// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Map Generation: Building A World                                              ██
// ██  Picking stop types, lanes and edges for each row of a world.                  ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// Hex is still being tested, so it is kept rare for now. These two numbers are the dials to turn it back up:
// the share of hex opponents that make it into a world's regular pool each map, and the odds a Dealership
// visit is allowed to stock hex items at all. Elites and bosses are not affected.
const HEX_REGULAR_KEEP = 0.35;
const HEX_SHOP_CHANCE = 0.25;
function opponentHasHex(o) {
  return (o.items || []).some((id) => ITEMS[id] && ITEMS[id].kind === 'hex');
}
function generateMap() {
  const nodes = [],
    edges = [];
  const castleRow = 10;
  // The Fleet Compound row is always a single node in every world, so every route passes through it.
  const rowCounts = [1, 2, 1, 2, 3, 1, 2, 3, 2, 2, 1, 2, 3, 2, 2, 3, 2, 2, 3, 2];
  const castleCol = 0;
  const worldMultiplier = RUN.worldMultiplier || 1.0;
  const highwayPools = WORLD_POOLS_BY_WORLD[RUN.world] || WORLD_1_POOLS;
  const regularPool = highwayPools.regulars.filter((o) => !opponentHasHex(o) || Math.random() < HEX_REGULAR_KEEP);
  const highwayRegularQueue = shuffle([...regularPool]);
  const eggQueue = shuffle([...EASTER_EGG_OPPONENTS]);
  const diffUse = {},
    diffRecent = [];
  const world1BonusEggs = RUN.world === 1 ? WORLD_1_BONUS_EGGS.map((o) => ({ o, used: false })) : [];
  function nextHighwayRegular(row) {
    for (const be of world1BonusEggs) {
      if (!be.used && Math.random() < EASTER_EGG_SPAWN_CHANCE) {
        be.used = true;
        return be.o;
      }
    }
    if (Math.random() < EASTER_EGG_SPAWN_CHANCE) {
      if (!eggQueue.length) eggQueue.push(...shuffle([...EASTER_EGG_OPPONENTS]));
      return eggQueue.pop();
    }
    if (DIFF.pacing && row != null) return diffPickRegular(regularPool, row, diffUse, diffRecent);
    if (!highwayRegularQueue.length) highwayRegularQueue.push(...shuffle([...regularPool]));
    return highwayRegularQueue.pop();
  }
  // Highway opponents ramp up smoothly across the world instead of sitting flat and then hitting
  // a sudden wall at the boss: row 0 is the world's base strength, and the last highway row before
  // the boss caps out at a flat +20% total. The boss's own multiplier below picks up right where
  // this ramp leaves off, so the boss reads as the natural next step, not a separate jump.
  const WORLD_RAMP_TOTAL = 0.2;
  const lastHighwayRow = rowCounts.length - 1;
  function scaleHighwayOpponent(base, row) {
    const scaled = JSON.parse(JSON.stringify(base));
    const rampFrac = lastHighwayRow > 0 ? Math.min(1, row / lastHighwayRow) : 0;
    scaled.hp = Math.round(base.hp * worldMultiplier * (1 + WORLD_RAMP_TOTAL * rampFrac));
    return scaled;
  }
  function makeOpponentForRow(row) {
    const diffBase = nextHighwayRegular(row);
    return diffTuneOpponent(scaleHighwayOpponent(diffBase, row), diffBase, row, 'regular');
  }
  // Each highway row renders across up to 3 vertical lanes (0=top, 1=middle, 2=bottom). Lanes are picked
  // per row on each generation. A 1-node row leans middle but can land top or bottom. A 2-node row usually
  // keeps the middle lane as the main through-line plus one random side, and occasionally skips the middle
  // so a path can run from the top lane to the bottom lane.
  function pickLanesForRow(k) {
    // Every row now always includes the middle lane, so the middle lane is one unbroken straight
    // line from start to boss (the map's main path). Rows with 2 nodes add one random side lane and
    // rows with 3 use all lanes, and those side nodes weave into the middle line from above/below.
    if (k >= 3) return [0, 1, 2];
    if (k === 1) return [1];
    return Math.random() < 0.5 ? [0, 1] : [1, 2];
  }
  const rowLanes = rowCounts.map((k) => pickLanesForRow(k));
  // The Fleet Compound is the run's central hub - keep it anchored on the middle lane so the
  // "main line" reliably runs through it rather than it randomly landing on a top/bottom detour.
  rowLanes[castleRow] = [1];
  for (let r = 0; r < rowCounts.length; r++) {
    const row = [];
    for (let c = 0; c < rowCounts[r]; c++) {
      row.push({ type: 'pending', opponent: makeOpponentForRow(r), lane: rowLanes[r][c] });
    }
    nodes.push(row);
  }
  nodes[0][0].type = 'battle';
  nodes[1].forEach((n) => (n.type = 'battle'));
  nodes[2][0] = { type: 'shop', lane: nodes[2][0].lane };
  nodes[castleRow][castleCol] = { type: 'castle', lane: nodes[castleRow][castleCol].lane };
  const eligible = [];
  for (let r = 0; r < nodes.length; r++)
    for (let c = 0; c < nodes[r].length; c++) if (nodes[r][c].type === 'pending') eligible.push({ r, c });
  shuffle(eligible);
  const needBattles = 29 - 3;
  eligible.slice(0, needBattles).forEach(({ r, c }) => {
    nodes[r][c] = { type: 'battle', opponent: makeOpponentForRow(r), lane: nodes[r][c].lane };
  });
  // The upgrade shops (Tuning Garage, Chop Shop, Overdrive Bay) are one-time stops per world -
  // hitting the same one twice on a route felt broken. The Dealership can show up twice since
  // node 3 always guarantees one. Everything else (rest, treasure, the card match) stays
  // unlimited since those are meant to recur. Fleet Plinko/Blackjack/Poker/Auction are also
  // one-time-per-world (same lock as the Fleet Compound's own copies of these games), so they're
  // capped at 1 each too - no point spawning a second node for a game you can only play once.
  const TYPE_CAPS = {
    shop: 2,
    blacksmith: 1,
    chopshop: 1,
    overdrive: 1,
    plinko_hazard: 1,
    blackjack_hazard: 1,
    poker_hazard: 1,
    auction_hazard: 1,
  };
  const typeCounts = { shop: 1 };
  function pickNodeTypeCapped() {
    for (let attempt = 0; attempt < 12; attempt++) {
      const t = pickNodeType();
      const cap = TYPE_CAPS[t];
      if (cap == null || (typeCounts[t] || 0) < cap) {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
        return t;
      }
    }
    return 'battle';
  }
  eligible.slice(needBattles).forEach(({ r, c }) => {
    const t = pickNodeTypeCapped();
    if (t === 'battle') {
      nodes[r][c] = { type: 'battle', opponent: makeOpponentForRow(r), lane: nodes[r][c].lane };
    } else {
      nodes[r][c] = { type: t, lane: nodes[r][c].lane };
    }
  });
  const bossTemplate = highwayPools.boss;
  // Continue the same ramp the highway just finished (ending at +20%) rather than restarting from
  // a disconnected flat multiplier, so the boss feels like the next step up, not a jarring spike.
  nodes.push([
    {
      type: 'battle',
      opponent: diffTuneOpponent(
        scaleMonsterForNewWorld(bossTemplate, worldMultiplier * (1 + WORLD_RAMP_TOTAL) * 1.15, 6),
        bossTemplate,
        20,
        'boss'
      ),
      lane: 1,
    },
  ]);
  // Edges are built from each node's lane (top/middle/bottom), not its array index. Adjacent-lane
  // connections are common, and a less frequent lane-2 jump lets a route run from the top lane to the
  // bottom lane.
  for (let r = 0; r < nodes.length - 1; r++) {
    const cur = nodes[r],
      next = nodes[r + 1];
    const add = (a, b) => {
      if (!edges.some((e) => e.fromRow === r && e.fromCol === a && e.toRow === r + 1 && e.toCol === b))
        edges.push({ fromRow: r, fromCol: a, toRow: r + 1, toCol: b });
    };
    if (cur.length === 1) {
      for (let b = 0; b < next.length; b++) add(0, b);
    } else if (next.length === 1) {
      cur.forEach((_, a) => add(a, 0));
    } else {
      cur.forEach((n1, a) => {
        const byDist = next.map((n2, b) => ({ b, dist: Math.abs(n2.lane - n1.lane) })).sort((x, y) => x.dist - y.dist);
        add(a, byDist[0].b);
        if (byDist[1] && byDist[1].dist <= 1 && Math.random() < 0.55) add(a, byDist[1].b);
        const jump = byDist.find((cd) => cd.dist >= 2);
        if (jump && Math.random() < 0.22) add(a, jump.b);
      });
      next.forEach((n2, b) => {
        if (!edges.some((e) => e.fromRow === r && e.toCol === b)) {
          const byDist = cur.map((n1, a) => ({ a, dist: Math.abs(n1.lane - n2.lane) })).sort((x, y) => x.dist - y.dist);
          add(byDist[0].a, b);
        }
      });
    }
  }
  // Draw two elites without repeats from the world's elite pool, so a world with more than
  // two defined elites (like World 1's three) actually rotates through all of them across
  // runs instead of the same two always landing in these two slots.
  const shuffledElites = shuffle([...highwayPools.elites]);
  [9, 15].forEach((eliteRow, idx) => {
    if (nodes[eliteRow] && nodes[eliteRow].length) {
      const col = idx === 0 ? nodes[eliteRow].length - 1 : 0;
      const eliteBase = shuffledElites[idx % shuffledElites.length];
      const eliteOpp = diffTuneOpponent(scaleHighwayOpponent(eliteBase, eliteRow), eliteBase, eliteRow, 'elite');
      eliteOpp.name = `${eliteBase.name} [Elite]`;
      nodes[eliteRow][col] = { type: 'battle', opponent: eliteOpp, lane: nodes[eliteRow][col].lane };
    }
  });
  // Repair pass: a player should never fight the same opponent twice in a row they can
  // actually walk through in one run - i.e. two directly-connected battle nodes with the same
  // opponent id. The regular pool is smaller than the number of battle nodes in a world, so
  // repeats somewhere on the map are unavoidable, but they should never land on nodes that are
  // directly connected to each other. Do a few sweeps swapping opponents within the same row
  // (which preserves the row's overall opponent distribution) whenever a direct-edge conflict
  // is found and a same-row swap can resolve it.
  const neighborsOf = (r, c) =>
    edges
      .filter((e) => (e.fromRow === r && e.fromCol === c) || (e.toRow === r && e.toCol === c))
      .map((e) => (e.fromRow === r && e.fromCol === c ? [e.toRow, e.toCol] : [e.fromRow, e.fromCol]));
  for (let sweep = 0; sweep < 3; sweep++) {
    let conflictFound = false;
    for (let r = 0; r < nodes.length; r++) {
      for (let c = 0; c < nodes[r].length; c++) {
        const node = nodes[r][c];
        if (node.type !== 'battle' || !node.opponent) continue;
        const conflictingNeighbor = neighborsOf(r, c).find(([nr, nc]) => {
          const nb = nodes[nr][nc];
          return nb.type === 'battle' && nb.opponent && nb.opponent.id === node.opponent.id;
        });
        if (!conflictingNeighbor) continue;
        conflictFound = true;
        // Look for another battle node in the same row whose opponent id differs from this
        // node's neighbors AND from the conflicting neighbor's own other neighbors, then swap.
        const swapTarget = nodes[r].findIndex((other, oc) => {
          if (oc === c || other.type !== 'battle' || !other.opponent) return false;
          if (other.opponent.id === node.opponent.id) return false;
          const otherConflicts = neighborsOf(r, oc).some(
            ([nr, nc]) => nodes[nr][nc].opponent && nodes[nr][nc].opponent.id === other.opponent.id
          );
          if (otherConflicts) return false;
          const wouldStillConflict = neighborsOf(r, c).some(
            ([nr, nc]) => nodes[nr][nc].opponent && nodes[nr][nc].opponent.id === other.opponent.id
          );
          return !wouldStillConflict;
        });
        if (swapTarget !== -1) {
          const tmp = node.opponent;
          nodes[r][c] = { ...node, opponent: nodes[r][swapTarget].opponent };
          nodes[r][swapTarget] = { ...nodes[r][swapTarget], opponent: tmp };
        }
      }
    }
    if (!conflictFound) break;
  }
  // World 1 only: a 50% chance (rolled once per run) of a Carnival matching game (match_hazard) before the
  // Fleet Compound (row 10), on top of its normal per-node odds. If none spawned in rows 0-9, one is
  // forced onto a random eligible battle node (skipping tutorial rows 0-1, the guaranteed Dealership at
  // row 2 and the Elite row 9).
  if (RUN.world === 1) {
    const alreadyHasEarlyMatch = nodes.slice(0, castleRow).some((row) => row.some((n) => n.type === 'match_hazard'));
    if (!alreadyHasEarlyMatch && Math.random() < 0.5) {
      const forceEligible = [];
      for (let r = 3; r <= 8; r++) {
        for (let c = 0; c < nodes[r].length; c++) {
          if (nodes[r][c].type === 'battle') forceEligible.push({ r, c });
        }
      }
      if (forceEligible.length) {
        const { r, c } = forceEligible[Math.floor(Math.random() * forceEligible.length)];
        nodes[r][c] = { type: 'match_hazard', lane: nodes[r][c].lane };
      }
    }
  }
  return { nodes, edges };
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Run State And Stops                                                           ██
// ██  The current run, travel costs, the Fleet Compound menu and stop handling.     ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

let RUN = null;
let BATTLE = null;
let selectedIdx = [];
// Click-and-drag multi-select: dragging across cards in the hand (to select several at once) or
// across cards already loaded into an item slot (to remove several at once) instead of clicking
// each one individually. See startDragSweep/updateDragSweep/finishDragSweep.
let dragSweep = null;
const FUEL_COST_PER_MOVE = 1;
// Coin-powered vehicles (the Admin Vehicle) have no fuel tank. Every stop costs coins instead, and anything
// that would hand out fuel pays out coins at this rate instead.
const FUEL_COIN_VALUE = 5;
function runHeroDef() {
  return (typeof RUN !== 'undefined' && RUN && RUN.hero && HEROES[RUN.hero.heroId]) || null;
}
function coinTravelCost() {
  const h = runHeroDef();
  return (h && h.travelCoinCost) || 0;
}
function usesCoinTravel() {
  return coinTravelCost() > 0;
}
// Gives fuel, or the coin equivalent to a coin-powered vehicle. Returns what was actually gained.
function addFuel(n) {
  if (!n) return 0;
  if (usesCoinTravel()) {
    const c = n * FUEL_COIN_VALUE;
    RUN.chips += c;
    return c;
  }
  const before = RUN.fuel;
  RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + n);
  return RUN.fuel - before;
}
// Takes fuel away (or the coin equivalent). Returns { took, unit }.
function takeFuel(n) {
  if (usesCoinTravel()) {
    const took = Math.min(RUN.chips, n * FUEL_COIN_VALUE);
    RUN.chips -= took;
    return { took, unit: 'coins' };
  }
  const took = Math.min(RUN.fuel, n);
  RUN.fuel -= took;
  return { took, unit: 'fuel' };
}
// Mini-game prizes that say "Fuel" become coin prizes for a coin-powered vehicle, so the board shows what you
// actually get.
function coinifyReward(r) {
  if (!r || r.type !== 'fuel' || !usesCoinTravel()) return r;
  const amt = r.amount * FUEL_COIN_VALUE;
  return { ...r, type: 'coins', amount: amt, label: `+${amt} Coins` };
}
function fuelChipHTML(n, plus = false) {
  if (usesCoinTravel())
    return (
      `<div class="cur chip" data-title="Paid out as coins, since this ` +
      `vehicle has no fuel tank.">${ICON.coin} ${plus ? '+' : ''}${n * FUEL_COIN_VALUE}${plus ? ' coins' : ''}</div>`
    );
  return `<div class="cur fuel">${ICON.fuel} ${plus ? '+' : ''}${n}${plus ? ' fuel' : ''}</div>`;
}
const GEM_DRAW_COST = 1;
const FUEL_HESTORE_COST = 1;
const FUEL_HEAL_AMOUNT = 10;
const OPPONENT_FUEL_HEAL_MODIFIER_DEFAULT = 0;
const ENERGY_PER_MOVE = 2;

