// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Fleet Auction                                                                 ██
// ██  Fleet Compound bonus game. Bid on mystery lots against two bidders.           ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// Three mystery lots, bid on one at a time against two computer bidders with different behavior. Pay a flat coin
// fee to inspect a lot before bidding on it, or bid blind. Passing walks away from that lot for free at any point.
// A lot resolves the moment no bidder wants to raise further - if that's you, it's yours for the current bid; if
// it's a computer, it's gone. Opened with openFleetAuction({ onComplete(haul) }).

const FLEET_AUCTION_CONFIG = {
  inspectCost: 5,
  bidIncrement: 5,
  // Computer bidders never bid past a lot's real value (blind ranges sit well under it, revealed
  // ranges top out at exactly its value), so a lot can never cost the player more than it is
  // worth from the bots' pushing alone. Each bot also skips a random share of lots outright and has a
  // small coin pool, which is what leaves real deals on the table. blindRange / revealedRange are
  // fractions of the lot's value, rolled fresh per lot; skipChance is the odds the bot ignores a lot.
  bidders: [
    {
      id: 'steady',
      name: 'Steady Eddie',
      blindRange: [0.35, 0.6],
      revealedRange: [0.5, 0.75],
      skipChance: 0.3,
      chipsRange: [40, 70],
      style: 'Bids cautiously - never pays more than the lot is worth, and sits out some lots entirely.',
    },
    {
      id: 'bigspender',
      name: 'Big Spender',
      blindRange: [0.3, 0.5],
      revealedRange: [0.7, 1.0],
      skipChance: 0.2,
      chipsRange: [60, 95],
      style: "Lowballs a mystery lot, but will pay up to a revealed lot's full value - never more.",
    },
  ],
};
function auctionLotPool() {
  const ownedIds = new Set(RUN.hero?.items || []);
  const allItems = Object.values(ITEMS).filter((it) => it.cost > 0 && !ownedIds.has(it.id));
  // One lot is always a real Item, and it leans toward the better ones (60+ coin value) when any are left.
  const goodItems = allItems.filter((it) => it.cost >= 60);
  const itemPool = goodItems.length ? goodItems : allItems;
  const itemId = itemPool.length ? shuffle([...itemPool])[0].id : 'supply_bag';
  const item = ITEMS[itemId] || ITEMS['supply_bag'];
  const currencyOptions = shuffle([
    { type: 'coins', amount: 60, label: '+60 Coins', value: 60 },
    { type: 'coins', amount: 90, label: '+90 Coins', value: 90 },
    { type: 'gems', amount: 3, label: '+3 Gems', value: 75 },
    { type: 'fuel', amount: 5, label: '+5 Fuel', value: 40 },
  ]);
  const itemLot = { type: 'item', itemId: item.id, label: item.name, value: item.cost || 50 };
  return shuffle([itemLot, currencyOptions[0], currencyOptions[1]]).map(coinifyReward);
}
// Opening bids start low (about a fifth of the lot's value) so there is room to actually win a deal.
function startingBidFor(lot) {
  return Math.max(5, Math.round((lot.value * 0.2 + Math.random() * 8) / 5) * 5);
}
function applyAuctionHaul(haul) {
  if (!RUN) return;
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.auctionPlayed = true;
  const parts = [];
  if (haul.coins) {
    RUN.chips += haul.coins;
    parts.push(`${haul.coins} coins`);
  }
  if (haul.gems) {
    RUN.gems = Math.min(RUN.maxGems, RUN.gems + haul.gems);
    parts.push(`${haul.gems} gem${haul.gems > 1 ? 's' : ''}`);
  }
  if (haul.fuel) {
    RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + haul.fuel);
    parts.push(`${haul.fuel} fuel`);
  }
  if (haul.itemIds && haul.itemIds.length) {
    for (const id of haul.itemIds) {
      if (!ITEMS[id]) continue;
      // Prize items cannot push you past your Item capacity. With no open slot, the item pays out its sell
      // value in coins instead.
      if (!ITEMS[id].weightless && equippedItemCount(RUN.hero) >= RUN.itemCap) {
        const coinsBack = Math.floor((ITEMS[id].cost || 40) / 2);
        RUN.chips += coinsBack;
        parts.push(`no open Item slot, so ${ITEMS[id].name} paid ${coinsBack} coins instead`);
      } else {
        RUN.hero.items.push(id);
        parts.push(`${ITEMS[id].name} added to your Fleet`);
      }
    }
  }
  // The Fleet Auction shows its own results screen first, so this top-bar notice is only a short recap.
  RUN.lastNotice = parts.length ? `Auction lots won: ${parts.join(', ')}.` : 'Auction: no lots won this round.';
  saveRun();
  render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
}
function openFleetAuction(options) {
  options = options || {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : function () {};
  const old = document.getElementById('fleetAuctionOverlay');
  if (old) old.remove();

  // See openFleetBlackjack's note - locked the moment it opens for the same scumming reason.
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.auctionPlayed = true;
  saveRun();

  // Each computer bidder gets its own coin pool for this auction (random within its configured range) that
  // depletes when it wins a lot.
  const bidderChips = {};
  for (const b of FLEET_AUCTION_CONFIG.bidders)
    bidderChips[b.id] = Math.round(b.chipsRange[0] + Math.random() * (b.chipsRange[1] - b.chipsRange[0]));

  const state = {
    lots: auctionLotPool().map((reward) => {
      const startBid = startingBidFor(reward);
      // Each bot's hidden willingness to pay for this specific lot, rolled once: blind, revealed, and
      // whether it is interested at all. Always at or under the lot's value.
      const caps = {};
      for (const b of FLEET_AUCTION_CONFIG.bidders) {
        const roll = (r) => Math.min(reward.value, Math.round(reward.value * (r[0] + Math.random() * (r[1] - r[0]))));
        caps[b.id] = {
          blind: roll(b.blindRange),
          revealed: roll(b.revealedRange),
          interested: Math.random() >= b.skipChance,
        };
      }
      return {
        reward,
        startBid,
        currentBid: startBid,
        highBidder: null,
        revealed: false,
        resolved: false,
        won: false,
        caps,
      };
    }),
    lotIndex: 0,
    haul: { coins: 0, gems: 0, fuel: 0, itemIds: [] },
    bidderChips,
    totalSpent: 0,
    finished: false,
  };

  const overlay = document.createElement('div');
  overlay.id = 'fleetAuctionOverlay';
  overlay.className = 'map-popup-overlay';
  overlay.style.paddingTop = '20px';
  overlay.innerHTML =
    `
    <div class="wo wide" style="max-width:820px;width:100%">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1 style="margin:2px 0 0;text-align:center">Fleet <em>Auction</em></h1>
        <div class="note" style="margin-top:2px;text-align:center">Three mystery lots, and one ` +
    `is always an Item. Inspect before you bid, or take the gamble blind.</div>
        <div id="fleetAuctionBidders" class="fleetAuctionBidders"></div>
        <div id="fleetAuctionLots" class="fleetAuctionLots"></div>
        <div id="fleetAuctionMessage" style="min-height:22px;text-align:center;font-size:13px;color:var(--dim)"></div>
        <div id="fleetAuctionControls" style="display:flex;justify-content:center;gap:10px;` +
    `padding-top:10px;flex-wrap:wrap"></div>
        <div style="display:flex;justify-content:center;padding-top:10px">
          <button class="wo-btn gray" id="fleetAuctionExitBtn">Back to Compound</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const lotsWrap = document.getElementById('fleetAuctionLots');
  const biddersWrap = document.getElementById('fleetAuctionBidders');
  const message = document.getElementById('fleetAuctionMessage');
  const controls = document.getElementById('fleetAuctionControls');
  const exitBtn = document.getElementById('fleetAuctionExitBtn');

  function bidderDef(id) {
    return FLEET_AUCTION_CONFIG.bidders.find((x) => x.id === id);
  }
  function bidderName(id) {
    const b = bidderDef(id);
    return b ? b.name : id;
  }
  function rewardLabelFor(reward) {
    return reward.type === 'item' ? `🚚 ${reward.label}` : reward.label;
  }
  function currentLot() {
    return state.lots[state.lotIndex];
  }

  // Shows each computer bidder's name, live remaining coin pool, and a one-line description of
  // how it decides whether to raise - so it's clear who you're bidding against and why, instead
  // of an invisible cap with no explanation.
  function renderBidders() {
    const youBox =
      `
      <div class="fleetAuctionBidder fleetAuctionYou">
        <div class="fleetAuctionBidderName">You</div>
        <div class="fleetAuctionBidderChips" style="color:var(--amber);` +
      `font-weight:800">${ICON.coin} ${RUN.chips} coins</div>
      </div>`;
    biddersWrap.innerHTML =
      youBox +
      FLEET_AUCTION_CONFIG.bidders
        .map(
          (b) => `
      <div class="fleetAuctionBidder hoverTip" data-title="${b.style}">
        <div class="fleetAuctionBidderName">${b.name}</div>
        <div class="fleetAuctionBidderChips">${ICON.coin} ${state.bidderChips[b.id]} coins left</div>
      </div>`
        )
        .join('');
  }

  function renderLots() {
    lotsWrap.innerHTML = state.lots
      .map((lot, i) => {
        const isActive = i === state.lotIndex && !lot.resolved;
        // A lot's contents show once it resolves, even if it was never inspected.
        const contents = lot.revealed || lot.resolved ? rewardLabelFor(lot.reward) : '???';
        const status = lot.resolved
          ? lot.won
            ? `Won for ${lot.currentBid} coins!`
            : lot.highBidder
              ? `Went to ${bidderName(lot.highBidder)} ` + `for ${lot.currentBid} coins`
              : 'Passed'
          : lot.highBidder
            ? `High bid: ${lot.currentBid} ` + `(${lot.highBidder === 'player' ? 'You' : bidderName(lot.highBidder)})`
            : `Starting bid: ${lot.startBid}`;
        return `<div class="fleetAuctionLot ${isActive ? 'active' : ''} ${lot.resolved ? 'resolved' : ''}">
        <div class="fleetAuctionLotTitle">Lot ${i + 1}</div>
        <div class="fleetAuctionLotContents">${contents}</div>
        <div class="fleetAuctionLotStatus">${status}</div>
      </div>`;
      })
      .join('');
    renderBidders();
  }
  function renderControls() {
    const lot = currentLot();
    if (!lot || lot.resolved) {
      controls.innerHTML = '';
      return;
    }
    const canInspect = !lot.revealed && RUN.chips >= FLEET_AUCTION_CONFIG.inspectCost;
    const nextBid = lot.currentBid + FLEET_AUCTION_CONFIG.bidIncrement;
    const canBid = RUN.chips >= nextBid;
    controls.innerHTML =
      `
      <button class="wo-btn teal" ` +
      `id="fleetAuctionInspectBtn" ${lot.revealed || !canInspect ? 'disabled' : ''}>${
        lot.revealed ? 'Inspected' : `Inspect (${FLEET_AUCTION_CONFIG.inspectCost} ` + `coins)`
      }</button>
      <button class="wo-btn green" id="fleetAuctionBidBtn" ${!canBid ? 'disabled' : ''}>Bid ${nextBid} Coins</button>
      <button class="wo-btn gray" id="fleetAuctionPassBtn">Pass</button>
    `;
    const inspectBtn = document.getElementById('fleetAuctionInspectBtn');
    if (inspectBtn) inspectBtn.onclick = doInspect;
    document.getElementById('fleetAuctionBidBtn').onclick = doBid;
    document.getElementById('fleetAuctionPassBtn').onclick = doPass;
  }

  function doInspect() {
    const lot = currentLot();
    if (!lot || lot.revealed || RUN.chips < FLEET_AUCTION_CONFIG.inspectCost) return;
    RUN.chips -= FLEET_AUCTION_CONFIG.inspectCost;
    lot.revealed = true;
    playSfx('buy');
    message.textContent = `Lot ${state.lotIndex + 1} revealed: ${rewardLabelFor(lot.reward)}.`;
    saveRun();
    renderLots();
    renderControls();
  }
  function computerRespond(lot) {
    let best = null;
    for (const bidder of FLEET_AUCTION_CONFIG.bidders) {
      if (lot.highBidder === bidder.id) continue;
      if (!lot.caps[bidder.id].interested) continue;
      const cap = lot.revealed ? lot.caps[bidder.id].revealed : lot.caps[bidder.id].blind;
      const nextBid = lot.currentBid + FLEET_AUCTION_CONFIG.bidIncrement;
      // A bidder also needs the coins in its own remaining pool to raise, not just to stay under its
      // willingness-to-pay cap.
      if (nextBid <= cap && nextBid <= state.bidderChips[bidder.id]) {
        if (!best || nextBid > best.nextBid) best = { bidder, nextBid };
      }
    }
    if (best) {
      lot.currentBid = best.nextBid;
      lot.highBidder = best.bidder.id;
      return best.bidder;
    }
    return null;
  }
  function doBid() {
    const lot = currentLot();
    if (!lot) return;
    const nextBid = lot.currentBid + FLEET_AUCTION_CONFIG.bidIncrement;
    if (RUN.chips < nextBid) return;
    lot.currentBid = nextBid;
    lot.highBidder = 'player';
    playSfx('buy');
    const counter = computerRespond(lot);
    if (counter) {
      message.textContent = `${counter.name} counters at ${lot.currentBid} coins.`;
      renderLots();
      renderControls();
    } else {
      message.textContent = `No other bidders. Lot ${state.lotIndex + 1} is yours for ${lot.currentBid} coins!`;
      winLot(lot);
    }
  }
  function doPass() {
    const lot = currentLot();
    if (!lot) return;
    lot.resolved = true;
    lot.won = false;
    lot.revealed = true;
    if (lot.highBidder) {
      // The winning bidder actually pays for the lot out of its own pool now, so its remaining
      // coins shown for the rest of the auction reflect what it really has left to spend.
      state.bidderChips[lot.highBidder] = Math.max(0, state.bidderChips[lot.highBidder] - lot.currentBid);
      message.textContent =
        `Lot ${state.lotIndex + 1} went to ${bidderName(lot.highBidder)} ` +
        `for ${lot.currentBid} coins - it was ${rewardLabelFor(lot.reward)}.`;
    } else {
      message.textContent = `Lot ${state.lotIndex + 1} passed - it was ${rewardLabelFor(lot.reward)}.`;
    }
    playSfx('lose');
    renderLots();
    setTimeout(advanceLot, 900);
  }
  function winLot(lot) {
    RUN.chips -= lot.currentBid;
    state.totalSpent += lot.currentBid;
    lot.resolved = true;
    lot.won = true;
    lot.revealed = true;
    if (lot.reward.type === 'item') state.haul.itemIds.push(lot.reward.itemId);
    else if (lot.reward.type === 'coins') state.haul.coins += lot.reward.amount;
    else if (lot.reward.type === 'gems') state.haul.gems += lot.reward.amount;
    else if (lot.reward.type === 'fuel') state.haul.fuel += lot.reward.amount;
    saveRun();
    renderLots();
    setTimeout(advanceLot, 900);
  }
  function advanceLot() {
    state.lotIndex++;
    if (state.lotIndex >= state.lots.length) {
      finishAuction();
      return;
    }
    message.textContent = '';
    renderLots();
    renderControls();
  }
  // Auction Results screen: every lot's contents and outcome, what was paid, and a coins-in and coins-out
  // breakdown.
  function finishAuction() {
    if (state.finished) return;
    state.finished = true;
    controls.innerHTML = '';
    message.textContent = '';
    const rows = state.lots
      .map((lot, i) => {
        const contents = rewardLabelFor(lot.reward);
        let outcome;
        if (lot.won) outcome = `<span style="color:var(--green)">Won for ${lot.currentBid} coins</span>`;
        else if (lot.highBidder)
          outcome =
            `<span style="color:var(--dim)">Went ` +
            `to ${bidderName(lot.highBidder)} for ${lot.currentBid} coins</span>`;
        else outcome = `<span style="color:var(--dim)">Passed</span>`;
        return `<div class="fleetAuctionResultRow"><span>Lot ${i + 1}: ${contents}</span>${outcome}</div>`;
      })
      .join('');
    const coinsGained = state.haul.coins || 0;
    const netCoins = coinsGained - state.totalSpent;
    const otherWins = [];
    if (state.haul.gems) otherWins.push(`${state.haul.gems} Gem${state.haul.gems > 1 ? 's' : ''}`);
    if (state.haul.fuel) otherWins.push(`${state.haul.fuel} Fuel`);
    if (state.haul.itemIds.length) otherWins.push(...state.haul.itemIds.map((id) => (ITEMS[id] ? ITEMS[id].name : id)));
    lotsWrap.innerHTML = '';
    biddersWrap.innerHTML = '';
    message.innerHTML =
      `
      <div style="text-align:left;max-width:420px;margin:0 auto">
        ${rows}
        <div class="fleetAuctionResultTotals">
          <div class="fleetAuctionResultRow" style="border-top:none;padding-top:0"><span>Coins ` +
      `spent bidding</span><span>${state.totalSpent}</span></div>
          <div class="fleetAuctionResultRow" style="border-top:none;padding-top:0"><span>Coins ` +
      `won from lots</span><span>${coinsGained}</span></div>
          <div class="fleetAuctionResultRow" style="border-top:none;padding-top:0"><span>Net ` +
      `coins</span><span style="color:${netCoins >= 0 ? 'var(--green)' : 'var(--red)'}">${netCoins >= 0 ? '+' : ''}${netCoins}</span>` +
      `</div>
          ${
            otherWins.length
              ? `<div class="fleetAuctionResultRow" style="border-top:none;` +
                `padding-top:0"><span>Also won</span><span>${otherWins.join(', ')}</span></div>`
              : ''
          }
        </div>
      </div>`;
    controls.innerHTML =
      `<button class="wo-btn amber" id="fleetAuctionResultsDoneBtn" ` +
      `style="width:100%;max-width:420px">Back to Compound</button>`;
    document.getElementById('fleetAuctionResultsDoneBtn').onclick = () => {
      overlay.remove();
      onComplete(state.haul);
    };
    exitBtn.style.display = 'none';
  }

  exitBtn.onclick = () => {
    const lot = currentLot();
    if (lot && !lot.resolved) {
      lot.resolved = true;
      lot.won = false;
      lot.revealed = true;
    }
    finishAuction();
  };

  renderLots();
  renderControls();
}
