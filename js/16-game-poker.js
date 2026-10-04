// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Fleet Poker                                                                   ██
// ██  Fleet Compound bonus game. Hold'em with three hole cards.                     ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// Texas Hold'em, but you get 3 hole cards instead of 2. Build three 3-hole-card hands from nine dealt cards (3
// cards x 3 deals), assigning each card to one of your three hands as it's dealt - once placed, a card can never
// be moved. Three hidden computer hands (3 hole cards each) are generated up front; each of your hands has its own
// visible reward, revealed before a single card is dealt. Once all nine of your cards are placed, a single shared
// community board deals out - flop, then turn, then river - right on this same screen. Once the river lands, all
// three computer hands and all three outcomes (best 5-of-8 using the game's existing evaluateHand tiers via
// bestHandFromPool) reveal together, not one at a time. Opened with openFleetPoker({ onComplete(haul) }).

const FLEET_POKER_CONFIG = { handCount: 3, cardsPerHand: 3, deals: 3, cardsPerDeal: 3, communityCount: 5 };
function pokerHandRewards() {
  const ownedIds = new Set(RUN.hero?.items || []);
  const itemPool = Object.values(ITEMS).filter((it) => it.cost > 0 && !ownedIds.has(it.id));
  const itemId = itemPool.length ? shuffle([...itemPool])[0].id : 'supply_bag';
  const item = ITEMS[itemId] || ITEMS['supply_bag'];
  const currencyOptions = shuffle([
    { type: 'coins', amount: 25, label: '+25 Coins' },
    { type: 'coins', amount: 45, label: '+45 Coins' },
    { type: 'gems', amount: 1, label: '+1 Gem' },
    { type: 'gems', amount: 2, label: '+2 Gems' },
    { type: 'fuel', amount: 2, label: '+2 Fuel' },
    { type: 'fuel', amount: 3, label: '+3 Fuel' },
  ]);
  return shuffle([{ type: 'item', itemId: item.id, label: item.name }, currencyOptions[0], currencyOptions[1]]).map(
    coinifyReward
  );
}
function applyPokerHaul(haul) {
  if (!RUN) return;
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.pokerPlayed = true;
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
  RUN.lastNotice = parts.length ? `Poker haul banked: ${parts.join(', ')}.` : 'Poker: no matches won this round.';
  saveRun();
  render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
}
function openFleetPoker(options) {
  options = options || {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : function () {};
  const old = document.getElementById('fleetPokerOverlay');
  if (old) old.remove();

  // See openFleetBlackjack's note - locked the moment it opens so the visible computer-hand
  // rewards can't be scummed by backing out and reopening for a better set.
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.pokerPlayed = true;
  saveRun();

  let deck = shuffle(freshDeck());
  function drawCard() {
    if (!deck.length) deck = shuffle(freshDeck());
    return deck.pop();
  }

  const rewards = pokerHandRewards();
  const state = {
    playerHands: Array.from({ length: FLEET_POKER_CONFIG.handCount }, (_, i) => ({
      cards: [],
      reward: rewards[i],
      outcome: null,
    })),
    computerHands: Array.from({ length: FLEET_POKER_CONFIG.handCount }, () => ({
      cards: Array.from({ length: FLEET_POKER_CONFIG.cardsPerHand }, () => drawCard()),
    })),
    community: [],
    pool: [],
    dealsUsed: 0,
    finished: false,
  };
  const haul = { coins: 0, gems: 0, fuel: 0, itemIds: [] };

  const overlay = document.createElement('div');
  overlay.id = 'fleetPokerOverlay';
  overlay.className = 'map-popup-overlay';
  overlay.style.paddingTop = '20px';
  overlay.innerHTML =
    `
    <div class="wo wide" style="max-width:900px;width:100%;overflow:clip">
      <div class="wo-stripe"></div>
      <div class="wo-body fleetGame">
        <h1 style="margin:2px 0 0;text-align:center">Fleet <em>Poker</em></h1>
        <div class="note fleetGameNote" style="text-align:center">Hold'em with 3 hole cards. ` +
    `Build three hands from nine cards. Once a card is placed, it's locked in.</div>
        <div id="fleetPokerMessage" style="min-height:18px;text-align:center;font-size:13px;color:var(--dim)"></div>
        <div id="fleetPokerPoolWrap" class="fleetTray">
          <div class="note" id="fleetPokerTrayNote" style="text-align:center;margin:0 0 4px"></div>
          <div id="fleetPokerPool" style="display:flex;justify-content:center;gap:8px"></div>
          <button class="wo-btn green" id="fleetPokerDealBtn">Deal 3</button>
        </div>
        <div id="fleetPokerCommunity" class="fleetPokerBoard" style="display:none">
          <div class="note" id="fleetPokerBoardLabel" style="text-align:center;margin:0 0 3px"></div>
          <div class="fleetPokerHandCards sm" id="fleetPokerBoardCards" style="justify-content:center"></div>
          <button class="wo-btn amber" id="fleetPokerRevealBtn" style="display:none;` +
    `margin-top:6px">Reveal the Flop</button>
        </div>
        <div id="fleetPokerHands" class="fleetPokerHands fleetTwoOne"></div>
        <div id="fleetPokerControls" style="display:flex;justify-content:center;gap:10px;` +
    `padding-top:10px;flex-wrap:wrap">
          <button class="wo-btn gray" id="fleetPokerExitBtn">Back to Compound</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const handsWrap = document.getElementById('fleetPokerHands');
  const poolWrap = document.getElementById('fleetPokerPoolWrap');
  const poolEl = document.getElementById('fleetPokerPool');
  const communityWrap = document.getElementById('fleetPokerCommunity');
  const boardLabelEl = document.getElementById('fleetPokerBoardLabel');
  const boardCardsEl = document.getElementById('fleetPokerBoardCards');
  const trayNote = document.getElementById('fleetPokerTrayNote');
  const message = document.getElementById('fleetPokerMessage');
  const controlsWrap = document.getElementById('fleetPokerControls');
  const dealBtn = document.getElementById('fleetPokerDealBtn');
  const revealBtn = document.getElementById('fleetPokerRevealBtn');
  const exitBtn = document.getElementById('fleetPokerExitBtn');

  let selectedPoolIdx = null;
  function cardHTML(c) {
    return (
      `<div class="card sm ${suitColorClass(c.color, c.suit)}">` +
      `<div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
    );
  }
  function cardBackHTML() {
    return `<div class="card back sm"></div>`;
  }
  // Item rewards get the same dotted underline as other tap-for-info text, and tapping one pops up the real item
  // card. An item prize is grayed out, with a note, when you have no open Item slot to keep it in.
  function noSlotFor(reward) {
    const it = ITEMS[reward.itemId];
    return !!it && !it.weightless && equippedItemCount(RUN.hero) >= RUN.itemCap;
  }
  function rewardLabelFor(reward) {
    if (reward.type !== 'item') return reward.label;
    const blocked = noSlotFor(reward);
    return (
      `🚚 <span class="hoverTip" ` +
      `data-pkitem="${reward.itemId}" ${blocked ? 'style="opacity:.5"' : ''}>${reward.label}</span>${
        blocked
          ? '<div style="font-size:10px;font-weight:600;' +
            'color:var(--dim);line-height:1.2">No open Item slot. Add a slot to keep it.</div>'
          : ''
      }`
    );
  }
  function showItemPreview(id) {
    const item = ITEMS[id];
    if (!item) return;
    const pop = document.createElement('div');
    pop.style.cssText =
      'position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.72);' +
      'display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;cursor:pointer';
    pop.innerHTML =
      `<div style="zoom:1.6;background:var(--white);border-radius:10px;` +
      `padding:6px">${renderStandardItemCard(item, {})}</div><div style="color:#fff;font-size:13px">` +
      `Tap anywhere to close</div>`;
    pop.onclick = () => pop.remove();
    document.body.appendChild(pop);
  }

  // The computer's hole cards show face up from the moment all nine of yours are placed, and stay up through the
  // showdown.
  function laneLine(label, right, cls) {
    return `<div class="bjLine ${cls || ''}"><span>${label}</span>` + `<b>${right || ''}</b></div>`;
  }
  function renderHands() {
    handsWrap.innerHTML = state.playerHands
      .map((hand, i) => {
        const full = hand.cards.length >= FLEET_POKER_CONFIG.cardsPerHand;
        const canTarget = state.pool.length > 0 && selectedPoolIdx != null && !full;
        const placeholders = Array.from({ length: FLEET_POKER_CONFIG.cardsPerHand - hand.cards.length })
          .map(() => cardBackHTML())
          .join('');
        const showdown = !!hand.outcome;
        const compHTML = state.allPlaced
          ? `${laneLine('Computer', showdown ? hand.cBest.label : '', 'you')}
        <div class="fleetPokerHandCards sm">${state.computerHands[i].cards.map(cardHTML).join('')}</div>`
          : '';
        const outcomeHTML = showdown
          ? `<div class="fleetPokerOutcome ${hand.outcome}">${hand.outcome === 'win' ? `Win: ${rewardLabelFor(hand.reward)}` : hand.outcome === 'lose' ? 'Lose' : 'Push'}</div>`
          : '';
        return `<div class="fleetPokerHand ${full ? 'full' : ''} ${canTarget ? 'targetable' : ''}" data-pkhand="${i}">
        <div class="fleetPokerHandReward">${rewardLabelFor(hand.reward)}</div>
        ${state.allPlaced ? laneLine('You', showdown ? hand.pBest.label : '') : ''}
        <div class="fleetPokerHandCards sm">${hand.cards.map(cardHTML).join('')}${placeholders}</div>
        ${compHTML}
        ${outcomeHTML}
      </div>`;
      })
      .join('');
    handsWrap.querySelectorAll('[data-pkitem]').forEach((el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        showItemPreview(el.dataset.pkitem);
      };
    });
    handsWrap.querySelectorAll('[data-pkhand]').forEach((el) => {
      el.onclick = () => {
        if (selectedPoolIdx == null) return;
        placeCard(+el.dataset.pkhand);
      };
    });
  }
  function renderPool() {
    poolEl.innerHTML = state.pool
      .map(
        (c, i) =>
          `<div class="card sm ` +
          `pick ${suitColorClass(c.color, c.suit)} ${selectedPoolIdx === i ? 'selected' : ''}" ` +
          `data-poolcard="${i}"><div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
      )
      .join('');
    poolEl.querySelectorAll('[data-poolcard]').forEach((el) => {
      el.onclick = () => {
        selectedPoolIdx = +el.dataset.poolcard;
        renderPool();
        renderHands();
      };
    });
  }
  // The tray at the top holds whatever you are placing: the Deal button when it's time for the next
  // cards, or the three dealt cards while you place them. It keeps the same height either way so
  // the hands below never jump around.
  function updateControls() {
    const dealing = state.pool.length > 0;
    const dealsLeft = state.dealsUsed < FLEET_POKER_CONFIG.deals;
    poolWrap.style.display = state.allPlaced ? 'none' : '';
    dealBtn.style.display = !dealing && dealsLeft ? '' : 'none';
    poolEl.style.display = dealing ? 'flex' : 'none';
    trayNote.textContent = dealing
      ? 'Tap a card, then tap a hand to place it.'
      : dealsLeft
        ? `Round ${state.dealsUsed + 1} ` + `of ${FLEET_POKER_CONFIG.deals}`
        : '';
    exitBtn.style.display = dealing || state.allPlaced ? 'none' : '';
  }

  function placeCard(handIdx) {
    const hand = state.playerHands[handIdx];
    if (hand.cards.length >= FLEET_POKER_CONFIG.cardsPerHand) return;
    const card = state.pool.splice(selectedPoolIdx, 1)[0];
    hand.cards.push(card);
    selectedPoolIdx = null;
    renderPool();
    renderHands();
    if (!state.pool.length) {
      if (state.dealsUsed >= FLEET_POKER_CONFIG.deals) {
        updateControls();
        startReveal();
        return;
      } else message.textContent = 'Deal the next 3 cards when ready.';
    }
    updateControls();
  }
  function startDeal() {
    if (state.pool.length || state.dealsUsed >= FLEET_POKER_CONFIG.deals) return;
    for (let i = 0; i < FLEET_POKER_CONFIG.cardsPerDeal; i++) state.pool.push(drawCard());
    state.dealsUsed++;
    selectedPoolIdx = null;
    message.textContent = `Round ${state.dealsUsed} of ${FLEET_POKER_CONFIG.deals} - place all 3 cards.`;
    renderPool();
    renderHands();
    updateControls();
  }

  // Community board reveals in stages (flop, turn, river) right on this same screen, then every
  // hand's outcome shows at once - no clicking through matches one at a time.
  function communityCardsHTML() {
    const slots = [];
    for (let i = 0; i < FLEET_POKER_CONFIG.communityCount; i++)
      slots.push(state.community[i] ? cardHTML(state.community[i]) : cardBackHTML());
    return slots.join('');
  }
  // One row of five small cards with the Reveal button right under it. It sticks to the top of the
  // screen so the board is always visible while you read the hands below.
  function renderCommunityStrip(label) {
    communityWrap.style.display = '';
    boardLabelEl.textContent = label;
    boardCardsEl.innerHTML = communityCardsHTML();
  }
  // Community board reveal is now player-paced: the deal/placement controls hide once all hole
  // cards are placed, and a single "Reveal" button steps through flop -> turn -> river -> showdown.
  // No player action is possible while waiting (there's nothing left to place), but pacing it out
  // one click at a time gives them a beat to read the board and think about what they need before
  // the next card lands, instead of everything flashing up at once.
  let revealStage = 0;
  function startReveal() {
    revealStage = 0;
    state.allPlaced = true;
    updateControls();
    renderHands();
    renderCommunityStrip('Hole cards locked in.');
    message.textContent = 'Ready when you are.';
    revealBtn.textContent = 'Reveal the Flop';
    revealBtn.style.display = '';
    revealBtn.disabled = false;
  }
  function revealNextStage() {
    revealBtn.disabled = true;
    if (revealStage === 0) {
      state.community.push(drawCard(), drawCard(), drawCard());
      renderCommunityStrip('Flop');
      renderHands();
      playSfx('open');
      message.textContent = '';
      revealStage = 1;
      revealBtn.textContent = 'Reveal the Turn';
      revealBtn.disabled = false;
    } else if (revealStage === 1) {
      state.community.push(drawCard());
      renderCommunityStrip('Turn');
      renderHands();
      playSfx('open');
      message.textContent = '';
      revealStage = 2;
      revealBtn.textContent = 'Reveal the River';
      revealBtn.disabled = false;
    } else if (revealStage === 2) {
      state.community.push(drawCard());
      renderCommunityStrip('River');
      renderHands();
      playSfx('open');
      message.textContent = '';
      revealStage = 3;
      revealBtn.textContent = 'Show Hands';
      revealBtn.disabled = false;
    } else {
      revealBtn.style.display = 'none';
      resolveShowdown();
    }
  }
  revealBtn.onclick = revealNextStage;
  function resolveShowdown() {
    state.playerHands.forEach((hand, i) => {
      const cHand = state.computerHands[i];
      const pBest = bestHandFromPool([...hand.cards, ...state.community], 5);
      const cBest = bestHandFromPool([...cHand.cards, ...state.community], 5);
      const pSum = pBest.cards.reduce((a, c) => a + c.rank, 0);
      const cSum = cBest.cards.reduce((a, c) => a + c.rank, 0);
      let outcome;
      if (pBest.tier > cBest.tier) outcome = 'win';
      else if (pBest.tier < cBest.tier) outcome = 'lose';
      else if (pSum > cSum) outcome = 'win';
      else if (pSum < cSum) outcome = 'lose';
      else outcome = 'push';
      hand.outcome = outcome;
      hand.pBest = pBest;
      hand.cBest = cBest;
      if (outcome === 'win') {
        if (hand.reward.type === 'item') haul.itemIds.push(hand.reward.itemId);
        else if (hand.reward.type === 'coins') haul.coins += hand.reward.amount;
        else if (hand.reward.type === 'gems') haul.gems += hand.reward.amount;
        else if (hand.reward.type === 'fuel') haul.fuel += hand.reward.amount;
      }
    });
    message.textContent = '';
    renderCommunityStrip('Community Cards');
    renderHands();
    playSfx(state.playerHands.some((h) => h.outcome === 'win') ? 'open' : 'lose');
    controlsWrap.style.display = '';
    controlsWrap.innerHTML =
      `<button class="wo-btn amber" id="fleetPokerFinishBtn" ` + `style="width:100%">Collect Winnings</button>`;
    communityWrap.scrollIntoView({ block: 'nearest' });
    document.getElementById('fleetPokerFinishBtn').onclick = finishPoker;
  }
  function finishPoker() {
    if (state.finished) return;
    state.finished = true;
    overlay.remove();
    onComplete(haul);
  }

  dealBtn.onclick = startDeal;
  exitBtn.onclick = () => {
    overlay.remove();
    onComplete({ coins: 0, gems: 0, fuel: 0, itemIds: [] });
  };

  renderHands();
  renderPool();
  updateControls();
}
