// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Tuning Garage, Treasure And Run End                                           ██
// ██  Card boosts, supply caches, ending a run and forfeiting.                      ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

let BLACKSMITH_OPTIONS = null;
let GARAGE_SELECTED_ITEM = null;
let BLACKSMITH_VISIT = null;
const SCOPE_TUNE_COST = { card: 30, rank: 60, suit: 90 };
const SCOPE_TUNE_DAMAGE = { card: 10, rank: 5, suit: 3 };
const SCOPE_TUNE_MAX_STACKS = 3;
function tuneCost(bonus, isSecondary, scope) {
  return SCOPE_TUNE_COST[scope] || 30;
}
function pickBlacksmithOptions() {
  const su1 = SUITS[Math.floor(Math.random() * SUITS.length)];
  const r1 = 2 + Math.floor(Math.random() * 13);
  const r2 = 2 + Math.floor(Math.random() * 13);
  const su3 = SUITS[Math.floor(Math.random() * SUITS.length)];
  return [
    { scope: 'card', rank: r1, suit: su1.s, label: `${rankLabel(r1)}${su1.s}`, desc: `Just this one card.` },
    { scope: 'rank', rank: r2, label: `Every ${rankLabel(r2)}`, desc: `Any ${rankLabel(r2)} you draw, any suit.` },
    { scope: 'suit', suit: su3.s, label: `Every ${su3.s}`, desc: `Any card of that suit you draw.` },
  ].sort((a, b) => SCOPE_TUNE_COST[a.scope] - SCOPE_TUNE_COST[b.scope]);
}
function findBoost(opt) {
  return RUN.cardBoosts.find((b) => b.scope === opt.scope && b.rank === opt.rank && b.suit === opt.suit);
}
function boostCard(opt) {
  let b = findBoost(opt);
  if (!b) {
    b = { scope: opt.scope, rank: opt.rank, suit: opt.suit, bonus: 0, count: 0 };
    RUN.cardBoosts.push(b);
  }
  if ((b.count || 0) >= SCOPE_TUNE_MAX_STACKS) return;
  b.bonus += SCOPE_TUNE_DAMAGE[opt.scope] || 0;
  b.count = (b.count || 0) + 1;
  saveRun();
}
function rollTreasure(big = false) {
  const mult = big ? 2 : 1;
  const choices = [
    { kind: 'coins', label: 'Coins', amount: (20 + Math.floor(Math.random() * 31)) * mult, icon: ICON.coin },
    usesCoinTravel()
      ? { kind: 'coins', label: 'Travel Budget', amount: FUEL_COIN_VALUE * mult, icon: ICON.coin }
      : { kind: 'fuel', label: 'Fuel', amount: 1 * mult, icon: ICON.fuel },
    { kind: 'gems', label: 'Gems', amount: (1 + Math.floor(Math.random() * 2)) * mult, icon: ICON.gem },
    { kind: 'energy', label: 'Energy', amount: (5 + Math.floor(Math.random() * 6)) * mult, icon: ICON.energy },
    { kind: 'points', label: 'Career Points', amount: (6 + Math.floor(Math.random() * 10)) * mult, icon: ICON.star },
  ];
  const prize = choices[Math.floor(Math.random() * choices.length)];
  let actual = prize.amount;
  if (prize.kind === 'coins') {
    const before = RUN.chips;
    RUN.chips = Math.min(999, RUN.chips + prize.amount);
    actual = RUN.chips - before;
  }
  if (prize.kind === 'fuel') {
    const before = RUN.fuel;
    RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + prize.amount);
    actual = RUN.fuel - before;
  }
  if (prize.kind === 'gems') {
    const before = RUN.gems;
    RUN.gems = Math.min(RUN.maxGems, RUN.gems + prize.amount);
    actual = RUN.gems - before;
  }
  if (prize.kind === 'energy') {
    const before = RUN.energy;
    RUN.energy = Math.min(RUN.maxEnergy, RUN.energy + prize.amount);
    actual = RUN.energy - before;
  }
  if (prize.kind === 'points') {
    earnPoints(prize.amount);
    RUN.careerPointsFromTreasure = (RUN.careerPointsFromTreasure || 0) + prize.amount;
  }
  saveRun();
  return { ...prize, amount: actual };
}
function endRun(won) {
  IN_BATTLE = false;
  clearBattleSave();
  playSfx(won ? 'win' : 'lose');
  const cleared = !!RUN.worldCleared;
  const bonus = worldCareerPoints(RUN.world, cleared);
  earnPoints(bonus);
  META.bestRun = Math.max(META.bestRun, RUN.path.length);
  META.highScore = Math.max(META.highScore, RUN.scoreThisRun);
  META.runsPlayed++;
  saveMeta();
  const bonusWorld = RUN.world;
  clearRunSave();
  render(runEndScreen(won, bonus, bonusWorld, cleared));
}
window.forfeitRun = function () {
  if (!confirm('Forfeit this run? This will count as a loss.')) return;
  IN_BATTLE = false;
  clearBattleSave();
  endRun(false);
};
