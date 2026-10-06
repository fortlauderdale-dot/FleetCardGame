// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Opponents                                                                     ██
// ██  Every opponent by world: regulars, elites and bosses.                         ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// prettier-ignore
const WORLD_1_POOLS = {
  regulars: [
    {
      id: 'w1_beach_umbrella', name: 'Runaway Beach Umbrella', icon: '⛱️', image: 'Hazards/rogue-beach-umbrella.png',
      hp: 48, minTier: 1, drawRate: 2, items: ['w1_umbrella_gust']
    },
    {
      id: 'w1_seagull', name: 'Territorial Seagull', icon: '🐦', image: 'Hazards/territorial-seagull.png', hp: 46,
      minTier: 1, drawRate: 2, items: ['w1_dive_bomb_peck']
    },
    {
      id: 'w1_beach_ball', name: 'Runaway Beach Ball', icon: '🏐', image: 'Hazards/runaway-beach-ball.png', hp: 44,
      minTier: 1, drawRate: 2, items: ['w1_bounce_barrage']
    },
    {
      id: 'w1_sunburnt_tourist', name: 'Sunburnt Tourist', icon: '🧴', image: 'Hazards/sunburnt-tourist.png', hp: 50,
      minTier: 1, drawRate: 2, items: ['w1_reckless_splash']
    },
    {
      id: 'w1_hermit_crab', name: 'Hermit Crab in a Stolen Shell', icon: '🦀',
      image: 'Hazards/hermit-crab-stolen-shell.png', hp: 52, minTier: 1, drawRate: 2, startArmor: 15,
      items: ['w1_pinch_attack']
    },
    {
      id: 'w1_rip_current', name: 'Rip Current', icon: '🌊', image: 'Hazards/rip-current.png', hp: 54, minTier: 1,
      drawRate: 2, items: ['w1_undertow_pull']
    },
    {
      id: 'w1_metal_detectorist', name: 'Overzealous Metal Detectorist', icon: '🔍',
      image: 'Hazards/overzealous-metal-detectorist.png', hp: 56, minTier: 1, drawRate: 2, items: ['w1_wild_swing']
    },
    {
      id: 'w1_boardwalk_plank', name: 'Broken Boardwalk Plank', icon: '🪵',
      image: 'Hazards/broken-boardwalk-plank.png', hp: 58, minTier: 1, drawRate: 2, startArmor: 12,
      items: ['w1_splinter_snap']
    },
    {
      id: 'w1_beach_cats', name: 'Feral Beach Cat', icon: '🐈', image: 'Hazards/feral-beach-cat.png', hp: 60,
      minTier: 1, drawRate: 2, items: ['w1_claw_skirmish']
    },
    {
      id: 'w1_rental_jet_ski_menace', name: 'Rental Jet Ski Menace', icon: '🚤',
      image: 'Hazards/rental-jet-ski-menace.png', hp: 62, minTier: 1, drawRate: 2, items: ['w1_net_snare']
    },
    {
      id: 'w1_jellyfish', name: 'Drifting Jellyfish', icon: '🪼', image: 'Hazards/drifting-jellyfish.png', hp: 46,
      minTier: 1, drawRate: 2, items: ['w1_jelly_drift']
    },
    {
      id: 'w1_unpermitted_sandcastle', name: 'Unpermitted Sandcastle', icon: '🏰',
      image: 'Hazards/unpermitted-sandcastle.png', hp: 58, minTier: 1, drawRate: 2,
      items: ['w1_moat_collapse', 'w1_turret_poke']
    },
    {
      id: 'w1_runaway_kite', name: 'Runaway Kite', icon: '🪁', image: 'Hazards/runaway-kite.png', hp: 40, minTier: 1,
      drawRate: 2, items: ['w1_string_snap']
    },
    {
      id: 'w1_lobster_trap', name: 'Lobster Trap', icon: '🦞', image: 'Hazards/lobster-trap.png', hp: 60, minTier: 1,
      drawRate: 2, startArmor: 14, items: ['w1_trap_snap', 'w1_rope_drag']
    },
    {
      id: 'w1_falling_coconut', name: 'Falling Coconut', icon: '🥥', image: 'Hazards/falling-coconut.png', hp: 44,
      minTier: 1, drawRate: 2, items: ['w1_coconut_drop']
    },
    {
      id: 'w1_reckless_surfboard', name: 'Reckless Surfboarder', icon: '🏄', image: 'Hazards/reckless-surfboard.png',
      hp: 56, minTier: 1, drawRate: 2, items: ['w1_wave_slap', 'w1_board_wobble']
    },
    {
      id: 'w1_snagged_anchor', name: 'Anchor Chain', icon: '⚓', image: 'Hazards/snagged-anchor-chain.png', hp: 64,
      minTier: 1, drawRate: 2, startArmor: 18, armorRegen: 6, items: ['w1_chain_rattle', 'w1_anchor_drag']
    },
    {
      id: 'w1_sea_turtle', name: 'Grumpy Sea Turtle', icon: '🐢', image: 'Hazards/grumpy-sea-turtle.png', hp: 66,
      minTier: 1, drawRate: 2, startArmor: 20, items: ['w1_shell_bump']
    },
    {
      id: 'w1_sargassum_sea_creature', name: 'Sargassum Sea Creature', icon: '🐙',
      image: 'Hazards/sargassum-sea-creature.png', hp: 52, minTier: 1, drawRate: 2, items: ['w1_net_haul']
    },
    {
      id: 'w1_spring_breaker', name: 'Spring Breaker', icon: '🍹', image: 'Hazards/spring-breaker.png', hp: 46,
      minTier: 1, drawRate: 2, items: ['w1_glare_flash']
    },
  ],
  elites: [
    {
      id: 'w1_lifeguard_tower', name: 'Lifeguard Tower', icon: '🛟', image: 'Hazards/lifeguard-tower-sentinel.png',
      hp: 95, minTier: 2, drawRate: 3, startArmor: 20, armorRegen: 8, items: ['w1_whistle_command']
    },
    {
      id: 'w1_frigatebird', name: 'Frigatebird', icon: '🦅', image: 'Hazards/alpha-frigatebird.png', hp: 92,
      minTier: 2, drawRate: 3, items: ['w1_talon_dive']
    },
    {
      id: 'w1_jellyfish_swarm', name: 'Jellyfish Swarm', icon: '🪼', image: 'Hazards/drifting-jellyfish-swarm.png',
      hp: 94, minTier: 2, drawRate: 3, items: ['w1_sting_barrage', 'w1_jelly_drift']
    },
    {
      id: 'w1_beach_cat_colony', name: 'Feral Beach Cat Colony', icon: '🐈',
      image: 'Hazards/feral-beach-cat-colony.png', hp: 93, minTier: 2, drawRate: 3,
      items: ['w1_claw_skirmish', 'w1_cat_colony_pounce']
    },
  ],
  boss: {
    id: 'rogue_wave', name: 'Big Al', icon: '🥂', image: 'Hazards/rogue-wave.png', hp: 150, minTier: 3, drawRate: 5,
    boss: true, usesPerTurn: 2, startArmor: 25, armorRegen: 12, items: ['w1_wave_crash', 'w1_riptide_sweep'],
    attackInfo: ('Attack: uses his best poker hand for heavy damage and can hit twice a turn. ' +
      'His entourage keeps his armor topped up every turn - no curses, just brute force.')
  },
};
// prettier-ignore
const WORLD_2_POOLS = {
  regulars: [
    {
      id: 'w2_snapping_gator', name: 'Snapping Gator', icon: '🐊', image: 'Hazards/snapping-gator.png', hp: 52,
      minTier: 1, drawRate: 2, items: ['w2_snapping_jaws']
    },
    {
      id: 'w2_mosquito_cloud', name: 'Swamp Mosquito', icon: '🦟', image: 'Hazards/swamp-mosquito.png', hp: 46,
      minTier: 1, drawRate: 2, items: ['w2_buzzing_bite']
    },
    {
      id: 'w2_sunken_airboat', name: 'Sunken Airboat', icon: '⛵', image: 'Hazards/sunken-airboat.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w2_prop_wash']
    },
    {
      id: 'w2_cottonmouth', name: 'Cottonmouth', icon: '🐍', image: 'Hazards/cottonmouth-viper.png', hp: 48,
      minTier: 1, drawRate: 2, items: ['w2_venomous_strike']
    },
    {
      id: 'w2_sinkhole', name: 'Sinkhole', icon: '🕳️', image: 'Hazards/sinkhole.png', hp: 60, minTier: 1,
      drawRate: 2, items: ['w2_sucking_pull']
    },
    {
      id: 'w2_swamp_gas', name: 'Swamp Gas', icon: '🌫️', image: 'Hazards/swamp-gas.png', hp: 50, minTier: 1,
      drawRate: 2, startHandSize: 6, items: ['w2_toxic_haze']
    },
    {
      id: 'w2_feral_hogs', name: 'Feral Hog', icon: '🐗', image: 'Hazards/feral-hog.png', hp: 62, minTier: 1,
      drawRate: 2, items: ['w2_tusk_charge']
    },
    {
      id: 'w2_burmese_python', name: 'Burmese Python', icon: '🐍', image: 'Hazards/burmese-python.png', hp: 56,
      minTier: 1, drawRate: 2, items: ['w2_root_trip']
    },
    {
      id: 'w2_thirsty_leeches', name: 'Thirsty Leeches', icon: '🪱', image: 'Hazards/thirsty-leeches.png', hp: 54,
      minTier: 1, drawRate: 2, items: ['w2_blood_drain']
    },
    {
      id: 'w2_fire_ant', name: 'Fire Ant', icon: '🐜', image: 'Hazards/fire-ant.png', hp: 58, minTier: 1, drawRate: 2,
      items: ['w2_swarming_bite']
    },
    {
      id: 'w2_cane_toad', name: 'Cane Toad', icon: '🐸', image: 'Hazards/cane-toad.png', hp: 50, minTier: 1,
      drawRate: 2, items: ['w2_bullfrog_lunge', 'w2_bullfrog_hop']
    },
    {
      id: 'w2_flooded_pothole', name: 'Flooded Pothole', icon: '💧', image: 'Hazards/flooded-pothole.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w2_burrow_collapse', 'w2_burrow_nip']
    },
    {
      id: 'w2_banana_spider', name: 'Banana Spider', icon: '🕷️', image: 'Hazards/banana-spider.png', hp: 46,
      minTier: 1, drawRate: 2, items: ['w2_spider_bite']
    },
    {
      id: 'w2_cold_stunned_iguana', name: 'Cold-Stunned Iguana', icon: '🦎', image: 'Hazards/cold-stunned-iguana.png',
      hp: 48, minTier: 1, drawRate: 2, items: ['w2_gecko_snap']
    },
    {
      id: 'w2_snowbird_in_the_left_lane', name: 'Snowbird in the Left Lane', icon: '🧓',
      image: 'Hazards/snowbird-in-the-left-lane.png', hp: 54, minTier: 1, drawRate: 2, startArmor: 10,
      items: ['w2_slime_trail']
    },
    {
      id: 'w2_love_bug', name: 'Love Bug', icon: '🪰', image: 'Hazards/love-bug.png', hp: 44, minTier: 1, drawRate: 2,
      items: ['w2_fly_swarm_bite']
    },
    {
      id: 'w2_rest_stop_raccoon', name: 'Rest Stop Raccoon', icon: '🦝', image: 'Hazards/rest-stop-raccoon.png',
      hp: 56, minTier: 1, drawRate: 2, items: ['w2_rat_nest_swarm']
    },
    {
      id: 'w2_sawgrass', name: 'Sawgrass', icon: '🌿', image: 'Hazards/sawgrass.png', hp: 60, minTier: 1, drawRate: 2,
      items: ['w2_reed_snare', 'w2_reed_scratch']
    },
    {
      id: 'w2_wobbly_rental_kayak', name: 'Wobbly Rental Kayak', icon: '🛶', image: 'Hazards/wobbly-rental-kayak.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w2_canoe_ram', 'w2_canoe_bump']
    },
    {
      id: 'w2_midday_heat', name: 'Midday Heat', icon: '☀️', image: 'Hazards/midday-heat.png', hp: 42, minTier: 1,
      drawRate: 2, items: ['w2_fever_microbe']
    },
  ],
  elites: [
    {
      id: 'w2_bull_gator', name: 'Bull Gator', icon: '🐊', image: 'Hazards/bull-gator.png', hp: 100, minTier: 2,
      drawRate: 3, items: ['w2_death_roll']
    },
    {
      id: 'w2_water_moccasin', name: 'Water Moccasin', icon: '🐍', image: 'Hazards/water-moccasin.png', hp: 98,
      minTier: 2, drawRate: 3, items: ['w2_twin_fang_strike']
    },
    {
      id: 'w2_mosquito_cloud_elite', name: 'Mosquito Cloud', icon: '🦟', image: 'Hazards/mosquito-cloud.png', hp: 90,
      minTier: 2, drawRate: 3, items: ['w2_buzzing_bite', 'w2_mosquito_cloud_bites']
    },
    {
      id: 'w2_brush_fire_smoke', name: 'Brush Fire Smoke', icon: '🔥', image: 'Hazards/brush-fire-smoke.png', hp: 92,
      minTier: 2, drawRate: 3, items: ['w2_toxic_haze', 'w2_fog_swarm_thicken']
    },
    {
      id: 'w2_wild_hog_herd', name: 'Wild Hog Herd', icon: '🐗', image: 'Hazards/wild-hog-herd.png', hp: 96,
      minTier: 2, drawRate: 3, items: ['w2_tusk_charge', 'w2_sounder_stampede']
    },
    {
      id: 'w2_fire_ant_mound', name: 'Fire Ant Mound', icon: '🐜', image: 'Hazards/fire-ant-mound.png', hp: 94,
      minTier: 2, drawRate: 3, items: ['w2_swarming_bite', 'w2_fire_ant_mound_boil']
    },
    {
      id: 'w2_love_bug_swarm', name: 'Love Bug Swarm', icon: '🪰', image: 'Hazards/love-bug-swarm.png', hp: 88,
      minTier: 2, drawRate: 3, items: ['w2_fly_swarm_bite', 'w2_deer_fly_cloud_descend']
    },
    {
      id: 'w2_raccoon_gang', name: 'Raccoon Gang', icon: '🦝', image: 'Hazards/raccoon-gang.png', hp: 92, minTier: 2,
      drawRate: 3, items: ['w2_rat_nest_swarm', 'w2_sewer_rat_nest_swarm']
    },
  ],
  boss: {
    id: 'nuisance_gator', name: 'Nuisance Gator', icon: '🐊', image: 'Hazards/nuisance-gator.png', hp: 170,
    minTier: 3, drawRate: 5, boss: true, usesPerTurn: 2, items: ['w2_death_roll_frenzy', 'w2_venomous_maw'],
    attackInfo: ('Attack: uses its best poker hand for heavy damage and can hit twice a turn. It ' +
      'wandered somewhere it should not, and it is enormous - about half its hits carry poison.')
  },
};
// prettier-ignore
const WORLD_3_POOLS = {
  regulars: [
    {
      id: 'w3_gridlock_commuter', name: 'Gridlock Commuter', icon: '🚗', image: 'Hazards/gridlock-commuter.png',
      hp: 50, minTier: 1, drawRate: 2, items: ['w3_road_rage']
    },
    {
      id: 'w3_screaming_dispatcher', name: 'Screaming Dispatcher', icon: '📻',
      image: 'Hazards/screaming-dispatcher.png', hp: 48, minTier: 1, drawRate: 2, items: ['w3_static_interference']
    },
    {
      id: 'ee_procurement', name: 'Procurement', icon: '📋', image: 'Hazards/procurement.png', hp: 52, minTier: 1,
      drawRate: 2, items: ['ee_procurement_po_hold']
    },
    {
      id: 'w3_rogue_delivery_drone', name: 'Rogue Delivery Drone', icon: '🛸',
      image: 'Hazards/rogue-delivery-drone.png', hp: 52, minTier: 1, drawRate: 2, items: ['w3_propeller_slash']
    },
    {
      id: 'w3_broken_ticket_dispenser', name: 'Broken Ticket Dispenser', icon: '🎫',
      image: 'Hazards/broken-ticket-dispenser.png', hp: 55, minTier: 1, drawRate: 2, items: ['w3_paper_jam']
    },
    {
      id: 'w3_injury_lawyer_billboard', name: 'Injury Lawyer Billboard', icon: '⚖️',
      image: 'Hazards/injury-lawyer-billboard.png', hp: 54, minTier: 1, drawRate: 2, items: ['w3_high_beam_glare']
    },
    {
      id: 'w3_hungry_parking_meter', name: 'Hungry Parking Meter', icon: '🅿️',
      image: 'Hazards/hungry-parking-meter.png', hp: 52, minTier: 1, drawRate: 2, items: ['w3_meter_poke']
    },
    {
      id: 'w3_orange_barrel_maze', name: 'Orange Barrel Maze', icon: '🚧', image: 'Hazards/orange-barrel-maze.png',
      hp: 58, minTier: 1, drawRate: 2, items: ['w3_barrier_ignite', 'w3_barrier_topple']
    },
    {
      id: 'w3_expired_fire_extinguisher', name: 'Expired Fire Extinguisher', icon: '🧯',
      image: 'Hazards/expired-fire-extinguisher.png', hp: 54, minTier: 1, drawRate: 2,
      items: ['w3_extinguisher_backfire', 'w3_extinguisher_swing']
    },
    {
      id: 'w3_flickering_streetlamp', name: 'Flickering Streetlamp', icon: '💡',
      image: 'Hazards/flickering-streetlamp.png', hp: 48, minTier: 1, drawRate: 2, items: ['w3_streetlamp_flicker']
    },
    {
      id: 'w3_dumpster_fire', name: 'Dumpster Fire', icon: '🗑️', image: 'Hazards/dumpster-fire.png', hp: 60,
      minTier: 1, drawRate: 2, items: ['w3_dumpster_flareup', 'w3_dumpster_smolder']
    },
    {
      id: 'w3_city_bus_running_late', name: 'City Bus Running Late', icon: '🚌',
      image: 'Hazards/city-bus-running-late.png', hp: 66, minTier: 1, drawRate: 2, startArmor: 16,
      items: ['w3_bus_sideswipe']
    },
    {
      id: 'w3_transformer_on_a_pole', name: 'Transformer on a Pole', icon: '🔌',
      image: 'Hazards/transformer-on-a-pole.png', hp: 50, minTier: 1, drawRate: 2, items: ['w3_junction_spark']
    },
    {
      id: 'w3_parking_pay_station', name: 'Parking Pay Station', icon: '📠', image: 'Hazards/parking-pay-station.png',
      hp: 56, minTier: 1, drawRate: 2, items: ['w3_kiosk_jam']
    },
    {
      id: 'w3_oblivious_commuter', name: 'Oblivious Commuter', icon: '📱', image: 'Hazards/oblivious-commuter.png',
      hp: 52, minTier: 1, drawRate: 2, items: ['w3_busstop_shortcircuit']
    },
    {
      id: 'w3_flipped_dumpster', name: 'Flipped Dumpster', icon: '♻️', image: 'Hazards/flipped-dumpster.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w3_panel_surge', 'w3_panel_rattle']
    },
    {
      id: 'w3_overzealous_valet', name: 'Overzealous Valet', icon: '🛎️', image: 'Hazards/overzealous-valet.png',
      hp: 54, minTier: 1, drawRate: 2, items: ['w3_valet_joyride']
    },
    {
      id: 'w3_sign_spinner', name: 'Sign Spinner', icon: '🪧', image: 'Hazards/sign-spinner.png', hp: 62, minTier: 1,
      drawRate: 2, items: ['w3_picket_shove', 'w3_picket_chant']
    },
    {
      id: 'w3_steaming_manhole', name: 'Steaming Manhole', icon: '♨️', image: 'Hazards/steaming-manhole.png', hp: 56,
      minTier: 1, drawRate: 2, items: ['w3_steam_vent']
    },
    {
      id: 'w3_free_downtown_wi_fi', name: 'Free Downtown Wi-Fi', icon: '📶', image: 'Hazards/free-downtown-wi-fi.png',
      hp: 46, minTier: 1, drawRate: 2, items: ['w3_router_jam']
    },
    {
      id: 'w3_rideshare_driver', name: 'Rideshare Driver', icon: '🚕', image: 'Hazards/rideshare-driver.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w3_rideshare_cutoff', 'w3_rideshare_honk']
    },
  ],
  elites: [
    {
      id: 'w3_code_enforcer', name: 'Code Enforcer', icon: '🚔', image: 'Hazards/code-enforcer.png', hp: 90,
      minTier: 2, drawRate: 3, items: ['w3_citation_blitz']
    },
    {
      id: 'w3_gridlocked_intersection', name: 'Gridlocked Intersection', icon: '🚦',
      image: 'Hazards/gridlocked-intersection.png', hp: 95, minTier: 2, drawRate: 3, items: ['w3_signal_scramble']
    },
    {
      id: 'w8_angry_citizen_mob', name: 'Angry Citizen', icon: '😡', image: 'Hazards/angry-citizen-mob.png', hp: 140,
      minTier: 2, drawRate: 3, items: ['w8_mob_pitchforks','w8_mob_petition','w8_mob_public_comment']
    },
  ],
  boss: {
    id: 'parking_enforcer', name: 'Parking Enforcer', icon: '🎟️', image: 'Hazards/parking-enforcer.png', hp: 160,
    minTier: 3, drawRate: 5, boss: true, usesPerTurn: 2, items: ['opp_boot_lockdown', 'opp_impound_fury'],
    attackInfo: ('Attack: uses its best poker hand for heavy damage and can hit twice a turn. ' +
      'Boots your fleet and burns - Fire damage from its boot lockdown.')
  },
};
// prettier-ignore
const WORLD_4_POOLS = {
  regulars: [
    {
      id: 'w4_barnacle_buoy', name: 'Barnacle Buoy', icon: '🟠', image: 'Hazards/barnacle-buoy.png', hp: 60,
      minTier: 1, drawRate: 2, items: ['w4_hull_scrape']
    },
    {
      id: 'w4_mooring_cleat', name: 'Mooring Cleat', icon: '⚓', image: 'Hazards/mooring-cleat.png', hp: 62,
      minTier: 1, drawRate: 2, items: ['w4_line_snap']
    },
    {
      id: 'w4_fuel_dock_siphoner', name: 'Fuel Dock Siphoner', icon: '⛽', image: 'Hazards/fuel-dock-siphoner.png',
      hp: 58, minTier: 1, drawRate: 2, items: ['w4_bilge_leak']
    },
    {
      id: 'w4_new_river_water_taxi', name: 'New River Water Taxi', icon: '🚤',
      image: 'Hazards/new-river-water-taxi.png', hp: 65, minTier: 1, drawRate: 2, items: ['w4_wake_turbulence']
    },
    {
      id: 'w4_bait_barge', name: 'Bait Barge', icon: '🚢', image: 'Hazards/bait-barge.png', hp: 68, minTier: 1,
      drawRate: 2, items: ['w4_chum_slick']
    },
    {
      id: 'w4_dock_crab', name: 'Dock Crab', icon: '🦀', image: 'Hazards/dock-crab.png', hp: 58, minTier: 1,
      drawRate: 2, items: ['w4_crab_swarm_nip']
    },
    {
      id: 'w4_overloaded_forklift', name: 'Overloaded Forklift', icon: '🏗️',
      image: 'Hazards/overloaded-forklift.png', hp: 62, minTier: 1, drawRate: 2,
      items: ['w4_crate_topple', 'w4_crate_shift']
    },
    {
      id: 'w4_live_bait_bucket', name: 'Live Bait Bucket', icon: '🪣', image: 'Hazards/live-bait-bucket.png', hp: 48,
      minTier: 1, drawRate: 2, items: ['w4_bait_spill']
    },
    {
      id: 'w4_oblivious_vlogger', name: 'Oblivious Vlogger', icon: '🎥', image: 'Hazards/oblivious-vlogger.png',
      hp: 50, minTier: 1, drawRate: 2, items: ['w4_fishing_snag']
    },
    {
      id: 'w4_dockside_ice_machine', name: 'Dockside Ice Machine', icon: '🧊',
      image: 'Hazards/dockside-ice-machine.png', hp: 54, minTier: 1, drawRate: 2, items: ['w4_ice_leak']
    },
    {
      id: 'w4_river_otter', name: 'River Otter', icon: '🦦', image: 'Hazards/river-otter.png', hp: 46, minTier: 1,
      drawRate: 2, items: ['w4_otter_nip']
    },
    {
      id: 'w4_debris_pile', name: 'Debris Pile', icon: '🧹', image: 'Hazards/debris-pile.png', hp: 56, minTier: 1,
      drawRate: 2, items: ['w4_piling_scrape']
    },
    {
      id: 'w4_mega_yacht_wake', name: 'Mega Yacht Wake', icon: '🛳️', image: 'Hazards/mega-yacht-wake.png', hp: 68,
      minTier: 1, drawRate: 2, startArmor: 14, items: ['w4_cruise_wake_swell', 'w4_cruise_wake_rock']
    },
    {
      id: 'w4_patrol_helicopter', name: 'Patrol Helicopter', icon: '🚁', image: 'Hazards/patrol-helicopter.png',
      hp: 64, minTier: 1, drawRate: 2, items: ['w4_chopper_downwash', 'w4_chopper_buzz']
    },
    {
      id: 'w4_pufferfish', name: 'Pufferfish', icon: '🐡', image: 'Hazards/pufferfish.png', hp: 44, minTier: 1,
      drawRate: 2, items: ['w4_puffer_puncture']
    },
    {
      id: 'w4_selfie_stick_tourist', name: 'Selfie Stick Tourist', icon: '📸',
      image: 'Hazards/selfie-stick-tourist.png', hp: 58, minTier: 1, drawRate: 2,
      items: ['w4_haunted_piling_hex', 'w4_haunted_piling_creak']
    },
    {
      id: 'w4_fortune_teller', name: "Fortune Teller's Kiosk", icon: '🔮', image: 'Hazards/fortune-tellers-kiosk.png',
      hp: 54, minTier: 1, drawRate: 2, items: ['w4_fortune_tellers_hex','w4_fortune_reshuffle']
    },
    {
      id: 'w4_boardwalk_tourist', name: 'Boardwalk Tourist', icon: '🗺️', image: 'Hazards/boardwalk-tourist.png',
      hp: 52, minTier: 1, drawRate: 2, items: ['w4_deck_board_snap']
    },
    {
      id: 'w4_sinking_charter_yacht', name: 'Sinking Charter Yacht', icon: '🛥️',
      image: 'Hazards/sinking-charter-yacht.png', hp: 56, minTier: 1, drawRate: 2, items: ['w4_bilge_overheat']
    },
    {
      id: 'w4_screaming_dockmaster', name: 'Screaming Dockmaster', icon: '📢',
      image: 'Hazards/screaming-dockmaster.png', hp: 60, minTier: 1, drawRate: 2,
      items: ['w4_cargo_winch_snap', 'w4_cargo_winch_swing']
    },
  ],
  elites: [
    {
      id: 'w4_marine_patrol_boat', name: 'Marine Patrol Boat', icon: '🚨', image: 'Hazards/marine-patrol-boat.png',
      hp: 110, minTier: 2, drawRate: 3, items: ['w4_blue_strobe']
    },
    {
      id: 'w4_stormwater_pump', name: 'Stormwater Pump', icon: '🌊', image: 'Hazards/stormwater-pump.png', hp: 115,
      minTier: 2, drawRate: 3, items: ['w4_backflow_gush']
    },
    {
      id: 'w4_dock_crab_swarm', name: 'Dock Crab Swarm', icon: '🦀', image: 'Hazards/dock-crab-swarm.png', hp: 108,
      minTier: 2, drawRate: 3, items: ['w4_crab_swarm_nip', 'w4_crab_swarm_pinch']
    },
  ],
  boss: {
    id: 'drawbridge', name: 'The Drawbridge', icon: '🌉', image: 'Hazards/drawbridge.png', hp: 190, minTier: 3,
    drawRate: 5, boss: true, usesPerTurn: 2, items: ['opp_bascule_crush', 'opp_warning_bell'],
    attackInfo: ('Attack: uses its best poker hand for heavy damage and can hit twice a turn. ' +
      'Crushes with its bascule span and siphons your fuel.')
  },
};
// prettier-ignore
const WORLD_5_POOLS = {
  regulars: [
    {
      id: 'w5_icy_pallet_jack', name: 'Icy Pallet Jack', icon: '🧊', image: 'Hazards/icy-pallet-jack.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w5_forklift_freeze', 'w5_forklift_bump']
    },
    {
      id: 'w5_melting_pallet', name: 'Melting Pallet', icon: '💧', image: 'Hazards/melting-pallet.png', hp: 56,
      minTier: 1, drawRate: 2, items: ['w5_fog_chill']
    },
    {
      id: 'w5_stuck_cooler_door', name: 'Stuck Cooler Door', icon: '🚪', image: 'Hazards/stuck-cooler-door.png',
      hp: 62, minTier: 1, drawRate: 2, startArmor: 18, items: ['w5_door_freeze']
    },
    {
      id: 'w5_chain_hoist', name: 'Chain Hoist', icon: '⛓️', image: 'Hazards/chain-hoist.png', hp: 60, minTier: 1,
      drawRate: 2, items: ['w5_hoist_swing']
    },
    {
      id: 'w5_delayed_delivery_driver', name: 'Delayed Delivery Driver', icon: '🚛',
      image: 'Hazards/delayed-delivery-driver.png', hp: 64, minTier: 1, drawRate: 2, items: ['w5_beeper_blare']
    },
    {
      id: 'w5_illegally_parked_semi', name: 'Illegally Parked Semi', icon: '🛑',
      image: 'Hazards/illegally-parked-semi.png', hp: 58, minTier: 1, drawRate: 2, items: ['w5_bumper_thud']
    },
    {
      id: 'w5_shrinkwrap_boulder', name: 'Shrinkwrap Boulder', icon: '🧶', image: 'Hazards/shrinkwrap-boulder.png',
      hp: 60, minTier: 1, drawRate: 2, items: ['w5_wrap_snag', 'w5_wrap_spin']
    },
    {
      id: 'w5_reckless_scanner_gun', name: 'Reckless Scanner Gun', icon: '📟',
      image: 'Hazards/reckless-scanner-gun.png', hp: 54, minTier: 1, drawRate: 2, items: ['w5_scan_grab']
    },
    {
      id: 'w5_inventory_clerk', name: 'Inventory Clerk', icon: '📋', image: 'Hazards/inventory-clerk.png', hp: 60,
      minTier: 1, drawRate: 2, items: ['w5_bot_grab', 'w5_bot_beep']
    },
    {
      id: 'w5_pallet_wrapper', name: 'Pallet Wrapper', icon: '🎞️', image: 'Hazards/pallet-wrapper.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w5_arm_snatch']
    },
    {
      id: 'w5_ammonia_leak', name: 'Ammonia Leak', icon: '☣️', image: 'Hazards/ammonia-leak.png', hp: 54, minTier: 1,
      drawRate: 2, items: ['w5_ammonia_fumes', 'w5_leak_drip']
    },
    {
      id: 'w5_naynay', name: 'NayNay', icon: '🐾', image: 'Hazards/naynay.png', hp: 56, minTier: 1, drawRate: 2,
      items: ['w5_naynay_mind_games', 'w5_naynay_guilt_trip']
    },
    {
      id: 'w5_overheated_compressor', name: 'Overheated Compressor', icon: '🔥',
      image: 'Hazards/overheated-compressor.png', hp: 60, minTier: 1, drawRate: 2,
      items: ['w5_compressor_blowout', 'w5_compressor_hum']
    },
    {
      id: 'w5_blown_a_c_compressor', name: 'Blown A/C Compressor', icon: '🔌',
      image: 'Hazards/blown-a-c-compressor.png', hp: 52, minTier: 1, drawRate: 2,
      items: ['w5_panel_arc','w5_compressor_recharge']
    },
    {
      id: 'w5_unmarked_wet_floor', name: 'Unmarked Wet Floor', icon: '⚠️', image: 'Hazards/unmarked-wet-floor.png',
      hp: 54, minTier: 1, drawRate: 2, items: ['w5_catwalk_slip']
    },
    {
      id: 'w5_stuck_bay_door', name: 'Stuck Bay Door', icon: '❄️', image: 'Hazards/stuck-bay-door.png', hp: 62,
      minTier: 1, drawRate: 2, startArmor: 14, items: ['w5_frost_seal']
    },
    {
      id: 'w5_logi_bear', name: 'Logi Bear', icon: '🐻', image: 'Hazards/logi-bear.png', hp: 60, minTier: 1,
      drawRate: 2, items: ['w5_logi_bear_roundhouse', 'w5_logi_bear_chop']
    },
    {
      id: 'w5_walk_in_freezer', name: 'Walk-In Freezer', icon: '🧊', image: 'Hazards/walk-in-freezer.png', hp: 66,
      minTier: 1, drawRate: 2, items: ['w5_freezer_gust']
    },
    {
      id: 'w5_malfunctioning_ice_machine', name: 'Malfunctioning Ice Machine', icon: '🧊',
      image: 'Hazards/malfunctioning-ice-machine.png', hp: 56, minTier: 1, drawRate: 2, items: ['w5_machine_jam']
    },
    {
      id: 'w5_slippery_dock_plate', name: 'Slippery Dock Plate', icon: '🛼', image: 'Hazards/slippery-dock-plate.png',
      hp: 52, minTier: 1, drawRate: 2, items: ['w5_plate_skid']
    },
  ],
  elites: [
    {
      id: 'w5_cryo_compressor', name: 'Cryo-Compressor', icon: '🏭', image: 'Hazards/cryo-compressor.png', hp: 120,
      minTier: 2, drawRate: 3, items: ['w5_elite_cryo_blast', 'w5_elite_cryo_slam']
    },
    {
      id: 'w5_overworked_logistics_worker', name: 'Overworked Logistics Worker', icon: '🥱',
      image: 'Hazards/overworked-logistics-worker.png', hp: 118, minTier: 2, drawRate: 3,
      items: ['w5_elite_ai_hex', 'w5_elite_ai_purge']
    },
  ],
  boss: {
    id: 'walk_in_walker', name: 'The Walk-In Walker', icon: '🧟', image: 'Hazards/walk-in-walker.png', hp: 205,
    minTier: 3, drawRate: 5, boss: true, usesPerTurn: 2, items: ['w5_boss_deepfreeze', 'w5_boss_coldsnap_hex'],
    attackInfo: ('Attack: uses its best poker hand for heavy damage and can hit twice a turn. ' +
      'Freezes your Items solid and takes cards off whatever\'s left thawed.')
  },
};
// prettier-ignore
const WORLD_6_POOLS = {
  regulars: [
    {
      id: 'w6_runaway_valet_cart', name: 'Runaway Valet Cart', icon: '🛺', image: 'Hazards/runaway-valet-cart.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w6_cart_careen']
    },
    {
      id: 'w6_runaway_bicycle', name: 'Runaway Bicycle', icon: '🚲', image: 'Hazards/runaway-bicycle.png', hp: 58,
      minTier: 1, drawRate: 2, items: ['w6_umbrella_flip']
    },
    {
      id: 'w6_toppled_streetlight', name: 'Toppled Streetlight', icon: '💡', image: 'Hazards/toppled-streetlight.png',
      hp: 64, minTier: 1, drawRate: 2, items: ['w6_streetlight_arc', 'w6_streetlight_sway']
    },
    {
      id: 'w6_delivery_vespa', name: 'Delivery Vespa', icon: '🛵', image: 'Hazards/delivery-vespa.png', hp: 56,
      minTier: 1, drawRate: 2, items: ['w6_lights_short']
    },
    {
      id: 'w6_aggressive_shopper', name: 'Aggressive Shopper', icon: '🛍️', image: 'Hazards/aggressive-shopper.png',
      hp: 60, minTier: 1, drawRate: 2, items: ['w6_alarm_shock']
    },
    {
      id: 'w6_broken_ev_charger', name: 'Broken EV Charger', icon: '🔌', image: 'Hazards/broken-ev-charger.png',
      hp: 64, minTier: 1, drawRate: 2, items: ['w6_charger_surge', 'w6_charger_beep']
    },
    {
      id: 'w6_king_tide_flood', name: 'King Tide Flood', icon: '🌊', image: 'Hazards/king-tide-flood.png', hp: 62,
      minTier: 1, drawRate: 2, items: ['w6_flood_surge']
    },
    {
      id: 'w6_falling_palm_frond', name: 'Falling Palm Frond', icon: '🌴', image: 'Hazards/falling-palm-frond.png',
      hp: 54, minTier: 1, drawRate: 2, items: ['w6_frond_smack']
    },
    {
      id: 'w6_downed_power_line', name: 'Downed Power Line', icon: '⚡', image: 'Hazards/downed-power-line.png',
      hp: 66, minTier: 1, drawRate: 2, items: ['w6_line_arc', 'w6_line_snap']
    },
    {
      id: 'w6_dark_traffic_signal', name: 'Dark Traffic Signal', icon: '🚦', image: 'Hazards/dark-traffic-signal.png',
      hp: 58, minTier: 1, drawRate: 2, items: ['w6_signal_flicker']
    },
    {
      id: 'w6_power_tripping_bouncer', name: 'Power-Tripping Bouncer', icon: '🕴️',
      image: 'Hazards/power-tripping-bouncer.png', hp: 60, minTier: 1, drawRate: 2,
      items: ['w6_laser_grab', 'w6_laser_scan']
    },
    {
      id: 'w6_pickpocket', name: 'Pickpocket', icon: '🤏', image: 'Hazards/pickpocket.png', hp: 52, minTier: 1,
      drawRate: 2, items: ['w6_pocket_lift']
    },
    {
      id: 'w6_timeshare_salesman', name: 'Timeshare Salesman', icon: '🏨', image: 'Hazards/timeshare-salesman.png',
      hp: 56, minTier: 1, drawRate: 2, items: ['w6_con_swindle', 'w6_con_chatter']
    },
    {
      id: 'w6_sketchy_valet_driver', name: 'Sketchy Valet Driver', icon: '🎫',
      image: 'Hazards/sketchy-valet-driver.png', hp: 54, minTier: 1, drawRate: 2, items: ['w6_ticket_switch']
    },
    {
      id: 'w6_storefront_awning', name: 'Storefront Awning', icon: '⛈️', image: 'Hazards/storefront-awning.png',
      hp: 62, minTier: 1, drawRate: 2, items: ['w6_awning_strike']
    },
    {
      id: 'w6_valet_golf_cart', name: 'Valet Golf Cart', icon: '🏌️', image: 'Hazards/valet-golf-cart.png', hp: 60,
      minTier: 1, drawRate: 2, items: ['w6_ac_arc']
    },
    {
      id: 'w6_storm_drain', name: 'Storm Drain', icon: '🌀', image: 'Hazards/storm-drain.png', hp: 60, minTier: 1,
      drawRate: 2, items: ['w6_drain_curse', 'w6_drain_pull']
    },
    {
      id: 'w6_broken_parking_meter', name: 'Broken Parking Meter', icon: '🅿️',
      image: 'Hazards/broken-parking-meter.png', hp: 56, minTier: 1, drawRate: 2,
      items: ['w6_meter_curse','w6_meter_feed']
    },
    {
      id: 'w6_loud_street_performer', name: 'Loud Street Performer', icon: '🎤',
      image: 'Hazards/loud-street-performer.png', hp: 58, minTier: 1, drawRate: 2, items: ['w6_neon_flicker']
    },
    {
      id: 'w6_sidewalk_influencer', name: 'Sidewalk Influencer', icon: '🤳', image: 'Hazards/sidewalk-influencer.png',
      hp: 56, minTier: 1, drawRate: 2, items: ['w6_table_tip']
    },
  ],
  elites: [
    {
      id: 'w6_live_shot_news_van', name: 'Live Shot News Van', icon: '📡', image: 'Hazards/live-shot-news-van.png',
      hp: 124, minTier: 2, drawRate: 3, usesPerTurn: 2, items: ['w6_elite_van_bolt', 'w6_elite_van_ram']
    },
    {
      id: 'w6_smash_and_grab_crew', name: 'Smash-and-Grab Crew', icon: '💍', image: 'Hazards/smash-and-grab-crew.png',
      hp: 120, minTier: 2, drawRate: 3, items: ['w6_elite_thief_snatch', 'w6_elite_thief_curse']
    },
  ],
  boss: {
    id: 'four_pm_thunderstorm', name: 'The 4 PM Thunderstorm', icon: '⛈️', image: 'Hazards/four-pm-thunderstorm.png',
    hp: 220, minTier: 3, drawRate: 5, boss: true, usesPerTurn: 2,
    items: ['w6_boss_lightning_barrage', 'w6_boss_static_curse'],
    attackInfo: ('Attack: uses its best poker hand for heavy damage and can hit twice a turn. ' +
      'Damage swings wildly with the storm, and every hit risks cursing one of your Items.')
  },
};
// ---- Easter egg opponents. Added to every world's `regulars` pool so they can show up anywhere.
// scaleHighwayOpponent() deep-clones before scaling HP, so sharing these base objects is safe. Item damage
// stays flat, like every other regular opponent. ----
// prettier-ignore
const EASTER_EGG_OPPONENTS = [
  {
    id: 'ee_city_auditor', name: 'City Auditor', icon: '🧐', image: 'Hazards/city-auditor.png', hp: 58, minTier: 1,
    drawRate: 2, startArmor: 14, items: ['ee_auditor_surprise_audit']
  },
  {
    id: 'ee_bionic_brett', name: 'Bionic Brett', icon: '🦾', image: 'Hazards/bionic-brett.png', hp: 62, minTier: 1,
    drawRate: 2, startArmor: 20, armorRegen: 6, items: ['ee_brett_shoulder_check', 'ee_brett_full_throttle']
  },
  {
    id: 'ee_fisherman_chris', name: 'Fisherman Chris', icon: '🎣', image: 'Hazards/fisherman-chris.png', hp: 56,
    minTier: 1, drawRate: 2, items: ['ee_chris_cast_line', 'ee_chris_reel_in']
  },
  {
    id: 'ee_chelsy', name: 'Chelsy', icon: '🗂️', image: 'Hazards/chelsy.png', hp: 50, minTier: 1, drawRate: 2,
    items: ['ee_chelsy_stapler_jam', 'ee_chelsy_filing_frenzy']
  },
  {
    id: 'ee_drew', name: 'Drew', icon: '📎', image: 'Hazards/drew.png', hp: 60, minTier: 1, drawRate: 2,
    items: ['ee_drew_reply_all', 'ee_drew_one_more_thing']
  },
  {
    id: 'ee_jen', name: 'Jen', icon: '📌', image: 'Hazards/jen.png', hp: 52, minTier: 1, drawRate: 2,
    items: ['ee_jen_sticky_note', 'ee_jen_calendar_invite']
  },
  {
    id: 'ee_haley', name: 'Haley', icon: '💐', image: 'Hazards/haley.png', hp: 50, minTier: 1, drawRate: 2,
    items: ['ee_haley_honeydo', 'ee_haley_surprise_coffee']
  },
  {
    id: 'ee_nala', name: 'Nala', icon: '🐕', image: 'Hazards/nala.png', hp: 46, minTier: 1, drawRate: 2,
    items: ['ee_nala_zoomies', 'ee_nala_tail_wag']
  },
  {
    id: 'ee_eevee', name: 'Eevee', icon: '🐾', image: 'Hazards/eevee.png', hp: 40, minTier: 1, drawRate: 2,
    items: ['ee_eevee_puppy_chaos', 'ee_eevee_nap_attack']
  },
  {
    id: 'ee_anthony', name: 'Anthony', icon: '🛠️', image: 'Hazards/anthony.png', hp: 58, minTier: 1, drawRate: 2,
    items: ['ee_anthony_torque_check', 'ee_anthony_diagnostic_deep_dive']
  },
];
// Easter eggs are NOT pushed into the regular pools - that would put all 10 of them in the same
// shuffle bag as the handful of normal regulars per world, so they'd show up on a huge share of
// fights. Instead generateMap() below rolls a small independent chance per fight to swap in an
// egg from its own queue, so they stay a rare, special sighting instead of a regular encounter.
const EASTER_EGG_SPAWN_CHANCE = 0.05;
// NayNay and Logi Bear live in World 5, but each can also show up once in World 1 as a gentler Easter egg.
const WORLD_1_BONUS_EGGS = [
  {
    id: 'ee_naynay',
    name: 'NayNay',
    icon: '🐾',
    image: 'Hazards/naynay.png',
    hp: 46,
    minTier: 1,
    drawRate: 2,
    items: ['ee_naynay_mind_games'],
  },
  {
    id: 'ee_logi_bear',
    name: 'Logi Bear',
    icon: '🐻',
    image: 'Hazards/logi-bear.png',
    hp: 52,
    minTier: 1,
    drawRate: 2,
    items: ['ee_logi_bear_roundhouse'],
  },
];
const OPPONENT_SWING_CAP = [22, 28, 34, 40, 46, 52, 60];
function revealFraction(row) {
  return [1.0, 0.8, 0.6, 0.4, 0.25, 0.1, 0][Math.min(row, 6)];
}
