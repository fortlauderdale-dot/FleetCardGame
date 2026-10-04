// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  World Names                                                                   ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const WORLD_NAMES = {
  1: 'A1A Coastline',
  2: 'Alligator Alley',
  3: 'Downtown Core',
  4: 'Riverwalk District',
  5: 'Sunrise Industrial',
  6: 'Las Olas Boulevard',
  7: 'Port Everglades',
  8: 'The Fleet Compound',
};


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Cards And Decks                                                               ██
// ██  Suits, ranks, card values and the shared deck.                                ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const SUITS = [
  { s: '♦', color: 'red' },
  { s: '♣', color: 'blk' },
  { s: '♥', color: 'red' },
  { s: '♠', color: 'blk' },
];
const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
function rankLabel(r) {
  return RANK_LABEL[r] || String(r);
}
function suitColorClass(color, suit) {
  return color === 'red' ? 'red' : suit === '♣' ? 'suit-club' : '';
}

const SIGMA_TIP =
  `<span class="hoverTip" data-title="Summation: The total face value of all ` +
  `cards used to satisfy this item's requirements.">Σ</span>`;
function suitMicroCardHTML(suit) {
  const cls = suitColorClass(suit === '♥' || suit === '♦' ? 'red' : 'black', suit);
  return `<span class="suitMicroCard ${cls}">${suit}</span>`;
}
function rankSuitMiniCardHTML(rank, suit) {
  const cls = suitColorClass(suit === '♥' || suit === '♦' ? 'red' : 'black', suit);
  return `<span class="reqMiniCard ${cls}"><div>${rankLabel(rank)}</div><div>${suit}</div></span>`;
}
function stashHoldsLineHTML(item) {
  const holdsWord = `<span class="hoverTip" data-title="Click a stored card to take it back.">Holds</span>`;
  if (item.acceptFilter?.suit)
    return `${holdsWord} up to ${item.maxStore} ${suitMicroCardHTML(item.acceptFilter.suit)}`;
  if (item.acceptFilter?.color)
    return `${holdsWord} up to ${item.maxStore} ${item.acceptFilter.color === 'red' ? 'Red' : 'Black'} ` + `cards`;
  return `${holdsWord} up to ${item.maxStore} cards of any kind`;
}
function cardValue(r) {
  if (r === 14) return 11;
  if (r >= 11) return 10;
  return r;
}
function freshDeck() {
  const d = [];
  for (const su of SUITS)
    for (let r = 2; r <= 14; r++) d.push({ rank: r, suit: su.s, color: su.color, revealed: false, cid: r + su.s });
  return d;
}
// Stable-identity helpers: card objects lose their JS object identity across a
// localStorage save/reload (JSON round-trip creates new object references), so
// any code that compared cards with === (indexOf/includes/Set.has on the object
// itself) could silently mismatch after a reload. cid (rank+suit) is unique
// within a single 52-card deck and survives serialization, so use it instead.
function cardIndexOf(arr, card) {
  return card ? arr.findIndex((x) => x && x.cid === card.cid) : -1;
}
function cardIncludes(arr, card) {
  return card ? arr.some((x) => x && x.cid === card.cid) : false;
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Poker Hands And Opponent Cards                                                ██
// ██  Hand ranking, damage math and how opponents pick their best cards.            ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const TIERS = [
  'High Card',
  'Pair',
  'Two Pair',
  'Three of a Kind',
  'Straight',
  'Flush',
  'Full House',
  'Four of a Kind',
  'Straight Flush',
];
const TIER_MULT = [1.0, 1.5, 1.7, 3.0, 2.5, 2.8, 3.2, 4.0, 5.0];
function evaluateHand(cards) {
  if (!cards.length) return { tier: 0, label: 'No Cards', mult: 0 };
  const ranks = cards.map((c) => c.rank);
  const rankCounts = {};
  for (const r of ranks) rankCounts[r] = (rankCounts[r] || 0) + 1;
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const suitSet = new Set(cards.map((c) => c.suit));
  const isFlush = cards.length >= 3 && suitSet.size === 1;
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);
  const isStraight =
    cards.length >= 3 &&
    uniqueRanks.length === cards.length &&
    uniqueRanks[uniqueRanks.length - 1] - uniqueRanks[0] === cards.length - 1;
  let tier = 0;
  if (counts[0] === 4) tier = 7;
  else if (cards.length === 5 && counts[0] === 3 && counts[1] === 2) tier = 6;
  else if (isFlush && isStraight) tier = 8;
  else if (isFlush) tier = 5;
  else if (isStraight) tier = 4;
  else if (counts[0] === 3) tier = 3;
  else if (counts[0] === 2 && counts[1] === 2) tier = 2;
  else if (counts[0] === 2) tier = 1;
  else tier = 0;
  return { tier, label: TIERS[tier], mult: TIER_MULT[tier] };
}
function combinations(arr, k) {
  const results = [];
  function helper(start, combo) {
    if (combo.length === k) {
      results.push(combo.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return results;
}
const OPPONENT_USES_PER_TURN_DEFAULT = 1;
function opponentMaxCards(opp) {
  return opp.maxCards ?? (opp.minTier === 0 ? 1 : 5);
}
function bestHandFromPool(pool, maxCards) {
  if (!pool.length) return { cards: [], tier: -1, label: 'Nothing', mult: 0 };
  const cap = Math.min(maxCards, pool.length);
  if (pool.length <= cap) {
    const ev = evaluateHand(pool);
    return { cards: pool, ...ev };
  }
  let best = null;
  for (const combo of combinations(pool, cap)) {
    const ev = evaluateHand(combo);
    const rankSum = combo.reduce((a, c) => a + c.rank, 0);
    if (!best || ev.tier > best.tier || (ev.tier === best.tier && rankSum > best.rankSum))
      best = { cards: combo, ...ev, rankSum };
  }
  return best;
}
// Unlike bestHandFromPool (which always grabs the single highest-poker-tier hand available,
// regardless of what an item's condition actually needs), this searches the pool for a combo
// that genuinely satisfies the GIVEN condition - a straight, an exact suit count, a specific
// rank, odd/even, all four suits, whatever. That's what makes an opponent's "needs a 3-card
// Straight" or "needs 3 red cards" attack a real, readable threat instead of a coin flip: it
// fires reliably once the cards for it are actually in the pool, and reliably doesn't fire
// when they're not, so the pool the player can see is honest information to plan around.
function bestComboOfSize(pool, cond, size) {
  if (size < 1 || size > pool.length) return null;
  let best = null,
    bestSum = -Infinity;
  for (const combo of combinations(pool, size)) {
    if (!checkCondition(cond, combo).met) continue;
    const sum = combo.reduce((a, c) => a + cardValue(c.rank) + (c.bonus || 0), 0);
    if (sum > bestSum) {
      bestSum = sum;
      best = combo;
    }
  }
  if (!best) return null;
  return { cards: best, ...evaluateHand(best) };
}
function findOpponentCombo(pool, cond, cap) {
  if (!pool.length || !cap) return null;
  const poolLen = pool.length;
  const fixedSize =
    cond && cond.exactCount != null
      ? cond.exactCount
      : cond && cond.type === 'straightLen'
        ? cond.len
        : cond && cond.type === 'exactCount'
          ? cond.count
          : null;
  if (fixedSize != null) return poolLen >= fixedSize ? bestComboOfSize(pool, cond, fixedSize) : null;
  const maxLen = Math.min(cap, poolLen);
  // A larger combo can never have a lower card-value sum than a smaller one, so the biggest
  // size that can satisfy the condition is always the most damaging - try biggest first and
  // stop as soon as one works, instead of exhaustively scoring every smaller size too.
  for (let size = maxLen; size >= 1; size--) {
    const found = bestComboOfSize(pool, cond, size);
    if (found) return found;
  }
  return null;
}
function damageFor(cards, mult) {
  return Math.round(cards.reduce((a, c) => a + cardValue(c.rank) + (c.bonus || 0), 0) * mult);
}

function formatRewardParts(reward, labels = { coins: 'coins', gems: 'gems', fuel: 'fuel', points: 'Career Points' }) {
  if (typeof usesCoinTravel === 'function' && usesCoinTravel() && reward.fuel)
    reward = { ...reward, coins: (reward.coins || 0) + reward.fuel * FUEL_COIN_VALUE, fuel: 0 };
  return Object.entries(labels)
    .filter(([key]) => reward[key])
    .map(([key, label]) => `+${reward[key]} ${label}`)
    .join(', ');
}
