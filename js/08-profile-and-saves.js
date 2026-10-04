// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Permanent Upgrades                                                            ██
// ██  Career Point upgrades that carry over between runs.                           ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const UPGRADE_TIERS = {
  high: { baseCost: 55, growth: 1.62 },
  medium: { baseCost: 33, growth: 1.56 },
  low: { baseCost: 20, growth: 1.5 },
};
const UPGRADE_DEFS = [
  {
    id: 'draw',
    label: 'Cards Drawn Per Turn',
    desc: '+1 card drawn at the start of each turn (also raises ' + 'your opening hand).',
    tier: 'high',
    currentValue: (lvl) => `${2 + lvl} cards/turn`,
  },
  {
    id: 'hp',
    label: 'Max HP',
    desc: '+15 max health per level.',
    tier: 'high',
    currentValue: (lvl) => `${100 + lvl * 15} HP`,
  },
  {
    id: 'chips',
    label: 'Starting Coins',
    desc: '+8 starting coins at New Playthrough.',
    tier: 'low',
    currentValue: (lvl) => `${40 + lvl * 8} coins`,
    unlock: { points: 50 },
  },
  {
    id: 'fuel',
    label: 'Starting Fuel',
    desc: '+1 starting fuel per level.',
    tier: 'low',
    currentValue: (lvl) => `${10 + lvl} fuel`,
    unlock: { points: 100 },
  },
  {
    id: 'handCap',
    label: 'Maximum Hand Size',
    desc: '+2 cards to your maximum hand size per level.',
    tier: 'high',
    currentValue: (lvl) => `${7 + lvl * 2} cards`,
    unlock: { points: 150, desc: 'Beat 50 opponents (lifetime)', check: () => (META.enemiesBeaten || 0) >= 50 },
  },
  {
    id: 'fuelCap',
    label: 'Fuel Tank Size',
    desc: '+5 max fuel you can hold per level.',
    tier: 'medium',
    currentValue: (lvl) => `${20 + lvl * 5} fuel`,
    unlock: { points: 200 },
  },
  {
    id: 'gem',
    label: 'Gem Efficiency',
    desc: '+1 card drawn per gem spent.',
    tier: 'medium',
    currentValue: (lvl) => `${1 + lvl} card${1 + lvl > 1 ? 's' : ''}/gem`,
    unlock: { points: 250, desc: 'Reach World 2', check: () => (META.bestWorld || 1) >= 2 },
  },
  {
    id: 'garage',
    label: 'Garage Expansion',
    desc: '+1 starting Item slot.',
    tier: 'medium',
    currentValue: (lvl) => `${3 + lvl} slots`,
    unlock: { points: 300 },
  },
  {
    id: 'energyCap',
    label: 'Energy Cell Size',
    desc: '+5 max energy you can hold per level.',
    tier: 'medium',
    currentValue: (lvl) => `${20 + lvl * 5} energy`,
    unlock: { points: 350 },
  },
  {
    id: 'gemCap',
    label: 'Gem Pouch Size',
    desc: '+2 max gems you can hold per level.',
    tier: 'medium',
    currentValue: (lvl) => `${10 + lvl * 2} gems`,
    unlock: { points: 400 },
  },
  {
    id: 'reveal',
    label: 'Battle Scan',
    desc: 'Start every battle with 1 extra opponent card already ' + 'revealed.',
    tier: 'low',
    currentValue: (lvl) => `${1 + lvl} card${1 + lvl > 1 ? 's' : ''} revealed`,
    unlock: {
      points: 450,
      desc: 'Beat the World 1 boss',
      check: () => (META.bestWorld || 1) >= 2 || !!META.world2Cleared,
    },
  },
  {
    id: 'range',
    label: 'Scout Range',
    desc: 'See one additional route space farther ahead.',
    tier: 'low',
    currentValue: (lvl) => `${3 + lvl} spaces ahead`,
    unlock: { points: 500, desc: 'Land 5 Perfect Wins', check: () => (META.perfectWins || 0) >= 5 },
  },
  {
    id: 'fuelpen',
    label: 'Fuel Efficiency',
    desc: 'Running out of fuel costs 1 less health per level when it happens.',
    tier: 'low',
    currentValue: (lvl) => `${Math.max(0, 10 - lvl)} HP lost (was 10)`,
    baseCost: 30,
    unlock: { points: 600 },
  },
];
const MAX_LEVEL = 10;
// One dial for the cost of every Career Point upgrade. 1 = base prices, 1.5 = half again as much.
const UPGRADE_COST_MULT = 1.5;
function upgradeCost(def, atLevel) {
  const t = UPGRADE_TIERS[def.tier] || UPGRADE_TIERS.medium;
  return Math.round((def.baseCost || t.baseCost) * UPGRADE_COST_MULT * Math.pow(t.growth, atLevel));
}
// An upgrade unlocks once you have earned unlock.points lifetime Career Points (the total you have ever earned, not
// what is left to spend), and, where one is listed, also met unlock.check (like reaching World 2).
function upgradeUnlocked(def) {
  if (!def.unlock) return true;
  if (def.unlock.points && (META.lifetimePoints || 0) < def.unlock.points) return false;
  return !def.unlock.check || def.unlock.check();
}
function upgradeUnlockText(def) {
  const u = def.unlock;
  if (!u) return '';
  const parts = [];
  if (u.points) parts.push(`Earn ${u.points} Career Points in total (you have ${META.lifetimePoints || 0})`);
  if (u.desc) parts.push(u.desc);
  return parts.join(' and ');
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Player Profile                                                                ██
// ██  Career Points, unlocks and settings saved between runs.                       ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const META_KEY = 'fleetduel-meta-v7';
const META_VERSION = 2;
function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.metaVersion !== META_VERSION) throw new Error('stale meta version, resetting');
      parsed.levels = parsed.levels || {};
      UPGRADE_DEFS.forEach((u) => {
        if (parsed.levels[u.id] == null) parsed.levels[u.id] = 0;
      });
      if (parsed.enemiesBeaten == null) parsed.enemiesBeaten = 0;
      if (parsed.elitesBeaten == null) parsed.elitesBeaten = 0;
      if (parsed.bestWorld == null) parsed.bestWorld = 1;
      if (parsed.perfectWins == null) parsed.perfectWins = 0;
      if (parsed.world2Cleared == null) parsed.world2Cleared = false;
      if (parsed.world3Cleared == null) parsed.world3Cleared = false;
      if (parsed.world4Cleared == null) parsed.world4Cleared = false;
      if (parsed.world5Cleared == null) parsed.world5Cleared = false;
      if (parsed.world6Cleared == null) parsed.world6Cleared = false;
      if (parsed.world7Cleared == null) parsed.world7Cleared = false;
      if (parsed.world8Cleared == null) parsed.world8Cleared = false;
      if (parsed.hasSeenTutorial == null) parsed.hasSeenTutorial = false;
      if (parsed.hasSeenPoisonTutorial == null) parsed.hasSeenPoisonTutorial = false;
      if (parsed.hasSeenFuelHealTip == null) parsed.hasSeenFuelHealTip = false;
      return parsed;
    }
  } catch (e) {}
  const levels = {};
  UPGRADE_DEFS.forEach((u) => (levels[u.id] = 0));
  return {
    metaVersion: META_VERSION,
    points: 0,
    lifetimePoints: 0,
    highScore: 0,
    bestRun: 0,
    runsPlayed: 0,
    enemiesBeaten: 0,
    elitesBeaten: 0,
    bestWorld: 1,
    perfectWins: 0,
    world2Cleared: false,
    world3Cleared: false,
    world4Cleared: false,
    world5Cleared: false,
    world6Cleared: false,
    world7Cleared: false,
    world8Cleared: false,
    hasSeenTutorial: false,
    hasSeenPoisonTutorial: false,
    hasSeenFuelHealTip: false,
    levels,
  };
}
let META = loadMeta();
function saveMeta() {
  try {
    META.metaVersion = META_VERSION;
    localStorage.setItem(META_KEY, JSON.stringify(META));
  } catch (e) {}
}
function earnPoints(n) {
  META.points += n;
  META.lifetimePoints += n;
  if (RUN) RUN.scoreThisRun += n;
  saveMeta();
}