// World difficulty curve: World 1 starts gentler (0.75x) and each later world adds 0.45. Yields: W1 0.75,
// W2 1.20, W3 1.65, W4 2.10, W5 2.55, W6 3.00.
const WORLD_DIFFICULTY_BASE = 0.75;
const WORLD_DIFFICULTY_STEP = 0.45;
function worldDifficultyMultiplier(world) {
  return WORLD_DIFFICULTY_BASE + (Math.max(1, world) - 1) * WORLD_DIFFICULTY_STEP;
}
function initRunWithStarter(id) {
  const L = META.levels;
  const baseHero = HEROES[id];
  DUNGEON_WIN_POPUP = null;
  DUNGEON_CONTINUE_POPUP = null;
  MATCH_POPUP = null;
  MATCH_RETURN_TO_MAP = false;
  MATCH_OVERLAY_ACTIVE = false;
  JOKER_GLITCH_POPUP = null;
  RETURN_TO_CASTLE_MENU = false;

  RUN = {
    worldMultiplier: worldDifficultyMultiplier(1),
    map: null,
    currentRow: -1,
    currentCol: null,
    path: [],
    health: 100 + L.hp * 15,
    maxHealth: 100 + L.hp * 15,
    chips: 40 + L.chips * 8 + (baseHero.startBonusCoins || 0),
    fuel: baseHero.travelCoinCost ? 0 : Math.min(20 + (L.fuelCap || 0) * 5, 10 + (L.fuel || 0)),
    energy: Math.min(20, (HERO_PERKS[id] || {}).startEnergy || 0),
    hero: { heroId: id, items: [...baseHero.starterItems] },
    // Every item card has real shop value now, starter items included - a starter item should be
    // able to show back up in the Dealership for a second copy, even while the run's first copy is
    // still equipped. Anything else stays excluded once owned, so the only "duplicate" possible is
    // of an item the hero actually started with. See pickShopStock().
    starterItemIds: [...baseHero.starterItems],
    itemCap: Math.min(MAX_ITEM_CAP, 3 + L.garage),
    handSize: 7 + (L.handCap || 0) * 2,
    drawPerTurn: Math.max(1, 2 + (L.draw || 0)),
    gems: 3,
    maxGems: 10 + (L.gemCap || 0) * 2,
    maxFuel: baseHero.travelCoinCost ? 0 : 20 + (L.fuelCap || 0) * 5,
    maxEnergy: 20 + (L.energyCap || 0) * 5,
    scoreThisRun: 0,
    lastNotice: null,
    cardBoosts: [],
    adminTuneLvl: 0,
    itemLevels: {},
    itemUsesLevels: {},
    itemKindOverride: {},
    itemMaxCardsLevels: {},
    itemUtilityLevels: {},
    handSortMode: 'value',
    innSleeps: 0,
    opponentsBeatenThisRun: 0,
    elitesBeatenThisRun: 0,
    perfectKillsThisRun: 0,
    careerPointsFromElites: 0,
    careerPointsFromPerfectKills: 0,
    careerPointsFromTreasure: 0,
    careerPointsFromMatchGame: 0,
    runUpgrades: { itemSlots: 0, drawPerTurn: 0, sightRange: 0, gemDraw: 0, health: 0 },
    castleState: {
      firstDone: false,
      secondDone: false,
      thirdDone: false,
      dungeonLocked: false,
      plinkoPlayed: false,
      blackjackPlayed: false,
      pokerPlayed: false,
      auctionPlayed: false,
      matchPlayed: false,
    },
    // One shared matching-game board for the whole run, whether you open it from a map Grid Anomaly
    // node or the Fleet Compound's Carnival Matching Game - pairs you've already found carry over
    // between plays no matter which entry point you use. matchGuesses resets to a fresh 4 every time
    // you open the game, but matchCards (and its matched pairs) persists until either a Joker Glitch
    // or a new run resets it - see resetMatchState().
    matchState: { matchCards: null, matchGuesses: 4, matchPick: [], matchLock: false, matchJackpotItemId: null },
  };
  RUN.world = 1;
  RUN.worldCleared = false;
  RUN.map = generateMap();
  RUN.bossRow = RUN.map.nodes.length - 1;
  saveRun();
  render(mapScreen());
}
function availableNextNodes() {
  if (RUN.currentRow === -1) return [{ row: 0, col: 0 }];
  return RUN.map.edges
    .filter((e) => e.fromRow === RUN.currentRow && e.fromCol === RUN.currentCol)
    .map((e) => ({ row: e.toRow, col: e.toCol }));
}
function payTravelCost() {
  const coinCost = coinTravelCost();
  if (coinCost) {
    // Coin-powered vehicle: each stop costs coins. If you cannot pay, it is the same as running out of fuel.
    RUN.energy = Math.min(RUN.maxEnergy, RUN.energy + ENERGY_PER_MOVE);
    RUN.innSleeps = 0;
    if (RUN.chips >= coinCost) {
      RUN.chips -= coinCost;
      return;
    }
    const coinPenalty = Math.max(0, 10 - (META.levels.fuelpen || 0) * 2);
    RUN.health = Math.max(1, RUN.health - coinPenalty);
    RUN.lastNotice =
      coinPenalty > 0
        ? `You couldn't pay the ${coinCost} coin trip! Pushing ` +
          `your fleet manually to the next stop cost you ${coinPenalty} HP.`
        : `You couldn't pay the ${coinCost} coin trip! Your Fuel ` +
          `Efficiency training kept the walk from costing you any health this time.`;
    return;
  }
  RUN.fuel -= FUEL_COST_PER_MOVE;
  RUN.energy = Math.min(RUN.maxEnergy, RUN.energy + ENERGY_PER_MOVE);
  RUN.innSleeps = 0;
  if (RUN.fuel < 0) {
    RUN.fuel = 0;
    const fuelPenalty = Math.max(0, 10 - (META.levels.fuelpen || 0) * 2);
    RUN.health = Math.max(1, RUN.health - fuelPenalty);
    RUN.lastNotice =
      fuelPenalty > 0
        ? `Out of fuel! Pushing your fleet manually to the next ` + `stop cost you ${fuelPenalty} HP.`
        : `Out of fuel! Your Fuel Efficiency training kept the ` + `walk from costing you any health this time.`;
  }
}
function commitNode(row, col) {
  RUN.currentRow = row;
  RUN.currentCol = col;
  RUN.path.push({ row, col });
  saveRun();
}
function selectNode(row, col) {
  RUN.onboardingDismissed = true;
  const node = RUN.map.nodes[row][col];
  payTravelCost();
  if (node.type === 'battle') {
    startBattle(node.opponent, row, col);
    return;
  }
  commitNode(row, col);
  if (node.type === 'castle') render(castleMenuScreen());
  else if (node.type === 'shop') {
    RETURN_TO_CASTLE_MENU = false;
    RUN.shopStock = null;
    render(shopScreen());
  } else if (node.type === 'rest') {
    GARAGE_POPUP = true;
    GARAGE_MESSAGE = '';
    render(mapScreen());
  } else if (node.type === 'blacksmith') {
    RETURN_TO_CASTLE_MENU = false;
    BLACKSMITH_OPTIONS = pickBlacksmithOptions();
    BLACKSMITH_VISIT = { primary: null, secondary: null };
    render(blacksmithScreen());
  } else if (node.type === 'chopshop') {
    RETURN_TO_CASTLE_MENU = false;
    render(chopShopScreen('map'));
  } else if (node.type === 'overdrive') {
    RETURN_TO_CASTLE_MENU = false;
    render(overdriveBayScreen('map'));
  } else if (node.type === 'treasure') {
    if (!node.big && Math.random() < 0.15) {
      TREASURE_POPUP = { choice: true };
      playSfx('open');
      render(mapScreen());
    } else {
      const found = rollTreasure(node.big);
      playSfx('open');
      TREASURE_POPUP = found;
      render(mapScreen());
    }
  } else if (node.type === 'match_hazard') {
    openMatchGame();
    MATCH_RETURN_TO_MAP = true;
    MATCH_OVERLAY_ACTIVE = true;
    renderMatchOverlay();
  } else if (node.type === 'plinko_hazard') {
    if (!RUN.castleState) RUN.castleState = {};
    if (RUN.castleState.plinkoPlayed) {
      RUN.lastNotice = 'The Plinko board here has already been played this world.';
      render(mapScreen());
      return;
    }
    RETURN_TO_CASTLE_MENU = false;
    openFleetPlinko({ onComplete: applyPlinkoHaul });
  } else if (node.type === 'blackjack_hazard') {
    if (!RUN.castleState) RUN.castleState = {};
    if (RUN.castleState.blackjackPlayed) {
      RUN.lastNotice = "You've already played Fleet Blackjack this world.";
      render(mapScreen());
      return;
    }
    RETURN_TO_CASTLE_MENU = false;
    openFleetBlackjack({ onComplete: applyBlackjackHaul });
  } else if (node.type === 'poker_hazard') {
    if (!RUN.castleState) RUN.castleState = {};
    if (RUN.castleState.pokerPlayed) {
      RUN.lastNotice = "You've already played Fleet Poker this world.";
      render(mapScreen());
      return;
    }
    RETURN_TO_CASTLE_MENU = false;
    openFleetPoker({ onComplete: applyPokerHaul });
  } else if (node.type === 'auction_hazard') {
    if (!RUN.castleState) RUN.castleState = {};
    if (RUN.castleState.auctionPlayed) {
      RUN.lastNotice = "You've already visited the Fleet Auction this world.";
      render(mapScreen());
      return;
    }
    RETURN_TO_CASTLE_MENU = false;
    openFleetAuction({ onComplete: applyAuctionHaul });
  }
}
function reenterCurrentNode(row, col) {
  const node = RUN.map.nodes[row][col];
  if (node.type === 'castle') {
    render(castleMenuScreen());
    return;
  }
  if (node.type === 'shop') {
    RETURN_TO_CASTLE_MENU = false;
    RUN.shopStock = null;
    render(shopScreen());
    return;
  }
  if (node.type === 'rest') {
    GARAGE_POPUP = true;
    GARAGE_MESSAGE = '';
    render(mapScreen());
    return;
  }
  if (node.type === 'blacksmith') {
    RETURN_TO_CASTLE_MENU = false;
    BLACKSMITH_OPTIONS = pickBlacksmithOptions();
    BLACKSMITH_VISIT = { primary: null, secondary: null };
    render(blacksmithScreen());
    return;
  }
  if (node.type === 'chopshop') {
    RETURN_TO_CASTLE_MENU = false;
    render(chopShopScreen('map'));
    return;
  }
  if (node.type === 'overdrive') {
    RETURN_TO_CASTLE_MENU = false;
    render(overdriveBayScreen('map'));
    return;
  }
  render(mapScreen());
}
let RETURN_TO_CASTLE_MENU = false;
const CASTLE_FIRST = {
  id: 'castleGuard',
  name: 'Castle Guard',
  tier: 2,
  icon: '🛡️',
  image: 'Vehicles/castle-guard.png',
  hp: 75,
  minTier: 2,
  drawRate: 3,
  items: ['opp_castle_poke_t2'],
};
const CASTLE_SECOND = {
  id: 'castleChampion',
  name: 'Castle Champion',
  tier: 3,
  icon: '🏰',
  image: 'Vehicles/castle-champion.png',
  hp: 105,
  minTier: 3,
  drawRate: 4,
  items: ['opp_castle_poke_t3'],
};
const CASTLE_THIRD = {
  id: 'castleOverlord',
  name: 'Compound Overlord',
  tier: 4,
  icon: '👑',
  image: 'Vehicles/castle-overlord.png',
  hp: 210,
  minTier: 3,
  drawRate: 5,
  usesPerTurn: 2,
  items: ['opp_castle_poke_t3', 'fender_bender'],
};
let DUNGEON_WIN_POPUP = null;
// One Fleet Compound menu button. Places you can only visit once per world show a check mark after you use them.
function castleMenuBtnHTML(id, label, used = false, extraClass = '') {
  return (
    `<button class="castleBtn ${extraClass}" id="${id}" ${used ? 'disabled' : ''}>` +
    `${used ? '&#10003; ' : ''}${label}</button>`
  );
}
function castleMenuScreen(message = '') {
  return (
    `${noticeHTML()}
  <div class="wo" style="max-width:480px;margin-left:auto;margin-right:auto">
    <div class="wo-stripe"></div><div class="wo-body">
      <h1 style="text-align:center">Fleet <em>Compound</em></h1>
      ${currencyBar()}
      ${message ? `<div class="panel"><div class="note">${message}</div></div>` : ''}
      <div class="castleMenu">
        <button class="castleBtn castleBtn-exit castleBtnWide" id="leaveCastleBtn">Back to World Map</button>
        ${castleMenuBtnHTML('castleWizardNavBtn', 'Fleet Matching Game', RUN.castleState?.matchPlayed, 'castleBtnWide')}
        ${castleMenuBtnHTML('castleDungeonNavBtn', 'Compound Dungeon', RUN.castleState?.dungeonLocked)}
        ${castleMenuBtnHTML('castlePlinkoNavBtn', 'Fleet Plinko', RUN.castleState?.plinkoPlayed)}
        ${castleMenuBtnHTML('castleBlackjackNavBtn', 'Fleet Blackjack', RUN.castleState?.blackjackPlayed)}
        ${castleMenuBtnHTML('castlePokerNavBtn', 'Fleet Poker', RUN.castleState?.pokerPlayed)}
        ${castleMenuBtnHTML('castleAuctionNavBtn', 'Fleet Auction', RUN.castleState?.auctionPlayed)}
        ${castleMenuBtnHTML('castleBlacksmithNavBtn', 'Tuning Garage')}
        ${castleMenuBtnHTML('castleChopShopNavBtn', 'Chop Shop')}
        ${castleMenuBtnHTML('castleOverdriveNavBtn', 'Overdrive Bay')}
        ${castleMenuBtnHTML('castleShopNavBtn', 'Dealership')}
        ${castleMenuBtnHTML('castleInnNavBtn', 'Body Shop')}
      </div>
    </div>
  </div>
  ${MATCH_OVERLAY_ACTIVE ? castleMatchScreen() : ''}`
  );
}
let DUNGEON_CONTINUE_POPUP = null;
function castleDungeonScreen(message = '') {
  if (DUNGEON_WIN_POPUP) {
    const p = DUNGEON_WIN_POPUP;
    const wonItem = ITEMS[p.itemId];
    return (
      `<div class="treasure-modal"><div class="wo" style="max-width:440px">
      <div class="wo-stripe"></div>
      <div class="wo-body" style="text-align:center">
        <div class="wo-eyebrow">Dungeon Cleared</div>
        <h1>You <em>Won</em>!</h1>
        ${wonItem ? `<div style="max-width:180px;margin:8px auto 0">${renderStandardItemCard(wonItem, {})}</div>` : `<div class="treasure-prize">${p.itemName}</div>`}
        <div class="note" style="margin-top:8px">New Item Card added to your Fleet, ` +
      `plus ${formatRewardParts({ coins: p.reward.coins, gems: p.reward.gems, fuel: p.reward.fuel, energy: p.reward.energy }, { coins: 'coins', gems: 'gems', fuel: 'fuel', energy: 'energy' })}.</div>
        <button class="wo-btn amber" id="dungeonWinContinueBtn" style="width:100%;margin-top:10px">Nice!</button>
      </div>
    </div></div>`
    );
  }
  if (DUNGEON_CONTINUE_POPUP) {
    const p = DUNGEON_CONTINUE_POPUP;
    const nextLabel = p.stage === 1 ? 'the High-Roller Battle' : 'the Overlord Battle';
    return (
      `<div class="treasure-modal"><div class="wo" style="max-width:440px">
      <div class="wo-stripe"></div>
      <div class="wo-body" style="text-align:center;padding-top:10px">
        <h1 style="margin-top:0">Good <em>Job!</em></h1>
        <div class="note">You ` +
      `earned ${formatRewardParts({ coins: p.reward.coins, gems: p.reward.gems, fuel: p.reward.fuel, energy: p.reward.energy }, { coins: 'coins', gems: 'gems', fuel: 'fuel', energy: 'energy' })}.</div>
        <div class="note" style="margin-top:6px;white-space:nowrap;font-size:clamp(10px,3.1vw,` +
      `13px)">Risk your earnings and keep going?</div>
        <button class="wo-btn amber" id="dungeonContinueBtn" style="width:100%;margin-top:10px">` +
      `Continue to ${nextLabel}</button>
        <button class="wo-btn red" id="dungeonCashOutBtn" style="width:100%;margin-top:8px">` +
      `Cash Out and Leave</button>
      </div>
    </div></div>`
    );
  }
  const locked = RUN.castleState?.dungeonLocked;
  return (
    `${noticeHTML()}
  <div class="wo">
    <div class="wo-stripe"></div><div class="wo-body">
      <h1>Fleet Compound <em>Dungeon</em></h1>
      ${currencyBar()}
      <div style="display:flex;gap:8px;margin:8px 0">
        <button class="wo-btn facilityExitBtn" id="backToCastleMenuBtn" style="flex:1">Back to Compound</button>
        <button class="wo-btn purple" id="openRunUpgradeFromDungeonBtn" style="flex:1">Upgrades</button>
      </div>
      ${message ? `<div class="panel"><div class="note">${message}</div></div>` : ''}
      ${
        locked
          ? `<div class="note" style="margin-top:8px">Dungeon closed for this world. You ` +
            `cashed out after Battle ${RUN.castleState?.secondDone ? 2 : 1}.</div>`
          : !RUN.castleState?.firstDone
            ? `<button class="wo-btn amber" id="castleBattle1Btn" ` +
              `style="width:100%;margin-bottom:8px">Battle 1</button>`
            : RUN.castleState?.thirdDone
              ? `<div class="note" style="margin-top:8px">Dungeon ` + `cleared for this world.</div>`
              : ''
      }
      <div class="note" style="color:var(--red);font-weight:700;margin:0 0 8px;` +
    `text-align:center;font-size:12px">Leaving locks the dungeon for this world only. You can try ` +
    `again in a later world.</div>
      <div class="dungeonRows">
        <div class="dungeonRow" style="${RUN.castleState?.firstDone ? 'opacity:0.55' : ''}">` +
    `<div class="dungeonRowName"><b>Battle 1</b><span>Moderate</span></div><div class="currencies ` +
    `dungeonRowRewards"><div class="cur chip">${ICON.coin} 45</div><div class="cur gem">${ICON.gem} ` +
    `1</div>${fuelChipHTML(1)}<div class="cur energy">${ICON.energy} 2</div></div></div>
        <div class="dungeonRow" style="${RUN.castleState?.secondDone ? 'opacity:0.55' : ''}">` +
    `<div class="dungeonRowName"><b>Battle 2</b><span>Hard</span></div><div class="currencies ` +
    `dungeonRowRewards"><div class="cur chip">${ICON.coin} 100</div><div class="cur gem">${ICON.gem} ` +
    `2</div>${fuelChipHTML(2)}<div class="cur energy">${ICON.energy} 4</div></div></div>
        <div class="dungeonRow" style="${RUN.castleState?.thirdDone ? 'opacity:0.55' : ''}">` +
    `<div class="dungeonRowName"><b>Battle 3</b><span>Extreme</span></div><div class="currencies ` +
    `dungeonRowRewards"><div class="cur chip">${ICON.coin} 160</div><div class="cur gem">${ICON.gem} ` +
    `4</div>${fuelChipHTML(4)}<div class="cur energy">${ICON.energy} 8</div><div class="cur" ` +
    `style="font-size:11px">+ Item Card</div></div></div>
      </div>
    </div>
  </div>`
  );
}
const SERVICE_STATION_FUEL_COST_PER_UNIT = 5;
const SERVICE_STATION_MAX_FUEL_PER_VISIT = 10;
// Fuel gets pricier (the Body Shop and the Service Station each keep their own count) the more you buy in one
// world: the first 10 units cost 5 coins each, then each extra unit costs 5 more than the last (10, 15, 20...). The
// count resets every world.
const BODY_SHOP_FUEL_FULL_PRICE_UNITS = 10;
function bodyShopFuelUnitPrice(boughtSoFar) {
  const extra = Math.max(0, boughtSoFar - BODY_SHOP_FUEL_FULL_PRICE_UNITS + 1);
  return SERVICE_STATION_FUEL_COST_PER_UNIT * (1 + extra);
}
function bodyShopFuelBought() {
  return (RUN.castleState && RUN.castleState.fuelBought) || 0;
}
function stationFuelBought() {
  return (RUN.castleState && RUN.castleState.stationFuelBought) || 0;
}
function bodyShopFuelQuote() {
  const bought = bodyShopFuelBought();
  const missing = Math.max(0, RUN.maxFuel - RUN.fuel);
  let units = 0,
    cost = 0;
  while (units < missing && units < SERVICE_STATION_MAX_FUEL_PER_VISIT) {
    const price = bodyShopFuelUnitPrice(bought + units);
    if (cost + price > RUN.chips) break;
    cost += price;
    units++;
  }
  return { units, cost, nextPrice: bodyShopFuelUnitPrice(bought + units), bought };
}
function resetBodyShopFuelState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.fuelBought = 0;
  RUN.castleState.stationFuelBought = 0;
}
function castleInnScreen(message = '') {
  const fuelQuote = bodyShopFuelQuote();
  const fuelPurchase = fuelQuote.units;
  const fuelCost = fuelQuote.cost;
  const sleepCost = RUN.innSleeps === 0 ? 0 : 20 * RUN.innSleeps;
  return (
    `${noticeHTML()}
  <div class="wo bodyShopWo">
    <div class="wo-stripe"></div>
    <div class="wo-body">
      <h1 style="text-align:center">Body <em>Shop</em></h1>
      ${currencyBar()}
      <div style="display:flex;gap:8px;margin:10px 0">
        <button class="wo-btn facilityExitBtn" id="backToCastleMenuBtn" style="flex:1">Back to Compound</button>
        <button class="wo-btn purple" id="openRunUpgradeFromInnBtn" style="flex:1">Upgrades</button>
      </div>
      ${message ? `<div class="panel"><div class="note">${message}</div></div>` : ''}
      <div>
        ${
          usesCoinTravel()
            ? ''
            : `        <div class="shopcard bodyShopRow">
          <h3>Refuel</h3>
          <button class="wo-btn bodyShopBtn hoverTip" id="castleFuelBtn" data-title="Fuel gets ` +
              `more expensive the more you buy here in one world. Next unit costs ${fuelQuote.nextPrice} ` +
              `coins. The price resets in the next world." ${fuelPurchase <= 0 ? 'disabled' : ''}>` +
              `+${fuelPurchase} Fuel${fuelCost ? ` = ${fuelCost} coins` : ''}</button>
        </div>`
        }
        <div class="shopcard bodyShopRow">
          <h3>Dent Repair</h3>
          <button class="wo-btn bodyShopBtn" ` +
    `id="castleRestBtn" ${RUN.health >= RUN.maxHealth ? 'disabled' : ''}>+30 ` +
    `Health${sleepCost ? ` = ${sleepCost} coins` : ''}</button>
        </div>
      </div>
    </div>
  </div>`
  );
}
const MATCH_SUIT_REWARDS = {
  '♦': { fuel: 2, label: '+2 fuel' },
  '♣': { gems: 1, label: '+1 gem' },
  '♥': { health: 20, label: '+20 health' },
  '♠': { energy: 4, label: '+4 energy' },
  RJ: { gems: 3, label: '+3 gems' },
  BJ: { points: 25, label: '+25 Career Points' },
};
let MATCH_POPUP = null;
let MATCH_RETURN_TO_MAP = false;
let MATCH_OVERLAY_ACTIVE = false;
function placeMatchPopup() {
  const modal = document.querySelector('.match-modal'),
    grid = document.querySelector('.matchGrid');
  if (!modal || !grid) return;
  const wo = modal.querySelector('.wo');
  if (!wo) return;
  modal.classList.add('placed');
  const place = () => {
    const g = grid.getBoundingClientRect(),
      tile = grid.querySelector('.matchTile'),
      th = tile ? tile.getBoundingClientRect().height : 100;
    const cx = g.left + g.width / 2,
      cy = g.top + th + 4; // middle of the board, on the line between row 1 and row 2
    const h = wo.getBoundingClientRect().height,
      w = wo.getBoundingClientRect().width;
    wo.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, cx - w / 2)) + 'px';
    wo.style.top = Math.max(8, Math.min(window.innerHeight - h - 8, cy - h / 2)) + 'px';
  };
  place();
  requestAnimationFrame(place);
}
function renderMatchOverlay() {
  render(MATCH_RETURN_TO_MAP ? mapScreen() : castleMenuScreen());
}
let JOKER_GLITCH_POPUP = null;
// Builds the "here's what you won" line for the end-of-attempts popup out of this visit's
// visitTally, skipping anything that stayed at zero. Returns a fallback line if nothing was won.
// Match game prizes use the same colored chips, icons and fonts as the resource bar at the top of the screen,
// so each prize looks like the thing it adds to. r = { coins, gems, fuel, health, energy, points }.
function matchRewardChipsHTML(r) {
  const chips = [];
  if (r.coins) chips.push(`<div class="cur chip">${ICON.coin} +${r.coins} coins</div>`);
  if (r.gems) chips.push(`<div class="cur gem">${ICON.gem} +${r.gems} gems</div>`);
  if (r.fuel) chips.push(fuelChipHTML(r.fuel, true));
  if (r.health) chips.push(`<div class="cur health">${ICON.heart} +${r.health} health</div>`);
  if (r.energy) chips.push(`<div class="cur energy">${ICON.energy} +${r.energy} energy</div>`);
  if (r.points) chips.push(`<div class="cur pts">${ICON.star} +${r.points} Career Points</div>`);
  if (!chips.length) return '';
  return `<div class="currencies matchPrizeChips">${chips.join('')}</div>`;
}
function matchVisitTallyLabel(st) {
  const t = (st && st.visitTally) || {};
  // The visit tally already turns fuel into coins for vehicles without a tank, so fuel is passed as 0 there.
  const chips = matchRewardChipsHTML({
    coins: t.coins,
    gems: t.gems,
    fuel: usesCoinTravel() ? 0 : t.fuel,
    health: t.health,
    energy: t.energy,
    points: t.points,
  });
  return chips || 'No pairs matched this visit.';
}
function jackpotPreviewCardHTML(st) {
  const item = ITEMS[st.matchJackpotItemId];
  if (!item) return '<div class="note">No item available</div>';
  return `<div style="max-width:150px;margin:6px auto 0">${renderStandardItemCard(item, {})}</div>`;
}
// Full reset of the shared matching-game board: wipes every matched pair and reshuffles fresh next
// time it's opened. Only two things should ever call this - starting a new run (the fresh RUN object
// already gives a clean matchState) and a Joker Glitch (Red Joker + Black Joker flipped together).
// Running out of attempts on one visit, leaving and coming back, or advancing to a new world must all
// leave existing pairs alone - see openMatchGame() below for that "fresh attempts, same board" case.
function resetMatchState() {
  RUN.matchState = {
    matchCards: null,
    matchGuesses: 4,
    matchPick: [],
    matchLock: false,
    matchJackpotItemId: null,
    visitTally: {},
  };
}
// Gives the shared matching board a fresh set of attempts for a newly-opened session without
// touching matchCards, so pairs already found - whether from a previous visit or from a different
// Grid Anomaly node - are still sitting there matched when the board renders. visitTally resets
// every time the board is opened, so the end-of-attempts summary only ever shows what was won
// during THIS visit, not the run's running total.
function openMatchGame() {
  if (!RUN.matchState)
    RUN.matchState = {
      matchCards: null,
      matchGuesses: 4,
      matchPick: [],
      matchLock: false,
      matchJackpotItemId: null,
      visitTally: {},
    };
  RUN.matchState.matchGuesses = 4;
  RUN.matchState.matchPick = [];
  RUN.matchState.matchLock = false;
  RUN.matchState.visitTally = {};
}
// One shared matching-game board for the whole run - the map's Grid Anomaly nodes and the Fleet
// Compound's Carnival Matching Game both read/write this same object, so pairs found at either one
// are still there the next time either one is opened.
function getMatchState() {
  if (!RUN.matchState)
    RUN.matchState = {
      matchCards: null,
      matchGuesses: 4,
      matchPick: [],
      matchLock: false,
      matchJackpotItemId: null,
      visitTally: {},
    };
  if (!RUN.matchState.visitTally) RUN.matchState.visitTally = {};
  return RUN.matchState;
}
// The Fleet Compound Dungeon locks only for the world you left it in - leaving it in World 1
// still lets you enter (and re-clear) it fresh in World 2, 3, etc. So its progress/lock flags
// get reset here alongside the matching game's, every time a new world starts.
function resetDungeonState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.firstDone = false;
  RUN.castleState.secondDone = false;
  RUN.castleState.thirdDone = false;
  RUN.castleState.dungeonLocked = false;
}
// Fleet Plinko locks for the world once played, same as the Carnival matching game and the
// Dungeon - reset alongside them every time a new world starts.
function resetPlinkoState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.plinkoPlayed = false;
}
// Fleet Blackjack, Fleet Poker, and Fleet Auction all follow the exact same one-per-world
// pattern as Plinko/Matching Game/Dungeon above - reset alongside them every new world.
function resetBlackjackState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.blackjackPlayed = false;
}
function resetPokerState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.pokerPlayed = false;
}
function resetAuctionState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.auctionPlayed = false;
}
// The Fleet Compound's Carnival Matching Game is limited to one play per world, like Plinko, Blackjack,
// Poker and Auction, and resets with them here.
function resetMatchPlayedState() {
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.matchPlayed = false;
}
// Applies a finished Plinko run's haul into the actual run economy (coins/gems/fuel are capped
// the same way every other reward source in the game caps them), marks the board played for
// this world, and drops the player back on the Fleet Compound menu.
function applyPlinkoHaul(haul) {
  if (!RUN) return;
  if (!RUN.castleState) RUN.castleState = {};
  RUN.castleState.plinkoPlayed = true;
  if (!haul.lost) {
    if (haul.coins) RUN.chips += haul.coins;
    if (haul.gems) RUN.gems = Math.min(RUN.maxGems, RUN.gems + haul.gems);
    if (haul.fuel) RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + haul.fuel);
    if (haul.coins || haul.gems || haul.fuel)
      RUN.lastNotice = `Plinko haul banked: ${[haul.coins ? `${haul.coins} coins` : '', haul.gems ? `${haul.gems} gem${haul.gems > 1 ? 's' : ''}` : '', haul.fuel ? `${haul.fuel} fuel` : ''].filter(Boolean).join(', ')}.`;
  }
  saveRun();
  render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
}
