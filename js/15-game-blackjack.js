// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Fleet Blackjack                                                               ██
// ██  Fleet Compound bonus game. Three hands against a real dealer.                 ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// Three EMPTY hands and a real dealer. Each hand's reward is locked in and shown before a single card is dealt,
// but there are no starting cards - hitting draws 3 cards you freely allocate across whichever hands are still
// live (including onto a hand with zero cards), so even the very first hit is a real placement decision. A hand
// that busts forfeits its reward; a hand that hits exactly 21 locks (no more cards can go to it). The dealer shows
// one card face-up and one face-down from the start for a bit of real strategy, then plays a standard hit-to-17
// hand once you Stand - each surviving hand only pays out if it beats the dealer's final total (a push pays
// nothing, same convention as Fleet Poker). Opened with openFleetBlackjack({ onComplete(haul) }); reward weights
// live in FLEET_BLACKJACK_CONFIG below.

const FLEET_BLACKJACK_CONFIG = {
  handCount: 3,
  drawSize: 3,
  // Bigger payouts than the first version (10 coins was too small to matter). Each hand rolls one
  // of these before any card is dealt, and only pays if that hand beats its dealer hand.
  rewardSlots: [
    { id: 'coins_small', label: '+25 Coins', type: 'coins', amount: 25, weight: 20 },
    { id: 'coins_medium', label: '+40 Coins', type: 'coins', amount: 40, weight: 14 },
    { id: 'coins_large', label: '+60 Coins', type: 'coins', amount: 60, weight: 6 },
    { id: 'fuel', label: '+2 Fuel', type: 'fuel', amount: 2, weight: 12 },
    { id: 'fuel_big', label: '+3 Fuel', type: 'fuel', amount: 3, weight: 6 },
    { id: 'gems', label: '+1 Gem', type: 'gems', amount: 1, weight: 10 },
    { id: 'gems_big', label: '+2 Gems', type: 'gems', amount: 2, weight: 5 },
  ],
};
// Standard soft-ace blackjack scoring: Aces count as 11 unless that would bust the hand, in
// which case they drop to 1 one at a time until the hand is 21 or under (or still busted).
function blackjackHandValue(cards) {
  let total = 0,
    aces = 0;
  for (const c of cards) {
    if (c.rank === 14) {
      aces++;
      total += 11;
    } else if (c.rank >= 11) total += 10;
    else total += c.rank;
  }
  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces--;
  }
  return { total, soft: softAces > 0, busted: total > 21 };
}
function weightedBlackjackReward() {
  const slots = FLEET_BLACKJACK_CONFIG.rewardSlots;
  let totalWeight = 0;
  for (const s of slots) totalWeight += Math.max(0, s.weight || 0);
  let roll = Math.random() * totalWeight;
  for (const s of slots) {
    roll -= Math.max(0, s.weight || 0);
    if (roll <= 0) return coinifyReward(s);
  }
  return coinifyReward(slots[slots.length - 1]);
}
function applyBlackjackHaul(haul) {
  if (!RUN) return;
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.blackjackPlayed = true;
  const parts = [];
  if (!haul.lost) {
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
  }
  RUN.lastNotice = parts.length
    ? `Blackjack haul banked: ${parts.join(', ')}.`
    : 'Blackjack: nothing banked this ' + 'round.';
  saveRun();
  render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
}
function openFleetBlackjack(options) {
  options = options || {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : function () {};
  const old = document.getElementById('fleetBlackjackOverlay');
  if (old) old.remove();

  // Locks Blackjack for the world the moment it's opened (not just on completion) - the
  // starting hands and reward slots are randomized and visible immediately, so without this
  // a player could back out before drawing and re-open for a better starting deal for free.
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.blackjackPlayed = true;
  saveRun();

  let deck = shuffle(freshDeck());
  function drawCard() {
    if (!deck.length) deck = shuffle(freshDeck());
    return deck.pop();
  }

  const state = {
    hands: Array.from({ length: FLEET_BLACKJACK_CONFIG.handCount }, () => ({
      cards: [],
      reward: weightedBlackjackReward(),
    })),
    // The dealer plays three hands too, one facing each of yours. Each shows one card face up and one face down.
    dealerHands: Array.from({ length: FLEET_BLACKJACK_CONFIG.handCount }, () => ({ cards: [drawCard(), drawCard()] })),
    dealerRevealed: false,
    pool: [],
    finished: false,
    hasDrawnOnce: false,
  };
  // No starting cards for the player - every card, including the first, arrives via a Hit and
  // has to be placed into one of the 3 (initially empty) hands, so the very first decision is a
  // real one instead of an automatic 2-card freebie.

  function handStatus(hand) {
    const v = blackjackHandValue(hand.cards);
    return { total: v.total, soft: v.soft, busted: v.busted, natural: hand.cards.length === 2 && v.total === 21 };
  }
  function canReceiveCard(hand) {
    const st = handStatus(hand);
    return !st.busted && st.total < 21;
  }
  function liveHands() {
    return state.hands.filter(canReceiveCard);
  }
  function anyStillStanding() {
    return state.hands.some((h) => !handStatus(h).busted);
  }

  const overlay = document.createElement('div');
  overlay.id = 'fleetBlackjackOverlay';
  overlay.className = 'map-popup-overlay';
  overlay.style.paddingTop = '20px';
  overlay.innerHTML =
    `
    <div class="wo wide" style="max-width:820px;width:100%">
      <div class="wo-stripe"></div>
      <div class="wo-body fleetGame">
        <h1 style="margin:2px 0 0;text-align:center">Fleet <em>Blackjack</em></h1>
        <div class="note fleetGameNote" style="text-align:center">Each of your hands plays the ` +
    `dealer hand above it and pays its reward if it wins. Hit to place cards, Stand when you're happy.</div>
        <div id="fleetBjMessage" style="min-height:18px;text-align:center;font-size:13px;color:var(--dim)"></div>
        <div id="fleetBjHands" class="fleetBjHands fleetTwoOne"></div>
        <div id="fleetBjPoolWrap" class="fleetMiniPoolWrap" style="display:none">
          <div class="note" style="text-align:center;margin:4px 0 4px">Tap a card, then tap a hand to place it.</div>
          <div id="fleetBjPool" style="display:flex;justify-content:center;gap:8px"></div>
        </div>
        <div id="fleetBjResult"></div>
        <div id="fleetBjControls" style="display:flex;justify-content:center;gap:10px;` +
    `padding-top:10px;flex-wrap:wrap">
          <button class="wo-btn green" id="fleetBjDrawBtn">Hit (Draw 3)</button>
          <button class="wo-btn amber" id="fleetBjBankBtn">Stand</button>
          <button class="wo-btn gray" id="fleetBjExitBtn">Back to Compound</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const handsWrap = document.getElementById('fleetBjHands');
  const poolWrap = document.getElementById('fleetBjPoolWrap');
  const poolEl = document.getElementById('fleetBjPool');
  const message = document.getElementById('fleetBjMessage');
  const drawBtn = document.getElementById('fleetBjDrawBtn');
  const bankBtn = document.getElementById('fleetBjBankBtn');
  const exitBtn = document.getElementById('fleetBjExitBtn');

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
  function dealerStatus(dh) {
    const v = blackjackHandValue(dh.cards);
    return { total: v.total, soft: v.soft, busted: v.busted, natural: dh.cards.length === 2 && v.total === 21 };
  }
  function renderDealer() {
    renderHands();
  }

  function renderHands() {
    handsWrap.innerHTML = state.hands
      .map((hand, i) => {
        const st = handStatus(hand);
        const dh = state.dealerHands[i];
        const canTarget = state.pool.length > 0 && selectedPoolIdx != null && canReceiveCard(hand);
        const statusLabel = st.busted
          ? 'Bust'
          : st.natural
            ? 'Blackjack!'
            : st.total === 21
              ? '21 (locked)'
              : hand.cards.length
                ? String(st.total) + (st.soft ? ' (soft)' : '')
                : 'Empty';
        const statusClass = st.busted ? 'bjBust' : st.natural || st.total === 21 ? 'bjLocked' : '';
        let dealerCards,
          dealerLabel,
          dealerClass = '';
        if (state.dealerRevealed) {
          const ds = dealerStatus(dh);
          dealerCards = dh.cards.map(cardHTML).join('');
          dealerLabel = ds.busted ? 'Bust' : ds.natural ? 'Blackjack!' : String(ds.total);
          dealerClass = ds.busted ? 'bjBust' : '';
        } else {
          dealerCards = cardHTML(dh.cards[0]) + cardBackHTML();
          dealerLabel = 'Showing ' + rankLabel(dh.cards[0].rank);
        }
        const resultLabel = hand.outcome
          ? `<div class="fleetBjHandOutcome ${hand.outcome}">${hand.outcome === 'win' ? 'Win' : hand.outcome === 'push' ? 'Push' : 'Lose'}</div>`
          : '';
        return (
          `<div class="fleetBjHand ${st.busted ? 'busted' : ''} ${canTarget ? 'targetable' : ''}" ` +
          `data-bjhand="${i}">
        <div class="fleetBjHandReward">${hand.reward.label}</div>
        <div class="bjLine"><span>Dealer</span><b class="${dealerClass}">${dealerLabel}</b></div>
        <div class="fleetBjHandCards sm ${dh.cards.length > 3 ? 'many' : ''}">${dealerCards}</div>
        <div class="bjLine you"><span>You</span><b class="${statusClass}">${statusLabel}</b></div>
        <div class="fleetBjHandCards ` +
          `sm ${hand.cards.length > 3 ? 'many' : ''}">${hand.cards.map(cardHTML).join('')}</div>
        ${resultLabel}
      </div>`
        );
      })
      .join('');
    handsWrap.querySelectorAll('[data-bjhand]').forEach((el) => {
      el.onclick = () => {
        if (selectedPoolIdx == null) return;
        placeCard(+el.dataset.bjhand);
      };
    });
  }
  function renderPool() {
    if (!state.pool.length) {
      poolWrap.style.display = 'none';
      poolEl.innerHTML = '';
      return;
    }
    poolWrap.style.display = '';
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
  function updateControls() {
    const dealing = state.pool.length > 0;
    drawBtn.style.display = dealing ? 'none' : '';
    bankBtn.style.display = dealing ? 'none' : '';
    exitBtn.style.display = dealing ? 'none' : '';
    drawBtn.disabled = liveHands().length === 0;
    // Stand only pays out hands that survived a real hit - with no starting cards, every hand
    // is empty (and un-busted) until you hit at least once, so without this a player could open
    // Blackjack and Stand for free with 3 empty "0" hands that can never actually beat a dealer.
    bankBtn.disabled = !state.hasDrawnOnce;
    bankBtn.textContent = state.hasDrawnOnce ? 'Stand' : 'Stand (hit first)';
  }

  function placeCard(handIdx) {
    const hand = state.hands[handIdx];
    if (!canReceiveCard(hand)) return;
    const card = state.pool.splice(selectedPoolIdx, 1)[0];
    hand.cards.push(card);
    selectedPoolIdx = null;
    const st = handStatus(hand);
    if (st.busted) {
      playSfx('lose');
      message.textContent = `Hand ${handIdx + 1} busted - reward forfeited.`;
    } else if (st.total === 21) {
      playSfx('open');
      message.textContent = `Hand ${handIdx + 1} locked at 21.`;
    } else {
      message.textContent = '';
    }
    // If cards remain in the pool but every hand is now busted or locked, there's nowhere left
    // to put them - discard the rest and force the round to a close instead of stranding cards.
    if (state.pool.length && liveHands().length === 0) {
      state.pool = [];
      message.textContent = 'No hands left to draw for.';
    }
    if (!anyStillStanding()) {
      finishRound();
      return;
    }
    renderPool();
    renderHands();
    renderDealer();
    updateControls();
  }

  function startDraw() {
    if (state.finished || state.pool.length || liveHands().length === 0) return;
    state.hasDrawnOnce = true;
    for (let i = 0; i < FLEET_BLACKJACK_CONFIG.drawSize; i++) state.pool.push(drawCard());
    selectedPoolIdx = null;
    message.textContent = 'Assign all 3 cards before hitting again.';
    renderPool();
    renderHands();
    renderDealer();
    updateControls();
  }

  function formatBjHaul(h) {
    const parts = [];
    if (h.coins) parts.push(`${h.coins} Coins`);
    if (h.gems) parts.push(`${h.gems} Gem${h.gems > 1 ? 's' : ''}`);
    if (h.fuel) parts.push(`${h.fuel} Fuel`);
    return parts.length ? parts.join(' + ') : '0';
  }
  function finishRound() {
    if (state.finished) return;
    state.finished = true;
    drawBtn.style.display = 'none';
    bankBtn.style.display = 'none';
    exitBtn.style.display = 'none';
    poolWrap.style.display = 'none';

    const haul = { coins: 0, gems: 0, fuel: 0 };
    // Guards against a bank/exit that happens before any hit ever occurred - with no starting
    // cards, every hand is empty (and un-busted) until you hit at least once, so without this
    // check every hand would still read as "standing" and pay out for free against the dealer.
    if (!state.hasDrawnOnce) {
      message.textContent = 'Nothing to Stand on.';
      haul.lost = true;
      showResultPopup(haul, 'Nothing to Stand on', 'You left without hitting, so nothing was banked.');
      return;
    }

    // Reveal every dealer hand's hidden card. Each dealer hand then plays a standard hit-to-17 -
    // but only if the player hand facing it is still alive (no point drawing against a bust).
    state.dealerRevealed = true;
    state.hands.forEach((hand, i) => {
      const dh = state.dealerHands[i];
      if (handStatus(hand).busted || !hand.cards.length) return;
      let dv = blackjackHandValue(dh.cards);
      while (dv.total < 17) {
        dh.cards.push(drawCard());
        dv = blackjackHandValue(dh.cards);
      }
    });

    let dealerWins = 0;
    state.hands.forEach((hand, i) => {
      const st = handStatus(hand);
      const ds = dealerStatus(state.dealerHands[i]);
      if (st.busted || !hand.cards.length) hand.outcome = 'lose';
      else if (ds.busted) hand.outcome = 'win';
      // A real blackjack (21 on the first two cards) beats a dealer 21 built from more cards, and
      // only ties a dealer blackjack. A plain 21 loses to a dealer blackjack.
      else if (st.natural && !ds.natural) hand.outcome = 'win';
      else if (ds.natural && !st.natural) hand.outcome = 'lose';
      else if (st.total > ds.total) hand.outcome = 'win';
      else if (st.total < ds.total) hand.outcome = 'lose';
      else hand.outcome = 'push';
      if (hand.outcome === 'lose') dealerWins++;
      if (hand.outcome === 'win') {
        if (hand.reward.type === 'coins') haul.coins += hand.reward.amount;
        else if (hand.reward.type === 'gems') haul.gems += hand.reward.amount;
        else if (hand.reward.type === 'fuel') haul.fuel += hand.reward.amount;
      }
    });
    renderHands();
    haul.lost = haul.coins === 0 && haul.gems === 0 && haul.fuel === 0;
    const wins = state.hands.filter((h) => h.outcome === 'win').length;
    const dealerLabel = `You won ${wins} of ${state.hands.length} hands.`;
    message.textContent = '';
    playSfx(haul.lost ? 'lose' : 'open');
    showResultPopup(
      haul,
      dealerLabel,
      haul.lost ? 'No hand beat the dealer. Nothing banked.' : `You won ${formatBjHaul(haul)}.`
    );
  }
  // Final hands stay on screen. The result sits right under the hands (not floating over them), and
  // the round only closes when the player clicks Collect.
  function showResultPopup(haul, headline, detail) {
    const box = document.getElementById('fleetBjResult');
    if (!box || document.getElementById('fleetBjCollectBtn')) return;
    box.innerHTML =
      `<div class="fleetResultBox ${haul.lost ? 'lose' : 'win'}">
      <div style="font-size:12px;color:var(--dim)">${headline}</div>
      <div style="font-size:15px;font-weight:700;margin:2px 0 8px">${detail}</div>
      <button class="wo-btn ${haul.lost ? 'gray' : 'green'}" ` +
      `id="fleetBjCollectBtn">${haul.lost ? 'Close' : 'Collect'}</button></div>`;
    document.getElementById('fleetBjCollectBtn').onclick = () => {
      overlay.remove();
      onComplete(haul);
    };
  }

  drawBtn.onclick = startDraw;
  bankBtn.onclick = finishRound;
  exitBtn.onclick = finishRound;

  renderHands();
  renderPool();
  renderDealer();
  updateControls();
}