// Career Points are a flat, per-World bonus now, not a per-kill trickle. Reaching a World
// pays out once; clearing its boss pays out more, and both grow with the World number so
// getting further into the campaign is worth more than grinding fights in an early one.
const WORLD_CP_BONUS = {
  1: { reach: 20, clear: 40 },
  2: { reach: 35, clear: 70 },
  3: { reach: 55, clear: 110 },
  4: { reach: 80, clear: 160 },
  5: { reach: 110, clear: 220 },
  6: { reach: 150, clear: 300 },
};
function worldCareerPoints(world, cleared) {
  const tier = WORLD_CP_BONUS[world] || WORLD_CP_BONUS[6];
  return cleared ? tier.clear : tier.reach;
}
// A Perfect Kill only happens when your final hit exactly matches an opponent's remaining
// HP, so it's a skill moment worth a small flat Career Points nod, not a trickle.
const PERFECT_KILL_CP = 5;
// A small flat Career Points nod for beating an Elite-tier opponent, tracked separately so the
// end-of-run summary can show how much of that run's score came from Elite fights specifically.
const ELITE_KILL_CP = 5;


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Run Save                                                                      ██
// ██  Mid-run saving and loading, including old save repair.                        ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const RUN_KEY = 'fleetduel-run-v82-worldcp';
function saveRun() {
  try {
    localStorage.setItem(RUN_KEY, JSON.stringify(RUN));
  } catch (e) {}
}
// Opponent ids were renamed. A run or battle saved with an old id is updated in place when it loads (id,
// picture and name). Saves with new ids pass through unchanged.
const OPP_ID_ALIASES = {
  blast_chiller_behemoth: 'walk_in_walker',
  blast_chiller: 'walk_in_walker',
  bog_matriarch: 'nuisance_gator',
  bridge_overlord: 'drawbridge',
  congestion_charge: 'parking_enforcer',
  squall_line: 'four_pm_thunderstorm',
  w1_fishing_net: 'w1_rental_jet_ski_menace',
  w1_lost_sunglasses: 'w1_spring_breaker',
  w1_sandcastle_sentinel: 'w1_unpermitted_sandcastle',
  w1_shrimp_net_snag: 'w1_sargassum_sea_creature',
  w2_basking_gecko: 'w2_cold_stunned_iguana',
  w2_bog_sinkmud: 'w2_sinkhole',
  w2_bullfrog: 'w2_cane_toad',
  w2_cypress_root: 'w2_burmese_python',
  w2_deer_fly_cloud: 'w2_love_bug',
  w2_deer_fly_swarm: 'w2_love_bug_swarm',
  w2_dugout_canoe: 'w2_wobbly_rental_kayak',
  w2_feral_hog_sounder: 'w2_wild_hog_herd',
  w2_fire_ants: 'w2_fire_ant',
  w2_fog_swarm: 'w2_swamp_gas',
  w2_fog_swarm_elite: 'w2_brush_fire_smoke',
  w2_leech_shallows: 'w2_thirsty_leeches',
  w2_marsh_spider: 'w2_banana_spider',
  w2_mosquito_swarm: 'w2_mosquito_cloud_elite',
  w2_nutria_burrow: 'w2_flooded_pothole',
  w2_reed_thicket: 'w2_sawgrass',
  w2_sewer_rat_nest: 'w2_rest_stop_raccoon',
  w2_sewer_rat_nest_elite: 'w2_raccoon_gang',
  w2_swamp_fever: 'w2_midday_heat',
  w2_swamp_snail: 'w2_snowbird_in_the_left_lane',
  w3_blinding_led_billboard: 'w3_injury_lawyer_billboard',
  w3_bus_stop_sign: 'w3_oblivious_commuter',
  w3_code_enforcement_enforcer: 'w3_code_enforcer',
  w3_construction_barrier: 'w3_orange_barrel_maze',
  w3_dumpster_fire_mob: 'w3_dumpster_fire',
  w3_fire_extinguisher: 'w3_expired_fire_extinguisher',
  w3_parking_kiosk: 'w3_parking_pay_station',
  w3_parking_meter: 'w3_hungry_parking_meter',
  w3_picket_line: 'w3_sign_spinner',
  w3_power_junction: 'w3_transformer_on_a_pole',
  w3_rogue_bus: 'w3_city_bus_running_late',
  w3_rogue_courier_drone: 'w3_rogue_delivery_drone',
  w3_smart_city_mainframe: 'w3_gridlocked_intersection',
  w3_static_walkie: 'w3_screaming_dispatcher',
  w3_steam_vent_mob: 'w3_steaming_manhole',
  w3_streetlamp: 'w3_flickering_streetlamp',
  w3_utility_panel: 'w3_flipped_dumpster',
  w3_wifi_router: 'w3_free_downtown_wi_fi',
  w4_bait_bucket_spill: 'w4_live_bait_bucket',
  w4_bilge_pump: 'w4_sinking_charter_yacht',
  w4_cargo_winch: 'w4_screaming_dockmaster',
  w4_choked_piling: 'w4_debris_pile',
  w4_cruise_ship_wake: 'w4_mega_yacht_wake',
  w4_dock_crab_swarm: 'w4_dock_crab',
  w4_dock_crab_swarm_elite: 'w4_dock_crab_swarm',
  w4_fuel_dock_siphon: 'w4_fuel_dock_siphoner',
  w4_haunted_piling: 'w4_selfie_stick_tourist',
  w4_ice_machine_leak: 'w4_dockside_ice_machine',
  w4_loose_cargo_crate: 'w4_overloaded_forklift',
  w4_loose_deck_board: 'w4_boardwalk_tourist',
  w4_marine_patrol_interceptor: 'w4_marine_patrol_boat',
  w4_patrol_chopper: 'w4_patrol_helicopter',
  w4_rusty_mooring_cleat: 'w4_mooring_cleat',
  w4_tangled_fishing_line: 'w4_oblivious_vlogger',
  w4_water_taxi: 'w4_new_river_water_taxi',
  w5_backup_beeper: 'w5_delayed_delivery_driver',
  w5_blast_chiller: 'w5_chiller_vent',
  w5_breaker_panel: 'w5_blown_a_c_compressor',
  w5_dock_bumper: 'w5_illegally_parked_semi',
  w5_dry_ice_fog: 'w5_melting_pallet',
  w5_frost_door: 'w5_stuck_bay_door',
  w5_frozen_forklift: 'w5_icy_pallet_jack',
  w5_ice_machine: 'w5_malfunctioning_ice_machine',
  w5_icy_catwalk: 'w5_unmarked_wet_floor',
  w5_inventory_bot: 'w5_inventory_clerk',
  w5_locker_door: 'w5_stuck_cooler_door',
  w5_pallet_wrap_arm: 'w5_pallet_wrapper',
  w5_rusted_coil: 'w5_iced_up_evaporator_coil',
  w5_scanner_drone: 'w5_reckless_scanner_gun',
  w5_shrink_wrap: 'w5_shrinkwrap_boulder',
  w5_slippery_plate: 'w5_slippery_dock_plate',
  w5_walkin_freezer: 'w5_walk_in_freezer',
  w5_warehouse_ai: 'w5_overworked_logistics_worker',
  w6_ac_short: 'w6_valet_golf_cart',
  w6_boutique_alarm: 'w6_aggressive_shopper',
  w6_broken_meter_hex: 'w6_broken_parking_meter',
  w6_cafe_table: 'w6_sidewalk_influencer',
  w6_con_artist: 'w6_timeshare_salesman',
  w6_ev_charger: 'w6_broken_ev_charger',
  w6_gutter_flood: 'w6_king_tide_flood',
  w6_jewel_thief: 'w6_smash_and_grab_crew',
  w6_laser_grid: 'w6_power_tripping_bouncer',
  w6_lightning_awning: 'w6_storefront_awning',
  w6_neon_sign: 'w6_loud_street_performer',
  w6_palm_frond: 'w6_falling_palm_frond',
  w6_patio_umbrella: 'w6_runaway_bicycle',
  w6_power_line: 'w6_downed_power_line',
  w6_storm_chaser_van: 'w6_live_shot_news_van',
  w6_streetlight: 'w6_toppled_streetlight',
  w6_string_lights: 'w6_delivery_vespa',
  w6_ticket_scam: 'w6_sketchy_valet_driver',
  w6_traffic_signal: 'w6_dark_traffic_signal',
  w6_valet_cart: 'w6_runaway_valet_cart',
  w7_aggressive_pelican: 'w7_pelican_eyeing_your_lunch',
  w7_barnacle_hull: 'w7_barnacle_crusted_hull',
  w7_cargo_net: 'w7_customs_k_9_beagle',
  w7_container_stack: 'w7_wobbly_container_straddle',
  w7_cruise_wake: 'w7_cruise_ship_wake',
  w7_diesel_cloud: 'w7_spewing_tugboat',
  w7_gantry_crane: 'w7_runaway_yard_mule',
  w7_lightning_mast: 'w7_towed_sailboat',
  w7_mooring_line: 'w7_crew_van',
  w7_port_security: 'w7_port_security_checkpoint',
  w7_radar_dish: 'w7_late_cruise_passenger',
  w7_rusted_dock_lock: 'w7_stubborn_gate_guard',
  w7_scrap_heap: 'w7_overloaded_scrap_truck',
  w7_storm_lashed_gantry: 'w7_gantry_crane_in_a_storm',
  w7_tanker_leak: 'w7_fuel_tanker',
  w8_air_wrench: 'w8_over_caffeinated_lube_tech',
  w8_angry_time_clock: 'w8_stressed_dispatcher',
  w8_backup_generator: 'w8_breakroom_fish_heater',
  w8_battery_charger: 'w8_third_shift_mechanic',
  w8_breakroom_fridge: 'w8_rude_parts_manager',
  w8_creeper_board: 'w8_runaway_creeper',
  w8_failing_lift: 'w8_angry_parts_clerk',
  w8_flooded_pit: 'w8_osha_inspector',
  w8_flooded_wash_bay: 'w8_runaway_pressure_washer_wand',
  w8_hydraulic_hose: 'w8_bursting_hydraulic_hose',
  w8_impound_gate: 'w8_locked_gate_guard',
  w8_jammed_key_box: 'w8_key_losing_service_writer',
  w8_oil_drain: 'w8_mystery_fluid_puddle',
  w8_paint_booth: 'w8_ignored_check_engine_light',
  w8_parts_bin: 'w8_clumsy_inventory_stocker',
  w8_po_pile: 'w8_procurement',
  w8_rogue_scanner: 'w8_auditing_bean_counter',
  w8_runaway_tow_rig: 'w8_repo_tow_truck',
  w8_sentient_diagnostic_computer: 'w8_lunch_stealing_coworker',
  w8_tire_stack: 'w8_unlicensed_detailer',
  w8_welding_arc: 'w8_unsafe_welder',
};
// One reused id (the Dock Crab Swarm elite) only counts as an old save when the picture also matches.
const OPP_ID_ALIAS_NEEDS_IMAGE = { w4_dock_crab_swarm: 'Hazards/dock-crab.png' };
function findOpponentDef(id) {
  const pools = [
    WORLD_1_POOLS,
    WORLD_2_POOLS,
    WORLD_3_POOLS,
    WORLD_4_POOLS,
    WORLD_5_POOLS,
    WORLD_6_POOLS,
    WORLD_7_POOLS,
    WORLD_8_POOLS,
  ];
  for (const p of pools) {
    if (!p) continue;
    const all = [...(p.regulars || []), ...(p.elites || []), ...(p.boss ? [p.boss] : [])];
    const hit = all.find((o) => o.id === id);
    if (hit) return hit;
  }
  return null;
}
function migrateOppIds(root) {
  if (!root || typeof root !== 'object') return root;
  const seen = new Set();
  (function walk(o) {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) {
      o.forEach(walk);
      return;
    }
    const newId = typeof o.id === 'string' ? OPP_ID_ALIASES[o.id] : null;
    if (newId && o.hp !== undefined && Array.isArray(o.items)) {
      const needImg = OPP_ID_ALIAS_NEEDS_IMAGE[o.id];
      const def = findOpponentDef(newId);
      if (def && (!needImg || o.image === needImg)) {
        o.id = def.id;
        o.image = def.image;
        o.name = def.name + (/ \[Elite\]$/.test(o.name || '') ? ' [Elite]' : '');
      }
    }
    Object.keys(o).forEach((k) => walk(o[k]));
  })(root);
  return root;
}
// Older World 3 maps had three nodes on the Fleet Compound row, so a route could skip the Compound.
// For a saved run that has not reached that row yet, collapse the row back to the single Compound
// node and rebuild the two sets of connections around it (same rule generateMap uses for a
// single-node row). A run that is already on or past that row is left alone.
function repairCompoundRow(run) {
  try {
    const nodes = run && run.map && run.map.nodes,
      edges = run && run.map && run.map.edges;
    if (!Array.isArray(nodes) || !Array.isArray(edges)) return run;
    const r = nodes.findIndex((row) => row.some((n) => n && n.type === 'castle'));
    if (r < 1 || nodes[r].length <= 1 || !nodes[r + 1]) return run;
    if (run.currentRow >= r || (run.path || []).some((p) => p.row >= r)) return run;
    nodes[r] = [nodes[r].find((n) => n && n.type === 'castle')];
    const kept = edges.filter((e) => e.fromRow !== r - 1 && e.fromRow !== r);
    nodes[r - 1].forEach((_, a) => kept.push({ fromRow: r - 1, fromCol: a, toRow: r, toCol: 0 }));
    nodes[r + 1].forEach((_, b) => kept.push({ fromRow: r, fromCol: 0, toRow: r + 1, toCol: b }));
    run.map.edges = kept;
  } catch (e) {}
  return run;
}
function loadRunSave() {
  try {
    const raw = localStorage.getItem(RUN_KEY);
    if (raw) return repairCompoundRow(migrateOppIds(JSON.parse(raw)));
  } catch (e) {}
  return null;
}
function clearRunSave() {
  try {
    localStorage.removeItem(RUN_KEY);
  } catch (e) {}
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Battle Save                                                                   ██
// ██  Saving a fight in progress.                                                   ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const BATTLE_KEY = 'fleetduel-battle-v1';
let IN_BATTLE = false;
function saveBattleState() {
  try {
    localStorage.setItem(
      BATTLE_KEY,
      JSON.stringify(BATTLE, (k, v) => (v instanceof Set ? [...v] : v))
    );
  } catch (e) {}
}
function loadBattleSave() {
  try {
    const raw = localStorage.getItem(BATTLE_KEY);
    if (!raw) return null;
    const parsed = migrateOppIds(JSON.parse(raw));
    if (parsed) parsed.usedThisTurn = new Set(parsed.usedThisTurn || []);
    if (parsed) parsed.turnStartedAt = Date.now();
    return parsed;
  } catch (e) {}
  return null;
}
function clearBattleSave() {
  try {
    localStorage.removeItem(BATTLE_KEY);
  } catch (e) {}
}
