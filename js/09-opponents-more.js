// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Map Generation                                                                ██
// ██  Building the route for a world, with the Fleet Compound in the middle.        ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function pickNodeType(forcedType) {
  if (forcedType) return forcedType;
  const r = Math.random();
  if (r < 0.58) return 'battle';
  if (r < 0.67) return 'rest';
  if (r < 0.75) return 'blacksmith';
  if (r < 0.8) return 'chopshop';
  if (r < 0.84) return 'overdrive';
  if (r < 0.9) return 'shop';
  if (r < 0.93) return 'match_hazard';
  if (r < 0.94) return 'plinko_hazard';
  if (r < 0.95) return 'blackjack_hazard';
  if (r < 0.96) return 'poker_hazard';
  if (r < 0.97) return 'auction_hazard';
  return 'treasure';
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Opponent Scaling                                                              ██
// ██  Reusing an opponent in a later world.                                         ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function scaleMonsterForNewWorld(baseMonster, worldMultiplier, tier) {
  const scaled = JSON.parse(JSON.stringify(baseMonster));
  if (tier != null) scaled.tier = tier;
  scaled.hp = Math.round(scaled.hp * worldMultiplier);
  if (scaled.attacks) {
    scaled.attacks.forEach((a) => {
      if (a.autoFire) a.autoFire.damage = Math.round(a.autoFire.damage * worldMultiplier);
      if (a.sumThreshold) a.sumThreshold.damage = Math.round(a.sumThreshold.damage * worldMultiplier);
      if (a.fewCardsThreshold) a.fewCardsThreshold.damage = Math.round(a.fewCardsThreshold.damage * worldMultiplier);
      if (a.perFaceCard) a.perFaceCard.damage = Math.round(a.perFaceCard.damage * worldMultiplier);
      if (a.suitPunish) a.suitPunish.base = Math.round((a.suitPunish.base || 0) * worldMultiplier);
    });
  }
  return scaled;
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Opponents: Worlds 7 And 8                                                     ██
// ██  Items and opponent pools for Port Everglades and the Fleet Compound.          ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// prettier-ignore

