// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Difficulty System                                                             ██
// ██  The threat table and the code that tunes opponents from it.                   ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// ===================== DIFF_TABLE comes from the threat engine (the Balance-Calculator model, extended). For
// every opponent and world it holds: s = damage scale, d = cards drawn per turn, dh = drawOnHit, h = hp scale, c =
// decision points, b = raw threat before tuning (% of your health), a = raw threat after full correction, p =
// strategic pressure, r = style tags, k = kind, n = number of items, z = zone before tuning, za = zone after, kp =
// keeper (a deliberately weird opponent the engine leaves alone), lo/hi/bc = the threat band for that opponent, cm
// = curse boost. DIFF_PATCH holds the extra opponent items that give elites 2-3 items and bosses 3-4.

// prettier-ignore
const DIFF_TABLE = {
  "w1_beach_umbrella":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":3.3, "a":3.3, "p":3.3, "pa":3.3, "r":["Snowball"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_seagull":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":11.4, "a":11.4, "p":11.4, "pa":11.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_beach_ball":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":11.7, "a":11.7, "p":11.7, "pa":11.7, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_sunburnt_tourist":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":3.4, "a":3.4, "p":3.4, "pa":3.4, "r":["Snowball"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_hermit_crab":{
    "1":{
      "s":0.9, "d":2, "dh":0, "h":1, "c":0.6, "b":17, "a":15.1, "p":19.4, "pa":17.5, "r":["Fortress"], "k":"regular",
      "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":"damage"
    }
  },
  "w1_rip_current":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":14.2, "a":14.2, "p":14.2, "pa":14.2, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_metal_detectorist":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":15.8, "a":15.8, "p":15.8, "pa":15.8, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_boardwalk_plank":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.6, "b":12.5, "a":12.5, "p":14.9, "pa":14.9, "r":["Fortress"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_beach_cats":{
    "1":{
      "s":0.521, "d":2, "dh":1, "h":1, "c":0, "b":8.8, "a":12.1, "p":8.8, "pa":12.1, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"draw on hit"
    }
  },
  "w1_rental_jet_ski_menace":{
    "1":{
      "s":0.619, "d":2, "dh":0, "h":1, "c":0, "b":24.4, "a":14.8, "p":24.4, "pa":14.8, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"review", "za":"spicy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":"damage"
    }
  },
  "w1_jellyfish":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":8.2, "a":8.2, "p":8.2, "pa":8.2, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_unpermitted_sandcastle":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":9.4, "a":9.4, "p":11.2, "pa":11.2, "r":["Snowball","Combo"],
      "k":"regular", "n":2, "ip":47.7, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":""
    }
  },
  "w1_runaway_kite":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":8.7, "a":8.7, "p":8.7, "pa":8.7, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_lobster_trap":{
    "1":{
      "s":0.75, "d":2, "dh":0, "h":1, "c":0.6, "b":19.1, "a":15.3, "p":21.4, "pa":17.7,
      "r":["Fortress","Combo","Bruiser"], "k":"regular", "n":2, "ip":71.5, "z":"watch", "za":"spicy", "kp":0,
      "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":"damage"
    }
  },
  "w1_falling_coconut":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":12.4, "a":12.4, "p":12.4, "pa":12.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_reckless_surfboard":{
    "1":{
      "s":0.758, "d":2, "dh":0, "h":1, "c":0, "b":20.2, "a":15.5, "p":20.2, "pa":15.5, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":77.8, "z":"watch", "za":"spicy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":"damage"
    }
  },
  "w1_snagged_anchor":{
    "1":{
      "s":0.75, "d":2, "dh":0, "h":1, "c":0.6, "b":19, "a":15.4, "p":21.4, "pa":17.8,
      "r":["Fortress","Combo","Bruiser"], "k":"regular", "n":2, "ip":41.2, "z":"watch", "za":"spicy", "kp":0,
      "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":"damage"
    }
  },
  "w1_sea_turtle":{
    "1":{
      "s":0.692, "d":2, "dh":1, "h":1, "c":0.6, "b":7.1, "a":11.6, "p":9.5, "pa":14, "r":["Fortress","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"draw on hit"
    }
  },
  "w1_sargassum_sea_creature":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":6, "a":6, "p":6, "pa":6, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_spring_breaker":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":8.2, "a":8.2, "p":8.2, "pa":8.2, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    }
  },
  "w1_lifeguard_tower":{
    "1":{
      "s":1, "d":3, "dh":0, "h":1, "c":2.4, "b":51.1, "a":51.1, "p":60.5, "pa":60.5,
      "r":["Saboteur","Fortress","Snowball"], "k":"elite", "n":2, "ip":100, "z":"healthy", "za":"healthy", "kp":0,
      "lo":34.4, "hi":63.8, "bc":49.1, "cm":1.25, "tn":""
    }
  },
  "w1_frigatebird":{
    "1":{
      "s":1, "d":3, "dh":0, "h":1, "c":0, "b":28.1, "a":28.1, "p":28.1, "pa":28.1, "r":["Bruiser"], "k":"elite",
      "n":2, "ip":26.2, "z":"healthy", "za":"healthy", "kp":0, "lo":21.8, "hi":40.4, "bc":31.1, "cm":1.25, "tn":""
    }
  },
  "w1_jellyfish_swarm":{
    "1":{
      "s":1, "d":3, "dh":0, "h":1, "c":1.7, "b":41.9, "a":41.9, "p":48.6, "pa":48.6, "r":["Saboteur"], "k":"elite",
      "n":3, "ip":63.2, "z":"healthy", "za":"healthy", "kp":0, "lo":29.3, "hi":54.4, "bc":41.9, "cm":1.25, "tn":""
    }
  },
  "w1_beach_cat_colony":{
    "1":{
      "s":1, "d":3, "dh":0, "h":1, "c":0, "b":14.4, "a":14.4, "p":14.4, "pa":14.4, "r":["Combo","Bruiser"],
      "k":"elite", "n":2, "ip":21, "z":"healthy", "za":"healthy", "kp":0, "lo":10.1, "hi":18.7, "bc":14.4, "cm":1.25,
      "tn":""
    }
  },
  "rogue_wave":{
    "1":{
      "s":1, "d":5, "dh":0, "h":1, "c":2.1, "b":112.9, "a":112.9, "p":121.3, "pa":121.3,
      "r":["Saboteur","Fortress","Predator"], "k":"boss", "n":3, "ip":61.1, "z":"healthy", "za":"healthy", "kp":0,
      "lo":79, "hi":146.8, "bc":112.9, "cm":1.5, "tn":""
    }
  },
  "w2_snapping_gator":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":5.3, "a":5.3, "p":5.3, "pa":5.3, "r":["Snowball"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_mosquito_cloud":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":6.7, "a":6.7, "p":8.3, "pa":8.3, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_sunken_airboat":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":21.2, "a":21.2, "p":21.2, "pa":21.2, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_cottonmouth":{
    "2":{
      "s":0.875, "d":2, "dh":0, "h":1, "c":2.9, "b":27, "a":21.7, "p":36.9, "pa":31.6, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":"damage"
    }
  },
  "w2_sinkhole":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":5.8, "a":5.8, "p":7.5, "pa":7.5, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_swamp_gas":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":13.1, "a":13.1, "p":14.7, "pa":14.7, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":""
    }
  },
  "w2_feral_hogs":{
    "2":{
      "s":0.729, "d":2, "dh":0, "h":1, "c":0, "b":26.5, "a":18.9, "p":26.5, "pa":18.9, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"watch", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":"damage"
    }
  },
  "w2_burmese_python":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":5, "a":5, "p":6.6, "pa":6.6, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_thirsty_leeches":{
    "2":{
      "s":0.804, "d":2, "dh":0, "h":1, "c":3, "b":26.2, "a":20.5, "p":36.6, "pa":30.8, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":"damage"
    }
  },
  "w2_fire_ant":{
    "2":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":1.7, "b":49.9, "a":25.7, "p":55.6, "pa":31.4, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"review", "za":"watch", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"damage"
    }
  },
  "w2_cane_toad":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.9, "b":16.1, "a":16.1, "p":19.1, "pa":19.1, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":54, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":""
    }
  },
  "w2_flooded_pothole":{
    "2":{
      "s":0.561, "d":2, "dh":1, "h":1, "c":0.5, "b":11.7, "a":16.5, "p":13.3, "pa":18.1, "r":["Snowball","Combo"],
      "k":"regular", "n":2, "ip":47.6, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"draw on hit"
    }
  },
  "w2_banana_spider":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.8, "b":21, "a":21, "p":30.7, "pa":30.6, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_cold_stunned_iguana":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":4.3, "a":4.3, "p":4.3, "pa":4.3, "r":["Snowball"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_snowbird_in_the_left_lane":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":15.9, "a":15.9, "p":15.9, "pa":15.9, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_love_bug":{
    "2":{
      "s":0.737, "d":2, "dh":0, "h":1, "c":2.4, "b":29.9, "a":17.8, "p":38, "pa":25.9, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"review", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":"damage"
    }
  },
  "w2_rest_stop_raccoon":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":7.8, "a":7.8, "p":7.8, "pa":7.8, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_sawgrass":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":13.7, "a":13.7, "p":15.5, "pa":15.5, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":78.7, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":""
    }
  },
  "w2_wobbly_rental_kayak":{
    "2":{
      "s":0.646, "d":2, "dh":0, "h":1, "c":0, "b":31.2, "a":20.5, "p":31.2, "pa":20.5, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":51.4, "z":"review", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":"damage"
    }
  },
  "w2_midday_heat":{
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.6, "b":17.7, "a":17.7, "p":26.4, "pa":26.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    }
  },
  "w2_bull_gator":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":0, "b":56.8, "a":56.8, "p":56.8, "pa":56.8, "r":["Bruiser"], "k":"elite",
      "n":2, "ip":39.9, "z":"healthy", "za":"healthy", "kp":0, "lo":33.8, "hi":62.7, "bc":48.3, "cm":1.25, "tn":""
    }
  },
  "w2_water_moccasin":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":2.8, "b":84.9, "a":84.9, "p":94.3, "pa":94.3, "r":["Bruiser"], "k":"elite",
      "n":2, "ip":67.3, "z":"healthy", "za":"healthy", "kp":0, "lo":60, "hi":111.3, "bc":85.6, "cm":1.25, "tn":""
    }
  },
  "w2_mosquito_cloud_elite":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":6.8, "b":31.5, "a":31.5, "p":54.8, "pa":54.8, "r":["Saboteur","Combo"],
      "k":"elite", "n":3, "ip":32.9, "z":"healthy", "za":"healthy", "kp":0, "lo":22.1, "hi":41, "bc":31.5, "cm":1.25,
      "tn":""
    }
  },
  "w2_brush_fire_smoke":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":4.6, "b":121.5, "a":121.5, "p":137, "pa":137, "r":["Grinder","Combo"],
      "k":"elite", "n":2, "ip":26.4, "z":"healthy", "za":"healthy", "kp":0, "lo":81.6, "hi":151.6, "bc":116.6,
      "cm":1.25, "tn":""
    }
  },
  "w2_wild_hog_herd":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":0.7, "b":38.3, "a":38.3, "p":40.8, "pa":40.8, "r":["Bruiser"], "k":"elite",
      "n":2, "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":26.8, "hi":49.8, "bc":38.3, "cm":1.25, "tn":""
    }
  },
  "w2_fire_ant_mound":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":5.4, "b":118.8, "a":118.8, "p":137.1, "pa":137.1, "r":["Grinder"], "k":"elite",
      "n":2, "ip":66.3, "z":"healthy", "za":"healthy", "kp":0, "lo":83.2, "hi":154.5, "bc":118.9, "cm":1.25, "tn":""
    }
  },
  "w2_love_bug_swarm":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":5, "b":62.8, "a":62.8, "p":79.8, "pa":79.8, "r":["Bruiser"], "k":"elite",
      "n":2, "ip":0.1, "z":"healthy", "za":"healthy", "kp":0, "lo":43.9, "hi":81.6, "bc":62.8, "cm":1.25, "tn":""
    }
  },
  "w2_raccoon_gang":{
    "2":{
      "s":1, "d":3, "dh":0, "h":1, "c":0, "b":17.9, "a":17.9, "p":17.9, "pa":17.9, "r":["Bruiser"], "k":"elite",
      "n":2, "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":12.5, "hi":23.3, "bc":17.9, "cm":1.25, "tn":""
    }
  },
  "nuisance_gator":{
    "2":{
      "s":1, "d":5, "dh":0, "h":1, "c":2.8, "b":166.1, "a":166.1, "p":175.7, "pa":175.7, "r":["Saboteur","Predator"],
      "k":"boss", "n":4, "ip":0.8, "z":"healthy", "za":"healthy", "kp":0, "lo":115.3, "hi":214.2, "bc":164.7,
      "cm":1.5, "tn":""
    }
  },
  "w3_gridlock_commuter":{
    "3":{
      "s":0.909, "d":3, "dh":0, "h":1, "c":0.4, "b":4.9, "a":6.4, "p":6.2, "pa":7.6, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":"draw"
    }
  },
  "w3_screaming_dispatcher":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":20.3, "a":20.3, "p":20.3, "pa":20.3, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_rogue_delivery_drone":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":20.5, "a":20.5, "p":20.5, "pa":20.5, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_broken_ticket_dispenser":{
    "3":{
      "s":0.833, "d":2, "dh":0, "h":1, "c":1.8, "b":31.1, "a":25.9, "p":36.3, "pa":31.1, "r":["Grinder"],
      "k":"regular", "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"damage"
    }
  },
  "w3_injury_lawyer_billboard":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":22, "a":22, "p":22, "pa":22, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_hungry_parking_meter":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.6, "b":11.8, "a":11.8, "p":13.5, "pa":13.5, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":""
    }
  },
  "w3_orange_barrel_maze":{
    "3":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":2.3, "b":64.2, "a":38.9, "p":71, "pa":45.8, "r":["Grinder"], "k":"regular",
      "n":2, "ip":71.5, "z":"review", "za":"review", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":"damage"
    }
  },
  "w3_expired_fire_extinguisher":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":15.2, "a":15.2, "p":16.6, "pa":16.6, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":77.2, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":""
    }
  },
  "w3_flickering_streetlamp":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":16.4, "a":16.4, "p":16.4, "pa":16.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_dumpster_fire":{
    "3":{
      "s":0.5, "d":2, "dh":1, "h":1, "c":1.5, "b":28.2, "a":36.2, "p":32.7, "pa":44.1,
      "r":["Grinder","Snowball","Combo"], "k":"regular", "n":2, "ip":47.1, "z":"spicy", "za":"review", "kp":0,
      "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":"draw on hit"
    }
  },
  "w3_city_bus_running_late":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":11.9, "a":11.9, "p":11.9, "pa":11.9, "r":["Fortress","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":""
    }
  },
  "w3_transformer_on_a_pole":{
    "3":{
      "s":0.707, "d":2, "dh":0, "h":1, "c":3.1, "b":38.8, "a":25.3, "p":47.8, "pa":34.3, "r":["Grinder"],
      "k":"regular", "n":1, "ip":100, "z":"review", "za":"spicy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"damage"
    }
  },
  "w3_parking_pay_station":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":8.1, "a":8.1, "p":8.1, "pa":8.1, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_oblivious_commuter":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.6, "b":11.8, "a":11.8, "p":13.5, "pa":13.5, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":""
    }
  },
  "w3_flipped_dumpster":{
    "3":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":2.1, "b":59.1, "a":37.5, "p":65.3, "pa":43.7, "r":["Grinder"], "k":"regular",
      "n":2, "ip":74.2, "z":"review", "za":"review", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":"damage"
    }
  },
  "w3_overzealous_valet":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":6.8, "a":6.8, "p":9, "pa":8.9, "r":["Snowball"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_sign_spinner":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":20.1, "a":20.1, "p":21.6, "pa":21.6, "r":["Snowball","Combo"],
      "k":"regular", "n":2, "ip":54.9, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":""
    }
  },
  "w3_steaming_manhole":{
    "3":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":2.8, "b":58.9, "a":35.7, "p":67.2, "pa":43.9, "r":["Grinder"], "k":"regular",
      "n":1, "ip":100, "z":"review", "za":"watch", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":"damage"
    }
  },
  "w3_free_downtown_wi_fi":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.9, "b":8.4, "a":8.4, "p":11.2, "pa":11.2, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    }
  },
  "w3_rideshare_driver":{
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":23.4, "a":23.4, "p":26.4, "pa":26.4, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":56.5, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":""
    }
  },
  "w3_code_enforcer":{
    "3":{
      "s":1, "d":3, "dh":0, "h":1, "c":4.8, "b":107.8, "a":107.8, "p":121.9, "pa":121.9, "r":["Grinder"], "k":"elite",
      "n":2, "ip":61.5, "z":"healthy", "za":"healthy", "kp":0, "lo":68.4, "hi":127.1, "bc":97.7, "cm":1.25, "tn":""
    }
  },
  "w3_gridlocked_intersection":{
    "3":{
      "s":1, "d":3, "dh":0, "h":1, "c":6.9, "b":172.6, "a":172.6, "p":192.8, "pa":192.8, "r":["Grinder","Saboteur"],
      "k":"elite", "n":3, "ip":82.5, "z":"healthy", "za":"healthy", "kp":0, "lo":126.6, "hi":235, "bc":180.8,
      "cm":1.25, "tn":""
    }
  },
  "parking_enforcer":{
    "3":{
      "s":1, "d":5, "dh":0, "h":1, "c":1.1, "b":99, "a":99, "p":102.4, "pa":102.4, "r":["Saboteur","Predator"],
      "k":"boss", "n":4, "ip":2.7, "z":"healthy", "za":"healthy", "kp":0, "lo":67.2, "hi":124.9, "bc":96.1, "cm":1.5,
      "tn":""
    }
  },
  "w4_barnacle_buoy":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":7.4, "a":7.4, "p":8.6, "pa":8.7, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_mooring_cleat":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":26.5, "a":26.5, "p":26.5, "pa":26.5, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_fuel_dock_siphoner":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":16, "a":16, "p":17.8, "pa":17.8, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":""
    }
  },
  "w4_new_river_water_taxi":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":30.9, "a":30.9, "p":30.9, "pa":30.9, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_bait_barge":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.9, "b":21.4, "a":21.4, "p":23.9, "pa":23.8, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":""
    }
  },
  "w4_dock_crab":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":6.8, "a":6.8, "p":8, "pa":8, "r":["Snowball"], "k":"regular", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_overloaded_forklift":{
    "4":{
      "s":0.714, "d":2, "dh":0, "h":1, "c":0, "b":42.1, "a":29.6, "p":42.1, "pa":29.6, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":50.4, "z":"review", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":"damage"
    }
  },
  "w4_live_bait_bucket":{
    "4":{
      "s":0.926, "d":2, "dh":0, "h":1, "c":2.8, "b":33.3, "a":32.2, "p":40.6, "pa":39.6, "r":["Bruiser"],
      "k":"regular", "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"damage"
    }
  },
  "w4_oblivious_vlogger":{
    "4":{
      "s":1, "d":3, "dh":0, "h":1, "c":0.4, "b":5.4, "a":7.9, "p":6.4, "pa":9, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":"draw"
    }
  },
  "w4_dockside_ice_machine":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":20.7, "a":20.7, "p":20.7, "pa":20.7, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_river_otter":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.7, "b":31.8, "a":31.8, "p":38.8, "pa":38.8, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_debris_pile":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.4, "b":13.3, "a":13.3, "p":14.5, "pa":14.5, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_mega_yacht_wake":{
    "4":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":0, "b":55.2, "a":33.3, "p":55.2, "pa":33.3, "r":["Fortress","Bruiser"],
      "k":"regular", "n":2, "ip":47.8, "z":"review", "za":"watch", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"damage"
    }
  },
  "w4_patrol_helicopter":{
    "4":{
      "s":0.5, "d":2, "dh":1, "h":1, "c":1.6, "b":33.9, "a":42.2, "p":38, "pa":49.5,
      "r":["Grinder","Snowball","Combo"], "k":"regular", "n":2, "ip":46.2, "z":"watch", "za":"review", "kp":0,
      "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":"draw on hit"
    }
  },
  "w4_pufferfish":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.6, "b":30.6, "a":30.6, "p":37.4, "pa":37.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_selfie_stick_tourist":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":9.3, "a":9.3, "p":11.1, "pa":11.1, "r":["Snowball"], "k":"regular",
      "n":2, "ip":84.7, "z":"light", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_fortune_teller":{
    "4":{
      "s":1.8, "d":4, "dh":0, "h":1, "c":0.7, "b":2, "a":6.7, "p":3.9, "pa":9.1, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":"draw"
    }
  },
  "w4_boardwalk_tourist":{
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.4, "b":15, "a":15, "p":16.1, "pa":16.1, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    }
  },
  "w4_sinking_charter_yacht":{
    "4":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":2.5, "b":65, "a":37.2, "p":71.4, "pa":43.6, "r":["Grinder"], "k":"regular",
      "n":1, "ip":100, "z":"review", "za":"watch", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":"damage"
    }
  },
  "w4_screaming_dockmaster":{
    "4":{
      "s":0.85, "d":2, "dh":0, "h":1, "c":1, "b":35.7, "a":29.7, "p":38.3, "pa":32.2, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":43.1, "z":"watch", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"damage"
    }
  },
  "w4_marine_patrol_boat":{
    "4":{
      "s":1, "d":3, "dh":0, "h":1, "c":10.1, "b":92.4, "a":92.4, "p":118.6, "pa":118.6, "r":["Saboteur"], "k":"elite",
      "n":2, "ip":49.9, "z":"healthy", "za":"healthy", "kp":0, "lo":52.4, "hi":97.2, "bc":74.8, "cm":1.25, "tn":""
    }
  },
  "w4_stormwater_pump":{
    "4":{
      "s":1, "d":3, "dh":0, "h":1, "c":5.5, "b":208.9, "a":208.9, "p":223.3, "pa":223.3, "r":["Grinder","Saboteur"],
      "k":"elite", "n":3, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":144.1, "hi":267.7, "bc":205.9,
      "cm":1.25, "tn":""
    }
  },
  "w4_dock_crab_swarm":{
    "4":{
      "s":1, "d":3, "dh":0, "h":1, "c":0.7, "b":34.1, "a":34.1, "p":35.9, "pa":35.9, "r":["Combo","Bruiser"],
      "k":"elite", "n":2, "ip":53.9, "z":"healthy", "za":"healthy", "kp":0, "lo":23.9, "hi":44.4, "bc":34.1,
      "cm":1.25, "tn":""
    }
  },
  "drawbridge":{
    "4":{
      "s":0.88, "d":5, "dh":0, "h":1, "c":16, "b":297.1, "a":262.1, "p":338.7, "pa":303.6,
      "r":["Predator","Combo","Bruiser"], "k":"boss", "n":4, "ip":5.1, "z":"watch", "za":"spicy", "kp":0, "lo":134.3,
      "hi":249.4, "bc":191.8, "cm":1.5, "tn":"damage"
    }
  },
  "w5_icy_pallet_jack":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":27.7, "a":27.7, "p":30.1, "pa":30, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":49.2, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_melting_pallet":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.9, "b":8.7, "a":8.7, "p":10.9, "pa":10.9, "r":["Saboteur","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_stuck_cooler_door":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.5, "b":33, "a":33, "p":38.8, "pa":38.8,
      "r":["Saboteur","Fortress","Snowball"], "k":"regular", "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":1,
      "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_chain_hoist":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":37.1, "a":37.1, "p":37.1, "pa":37.1, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_delayed_delivery_driver":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":28.6, "a":28.6, "p":28.6, "pa":28.6, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_illegally_parked_semi":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.4, "b":17.6, "a":17.6, "p":18.6, "pa":18.6, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_shrinkwrap_boulder":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.2, "b":24.8, "a":24.8, "p":27.6, "pa":27.6, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":63.8, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_reckless_scanner_gun":{
    "5":{
      "s":0.91, "d":3, "dh":0, "h":1, "c":1.3, "b":6.5, "a":8.7, "p":9.6, "pa":12.7, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":"draw"
    }
  },
  "w5_inventory_clerk":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.9, "b":24.5, "a":24.5, "p":26.6, "pa":26.6, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":54.6, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_pallet_wrapper":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":15.7, "a":15.7, "p":19.4, "pa":19.4, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_ammonia_leak":{
    "5":{
      "s":0.6, "d":2, "dh":0, "h":1, "c":2.5, "b":76.2, "a":35.3, "p":81.9, "pa":41, "r":["Grinder"], "k":"regular",
      "n":2, "ip":79.5, "z":"review", "za":"spicy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":"damage"
    }
  },
  "w5_naynay":{
    "5":{
      "s":0.853, "d":3, "dh":0, "h":1, "c":0.5, "b":3.2, "a":8.8, "p":4.4, "pa":10.4, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"draw"
    }
  },
  "w5_overheated_compressor":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.9, "b":36.6, "a":36.6, "p":38.8, "pa":38.8, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":52.4, "z":"spicy", "za":"spicy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_blown_a_c_compressor":{
    "5":{
      "s":1.644, "d":4, "dh":0, "h":1, "c":0.5, "b":2.4, "a":8.6, "p":3.6, "pa":10, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"draw"
    }
  },
  "w5_unmarked_wet_floor":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.5, "b":8, "a":8, "p":11.4, "pa":11.4, "r":["Saboteur","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_stuck_bay_door":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.3, "b":40.7, "a":40.7, "p":46, "pa":45.9,
      "r":["Saboteur","Fortress","Snowball"], "k":"regular", "n":1, "ip":100, "z":"watch", "za":"watch", "kp":1,
      "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_logi_bear":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":23.7, "a":23.7, "p":25.3, "pa":25.4, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":53.1, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_walk_in_freezer":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.4, "b":16.6, "a":16.6, "p":19.9, "pa":19.8, "r":["Saboteur","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_malfunctioning_ice_machine":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.4, "b":10.8, "a":10.8, "p":14.1, "pa":14.1, "r":["Saboteur","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":""
    }
  },
  "w5_slippery_dock_plate":{
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":20.2, "a":20.2, "p":20.2, "pa":20.2, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    }
  },
  "w5_cryo_compressor":{
    "5":{
      "s":1, "d":3, "dh":0, "h":1, "c":5.5, "b":125.2, "a":125.2, "p":137.9, "pa":137.9, "r":["Combo"], "k":"elite",
      "n":3, "ip":17.8, "z":"healthy", "za":"healthy", "kp":0, "lo":74.3, "hi":138.1, "bc":106.2, "cm":1.25, "tn":""
    }
  },
  "w5_overworked_logistics_worker":{
    "5":{
      "s":1, "d":3, "dh":0, "h":1, "c":8.1, "b":192.9, "a":192.9, "p":211.8, "pa":211.8, "r":["Grinder","Saboteur"],
      "k":"elite", "n":3, "ip":64.8, "z":"healthy", "za":"healthy", "kp":0, "lo":132.7, "hi":246.4, "bc":189.6,
      "cm":1.25, "tn":""
    }
  },
  "walk_in_walker":{
    "5":{
      "s":1, "d":5, "dh":0, "h":1, "c":27.9, "b":373.3, "a":373.3, "p":438.1, "pa":438.1, "r":["Saboteur","Predator"],
      "k":"boss", "n":4, "ip":18.1, "z":"spicy", "za":"spicy", "kp":0, "lo":181.2, "hi":336.5, "bc":258.8, "cm":1.5,
      "tn":""
    }
  },
  "w6_runaway_valet_cart":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":29.5, "a":29.5, "p":29.5, "pa":29.5, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_runaway_bicycle":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":31.7, "a":31.7, "p":31.7, "pa":31.7, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_toppled_streetlight":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.3, "b":26.2, "a":26.2, "p":26.9, "pa":26.9,
      "r":["Gambler","Combo","Bruiser"], "k":"regular", "n":2, "ip":60.5, "z":"healthy", "za":"healthy", "kp":0,
      "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_delivery_vespa":{
    "6":{
      "s":1.053, "d":4, "dh":0, "h":1, "c":0.8, "b":4.9, "a":9.8, "p":6.5, "pa":12, "r":["Gambler"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":"draw"
    }
  },
  "w6_aggressive_shopper":{
    "6":{
      "s":0.745, "d":3, "dh":0, "h":1, "c":0.8, "b":6.8, "a":9.8, "p":8.4, "pa":12, "r":["Gambler","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"draw"
    }
  },
  "w6_broken_ev_charger":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.2, "b":26.9, "a":26.9, "p":27.3, "pa":27.3,
      "r":["Gambler","Combo","Bruiser"], "k":"regular", "n":2, "ip":41.5, "z":"healthy", "za":"healthy", "kp":0,
      "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_king_tide_flood":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":41.3, "a":41.3, "p":41.3, "pa":41.3, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_falling_palm_frond":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":22.8, "a":22.8, "p":22.8, "pa":22.8, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_downed_power_line":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.6, "b":29.4, "a":29.4, "p":30.6, "pa":30.6,
      "r":["Gambler","Combo","Bruiser"], "k":"regular", "n":2, "ip":75.7, "z":"healthy", "za":"healthy", "kp":0,
      "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_dark_traffic_signal":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.3, "b":17.1, "a":17.1, "p":19.8, "pa":19.8, "r":["Gambler"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_power_tripping_bouncer":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":23.2, "a":23.2, "p":24.3, "pa":24.3, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":63.1, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":""
    }
  },
  "w6_pickpocket":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":8.5, "a":8.5, "p":10.6, "pa":10.6, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_timeshare_salesman":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":18.9, "a":18.9, "p":20.3, "pa":20.3, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":90.3, "z":"light", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_sketchy_valet_driver":{
    "6":{
      "s":1.417, "d":2, "dh":0, "h":1, "c":1.2, "b":7.2, "a":9.8, "p":9.7, "pa":12.3, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":"damage"
    }
  },
  "w6_storefront_awning":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":34.8, "a":34.8, "p":38.3, "pa":38.3, "r":["Gambler"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_valet_golf_cart":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.1, "b":17.6, "a":17.6, "p":22, "pa":22, "r":["Gambler"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_storm_drain":{
    "6":{
      "s":0.656, "d":2, "dh":0, "h":1, "c":5.5, "b":58.7, "a":37.9, "p":70.3, "pa":49.6, "r":["Bruiser"],
      "k":"regular", "n":2, "ip":62.2, "z":"review", "za":"spicy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"damage"
    }
  },
  "w6_broken_parking_meter":{
    "6":{
      "s":1.8, "d":2, "dh":0, "h":1, "c":0.7, "b":1.9, "a":3.5, "p":3.4, "pa":4.9, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"quiet", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":"damage"
    }
  },
  "w6_loud_street_performer":{
    "6":{
      "s":1.181, "d":3, "dh":0, "h":1, "c":0.8, "b":5.4, "a":9.7, "p":7, "pa":11.7, "r":["Gambler","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"draw"
    }
  },
  "w6_sidewalk_influencer":{
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":23.7, "a":23.7, "p":23.7, "pa":23.7, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    }
  },
  "w6_live_shot_news_van":{
    "6":{
      "s":1, "d":3, "dh":0, "h":1, "c":0.8, "b":110.7, "a":110.7, "p":112.3, "pa":112.3, "r":["Predator","Gambler"],
      "k":"elite", "n":2, "ip":40.2, "z":"healthy", "za":"healthy", "kp":0, "lo":61.9, "hi":114.9, "bc":88.4,
      "cm":1.25, "tn":""
    }
  },
  "w6_smash_and_grab_crew":{
    "6":{
      "s":1, "d":3, "dh":0, "h":1, "c":10.2, "b":84.3, "a":84.3, "p":105.8, "pa":105.8, "r":["Combo"], "k":"elite",
      "n":3, "ip":34.9, "z":"spicy", "za":"spicy", "kp":0, "lo":45.2, "hi":84, "bc":64.6, "cm":1.25, "tn":""
    }
  },
  "four_pm_thunderstorm":{
    "6":{
      "s":1, "d":5, "dh":0, "h":1, "c":9.4, "b":182.1, "a":182.1, "p":202, "pa":202,
      "r":["Saboteur","Predator","Gambler"], "k":"boss", "n":4, "ip":0.9, "z":"healthy", "za":"healthy", "kp":0,
      "lo":105.2, "hi":195.3, "bc":150.2, "cm":1.5, "tn":""
    }
  },
  "w7_wobbly_container_straddle":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":17.3, "a":17.3, "p":17.3, "pa":17.3, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_runaway_yard_mule":{
    "7":{
      "s":0.641, "d":2, "dh":0, "h":1, "c":0, "b":65.7, "a":41.8, "p":65.7, "pa":41.8, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":50.3, "z":"review", "za":"spicy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":"damage"
    }
  },
  "w7_customs_k_9_beagle":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":16.4, "a":16.4, "p":19.4, "pa":19.4, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_fuel_tanker":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.8, "b":22.6, "a":22.6, "p":24.1, "pa":24.1, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_spewing_tugboat":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.6, "b":24, "a":24, "p":25.1, "pa":25.1, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_cruise_ship_wake":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":10.8, "a":10.8, "p":11.8, "pa":11.8, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_customs_inspector":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.8, "b":29.8, "a":29.8, "p":31.4, "pa":31.4, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":58.5, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_runaway_forklift":{
    "7":{
      "s":0.719, "d":2, "dh":0, "h":1, "c":0, "b":59.4, "a":42.9, "p":59.4, "pa":42.9, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"review", "za":"spicy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":"damage"
    }
  },
  "w7_harbor_tug":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.7, "b":18.5, "a":18.5, "p":21.9, "pa":21.9, "r":["Saboteur","Snowball"],
      "k":"regular", "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_crew_van":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":43.4, "a":43.4, "p":43.4, "pa":43.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_late_cruise_passenger":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":14.2, "a":14.2, "p":15.1, "pa":15.1, "r":["Gambler","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_towed_sailboat":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":36.3, "a":36.3, "p":39.4, "pa":39.4, "r":["Gambler"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_pelican_eyeing_your_lunch":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":33.1, "a":33.1, "p":33.1, "pa":33.1, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":75.8, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_frozen_fish_hold":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":22, "a":22, "p":25, "pa":25, "r":["Saboteur","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_barnacle_crusted_hull":{
    "7":{
      "s":0.783, "d":2, "dh":0, "h":1, "c":0, "b":54.7, "a":43.1, "p":54.7, "pa":43.1, "r":["Fortress"],
      "k":"regular", "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":"damage"
    }
  },
  "w7_overworked_stevedore":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":15.6, "a":15.6, "p":18.7, "pa":18.8, "r":["Saboteur","Snowball"],
      "k":"regular", "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_overloaded_scrap_truck":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":52, "a":52, "p":52, "pa":52, "r":["Bruiser"], "k":"regular", "n":1,
      "ip":100, "z":"watch", "za":"watch", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_harbor_fog":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.4, "b":32.4, "a":32.4, "p":33.2, "pa":33.2, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":33.2, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_bilge_slick":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":22.9, "a":22.9, "p":24.3, "pa":24.3, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    }
  },
  "w7_stubborn_gate_guard":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.3, "b":19.2, "a":19.2, "p":21.7, "pa":21.7, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_port_security_checkpoint":{
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":29.9, "a":29.9, "p":33, "pa":33, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":96.3, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    }
  },
  "w7_drifting_container_ship":{
    "7":{
      "s":1, "d":3, "dh":0, "h":1, "c":3.8, "b":89.9, "a":89.9, "p":97.2, "pa":97.2, "r":["Saboteur"], "k":"elite",
      "n":3, "ip":35.6, "z":"spicy", "za":"spicy", "kp":0, "lo":43.9, "hi":81.6, "bc":62.8, "cm":1.25, "tn":""
    }
  },
  "w7_gantry_crane_in_a_storm":{
    "7":{
      "s":1, "d":3, "dh":0, "h":1, "c":1.8, "b":108.3, "a":108.3, "p":111.8, "pa":111.8, "r":["Gambler"], "k":"elite",
      "n":3, "ip":46.9, "z":"spicy", "za":"spicy", "kp":0, "lo":52.3, "hi":97.1, "bc":74.7, "cm":1.25, "tn":""
    }
  },
  "w7_customs_sweep_team":{
    "7":{
      "s":1, "d":3, "dh":0, "h":1, "c":9.9, "b":100.5, "a":100.5, "p":119.6, "pa":119.6, "r":["Saboteur"],
      "k":"elite", "n":3, "ip":91.6, "z":"spicy", "za":"spicy", "kp":0, "lo":47.6, "hi":88.4, "bc":68, "cm":1.25,
      "tn":""
    }
  },
  "harbormaster":{
    "7":{
      "s":1, "d":5, "dh":0, "h":1, "c":2.2, "b":27.2, "a":27.2, "p":27.2, "pa":27.2, "r":["Gambler"], "k":"boss",
      "n":2, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":19.1, "hi":35.4, "bc":27.2, "cm":1.5,
      "tn":"fixed numbers"
    }
  },
  "w8_angry_parts_clerk":{
    "8":{
      "s":0.636, "d":2, "dh":0, "h":1, "c":0, "b":67.7, "a":46.1, "p":67.7, "pa":46.1, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":49.3, "z":"review", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":"damage"
    }
  },
  "w8_clumsy_inventory_stocker":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":17.2, "a":17.2, "p":17.2, "pa":17.2, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_runaway_pressure_washer_wand":{
    "8":{
      "s":0.887, "d":2, "dh":0, "h":1, "c":0.5, "b":53.6, "a":46.8, "p":54.4, "pa":47.6, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":40.7, "z":"watch", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":"damage"
    }
  },
  "w8_fuel_island_fire":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":45.9, "a":45.9, "p":46.8, "pa":46.8, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":44.8, "z":"spicy", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "w8_unlicensed_detailer":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.5, "b":7.4, "a":7.4, "p":8.2, "pa":8.2, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"quiet", "kp":1, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_auditing_bean_counter":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.5, "b":14.8, "a":14.8, "p":17.5, "pa":17.5, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"light", "za":"light", "kp":1, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_third_shift_mechanic":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.7, "b":39.1, "a":39.1, "p":42, "pa":42, "r":["Gambler"], "k":"regular",
      "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_osha_inspector":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.2, "b":38.9, "a":38.9, "p":41, "pa":41, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":52.4, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "w8_locked_gate_guard":{
    "8":{
      "s":0.833, "d":2, "dh":0, "h":1, "c":0.6, "b":56, "a":46.4, "p":57, "pa":47.5, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":68.6, "z":"watch", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":"damage"
    }
  },
  "w8_procurement":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.9, "b":18.2, "a":18.2, "p":23.2, "pa":23.2, "r":["Saboteur","Snowball"],
      "k":"regular", "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "w8_shop_cat":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":38.8, "a":38.8, "p":40.6, "pa":40.6, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":98.1, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_over_caffeinated_lube_tech":{
    "8":{
      "s":0.827, "d":2, "dh":0, "h":1, "c":0, "b":55.7, "a":46.4, "p":55.7, "pa":46.4, "r":["Bruiser"], "k":"regular",
      "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":"damage"
    }
  },
  "w8_runaway_creeper":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.4, "b":4.6, "a":4.6, "p":5.3, "pa":5.3, "r":["Snowball"], "k":"regular",
      "n":1, "ip":100, "z":"quiet", "za":"quiet", "kp":1, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_mystery_fluid_puddle":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.3, "b":50.1, "a":50.1, "p":52.3, "pa":52.3,
      "r":["Grinder","Snowball","Combo"], "k":"regular", "n":2, "ip":38.4, "z":"spicy", "za":"spicy", "kp":0,
      "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_ignored_check_engine_light":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.7, "b":36, "a":36, "p":37.2, "pa":37.2, "r":["Grinder","Snowball"],
      "k":"regular", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":1, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "w8_unsafe_welder":{
    "8":{
      "s":0.828, "d":2, "dh":0, "h":1, "c":3.2, "b":56.6, "a":46.4, "p":62.3, "pa":52.1, "r":["Grinder","Gambler"],
      "k":"regular", "n":2, "ip":84, "z":"watch", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":"damage"
    }
  },
  "w8_bursting_hydraulic_hose":{
    "8":{
      "s":0.857, "d":2, "dh":0, "h":1, "c":0, "b":54.1, "a":46.2, "p":54.1, "pa":46.2, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":0, "z":"watch", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":"damage"
    }
  },
  "w8_breakroom_fish_heater":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":3.4, "b":41.3, "a":41.3, "p":47.4, "pa":47.4, "r":["Saboteur","Gambler"],
      "k":"regular", "n":2, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "w8_rude_parts_manager":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":4.8, "b":25.3, "a":25.3, "p":33.8, "pa":33.8, "r":["Snowball"], "k":"regular",
      "n":2, "ip":42.4, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_key_losing_service_writer":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1.6, "b":24.1, "a":24.1, "p":26.8, "pa":26.8, "r":["Bruiser"], "k":"regular",
      "n":2, "ip":92.3, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "w8_stressed_dispatcher":{
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0.8, "b":30.7, "a":30.7, "p":32.2, "pa":32.2, "r":["Combo","Bruiser"],
      "k":"regular", "n":2, "ip":55.4, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "w8_angry_citizen_mob":{
    "8":{
      "s":0.765, "d":3, "dh":0, "h":1, "c":2.7, "b":87.1, "a":78.7, "p":92, "pa":83.5, "r":["Bruiser"], "k":"elite",
      "n":3, "ip":24.7, "z":"watch", "za":"spicy", "kp":0, "lo":40.4, "hi":75, "bc":57.7, "cm":1.25, "tn":"damage"
    }
  },
  "w8_lunch_stealing_coworker":{
    "8":{
      "s":0.705, "d":3, "dh":0, "h":1, "c":12, "b":115.4, "a":100.7, "p":136.7, "pa":122, "r":["Saboteur","Snowball"],
      "k":"elite", "n":3, "ip":50.2, "z":"watch", "za":"spicy", "kp":0, "lo":51.7, "hi":96.1, "bc":73.9, "cm":1.25,
      "tn":"damage"
    }
  },
  "w8_repo_tow_truck":{
    "8":{
      "s":0.63, "d":3, "dh":0, "h":1, "c":0.2, "b":118.4, "a":100, "p":118.8, "pa":100.4, "r":["Predator","Gambler"],
      "k":"elite", "n":3, "ip":50.7, "z":"watch", "za":"spicy", "kp":0, "lo":51.1, "hi":94.8, "bc":72.9, "cm":1.25,
      "tn":"damage"
    }
  },
  "evil_mechanic":{
    "8":{
      "s":1, "d":5, "dh":0, "h":1, "c":13.3, "b":160.8, "a":160.8, "p":184.3, "pa":184.3,
      "r":["Predator","Gambler","Bruiser"], "k":"boss", "n":4, "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":90,
      "hi":167.1, "bc":128.5, "cm":1.5, "tn":""
    }
  },
  "ee_procurement":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":4.2, "a":4.2, "p":4.2, "pa":4.2, "r":["Snowball"], "k":"egg", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    },
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":5.6, "a":5.6, "p":5.6, "pa":5.6, "r":["Snowball"], "k":"egg", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    },
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":6.7, "a":6.7, "p":6.7, "pa":6.7, "r":["Snowball"], "k":"egg", "n":1,
      "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":7, "a":7, "p":7, "pa":7, "r":["Snowball"], "k":"egg", "n":1, "ip":100,
      "z":"light", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":6.9, "a":6.9, "p":6.9, "pa":6.9, "r":["Snowball"], "k":"egg", "n":1,
      "ip":100, "z":"quiet", "za":"quiet", "kp":1, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    },
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":7.5, "a":7.5, "p":7.5, "pa":7.5, "r":["Snowball"], "k":"egg", "n":1,
      "ip":100, "z":"quiet", "za":"quiet", "kp":1, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    },
    "7":{
      "s":0.733, "d":3, "dh":0, "h":1, "c":0, "b":6.9, "a":10.9, "p":6.9, "pa":10.9, "r":["Snowball"], "k":"egg",
      "n":1, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":"draw"
    },
    "8":{
      "s":0.791, "d":3, "dh":0, "h":1, "c":0, "b":7, "a":11.9, "p":7, "pa":11.9, "r":["Snowball"], "k":"egg", "n":1,
      "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":"draw"
    }
  },
  "ee_city_auditor":{
    "1":{
      "s":0.788, "d":2, "dh":0, "h":1, "c":0, "b":19.8, "a":17.3, "p":19.8, "pa":17.3, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"watch", "za":"watch", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"damage"
    },
    "2":{
      "s":0.72, "d":2, "dh":0, "h":1, "c":0, "b":27.2, "a":20.9, "p":27.2, "pa":20.9, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"damage"
    },
    "3":{
      "s":0.799, "d":2, "dh":0, "h":1, "c":0, "b":31.1, "a":25.9, "p":31.1, "pa":25.9, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"watch", "za":"spicy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"damage"
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":32.8, "a":32.8, "p":32.8, "pa":32.8, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":33.6, "a":33.6, "p":33.6, "pa":33.6, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"spicy", "za":"spicy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    },
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":35.3, "a":35.3, "p":35.3, "pa":35.3, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":""
    },
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":34.2, "a":34.2, "p":34.2, "pa":34.2, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":""
    },
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":34.8, "a":34.8, "p":34.8, "pa":34.8, "r":["Fortress","Bruiser"],
      "k":"egg", "n":1, "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":""
    }
  },
  "ee_bionic_brett":{
    "1":{
      "s":0.722, "d":2, "dh":0, "h":1, "c":0, "b":22.1, "a":14.8, "p":22.1, "pa":14.8, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":66, "z":"review", "za":"spicy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"damage"
    },
    "2":{
      "s":0.66, "d":2, "dh":0, "h":1, "c":0, "b":29.2, "a":20.7, "p":29.2, "pa":20.7, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":65.6, "z":"review", "za":"spicy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"damage"
    },
    "3":{
      "s":0.732, "d":2, "dh":0, "h":1, "c":0, "b":36, "a":25.3, "p":36, "pa":25.3, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":66.7, "z":"review", "za":"spicy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"damage"
    },
    "4":{
      "s":0.734, "d":2, "dh":0, "h":1, "c":0, "b":39.8, "a":28.7, "p":39.8, "pa":28.7, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":66.2, "z":"watch", "za":"spicy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"damage"
    },
    "5":{
      "s":0.768, "d":2, "dh":0, "h":1, "c":0, "b":44.2, "a":34.2, "p":44.2, "pa":34.2, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":66.9, "z":"watch", "za":"spicy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"damage"
    },
    "6":{
      "s":0.819, "d":2, "dh":0, "h":1, "c":0, "b":46.5, "a":37.5, "p":46.5, "pa":37.5, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":66.5, "z":"watch", "za":"spicy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"damage"
    },
    "7":{
      "s":0.882, "d":2, "dh":0, "h":1, "c":0, "b":47.7, "a":43, "p":47.7, "pa":43, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":66.5, "z":"watch", "za":"spicy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":"damage"
    },
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":48.1, "a":48.1, "p":48.1, "pa":48.1, "r":["Fortress","Bruiser"],
      "k":"egg", "n":2, "ip":68, "z":"spicy", "za":"spicy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "ee_fisherman_chris":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":13.8, "a":13.8, "p":17.9, "pa":17.9, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    },
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":18.8, "a":18.8, "p":22.2, "pa":22.2, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    },
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":22.2, "a":22.2, "p":25.2, "pa":25.2, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":23.9, "a":23.9, "p":26.5, "pa":26.5, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":24.9, "a":24.9, "p":27.3, "pa":27.3, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    },
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":26.6, "a":26.6, "p":28.8, "pa":28.8, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    },
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":26.1, "a":26.1, "p":28.1, "pa":28.1, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    },
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":26.6, "a":26.6, "p":28.4, "pa":28.4, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "ee_chelsy":{
    "1":{
      "s":0.767, "d":3, "dh":0, "h":1, "c":2.3, "b":2.2, "a":3.9, "p":11.4, "pa":12.4, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"draw"
    },
    "2":{
      "s":0.729, "d":3, "dh":0, "h":1, "c":2.3, "b":3, "a":5.1, "p":10.9, "pa":12.3, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"draw"
    },
    "3":{
      "s":0.785, "d":3, "dh":0, "h":1, "c":2.3, "b":3.6, "a":6.6, "p":10.4, "pa":12.9, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"draw"
    },
    "4":{
      "s":0.853, "d":3, "dh":0, "h":1, "c":2.3, "b":3.8, "a":7.7, "p":9.8, "pa":13.2, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"draw"
    },
    "5":{
      "s":0.948, "d":3, "dh":0, "h":1, "c":2.2, "b":3.9, "a":8.8, "p":9.1, "pa":13.6, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"draw"
    },
    "6":{
      "s":0.988, "d":3, "dh":0, "h":1, "c":2.3, "b":4.2, "a":9.8, "p":8.9, "pa":14.1, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"draw"
    },
    "7":{
      "s":1.135, "d":3, "dh":0, "h":1, "c":2.2, "b":4, "a":10.8, "p":8.2, "pa":14.7, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":"draw"
    },
    "8":{
      "s":1.226, "d":3, "dh":0, "h":1, "c":2.1, "b":4.1, "a":11.9, "p":7.9, "pa":15.4, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":"draw"
    }
  },
  "ee_drew":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":12.9, "a":12.9, "p":16.9, "pa":16.9, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    },
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":18.3, "a":18.3, "p":21.6, "pa":21.6, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    },
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":20.6, "a":20.6, "p":23.5, "pa":23.5, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":23, "a":23, "p":25.6, "pa":25.6, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":23.2, "a":23.2, "p":25.5, "pa":25.5, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    },
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":25.4, "a":25.4, "p":27.5, "pa":27.5, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    },
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":25.3, "a":25.3, "p":27.2, "pa":27.2, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    },
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":1, "b":25.3, "a":25.3, "p":27.1, "pa":27.1, "r":["Saboteur"], "k":"egg", "n":2,
      "ip":100, "z":"healthy", "za":"healthy", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "ee_jen":{
    "1":{
      "s":0.704, "d":3, "dh":0, "h":1, "c":2.4, "b":2.4, "a":3.9, "p":11.8, "pa":12.5, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"draw"
    },
    "2":{
      "s":1.637, "d":2, "dh":0, "h":1, "c":2.4, "b":3.2, "a":5.3, "p":11.3, "pa":13.4, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"damage"
    },
    "3":{
      "s":0.742, "d":3, "dh":0, "h":1, "c":2.4, "b":3.8, "a":6.6, "p":10.8, "pa":12.9, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"draw"
    },
    "4":{
      "s":0.807, "d":3, "dh":0, "h":1, "c":2.3, "b":4, "a":7.7, "p":10.1, "pa":13.3, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"draw"
    },
    "5":{
      "s":0.892, "d":3, "dh":0, "h":1, "c":2.3, "b":4.1, "a":8.7, "p":9.4, "pa":13.6, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"draw"
    },
    "6":{
      "s":0.935, "d":3, "dh":0, "h":1, "c":2.3, "b":4.4, "a":9.8, "p":9.3, "pa":14.2, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"draw"
    },
    "7":{
      "s":1.08, "d":3, "dh":0, "h":1, "c":2.2, "b":4.2, "a":10.9, "p":8.5, "pa":14.8, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":"draw"
    },
    "8":{
      "s":1.163, "d":3, "dh":0, "h":1, "c":2.2, "b":4.3, "a":11.9, "p":8.2, "pa":15.5, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":"draw"
    }
  },
  "ee_haley":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.2, "b":3.6, "a":3.6, "p":12.4, "pa":12.4, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    },
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.2, "b":5, "a":5, "p":12.5, "pa":12.5, "r":["Saboteur","Snowball"], "k":"egg",
      "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    },
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.2, "b":5.9, "a":5.9, "p":12.5, "pa":12.5, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":2.2, "b":6.3, "a":6.3, "p":12, "pa":12, "r":["Saboteur","Snowball"], "k":"egg",
      "n":2, "ip":100, "z":"light", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1.387, "d":2, "dh":0, "h":1, "c":2.1, "b":6.3, "a":8.8, "p":11.3, "pa":13.8, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"damage"
    },
    "6":{
      "s":1.442, "d":2, "dh":0, "h":1, "c":2.2, "b":6.8, "a":9.8, "p":11.3, "pa":14.3, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"damage"
    },
    "7":{
      "s":0.921, "d":3, "dh":0, "h":1, "c":2.1, "b":6.4, "a":10.8, "p":10.4, "pa":14.6, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":"draw"
    },
    "8":{
      "s":0.994, "d":3, "dh":0, "h":1, "c":2.1, "b":6.5, "a":11.9, "p":10.1, "pa":15.3, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":"draw"
    }
  },
  "ee_nala":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":11.4, "a":11.4, "p":11.4, "pa":11.4, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    },
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":15.5, "a":15.5, "p":15.5, "pa":15.5, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    },
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":18.1, "a":18.1, "p":18.1, "pa":18.1, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":19.6, "a":19.6, "p":19.6, "pa":19.6, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":20.5, "a":20.5, "p":20.5, "pa":20.5, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    },
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":21.9, "a":21.9, "p":21.9, "pa":21.9, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"healthy", "za":"healthy", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    },
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":21.6, "a":21.6, "p":21.6, "pa":21.6, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"light", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    },
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":22.5, "a":22.5, "p":22.5, "pa":22.5, "r":["Bruiser"], "k":"egg", "n":2,
      "ip":0, "z":"light", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "ee_eevee":{
    "1":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":8.1, "a":8.1, "p":8.1, "pa":8.1, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":69.2, "z":"healthy", "za":"healthy", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1, "tn":""
    },
    "2":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":10.9, "a":10.9, "p":10.9, "pa":10.9, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":69.5, "z":"healthy", "za":"healthy", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1, "tn":""
    },
    "3":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":14, "a":14, "p":14, "pa":14, "r":["Combo","Bruiser"], "k":"egg", "n":2,
      "ip":71.6, "z":"healthy", "za":"healthy", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1, "tn":""
    },
    "4":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":15.5, "a":15.5, "p":15.5, "pa":15.5, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":71.2, "z":"healthy", "za":"healthy", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1, "tn":""
    },
    "5":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":16.6, "a":16.6, "p":16.6, "pa":16.6, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":70.9, "z":"light", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1, "tn":""
    },
    "6":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":17.6, "a":17.6, "p":17.6, "pa":17.6, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":70.7, "z":"light", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1, "tn":""
    },
    "7":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":18.4, "a":18.4, "p":18.4, "pa":18.4, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":70.5, "z":"light", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1, "tn":""
    },
    "8":{
      "s":1, "d":2, "dh":0, "h":1, "c":0, "b":19.1, "a":19.1, "p":19.1, "pa":19.1, "r":["Combo","Bruiser"], "k":"egg",
      "n":2, "ip":70.5, "z":"light", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1, "tn":""
    }
  },
  "ee_anthony":{
    "1":{
      "s":1.417, "d":2, "dh":0, "h":1, "c":2.5, "b":2.8, "a":3.9, "p":12.9, "pa":13.9, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":7.7, "hi":14.3, "bc":11, "cm":1,
      "tn":"damage"
    },
    "2":{
      "s":1.383, "d":2, "dh":0, "h":1, "c":2.5, "b":3.8, "a":5.3, "p":12.4, "pa":13.9, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":10.5, "hi":19.5, "bc":15, "cm":1,
      "tn":"damage"
    },
    "3":{
      "s":1.496, "d":2, "dh":0, "h":1, "c":2.5, "b":4.5, "a":6.7, "p":11.9, "pa":14.1, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":13.3, "hi":24.7, "bc":19, "cm":1,
      "tn":"damage"
    },
    "4":{
      "s":1.607, "d":2, "dh":0, "h":1, "c":2.5, "b":4.8, "a":7.6, "p":11.2, "pa":14.1, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":15.4, "hi":28.6, "bc":22, "cm":1,
      "tn":"damage"
    },
    "5":{
      "s":0.752, "d":3, "dh":0, "h":1, "c":2.4, "b":4.9, "a":8.8, "p":10.6, "pa":13.9, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":17.5, "hi":32.5, "bc":25, "cm":1,
      "tn":"draw"
    },
    "6":{
      "s":0.792, "d":3, "dh":0, "h":1, "c":2.4, "b":5.2, "a":9.9, "p":10.3, "pa":14.5, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":19.6, "hi":36.4, "bc":28, "cm":1,
      "tn":"draw"
    },
    "7":{
      "s":0.926, "d":3, "dh":0, "h":1, "c":2.4, "b":4.9, "a":10.9, "p":9.5, "pa":15, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":21.7, "hi":40.3, "bc":31, "cm":1,
      "tn":"draw"
    },
    "8":{
      "s":1.004, "d":3, "dh":0, "h":1, "c":2.3, "b":5, "a":11.9, "p":9.1, "pa":15.7, "r":["Saboteur","Snowball"],
      "k":"egg", "n":2, "ip":100, "z":"quiet", "za":"light", "kp":0, "lo":23.8, "hi":44.2, "bc":34, "cm":1,
      "tn":"draw"
    }
  }
};
const DIFF_PATCH = {
  items: {
    lab_lifeguard_scan: {
      id: 'lab_lifeguard_scan',
      name: 'Scan The Water',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'red',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note: 'Needs 3 Red cards. Sweeps the beach with binoculars. Draws 2 cards for its next attack.',
    },
    lab_frigate_skim: {
      id: 'lab_frigate_skim',
      name: 'Surface Skim',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'sumThreshold',
        min: 11,
      },
      flatAmount: 9,
      note: 'Needs cards totaling 11+. Skims the waves for a quick peck.',
    },
    lab_jelly_bloom: {
      id: 'lab_jelly_bloom',
      name: 'Bloom',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'blk',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 1,
      drawPerLevel: 0,
      note: 'Needs 3 Black cards. The swarm swells and closes ranks. Draws 1 card for its next attack.',
    },
    lab_gator_lunge: {
      id: 'lab_gator_lunge',
      name: 'Lunge',
      maxCards: 1,
      usesPerTurn: 1,
      condition: {
        type: 'any',
        exactCount: 1,
      },
      flatAmount: 10,
      note: 'Needs exactly 1 card. Bursts out of the reeds.',
    },
    lab_moccasin_coil: {
      id: 'lab_moccasin_coil',
      name: 'Coil And Strike',
      maxCards: 1,
      usesPerTurn: 1,
      condition: {
        type: 'any',
        exactCount: 1,
      },
      flatAmount: 8,
      note: 'Needs exactly 1 card. Coils up and snaps out.',
    },
    lab_mosquito_feast: {
      id: 'lab_mosquito_feast',
      name: 'Feeding Frenzy',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'red',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note: 'Needs 3 Red cards. One bite and the whole cloud gets excited. Draws 2 cards for its next attack.',
    },
    lab_enforcer_stopwork: {
      id: 'lab_enforcer_stopwork',
      name: 'Stop Work Order',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 0.8,
      kind: 'ice',
      note: 'Needs a Pair. Slaps a notice on your gear. Freezes one of your Items.',
    },
    lab_mainframe_hex: {
      id: 'lab_mainframe_hex',
      name: 'Data Siphon',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'blk',
        count: 3,
      },
      baseMult: 1.1,
      kind: 'hex',
      note: 'Needs 3 Black cards. Pulls your records out of your hands. Hexes one of your Items.',
    },
    lab_mainframe_reboot: {
      id: 'lab_mainframe_reboot',
      name: 'Reboot Cycle',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'sumThreshold',
        min: 10,
      },
      baseMult: 0,
      drawAmount: 1,
      drawPerLevel: 0,
      note: 'Needs cards totaling 10+. Restarts and reloads. Draws 1 card for its next attack.',
    },
    lab_marine_boarding: {
      id: 'lab_marine_boarding',
      name: 'Boarding Inspection',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 0.8,
      kind: 'ice',
      note: 'Needs a Pair. Locks down a piece of your gear. Freezes one of your Items.',
    },
    lab_pump_prime: {
      id: 'lab_pump_prime',
      name: 'Prime The Pump',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'sumThreshold',
        min: 8,
      },
      baseMult: 0,
      drawAmount: 1,
      drawPerLevel: 0,
      note: 'Needs cards totaling 8+. Sucks in more water. Draws 1 card for its next attack.',
    },
    lab_pump_spray: {
      id: 'lab_pump_spray',
      name: 'Spray',
      maxCards: 1,
      usesPerTurn: 1,
      condition: {
        type: 'any',
        exactCount: 1,
      },
      flatAmount: 9,
      note: 'Needs exactly 1 card. A hard jet from the outflow.',
    },
    lab_cryo_frostbite: {
      id: 'lab_cryo_frostbite',
      name: 'Frostbite',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 0.9,
      kind: 'curse',
      note: 'Needs a Pair. Cold that settles in and stays. Curses one of your Items.',
    },
    lab_ai_reboot: {
      id: 'lab_ai_reboot',
      name: 'Inventory Sweep',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'red',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note: 'Needs 3 Red cards. Scans every shelf again. Draws 2 cards for its next attack.',
    },
    lab_thief_pickpocket: {
      id: 'lab_thief_pickpocket',
      name: 'Sleight Of Hand',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 0,
      utilityEffect: 'discardHand',
      discardCount: 1,
      note: 'Needs a Pair. Lifts a card right out of your hand. Knocks 1 card out of your hand.',
    },
    lab_wave_undertow: {
      id: 'lab_wave_undertow',
      name: 'Cigar Smoke Blow',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'blk',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note:
        'Needs 3 Black cards. Big Al blows a thick cloud of cigar smoke in your face. Draws ' +
        '2 cards for its next attack.',
    },
    lab_matriarch_brood: {
      id: 'lab_matriarch_brood',
      name: 'Call The Brood',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'red',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note: 'Needs 3 Red cards. Hatchlings pour out of the mud. Draws 2 cards for its next attack.',
    },
    lab_matriarch_lash: {
      id: 'lab_matriarch_lash',
      name: 'Tail Lash',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 1.1,
      kind: 'curse',
      note: 'Needs a Pair. A heavy sweep that leaves you rattled. Curses one of your Items.',
    },
    lab_congestion_tow: {
      id: 'lab_congestion_tow',
      name: 'Tow Away Zone',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 2,
      },
      baseMult: 1,
      kind: 'ice',
      note: 'Needs Two Pair. Hooks a vehicle and drags it off. Freezes one of your Items.',
    },
    lab_congestion_gridlock: {
      id: 'lab_congestion_gridlock',
      name: 'Gridlock',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'sumThreshold',
        min: 9,
      },
      baseMult: 0,
      drawAmount: 1,
      drawPerLevel: 0,
      note: 'Needs cards totaling 9+. Traffic stacks up behind you. Draws 1 card for its next attack.',
    },
    lab_bridge_lockdown: {
      id: 'lab_bridge_lockdown',
      name: 'Bridge Lockdown',
      maxCards: 4,
      usesPerTurn: 1,
      condition: {
        type: 'sumThreshold',
        min: 15,
      },
      baseMult: 0.9,
      kind: 'ice',
      note: 'Needs cards totaling 15+. The gates come down and nothing moves. Freezes one of your Items.',
    },
    lab_bridge_toll: {
      id: 'lab_bridge_toll',
      name: 'Toll Collector',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 1.1,
      kind: 'curse',
      note: 'Needs a Pair. Pay now or pay more later. Curses one of your Items.',
    },
    lab_chiller_frostbite: {
      id: 'lab_chiller_frostbite',
      name: 'Deep Frostbite',
      maxCards: 2,
      usesPerTurn: 1,
      condition: {
        type: 'pokerTier',
        tier: 1,
      },
      baseMult: 1.2,
      kind: 'curse',
      note: 'Needs a Pair. The cold leaves a mark on the whole fleet. Curses one of your Items.',
    },
    lab_chiller_vent: {
      id: 'lab_chiller_vent',
      name: 'Vent Cycle',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'blk',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note: 'Needs 3 Black cards. Cycles the compressors for another run. Draws 2 cards for its next attack.',
    },
    lab_squall_gust: {
      id: 'lab_squall_gust',
      name: 'Storm Gust',
      maxCards: 1,
      usesPerTurn: 1,
      condition: {
        type: 'any',
        exactCount: 1,
      },
      flatAmount: 24,
      kind: 'lightning',
      note:
        'Needs exactly 1 card. A single crack out of a clear sky. Damage is randomized by ' +
        'the shared Lightning roll.',
    },
    lab_squall_eye: {
      id: 'lab_squall_eye',
      name: 'Eye Of The Storm',
      maxCards: 3,
      usesPerTurn: 1,
      condition: {
        type: 'colorCount',
        color: 'red',
        count: 3,
      },
      baseMult: 0,
      drawAmount: 2,
      drawPerLevel: 0,
      note: 'Needs 3 Red cards. A calm spot where the next front builds. Draws 2 cards for its next attack.',
    },
  },
  opponents: {
    w1_lifeguard_tower: {
      add: ['lab_lifeguard_scan'],
    },
    w1_frigatebird: {
      add: ['lab_frigate_skim'],
    },
    w1_jellyfish_swarm: {
      add: ['lab_jelly_bloom'],
    },
    w2_bull_gator: {
      add: ['lab_gator_lunge'],
    },
    w2_water_moccasin: {
      add: ['lab_moccasin_coil'],
    },
    w2_mosquito_cloud_elite: {
      add: ['lab_mosquito_feast'],
    },
    w3_code_enforcer: {
      add: ['lab_enforcer_stopwork'],
    },
    w3_gridlocked_intersection: {
      add: ['lab_mainframe_hex', 'lab_mainframe_reboot'],
    },
    w4_marine_patrol_boat: {
      add: ['lab_marine_boarding'],
    },
    w4_stormwater_pump: {
      add: ['lab_pump_prime', 'lab_pump_spray'],
    },
    w5_cryo_compressor: {
      add: ['lab_cryo_frostbite'],
    },
    w5_overworked_logistics_worker: {
      add: ['lab_ai_reboot'],
    },
    w6_smash_and_grab_crew: {
      add: ['lab_thief_pickpocket'],
    },
    rogue_wave: {
      add: ['lab_wave_undertow'],
    },
    nuisance_gator: {
      add: ['lab_matriarch_brood', 'lab_matriarch_lash'],
    },
    parking_enforcer: {
      add: ['lab_congestion_gridlock'],
    },
    drawbridge: {
      add: ['lab_bridge_toll'],
    },
    walk_in_walker: {
      add: ['lab_chiller_frostbite', 'lab_chiller_vent'],
    },
    four_pm_thunderstorm: {
      add: ['lab_squall_gust', 'lab_squall_eye'],
    },
  },
};
Object.assign(ITEMS, DIFF_PATCH.items);
