// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Shared Opponent Items                                                         ██
// ██  Opponent Items that work exactly the same share one card.                     ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// Each entry below is a shared card (its full definition lives in the Item catalog or the difficulty patch)
// followed by the look-alike Items that are the same card with a different name on the top line.
// To change how a whole group works, change the shared card. To rename one, change its name here.
// Every look-alike keeps its own id, so saved runs and opponent Item lists keep working.
// prettier-ignore
const SHARED_ITEMS = {
  ee_chelsy_filing_frenzy: {
    ee_jen_calendar_invite: 'Calendar Invite',
    ee_anthony_diagnostic_deep_dive: 'Diagnostic Deep-Dive',
  },
  ee_chris_reel_in: {
    ee_haley_surprise_coffee: 'Surprise Coffee Run',
  },
  ee_drew_one_more_thing: {
    lab_pump_prime: 'Prime The Pump',
  },
  lab_enforcer_stopwork: {
    lab_marine_boarding: 'Boarding Inspection',
  },
  lab_wave_undertow: {
    lab_chiller_vent: 'Vent Cycle',
  },
  opp_aftershock: {
    opp_corrosive_mud: 'Corrosive Mud',
    w4_bilge_leak: 'Siphon Spill',
    w2_buzzing_bite: 'Buzzing Bite',
    w8_drain_ooze: 'Mystery Seep',
  },
  opp_bulletin: {
    opp_crowd_surge: 'Crowd Surge',
    opp_crush_cycle: 'Crush Cycle',
    opp_castle_poke_t2: 'Guard Strike',
  },
  opp_pair_curse: {
    opp_sudden_dash: 'Sudden Dash',
    opp_harassment: 'Harassment',
    w3_bus_sideswipe: 'Bus Sideswipe',
    w3_picket_chant: 'Dance Break',
    w4_haunted_piling_creak: 'Selfie Stick Poke',
    w1_umbrella_gust: 'Umbrella Gust',
    w1_reckless_splash: 'Reckless Splash',
    w1_turret_poke: 'Turret Poke',
    w1_board_wobble: 'Board Wobble',
    w2_snapping_jaws: 'Snapping Jaws',
    w2_burrow_nip: 'Wheel Drop',
    w2_gecko_snap: 'Tree Drop',
    ee_naynay_mind_games: 'Mind Games',
    ee_procurement_po_hold: 'Purchase Order Hold',
    ee_brett_shoulder_check: 'Shoulder Check',
    ee_chelsy_stapler_jam: 'Stapler Jam',
    ee_jen_sticky_note: 'Sticky Note Ambush',
    ee_anthony_torque_check: 'Torque Check',
    ee_haley_honeydo: 'Honey-Do List',
    ee_eevee_puppy_chaos: 'Puppy Chaos',
    w7_pelican_dive: 'Dive Bomb',
  },
  opp_rancid_blaze: {
    w1_claw_skirmish: 'Claw Skirmish',
    w1_whistle_command: 'Whistle Command',
    w2_death_roll: 'Death Roll',
  },
  opp_sabotage_engine: {
    opp_crowd_pressure: 'Crowd Pressure',
    w4_blue_strobe: 'Blue Strobe',
  },
  opp_shouting_match: {
    opp_debris_slam: 'Debris Slam',
    opp_ground_collapse: 'Ground Collapse',
    opp_barrier_slam: 'Barrier Slam',
    opp_ram_plate: 'Ram Plate',
  },
  opp_snap_bite: {
    w3_high_beam_glare: 'Free Consultation',
  },
  opp_toxic_spray: {
    opp_undertow: 'Undertow',
    opp_streetlight_shock: 'High-Voltage Shock',
    w2_toxic_haze: 'Toxic Haze',
    w2_twin_fang_strike: 'Twin Fang Strike',
  },
  w1_coconut_drop: {
    w7_beak_snap: 'Beak Snap',
  },
  w1_wild_swing: {
    w7_boom_gate: 'Boom Gate',
    w8_fuel_splash: 'Fuel Splash',
    lab_gator_lunge: 'Lunge',
  },
  w2_sounder_stampede: {
    w2_burrow_collapse: 'Axle Breaker',
  },
  w2_tusk_charge: {
    w8_pressure_blast: 'Pressure Blast',
  },
  w3_barrier_topple: {
    w4_crate_shift: 'Fork Bump',
    w4_cargo_winch_swing: 'Clipboard Throw',
    w1_jelly_drift: 'Jelly Drift',
    w2_slime_trail: 'Left Lane Crawl',
    w2_canoe_bump: 'Kayak Bump',
    w5_wrap_spin: 'Loose Film Whip',
    w5_bot_beep: 'Cart Bump',
    w5_naynay_guilt_trip: 'Guilt Trip',
    w5_chiller_hiss: 'Chiller Hiss',
    w6_streetlight_sway: 'Streetlight Sway',
    w6_charger_beep: 'Charger Error Beep',
    w6_laser_scan: 'Shoulder Check',
    w6_drain_pull: 'Gutter Pull',
    ee_eevee_nap_attack: 'Nap Attack',
    w7_fog_horn: 'Fog Horn',
  },
  w3_dumpster_flareup: {
    w4_chopper_downwash: 'Chopper Downwash Scorch',
  },
  w3_extinguisher_swing: {
    w3_panel_rattle: 'Dumpster Rattle',
    w3_rideshare_honk: 'Rideshare Honk',
    w1_glare_flash: 'Red Cup Toss',
    w2_bullfrog_hop: 'Toad Hop',
    w2_reed_scratch: 'Sawgrass Scratch',
    w5_leak_drip: 'Coolant Drip',
    w5_compressor_hum: 'Compressor Hum',
    w6_con_chatter: 'Free Breakfast Offer',
  },
  w3_junction_spark: {
    w8_arc_spatter: 'Spatter',
  },
  w3_meter_poke: {
    w3_dumpster_smolder: 'Dumpster Smolder',
    w3_busstop_shortcircuit: 'Scalding Coffee',
    w4_chopper_buzz: 'Chopper Low Buzz',
    w8_rig_fire: 'Engine Fire',
  },
  w3_propeller_slash: {
    w4_line_snap: 'Line Snap',
    w1_dive_bomb_peck: 'Dive-Bomb Peck',
    w5_beeper_blare: 'Late Backup',
    w6_cart_careen: 'Valet Cart Careen',
    ee_chris_cast_line: 'It\'s Cheaperrr',
    ee_nala_zoomies: 'The Zoomies',
    w7_hook_snag: 'Coupler Snag',
    w8_lift_creak: 'Backorder Sigh',
    w8_pit_splash: 'Clipboard Smack',
    lab_pump_spray: 'Spray',
  },
  w3_signal_scramble: {
    w4_backflow_gush: 'Backflow Gush',
  },
  w3_static_interference: {
    w1_bounce_barrage: 'Bounce Barrage',
    ee_nala_tail_wag: 'Tail Wag Sweep',
  },
  w3_streetlamp_flicker: {
    w4_ice_leak: 'Dockside Ice Leak',
    w4_cruise_wake_rock: 'Mega Yacht Rock',
    w1_string_snap: 'String Snap',
    w1_rope_drag: 'Rope Drag',
    w5_forklift_bump: 'Pallet Jack Bump',
    w5_logi_bear_chop: 'Karate Chop',
    w5_plate_skid: 'Dock Plate Skid',
    w6_frond_smack: 'Palm Frond Smack',
    w6_line_snap: 'Power Line Snap',
    w6_table_tip: 'Perfect Shot',
    ee_drew_reply_all: 'Reply-All Email',
    w7_stamp: 'Rubber Stamp',
    w8_keys_snap: 'Key Toss',
    w8_clock_tick: 'Ringing Phones',
    lab_moccasin_coil: 'Coil And Strike',
  },
  w4_bait_spill: {
    w4_otter_nip: 'River Otter Nip',
    w4_puffer_puncture: 'Pufferfish Puncture',
    w2_spider_bite: 'Spider Bite',
  },
  w4_crab_swarm_pinch: {
    w1_cat_colony_pounce: 'Colony Pounce',
  },
  w4_crate_topple: {
    w1_sting_barrage: 'Sting Barrage',
    w5_hoist_swing: 'Chain Hoist Swing',
    w6_flood_surge: 'King Tide Flood',
  },
  w4_cruise_wake_swell: {
    w1_wave_slap: 'Wave Slap',
  },
  w4_deck_board_snap: {
    w1_splinter_snap: 'Splinter Snap',
    w5_bumper_thud: 'Semi Bumper Thud',
  },
  w4_fortune_reshuffle: {
    w5_compressor_recharge: 'Recharge the Capacitor',
    w6_meter_feed: 'Feed the Meter',
  },
  w4_wake_turbulence: {
    w1_undertow_pull: 'Undertow Pull',
    w2_prop_wash: 'Prop Wash',
  },
  w5_bot_grab: {
    w6_pocket_lift: 'Pocket Lift',
  },
  w5_elite_ai_hex: {
    w6_elite_thief_snatch: 'Smash and Grab',
  },
  w5_elite_cryo_slam: {
    w6_elite_van_ram: 'Live Shot Ram',
  },
  w5_fog_chill: {
    w5_chiller_blast: 'Blast Chiller Vent',
  },
  w6_awning_strike: {
    w7_mast_strike: 'Mast Strike',
  },
  w6_boss_static_curse: {
    w8_boss_sabotage: 'Sabotage',
  },
  w6_streetlight_arc: {
    w8_arc_flash: 'Arc Flash',
    w8_rig_arc: 'Winch Arc',
  },
  w6_umbrella_flip: {
    ee_auditor_surprise_audit: 'Surprise Audit',
  },
  w7_contraband_check: {
    w8_keys_lost: 'Lost Keys',
  },
  w7_counterweight: {
    w8_diag_override: 'Lunch Grab',
  },
  w7_exhaust_cough: {
    w7_salt_fog: 'Salt Fog',
    w8_wash_runoff: 'Soapy Runoff',
  },
  w7_forklift_ram: {
    w8_hose_burst: 'Hose Burst',
  },
  w7_hold_inspection: {
    w8_mob_petition: 'Signed Petition',
  },
  w7_pat_down: {
    w8_cat_knock: 'Knock It Off The Bench',
    w8_mob_public_comment: 'Public Comment',
    lab_thief_pickpocket: 'Sleight Of Hand',
  },
  w7_scrap_slide: {
    w7_hoist_drop: 'Hoist Drop',
  },
  w7_shift_change: {
    w7_bridge_lights: 'Bridge Lights',
    w8_po_reroute: 'Reroute For Approval',
    w8_diag_reboot: 'Second Helping',
    lab_lifeguard_scan: 'Scan The Water',
    lab_mosquito_feast: 'Feeding Frenzy',
    lab_ai_reboot: 'Inventory Sweep',
    lab_matriarch_brood: 'Call The Brood',
    lab_squall_eye: 'Eye Of The Storm',
  },
  w7_stack_shift: {
    lab_cryo_frostbite: 'Frostbite',
  },
  w7_tug_horn: {
    w7_backup_called: 'Backup Called',
    w8_gen_hum: 'Microwave Hum',
  },
  w8_gate_hold: {
    w8_clock_punch: 'Punch Out',
    lab_matriarch_lash: 'Tail Lash',
    lab_bridge_toll: 'Toll Collector',
  },
  w8_pit_chill: {
    w8_fridge_chill: 'Cold Shoulder',
  },
};

function cloneItemDef(def) {
  const copy = Array.isArray(def) ? [] : {};
  Object.keys(def).forEach((k) => {
    const v = def[k];
    copy[k] = v && typeof v === 'object' ? cloneItemDef(v) : v;
  });
  return copy;
}
Object.keys(SHARED_ITEMS).forEach((baseId) => {
  Object.keys(SHARED_ITEMS[baseId]).forEach((id) => {
    ITEMS[id] = Object.assign(cloneItemDef(ITEMS[baseId]), { id, name: SHARED_ITEMS[baseId][id] });
  });
});
