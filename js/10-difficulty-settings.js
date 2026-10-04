// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Difficulty Settings                                                           ██
// ██  Every dial that controls how hard the game is. Change a number, save, reload. ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const DIFFICULTY_VERSION = 1;
// prettier-ignore
const DIFFICULTY_DEFAULTS = {
  // ---- how opponents are tuned ----
  // nudge outlier opponents toward a healthy threat range (opponents already inside the range are left alone)
  tuning: true,
  strength: 65,          // 0-100. How much of the engine's correction to apply. 0 = none, 100 = all of it.
  // 60-150. Overall damage dial. 100 is what the engine was built around. 80 is gentler, 120 is rough.
  difficulty: 100,
  // ---- opponent health ----
  hpBonusRegular: 35,    // % extra health on every regular opponent in World 1, fading out by hpEarlyFade
  hpBonusElite: 25,      // % extra health on elites (same fade)
  hpBonusBoss: 10,       // % extra health on bosses (same fade)
  // the three flat bonuses above apply fully in World 1 and fade to nothing by this world (4 = gone by World 4). 99
  // keeps them in every world.
  hpEarlyFade: 4,
  // extra % that builds across a world's rows (0 at the first row, full amount at the boss). Regulars and elites
  // only.
  hpRowRamp: 25,
  hpPerWorld: 15,        // extra % for every world after the first (World 2 = +15, World 6 = +75, World 8 = +105)
  // ---- pacing and variety ----
  pacing: true,          // early fights are gentle and teach one thing each, then fights rise and relax (see paceByRow)
  paceByRow: [
    0.60, 0.65, 0.70, 0.78, 0.85, 1.00, 0.95, 1.05, 1.10, 1.15, 0.85, 0.90, 1.00, 1.10, 1.15, 1.20, 1.10, 1.20, 1.25,
    1.25
  ],   // damage multiplier for each map row (row 1 first)
  rewardsScale: true,    // tougher than usual fights pay a little more coins, easier ones a little less (85-135%)
  // ---- opponent items ----
  extraItems: true,      // elites get 2-3 items, bosses 3-4 (extra ones sit to the right of the main attack)
  drawOnHit: true,       // a few opponents with hard hands draw a card each time you hit them
  curseBoost: true,      // curses from elites and bosses go off for more (elite x1.25, boss x1.5)
  // ---- rules that changed ----
  dotHitsPlayer: true,   // poison and burn from opponents land on YOU
  // the 16 "Needs Two Pair" items that could only hold 3 cards now hold 4, so they can actually fire
  fixTwoPair: true,
  lightningFromZero: true, // Lightning rolls 0-100% (false = 25-100%). One shared roll for you and the opponent.
  // biggest single hit an opponent can land: 'flat99' (99), 'health' (45% of your max health) or 'base' (old caps,
  // 22 up to 60)
  swingCap: 'flat99',
  mercy: false,          // opponents hit a bit softer if you start under 35% health, a bit harder above 90%
  // ---- display and testing ----
  showNumbers: false,    // show the engine's numbers under Difficulty when you tap a battle stop
  logFights: true        // record what each real fight cost you (shown on the tuning screen)
};