Object.assign(ITEMS, {
  w7_stack_collapse: {
    id: 'w7_stack_collapse', name: 'Stack Collapse', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 2.18,
    note: 'Needs a Pair. Forty tons of shipping container lean your way.'
  },
  w7_crane_swing: {
    id: 'w7_crane_swing', name: 'Mule Charge', maxCards: 4, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 16}, flatAmount: 26,
    note: (`Needs cards totaling ${SIGMA_TIP}16+. A yard truck with nobody driving it whips ` +
      `around the corner at full speed.`)
  },
  w7_hook_snag: {
    id: 'w7_hook_snag', name: 'Coupler Snag', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 9, note: 'Needs exactly 1 card. The coupler catches whatever it can reach.'
  },
  w7_net_drop: {
    id: 'w7_net_drop', name: 'Sniff Out', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, baseMult: 1.76, kind: 'hex',
    note: 'Needs 3 Black cards. Sniffs out a card and trots off with it. Hexes one of your Items.'
  },
  w7_fuel_fire: {
    id: 'w7_fuel_fire', name: 'Fuel Fire', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.06, kind: 'burn', note: 'Needs a Pair. One spark is all the puddle needed. Burns you.'
  },
  w7_exhaust_cough: {
    id: 'w7_exhaust_cough', name: 'Exhaust Cough', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 1.1, kind: 'poison',
    note: 'Needs a Pair. Black smoke rolls across the pier. Poisons you.'
  },
  w7_wake_slam: {
    id: 'w7_wake_slam', name: 'Wake Slam', maxCards: 3, usesPerTurn: 1, condition: {type: 'straightLen', len: 3},
    baseMult: 3.56, note: 'Needs 3 cards in a row. Nobody on the pier saw it coming.'
  },
  w7_hold_inspection: {
    id: 'w7_hold_inspection', name: 'Hold For Inspection', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 1, kind: 'curse',
    note: 'Needs a Pair. Something in your paperwork is not quite right. Curses one of your Items.'
  },
  w7_stamp: {
    id: 'w7_stamp', name: 'Rubber Stamp', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 8, note: 'Needs exactly 1 card. Denied, loudly.'
  },
  w7_forklift_ram: {
    id: 'w7_forklift_ram', name: 'Forks Up', maxCards: 3, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 14},
    flatAmount: 24, note: `Needs cards totaling ${SIGMA_TIP}14+. Nobody is driving it.`
  },
  w7_tug_shove: {
    id: 'w7_tug_shove', name: 'Tug Shove', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.96, note: 'Needs a Pair. Small boat, enormous engine.'
  },
  w7_tug_horn: {
    id: 'w7_tug_horn', name: 'Air Horn', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 1, drawPerLevel: 0,
    note: 'Needs 3 Red cards. The blast rattles everyone into position. Draws 1 card for its next attack.'
  },
  w7_line_whip: {
    id: 'w7_line_whip', name: 'Shift Rush', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 14, note: 'Needs exactly 1 card. A van full of tired dockworkers cuts across your lane.'
  },
  w7_radar_static: {
    id: 'w7_radar_static', name: 'Gangway Dash', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 4.56, kind: 'lightning',
    note: ('Needs a Pair. Sprints for the gangway with luggage flying. Damage is randomized by ' +
      'the shared Lightning roll.')
  },
  w7_mast_strike: {
    id: 'w7_mast_strike', name: 'Mast Strike', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 14}, flatAmount: 30, kind: 'lightning',
    note: (`Needs cards totaling ${SIGMA_TIP}14+. The tallest thing on the dock takes the hit, ` +
      `then passes it on. Damage is randomized by the shared Lightning roll.`)
  },
  w7_beak_snap: {
    id: 'w7_beak_snap', name: 'Beak Snap', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 11, note: 'Needs exactly 1 card. It wants the sandwich you do not have.'
  },
  w7_pelican_dive: {
    id: 'w7_pelican_dive', name: 'Dive Bomb', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1, note: 'Needs a Pair. Straight down, no warning.'
  },
  w7_cold_hold: {
    id: 'w7_cold_hold', name: 'Cold Hold', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.49, kind: 'ice', note: 'Needs a Pair. The hatch swings shut on your gear. Freezes one of your Items.'
  },
  w7_hull_scrape: {
    id: 'w7_hull_scrape', name: 'Hull Scrape', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 10}, flatAmount: 15,
    note: `Needs cards totaling ${SIGMA_TIP}10+. Sharp, slow and hard to stop.`
  },
  w7_heave: {
    id: 'w7_heave', name: 'Heave', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 2.4, note: 'Needs a Pair. One more pallet before the shift ends.'
  },
  w7_shift_change: {
    id: 'w7_shift_change', name: 'Shift Change', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 2, drawPerLevel: 0,
    note: 'Needs 3 Red cards. Fresh crew, fresh hands. Draws 2 cards for its next attack.'
  },
  w7_scrap_slide: {
    id: 'w7_scrap_slide', name: 'Scrap Slide', maxCards: 4, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 18}, flatAmount: 28,
    note: `Needs cards totaling ${SIGMA_TIP}18+. The whole load decides to move at once.`
  },
  w7_salt_fog: {
    id: 'w7_salt_fog', name: 'Salt Fog', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.1, kind: 'poison', note: 'Needs a Pair. Damp, thick and somehow sour. Poisons you.'
  },
  w7_fog_horn: {
    id: 'w7_fog_horn', name: 'Fog Horn', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 7, note: 'Needs exactly 1 card. Low and long.'
  },
  w7_slick_flash: {
    id: 'w7_slick_flash', name: 'Slick Flash', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.21, kind: 'burn', note: 'Needs a Pair. The water itself catches. Burns you.'
  },
  w7_dock_lockdown: {
    id: 'w7_dock_lockdown', name: 'No Entry', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.87, kind: 'curse',
    note: ('Needs a Pair. Folds his arms, blocks the gate and nothing works until he says so. ' +
      'Curses one of your Items.')
  },
  w7_pat_down: {
    id: 'w7_pat_down', name: 'Pat Down', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 0, utilityEffect: 'discardHand', discardCount: 1,
    note: 'Needs a Pair. A card goes missing from your hand. Knocks 1 card out of your hand.'
  },
  w7_boom_gate: {
    id: 'w7_boom_gate', name: 'Boom Gate', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 10, note: 'Needs exactly 1 card. Down fast, up slow.'
  },
  w7_hull_slam: {
    id: 'w7_hull_slam', name: 'Hull Slam', maxCards: 4, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 2},
    baseMult: 1.3, note: 'Needs Two Pair. A quarter mile of steel with nobody on the bridge.'
  },
  w7_stack_shift: {
    id: 'w7_stack_shift', name: 'Stack Shift', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 0.9, kind: 'curse',
    note: 'Needs a Pair. The load moves and something of yours locks up. Curses one of your Items.'
  },
  w7_bridge_lights: {
    id: 'w7_bridge_lights', name: 'Bridge Lights', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 2, drawPerLevel: 0,
    note: 'Needs 3 Red cards. Someone finally woke up on deck. Draws 2 cards for its next attack.'
  },
  w7_gantry_bolt: {
    id: 'w7_gantry_bolt', name: 'Gantry Bolt', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 2, kind: 'lightning',
    note: ('Needs a Pair. Two hundred feet of conductor in a thunderstorm. Damage is randomized ' +
      'by the shared Lightning roll.')
  },
  w7_hoist_drop: {
    id: 'w7_hoist_drop', name: 'Hoist Drop', maxCards: 4, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 18},
    flatAmount: 28, note: `Needs cards totaling ${SIGMA_TIP}18+. The load lets go.`
  },
  w7_counterweight: {
    id: 'w7_counterweight', name: 'Counterweight', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, baseMult: 1.2, kind: 'hex',
    note: 'Needs 3 Black cards. The swing drags a card out of your hand. Hexes one of your Items.'
  },
  w7_full_search: {
    id: 'w7_full_search', name: 'Full Search', maxCards: 4, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 2},
    baseMult: 1.2, kind: 'ice',
    note: 'Needs Two Pair. Your whole rig is held until they finish. Freezes one of your Items.'
  },
  w7_contraband_check: {
    id: 'w7_contraband_check', name: 'Contraband Check', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 0, utilityEffect: 'discardHand', discardCount: 2,
    note: 'Needs a Pair. Two cards leave your hand and do not come back. Knocks 2 cards out of your hand.'
  },
  w7_backup_called: {
    id: 'w7_backup_called', name: 'Backup Called', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 1, drawPerLevel: 0,
    note: 'Needs 3 Red cards. More officers arrive. Draws 1 card for its next attack.'
  },
  w7_close_the_gates: {
    id: 'w7_close_the_gates', name: 'Close The Gates', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, kind: 'defense', flatAmount: 0,
    opponentEffect: 'reinforceArmor', reinforceAmount: 47,
    note: 'Needs 3 Black cards. Seals the port. Reinforces itself with 47 armor.'
  },
  w7_final_tally: {
    id: 'w7_final_tally', name: 'Final Tally', maxCards: 4, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 4}, flatAmount: 48,
    note: 'Needs 4 Red cards. Every crate counted, every debt collected.'
  },
  w8_lift_drop: {
    id: 'w8_lift_drop', name: 'Window Slam', maxCards: 4, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 16},
    flatAmount: 28, note: `Needs cards totaling ${SIGMA_TIP}16+. Slams the parts window shut right on your hand.`
  },
  w8_lift_creak: {
    id: 'w8_lift_creak', name: 'Backorder Sigh', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 9, note: 'Needs exactly 1 card. A long sigh, and the part is on backorder again.'
  },
  w8_bin_spill: {
    id: 'w8_bin_spill', name: 'Bin Spill', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 2.28, note: 'Needs a Pair. Every bolt in the building, all at once.'
  },
  w8_wash_runoff: {
    id: 'w8_wash_runoff', name: 'Soapy Runoff', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.1, kind: 'poison',
    note: 'Needs a Pair. Something in the chemical mix is not supposed to be in there. Poisons you.'
  },
  w8_pressure_blast: {
    id: 'w8_pressure_blast', name: 'Pressure Blast', maxCards: 1, usesPerTurn: 1,
    condition: {type: 'any', exactCount: 1}, flatAmount: 12,
    note: 'Needs exactly 1 card. Two thousand PSI at close range.'
  },
  w8_pump_flare: {
    id: 'w8_pump_flare', name: 'Pump Flare', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.1, kind: 'burn', note: 'Needs a Pair. Somebody forgot to shut the nozzle. Burns you.'
  },
  w8_fuel_splash: {
    id: 'w8_fuel_splash', name: 'Fuel Splash', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 10, note: 'Needs exactly 1 card. Wet and flammable.'
  },
  w8_tire_roll: {
    id: 'w8_tire_roll', name: 'Tire Shine Slick', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'straightLen', len: 3}, baseMult: 3.84,
    note: 'Needs 3 cards in a row. Sprays tire shine across the lot and everything slides.'
  },
  w8_scanner_override: {
    id: 'w8_scanner_override', name: 'Audit Adjustment', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, baseMult: 2.16, kind: 'hex',
    note: 'Needs 3 Black cards. Reviews your hand and adjusts a card out of it. Hexes one of your Items.'
  },
  w8_charger_arc: {
    id: 'w8_charger_arc', name: 'Crossed Cables', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 14}, flatAmount: 32, kind: 'lightning',
    note: (`Needs cards totaling ${SIGMA_TIP}14+. Jumper cables clamped on backward at 3 a.m. ` +
      `Damage is randomized by the shared Lightning roll.`)
  },
  w8_pit_chill: {
    id: 'w8_pit_chill', name: 'Safety Violation', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 1, kind: 'ice',
    note: 'Needs a Pair. Finds a violation and shuts one of your Items down. Freezes one of your Items.'
  },
  w8_pit_splash: {
    id: 'w8_pit_splash', name: 'Clipboard Smack', maxCards: 1, usesPerTurn: 1,
    condition: {type: 'any', exactCount: 1}, flatAmount: 9,
    note: 'Needs exactly 1 card. A clipboard swung right at your mirror.'
  },
  w8_gate_hold: {
    id: 'w8_gate_hold', name: 'Gate Hold', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.1, kind: 'curse', note: 'Needs a Pair. Your paperwork is not in order. Curses one of your Items.'
  },
  w8_gate_swing: {
    id: 'w8_gate_swing', name: 'Gate Swing', maxCards: 3, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 12},
    flatAmount: 18, note: `Needs cards totaling ${SIGMA_TIP}12+. Heavier than it looks.`
  },
  w8_po_reject: {
    id: 'w8_po_reject', name: 'Rejected', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 2.03, kind: 'curse', note: 'Needs a Pair. Missing a signature. Again. Curses one of your Items.'
  },
  w8_po_reroute: {
    id: 'w8_po_reroute', name: 'Reroute For Approval', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 2, drawPerLevel: 0,
    note: 'Needs 3 Red cards. It goes around one more time. Draws 2 cards for its next attack.'
  },
  w8_cat_swipe: {
    id: 'w8_cat_swipe', name: 'Swipe', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 13, note: 'Needs exactly 1 card. Claws first, questions never.'
  },
  w8_cat_knock: {
    id: 'w8_cat_knock', name: 'Knock It Off The Bench', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 0, utilityEffect: 'discardHand', discardCount: 1,
    note: 'Needs a Pair. One card off the edge, on purpose. Knocks 1 card out of your hand.'
  },
  w8_wrench_chatter: {
    id: 'w8_wrench_chatter', name: 'Impact Rattle', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 12}, flatAmount: 20,
    note: (`Needs cards totaling ${SIGMA_TIP}12+. Fourth energy drink, and the impact wrench is ` +
      `spinning with nothing to grip.`)
  },
  w8_creeper_slide: {
    id: 'w8_creeper_slide', name: 'Creeper Slide', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'straightLen', len: 3}, baseMult: 3.6,
    note: 'Needs 3 cards in a row. Low, fast and right at the ankles.'
  },
  w8_drain_ooze: {
    id: 'w8_drain_ooze', name: 'Mystery Seep', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1, kind: 'poison',
    note: 'Needs a Pair. Nobody knows what it is, and it finds every crack. Poisons you.'
  },
  w8_drain_flash: {
    id: 'w8_drain_flash', name: 'Flash Fire', maxCards: 4, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 2},
    baseMult: 1, kind: 'burn', note: 'Needs Two Pair. The shop floor is one big fuse. Burns you.'
  },
  w8_booth_fumes: {
    id: 'w8_booth_fumes', name: 'Burning Smell', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.2, kind: 'poison',
    note: 'Needs a Pair. A sweet, headache-sharp smell nobody has gotten around to checking. Poisons you.'
  },
  w8_arc_flash: {
    id: 'w8_arc_flash', name: 'Arc Flash', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.9, kind: 'lightning',
    note: 'Needs a Pair. Do not look at it. Damage is randomized by the shared Lightning roll.'
  },
  w8_arc_spatter: {
    id: 'w8_arc_spatter', name: 'Spatter', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 9, kind: 'burn', note: 'Needs exactly 1 card. Small, hot and everywhere. Burns you.'
  },
  w8_hose_whip: {
    id: 'w8_hose_whip', name: 'Hose Whip', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 16, note: 'Needs exactly 1 card. Pressurized and loose.'
  },
  w8_hose_burst: {
    id: 'w8_hose_burst', name: 'Hose Burst', maxCards: 3, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 14},
    flatAmount: 24, note: `Needs cards totaling ${SIGMA_TIP}14+. The fitting lets go.`
  },
  w8_gen_surge: {
    id: 'w8_gen_surge', name: 'Fish Reheat', maxCards: 3, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 12},
    flatAmount: 28, kind: 'lightning',
    note: (`Needs cards totaling ${SIGMA_TIP}12+. Reheats yesterday's fish and the smell hits ` +
      `all at once. Damage is randomized by the shared Lightning roll.`)
  },
  w8_gen_hum: {
    id: 'w8_gen_hum', name: 'Microwave Hum', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 1, drawPerLevel: 0,
    note: 'Needs 3 Red cards. The microwave hums back to life. Draws 1 card for its next attack.'
  },
  w8_fridge_chill: {
    id: 'w8_fridge_chill', name: 'Cold Shoulder', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 1, kind: 'ice',
    note: 'Needs a Pair. Gives you the cold shoulder and shuts one of your Items down. Freezes one of your Items.'
  },
  w8_fridge_hex: {
    id: 'w8_fridge_hex', name: 'Order Denied', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, baseMult: 1.1, kind: 'hex',
    note: 'Needs 3 Black cards. Refuses your order and keeps a card for himself. Hexes one of your Items.'
  },
  w8_keys_lost: {
    id: 'w8_keys_lost', name: 'Lost Keys', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 0, utilityEffect: 'discardHand', discardCount: 2,
    note: 'Needs a Pair. Two cards you were counting on are gone. Knocks 2 cards out of your hand.'
  },
  w8_keys_snap: {
    id: 'w8_keys_snap', name: 'Key Toss', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 8, note: 'Needs exactly 1 card. Tosses the keyring across the desk and clips your hand.'
  },
  w8_clock_punch: {
    id: 'w8_clock_punch', name: 'Punch Out', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.1, kind: 'curse', note: 'Needs a Pair. Your time is running out. Curses one of your Items.'
  },
  w8_clock_tick: {
    id: 'w8_clock_tick', name: 'Ringing Phones', maxCards: 1, usesPerTurn: 1, condition: {type: 'any', exactCount: 1},
    flatAmount: 8, note: 'Needs exactly 1 card. Every line ringing at once.'
  },
  w8_mob_pitchforks: {
    id: 'w8_mob_pitchforks', name: 'Pitchforks Up', maxCards: 4, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 2}, baseMult: 1.4,
    note: 'Needs Two Pair. They have waited on hold long enough.'
  },
  w8_mob_petition: {
    id: 'w8_mob_petition', name: 'Signed Petition', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 1, kind: 'curse',
    note: 'Needs a Pair. Every signature is one more problem. Curses one of your Items.'
  },
  w8_mob_public_comment: {
    id: 'w8_mob_public_comment', name: 'Public Comment', maxCards: 2, usesPerTurn: 1,
    condition: {type: 'pokerTier', tier: 1}, baseMult: 0, utilityEffect: 'discardHand', discardCount: 1,
    note: 'Needs a Pair. Three minutes each, and nobody stops them. Knocks 1 card out of your hand.'
  },
  w8_diag_lockout: {
    id: 'w8_diag_lockout', name: 'Out To Lunch', maxCards: 4, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 2},
    baseMult: 1.3, kind: 'ice',
    note: 'Needs Two Pair. Gone to lunch, and nothing moves until they are back. Freezes one of your Items.'
  },
  w8_diag_override: {
    id: 'w8_diag_override', name: 'Lunch Grab', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, baseMult: 1.2, kind: 'hex',
    note: 'Needs 3 Black cards. Helps themselves to a card out of your hand. Hexes one of your Items.'
  },
  w8_diag_reboot: {
    id: 'w8_diag_reboot', name: 'Second Helping', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'red', count: 3}, baseMult: 0, drawAmount: 2, drawPerLevel: 0,
    note: 'Needs 3 Red cards. Goes back for seconds. Draws 2 cards for its next attack.'
  },
  w8_rig_ram: {
    id: 'w8_rig_ram', name: 'Flatbed Ram', maxCards: 4, usesPerTurn: 1, condition: {type: 'sumThreshold', min: 18},
    flatAmount: 34, note: `Needs cards totaling ${SIGMA_TIP}18+. Hooks your wheels and does not wait for the owner.`
  },
  w8_rig_arc: {
    id: 'w8_rig_arc', name: 'Winch Arc', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1.9, kind: 'lightning',
    note: 'Needs a Pair. The cable finds something to ground on. Damage is randomized by the shared Lightning roll.'
  },
  w8_rig_fire: {
    id: 'w8_rig_fire', name: 'Engine Fire', maxCards: 2, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 1},
    baseMult: 1, kind: 'burn', note: 'Needs a Pair. The hood is already smoking. Burns you.'
  },
  w8_boss_shock_gun: {
    id: 'w8_boss_shock_gun', name: 'Rigged Shock Gun', maxCards: 5, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 24}, flatAmount: 50, kind: 'lightning',
    note: (`Needs cards totaling ${SIGMA_TIP}24+. One wrong touch and the whole rig lights up. ` +
      `Damage is randomized by the shared Lightning roll.`)
  },
  w8_boss_sabotage: {
    id: 'w8_boss_sabotage', name: 'Sabotage', maxCards: 4, usesPerTurn: 1, condition: {type: 'pokerTier', tier: 2},
    baseMult: 1.6, kind: 'curse', note: 'Needs Two Pair. A bolt left loose on purpose. Curses one of your Items.'
  },
  w8_boss_deep_freeze: {
    id: 'w8_boss_deep_freeze', name: 'Coolant Flood', maxCards: 4, usesPerTurn: 1,
    condition: {type: 'sumThreshold', min: 15}, baseMult: 1, kind: 'ice',
    note: `Needs cards totaling ${SIGMA_TIP}15+. Floods the bay and seizes a whole system. Freezes one of your Items.`
  },
  w8_boss_tamper: {
    id: 'w8_boss_tamper', name: 'Tampered Records', maxCards: 3, usesPerTurn: 1,
    condition: {type: 'colorCount', color: 'blk', count: 3}, baseMult: 1.3, kind: 'hex',
    note: 'Needs 3 Black cards. Quietly takes a card from your hand. Hexes one of your Items.'
  },
});
// prettier-ignore
const WORLD_7_POOLS = {
  regulars: [
    {
      id: 'w7_wobbly_container_straddle', name: 'Wobbly Container Straddle', icon: '📦',
      image: 'Hazards/wobbly-container-straddle.png', hp: 66, minTier: 1, drawRate: 2, items: ['w7_stack_collapse']
    },
    {
      id: 'w7_runaway_yard_mule', name: 'Runaway Yard Mule', icon: '🐴', image: 'Hazards/runaway-yard-mule.png',
      hp: 70, minTier: 1, drawRate: 2, items: ['w7_crane_swing','w7_hook_snag']
    },
    {
      id: 'w7_customs_k_9_beagle', name: 'Customs K-9 Beagle', icon: '🐶', image: 'Hazards/customs-k-9-beagle.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w7_net_drop']
    },
    {
      id: 'w7_fuel_tanker', name: 'Fuel Tanker', icon: '🛢️', image: 'Hazards/fuel-tanker.png', hp: 68, minTier: 1,
      drawRate: 2, items: ['w7_fuel_fire']
    },
    {
      id: 'w7_spewing_tugboat', name: 'Spewing Tugboat', icon: '💨', image: 'Hazards/spewing-tugboat.png', hp: 60,
      minTier: 1, drawRate: 2, items: ['w7_exhaust_cough']
    },
    {
      id: 'w7_cruise_ship_wake', name: 'Cruise Ship Wake', icon: '🚢', image: 'Hazards/cruise-ship-wake.png', hp: 72,
      minTier: 1, drawRate: 2, items: ['w7_wake_slam']
    },
    {
      id: 'w7_customs_inspector', name: 'Customs Inspector', icon: '🛃', image: 'Hazards/customs-inspector.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w7_hold_inspection','w7_stamp']
    },
    {
      id: 'w7_runaway_forklift', name: 'Runaway Forklift', icon: '🚜', image: 'Hazards/runaway-forklift.png', hp: 68,
      minTier: 1, drawRate: 2, items: ['w7_forklift_ram']
    },
    {
      id: 'w7_harbor_tug', name: 'Harbor Tug', icon: '🚤', image: 'Hazards/harbor-tug.png', hp: 70, minTier: 1,
      drawRate: 2, items: ['w7_tug_shove','w7_tug_horn']
    },
    {
      id: 'w7_crew_van', name: 'Crew Van', icon: '🚐', image: 'Hazards/crew-van.png', hp: 60, minTier: 1, drawRate: 2,
      items: ['w7_line_whip']
    },
    {
      id: 'w7_late_cruise_passenger', name: 'Late Cruise Passenger', icon: '🧳',
      image: 'Hazards/late-cruise-passenger.png', hp: 64, minTier: 1, drawRate: 2, items: ['w7_radar_static']
    },
    {
      id: 'w7_towed_sailboat', name: 'Towed Sailboat', icon: '⚡', image: 'Hazards/towed-sailboat.png', hp: 66,
      minTier: 1, drawRate: 2, items: ['w7_mast_strike']
    },
    {
      id: 'w7_pelican_eyeing_your_lunch', name: 'Pelican Eyeing Your Lunch', icon: '🦤',
      image: 'Hazards/pelican-eyeing-your-lunch.png', hp: 58, minTier: 1, drawRate: 2,
      items: ['w7_beak_snap','w7_pelican_dive']
    },
    {
      id: 'w7_frozen_fish_hold', name: 'Frozen Fish Hold', icon: '🧊', image: 'Hazards/frozen-fish-hold.png', hp: 64,
      minTier: 1, drawRate: 2, items: ['w7_cold_hold']
    },
    {
      id: 'w7_barnacle_crusted_hull', name: 'Barnacle-Crusted Hull', icon: '🐚',
      image: 'Hazards/barnacle-crusted-hull.png', hp: 72, minTier: 1, drawRate: 2, items: ['w7_hull_scrape'],
      startArmor: 16
    },
    {
      id: 'w7_overworked_stevedore', name: 'Overworked Stevedore', icon: '👷',
      image: 'Hazards/overworked-stevedore.png', hp: 62, minTier: 1, drawRate: 2,
      items: ['w7_heave','w7_shift_change']
    },
    {
      id: 'w7_overloaded_scrap_truck', name: 'Overloaded Scrap Truck', icon: '🗑️',
      image: 'Hazards/overloaded-scrap-truck.png', hp: 70, minTier: 1, drawRate: 2, items: ['w7_scrap_slide']
    },
    {
      id: 'w7_harbor_fog', name: 'Harbor Fog', icon: '🌫️', image: 'Hazards/harbor-fog.png', hp: 60, minTier: 1,
      drawRate: 2, items: ['w7_salt_fog','w7_fog_horn']
    },
    {
      id: 'w7_bilge_slick', name: 'Bilge Slick', icon: '🛢️', image: 'Hazards/bilge-slick.png', hp: 64, minTier: 1,
      drawRate: 2, items: ['w7_slick_flash']
    },
    {
      id: 'w7_stubborn_gate_guard', name: 'Stubborn Gate Guard', icon: '💂', image: 'Hazards/stubborn-gate-guard.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w7_dock_lockdown']
    },
    {
      id: 'w7_port_security_checkpoint', name: 'Port Security Checkpoint', icon: '🚧',
      image: 'Hazards/port-security-checkpoint.png', hp: 64, minTier: 1, drawRate: 2,
      items: ['w7_pat_down','w7_boom_gate']
    },
  ],
  elites: [
    {
      id: 'w7_drifting_container_ship', name: 'Drifting Container Ship', icon: '🚢',
      image: 'Hazards/drifting-container-ship.png', hp: 130, minTier: 2, drawRate: 3,
      items: ['w7_hull_slam','w7_stack_shift','w7_bridge_lights']
    },
    {
      id: 'w7_gantry_crane_in_a_storm', name: 'Gantry Crane in a Storm', icon: '⛈️',
      image: 'Hazards/gantry-crane-in-a-storm.png', hp: 126, minTier: 2, drawRate: 3,
      items: ['w7_gantry_bolt','w7_hoist_drop','w7_counterweight']
    },
    {
      id: 'w7_customs_sweep_team', name: 'Customs Sweep Team', icon: '🕵️', image: 'Hazards/customs-sweep-team.png',
      hp: 122, minTier: 2, drawRate: 3, items: ['w7_full_search','w7_contraband_check','w7_backup_called']
    },
  ],
  boss: {
    id: 'harbormaster', name: 'The Harbormaster', icon: '🧑‍✈️', image: 'Hazards/harbormaster.png', hp: 230,
    minTier: 3, drawRate: 5, boss: true, usesPerTurn: 1, discardPoolEachTurn: true, revealedOnDraw: 3,
    fixedNumbers: true, items: ['w7_close_the_gates','w7_final_tally'],
    attackInfo: ('Attack: throws away its whole hand every turn and draws 5 new cards, with only ' +
      '3 face up. Three Black cards close the gates for 47 armor. Four Red cards hit for 48. Read what ' +
      'you can see and guess the rest.')
  },
};
// prettier-ignore
const WORLD_8_POOLS = {
  regulars: [
    {
      id: 'w8_angry_parts_clerk', name: 'Angry Parts Clerk', icon: '😤', image: 'Hazards/angry-parts-clerk.png',
      hp: 72, minTier: 1, drawRate: 2, items: ['w8_lift_drop','w8_lift_creak']
    },
    {
      id: 'w8_clumsy_inventory_stocker', name: 'Clumsy Inventory Stocker', icon: '📦',
      image: 'Hazards/clumsy-inventory-stocker.png', hp: 68, minTier: 1, drawRate: 2, items: ['w8_bin_spill']
    },
    {
      id: 'w8_runaway_pressure_washer_wand', name: 'Runaway Pressure Washer Wand', icon: '🚿',
      image: 'Hazards/runaway-pressure-washer-wand.png', hp: 66, minTier: 1, drawRate: 2,
      items: ['w8_wash_runoff','w8_pressure_blast']
    },
    {
      id: 'w8_fuel_island_fire', name: 'Fuel Island Fire', icon: '⛽', image: 'Hazards/fuel-island-fire.png', hp: 70,
      minTier: 1, drawRate: 2, items: ['w8_pump_flare','w8_fuel_splash']
    },
    {
      id: 'w8_unlicensed_detailer', name: 'Unlicensed Detailer', icon: '🧽', image: 'Hazards/unlicensed-detailer.png',
      hp: 66, minTier: 1, drawRate: 2, items: ['w8_tire_roll']
    },
    {
      id: 'w8_auditing_bean_counter', name: 'Auditing Bean Counter', icon: '🧮',
      image: 'Hazards/auditing-bean-counter.png', hp: 62, minTier: 1, drawRate: 2, items: ['w8_scanner_override']
    },
    {
      id: 'w8_third_shift_mechanic', name: 'Third-Shift Mechanic', icon: '🌙',
      image: 'Hazards/third-shift-mechanic.png', hp: 68, minTier: 1, drawRate: 2, items: ['w8_charger_arc']
    },
    {
      id: 'w8_osha_inspector', name: 'OSHA Inspector', icon: '🦺', image: 'Hazards/osha-inspector.png', hp: 70,
      minTier: 1, drawRate: 2, items: ['w8_pit_chill','w8_pit_splash']
    },
    {
      id: 'w8_locked_gate_guard', name: 'Locked Gate Guard', icon: '🚧', image: 'Hazards/locked-gate-guard.png',
      hp: 70, minTier: 1, drawRate: 2, items: ['w8_gate_hold','w8_gate_swing']
    },
    {
      id: 'w8_shop_cat', name: 'Shop Cat', icon: '🐈', image: 'Hazards/shop-cat.png', hp: 56, minTier: 1, drawRate: 2,
      items: ['w8_cat_swipe','w8_cat_knock']
    },
    {
      id: 'w8_over_caffeinated_lube_tech', name: 'Over-Caffeinated Lube Tech', icon: '🔧',
      image: 'Hazards/over-caffeinated-lube-tech.png', hp: 64, minTier: 1, drawRate: 2, items: ['w8_wrench_chatter']
    },
    {
      id: 'w8_runaway_creeper', name: 'Runaway Creeper', icon: '🛹', image: 'Hazards/runaway-creeper.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w8_creeper_slide']
    },
    {
      id: 'w8_mystery_fluid_puddle', name: 'Mystery Fluid Puddle', icon: '🛢️',
      image: 'Hazards/mystery-fluid-puddle.png', hp: 70, minTier: 1, drawRate: 2,
      items: ['w8_drain_ooze','w8_drain_flash']
    },
    {
      id: 'w8_ignored_check_engine_light', name: 'Ignored Check Engine Light', icon: '🔶',
      image: 'Hazards/ignored-check-engine-light.png', hp: 66, minTier: 1, drawRate: 2, items: ['w8_booth_fumes']
    },
    {
      id: 'w8_unsafe_welder', name: 'Unsafe Welder', icon: '🔥', image: 'Hazards/unsafe-welder.png', hp: 64,
      minTier: 1, drawRate: 2, items: ['w8_arc_flash','w8_arc_spatter']
    },
    {
      id: 'w8_bursting_hydraulic_hose', name: 'Bursting Hydraulic Hose', icon: '🪢',
      image: 'Hazards/bursting-hydraulic-hose.png', hp: 64, minTier: 1, drawRate: 2,
      items: ['w8_hose_whip','w8_hose_burst']
    },
    {
      id: 'w8_breakroom_fish_heater', name: 'Breakroom Fish Heater', icon: '🐟',
      image: 'Hazards/breakroom-fish-heater.png', hp: 68, minTier: 1, drawRate: 2,
      items: ['w8_gen_surge','w8_gen_hum']
    },
    {
      id: 'w8_rude_parts_manager', name: 'Rude Parts Manager', icon: '🧑‍💼', image: 'Hazards/rude-parts-manager.png',
      hp: 66, minTier: 1, drawRate: 2, items: ['w8_fridge_chill','w8_fridge_hex']
    },
    {
      id: 'w8_key_losing_service_writer', name: 'Key-Losing Service Writer', icon: '🔑',
      image: 'Hazards/key-losing-service-writer.png', hp: 62, minTier: 1, drawRate: 2,
      items: ['w8_keys_lost','w8_keys_snap']
    },
    {
      id: 'w8_stressed_dispatcher', name: 'Stressed Dispatcher', icon: '⏱️', image: 'Hazards/stressed-dispatcher.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w8_clock_punch','w8_clock_tick']
    },
  ],
  elites: [
    {
      id: 'w8_lunch_stealing_coworker', name: 'Lunch-Stealing Coworker', icon: '🥪',
      image: 'Hazards/lunch-stealing-coworker.png', hp: 136, minTier: 2, drawRate: 3,
      items: ['w8_diag_lockout','w8_diag_override','w8_diag_reboot']
    },
    {
      id: 'w8_repo_tow_truck', name: 'Repo Tow Truck', icon: '🚛', image: 'Hazards/repo-tow-truck.png', hp: 144,
      minTier: 2, drawRate: 3, items: ['w8_rig_ram','w8_rig_arc','w8_rig_fire'], usesPerTurn: 2
    },
  ],
  boss: {
    id: 'evil_mechanic', name: 'The Evil Mechanic', icon: '🧑‍🔧', image: 'Hazards/evil-mechanic.png', hp: 280,
    minTier: 3, drawRate: 5, boss: true, usesPerTurn: 2,
    items: ['w8_boss_shock_gun','w8_boss_sabotage','w8_boss_deep_freeze','w8_boss_tamper'],
    attackInfo: ('Attack: swings twice a turn with everything it has. Shock, sabotage, freeze ' +
      'and hex all work together, so every turn asks you to choose what to save.')
  },
};

const WORLD_POOLS_BY_WORLD = {
  1: WORLD_1_POOLS,
  2: WORLD_2_POOLS,
  3: WORLD_3_POOLS,
  4: WORLD_4_POOLS,
  5: WORLD_5_POOLS,
  6: WORLD_6_POOLS,
  7: WORLD_7_POOLS,
  8: WORLD_8_POOLS,
};

// Opponents do not hex your Items for now. Any hex Item an opponent carries (no shop price) becomes a
// plain attack with the same condition and damage, keeping its id so saves still load. Dealership Items
// are not touched.
const OPPONENT_HEX_ENABLED = false;
if (!OPPONENT_HEX_ENABLED) {
  Object.values(ITEMS).forEach((it) => {
    if (it && it.kind === 'hex' && !(it.cost > 0)) {
      delete it.kind;
      if (it.note) {
        const m = it.note.match(/^[^.]*\./);
        if (m) it.note = m[0];
      }
    }
  });
}
