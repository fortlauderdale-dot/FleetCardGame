// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Item Cards: Catalog                                                           ██
// ██  Every Item card, both the ones you buy and the ones opponents use.            ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function equippedItemCount(hero) {
  return (hero.items || []).filter((id) => !ITEMS[id]?.weightless).length;
}
// prettier-ignore
const ITEMS = {
  card_draw: {
    id: 'card_draw', name: 'Fast Pit Stop', cost: 60, maxCards: 3, usesPerTurn: 1, condition: { type: 'any' },
    baseMult: 1, drawAmount: 2, drawPerLevel: 1, levelCap: 3,
    note: `Needs any card, up to 3. Attack for ${SIGMA_TIP} of cards played, then draw 2 additional cards.`
  },
 pair_draw: { id: 'pair_draw', name: 'Hit & Run', cost: 45, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1,
    drawAmount: 2, drawPerLevel: 0,
    note: 'Needs a Pair. Deals damage and draws 2 cards immediately.' },
  trips_draw: {
    id: 'trips_draw', name: 'Triple Axle Slam', cost: 75, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 3, exactTier: true }, baseMult: 1.8, drawAmount: 3, drawPerLevel: 0,
    note: 'Needs Three of a Kind. Deals damage and draws 3 cards immediately.'
  },
  diamond_draw: {
    id: 'diamond_draw', name: 'Diamond Lane Dash', cost: 55, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♦', count: 1 }, baseMult: 1, drawAmount: 1, drawPerLevel: 0,
    note: `Needs at least 1 ${kw('Diamond')}. Deals damage and draws 1 card immediately.`
  },
  all_points: {
    id: 'all_points', name: 'Aussie Flush', cost: 80, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1, minRow: 3,
    condition: { type: 'allSuits' }, flatAmount: 40, flatAmountPerLevel: 5,
    note: `Needs one of each ${kw('Suit')} (4 cards). Flat ${kw('Attack')} for 40 damage.`
  },
  repo_notice: {
    id: 'repo_notice', name: 'Repossession Order', cost: 75, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'colorCount', color: 'blk', count: 2 }, baseMult: 1, kind: 'curse',
    note: `Needs 2+ ${kw('Black')} cards. Curses the opponent for ${SIGMA_TIP} of the cards played.`
  },
  safety_inspection: {
    id: 'safety_inspection', name: 'Safety Inspection', cost: 75, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'colorCount', color: 'red', count: 2 }, baseMult: 1, kind: 'defense',
    note: `Needs 2+ ${kw('Red')} cards. Blocks damage equal to ${SIGMA_TIP} of the cards played.`
  },
  jinxed_duo: {
    id: 'jinxed_duo', name: 'Cursed Carpool', cost: 85, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'cardIn', cards: [{ rank: 3, suit: '♣' }, { rank: 4, suit: '♣' }] }, baseMult: 1,
    flatBonus: 16, flatBonusPerLevel: 0, kind: 'poison', drawAmount: 1, drawPerLevel: 0,
    note: (`Needs the ${rankLabel(3)}${suitMicroCardHTML('♣')} ` +
      `or ${rankLabel(4)}${suitMicroCardHTML('♣')}. Poison damage for ${SIGMA_TIP} of cards played + ` +
      `16, then draw 1 card immediately.`)
  },
  heart_inferno: {
    id: 'heart_inferno', name: 'Heart Redline', cost: 100, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'exactCount', count: 4 }, baseMult: 1, kind: 'burn',
    bonus: { condition: { type: 'suitCount', suit: '♥', count: 4 }, base: 0.5, perLevel: 0, maxLevel: 0 },
    note: `Needs exactly 4 cards. Flame damage for ${SIGMA_TIP}, +50% if all 4 are ${kw('Heart',"heart")}.`
  },
  diamond_inferno: {
    id: 'diamond_inferno', name: 'Diamond Redline', cost: 100, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'exactCount', count: 4 }, baseMult: 1, kind: 'burn',
    bonus: { condition: { type: 'suitCount', suit: '♦', count: 4 }, base: 0.5, perLevel: 0, maxLevel: 0 },
    note: `Needs exactly 4 cards. Flame damage for ${SIGMA_TIP}, +50% if all 4 are ${kw('Diamond')}.`
  },
  club_inferno: {
    id: 'club_inferno', name: 'Club Redline', cost: 100, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'exactCount', count: 4 }, baseMult: 1, kind: 'burn',
    bonus: { condition: { type: 'suitCount', suit: '♣', count: 4 }, base: 0.5, perLevel: 0, maxLevel: 0 },
    note: `Needs exactly 4 cards. Flame damage for ${SIGMA_TIP}, +50% if all 4 are ${kw('Club',"club")}.`
  },
  spade_inferno: {
    id: 'spade_inferno', name: 'Spade Redline', cost: 100, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'exactCount', count: 4 }, baseMult: 1, kind: 'burn',
    bonus: { condition: { type: 'suitCount', suit: '♠', count: 4 }, base: 0.5, perLevel: 0, maxLevel: 0 },
    note: `Needs exactly 4 cards. Flame damage for ${SIGMA_TIP}, +50% if all 4 are ${kw('Spade')}.`
  },
  five_alarm_flush: {
    id: 'five_alarm_flush', name: 'Code Five Response', cost: 135, maxCards: 5, usesPerTurn: 2,
    usesPerTurnPerLevel: 1, minRow: 3, condition: { type: 'pokerTier', tier: 5, exactCount: 5 }, baseMult: 1.5,
    note: `Needs exactly 5 cards making a ${kw('Flush')}. ${SIGMA_TIP} +50% damage. 2 uses per turn.`
  },
  exact_change: {
    id: 'exact_change', name: 'Exact Change', cost: 40, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'sumExact', value: 4 }, baseMult: 0, drawAmount: 0, drawUsesCardCount: true, drawBonusFlat: 2,
    drawPerLevel: 0,
    note: (`Cards played must add up to exactly 4 (example: 2+2, or a single 4). Draws a card ` +
      `for each card played, +2. Draws immediately.`)
  },
  chain_starter: {
    id: 'chain_starter', name: 'Jump Start', cost: 65, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1, minRow: 2,
    condition: { type: 'straightLen', len: 3 }, baseMult: straightMult(3),
    note: `Needs a 3-card ${kw('Straight')} (example: 6, 7, 8). ${SIGMA_TIP} +45% damage.`
  },
  drawstone: {
    id: 'drawstone', name: 'Tow Cable', cost: 60, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'sumThreshold', min: 7 }, baseMult: 1, drawAmount: 2, drawPerLevel: 0,
    note: `Cards played must add up to 7+. Hits for ${SIGMA_TIP} of the cards played, then draws 2 cards immediately.`
  },
  impound_release: {
    id: 'impound_release', name: 'Impound Release', cost: 155, maxCards: 5, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 0, kind: 'unlock', unlockThreshold: 45,
    note: (`Deals no damage. Playing cards through it counts down from 45 to 0 (based on the ` +
      `cards' value). Once fully charged, playing cards through it instead draws you 4 fresh cards, ` +
      `once per turn, for the rest of this battle - it never re-locks. Charge resets at the start of your next battle.`)
  },
  fender_bender: {
    id: 'fender_bender', name: 'Fender Bender', cost: 50, sellValue: 25, maxCards: 2, usesPerTurn: 1,
    usesPerTurnPerLevel: 1, condition: { type: 'pokerTier', tier: 0 }, baseMult: 1,
    bonus: { condition: { type: 'pokerTier', tier: 1 }, base: 0.5, perLevel: 0.25, maxLevel: 2 },
    note: 'Up to 2 cards. A Pair adds a bonus that grows the more you tune it.'
  },
  taylor_sift: {
    id: 'taylor_sift', name: 'Taylor Sift', cost: 35, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: (`Needs any card, up to 3. Rakes the sifter through for ${SIGMA_TIP} damage - simple ` +
      `and steady, just like combing the beach.`)
  },
  sand_trap: {
    id: 'sand_trap', name: 'Sand Trap', cost: 55, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.25, kind: 'defense',
    note: (`Needs any card, up to 3. Blocks damage equal to ${SIGMA_TIP} × 1.25 - bogs the ` +
      `attack down like tires stuck in loose sand.`)
  },
  pallet_drop: {
    id: 'pallet_drop', name: 'Pallet Drop', cost: 40, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'sumThreshold', min: 8 }, flatAmount: 10, flatAmountPerLevel: 3,
    note: `Cards played must add up to ${SIGMA_TIP}8+. Drops a loaded pallet for a flat 10 damage.`
  },
  full_pallet: {
    id: 'full_pallet', name: 'Full Pallet', cost: 90, maxCards: 5, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'exactCount', count: 5 }, baseMult: 1,
    note: (`Needs exactly 5 cards. Stacks a full pallet and drops it for ${SIGMA_TIP} of all ` +
      `five cards. Draw up to a full five first.`)
  },
  roof_rack: { id: 'roof_rack', name: 'Roof Rack', cost: 70, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: `Needs any card, up to 4. Slings everything strapped to the roof for ${SIGMA_TIP} damage.` },
  hose_slam: { id: 'hose_slam', name: 'Hose Slam', cost: 40, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: `Needs any card, up to 3. Whips the fuel hose around for ${SIGMA_TIP} damage.` },
  overhead_lift: {
    id: 'overhead_lift', name: 'Overhead Lift', cost: 40, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, drawAmount: 1, drawPerLevel: 0,
    note: `Needs a Pair. Hits for ${SIGMA_TIP}, then hoists up 1 extra card.`
  },
  donut_toss: { id: 'donut_toss', name: 'Donut Toss', cost: 80, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.5,
    note: `Needs a Pair. Chucks a box of donuts for ${SIGMA_TIP} × 1.5 damage - messy, but it works.` },
  hot_pursuit: {
    id: 'hot_pursuit', name: 'Hot Pursuit', cost: 110, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.8, hpCost: 8,
    note: (`Needs any cards, up to 4. Floors it for ${SIGMA_TIP} × 1.8 damage, but the chase ` +
      `costs you 8 health every time you fire it.`)
  },
  donut_break: {
    id: 'donut_break', name: 'Donut Break', cost: 70, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, healAmount: 12,
    note: (`Needs any cards, up to 2. Tosses a donut for ${SIGMA_TIP} damage and you heal 12 ` +
      `health. Pays for Hot Pursuit.`)
  },
  mower_trim: {
    id: 'mower_trim', name: 'Trim the Edges', cost: 35, maxCards: 2, usesPerTurn: 2, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: `Needs any card, up to 2. Trims for ${SIGMA_TIP} damage, and the mower can do it twice a turn.`
  },
  grass_catcher: {
    id: 'grass_catcher', name: 'Grass Catcher', cost: 40, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, kind: 'defense',
    note: `Needs any card, up to 3. Catches the clippings and blocks damage equal to ${SIGMA_TIP}.`
  },
  stretcher_run: {
    id: 'stretcher_run', name: 'Stretcher Run', cost: 60, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, healAmount: 6,
    note: `Needs any card, up to 3. Rushes in for ${SIGMA_TIP} damage and you heal 6 health.`
  },
  sand_dash: { id: 'sand_dash', name: 'Sand Dash', cost: 45, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.3,
    note: `Needs any card, up to 2. Kicks up sand for ${SIGMA_TIP} × 1.3 damage.` },
  wheelie_strike: {
    id: 'wheelie_strike', name: 'Wheelie Strike', cost: 50, maxCards: 1, usesPerTurn: 2, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.5,
    note: `Needs exactly 1 card. Pops a wheelie for ${SIGMA_TIP} × 1.5 damage, and can go twice a turn.`
  },
  traffic_stop: {
    id: 'traffic_stop', name: 'Traffic Stop', cost: 55, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.6,
    note: `Needs a Pair. Pulls them over for ${SIGMA_TIP} × 1.6 damage.`
  },
  bucket_jab: { id: 'bucket_jab', name: 'Bucket Jab', cost: 40, maxCards: 2, usesPerTurn: 2, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: `Needs any card, up to 2. Jabs with the bucket for ${SIGMA_TIP} damage, twice a turn.` },
  push_back: { id: 'push_back', name: 'Push Back', cost: 45, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.2, kind: 'defense',
    note: `Needs any card, up to 3. Shoves the attack away and blocks damage equal to ${SIGMA_TIP} × 1.2.` },
  bucket_scoop: {
    id: 'bucket_scoop', name: 'Bucket Scoop', cost: 60, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, drawAmount: 1, drawPerLevel: 0,
    note: `Needs any card, up to 3. Scoops for ${SIGMA_TIP} damage, then digs up 1 extra card.`
  },
  hydraulic_slam: {
    id: 'hydraulic_slam', name: 'Hydraulic Slam', cost: 70, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 2,
    note: `Needs a Pair. Slams the arm down for ${SIGMA_TIP} × 2 damage.`
  },
  heavy_load: { id: 'heavy_load', name: 'Heavy Load', cost: 70, maxCards: 5, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: `Needs any card, up to 5. Drops the whole bed for ${SIGMA_TIP} damage.` },
  gravel_drop: {
    id: 'gravel_drop', name: 'Gravel Drop', cost: 50, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.3,
    note: `Needs any card, up to 2. Spills gravel for ${SIGMA_TIP} × 1.3 damage.`
  },
  compactor: { id: 'compactor', name: 'Compactor', cost: 60, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.1, kind: 'defense',
    note: `Needs any card, up to 4. Crushes the incoming hit and blocks damage equal to ${SIGMA_TIP} × 1.1.` },
  dumpster_dive: {
    id: 'dumpster_dive', name: 'Dumpster Dive', cost: 55, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, drawAmount: 2, drawPerLevel: 0,
    note: `Needs any card, up to 2. Hits for ${SIGMA_TIP} damage, then digs up 2 extra cards.`
  },
  pressure_washer: {
    id: 'pressure_washer', name: 'Pressure Washer', cost: 85, maxCards: 2, usesPerTurn: 3, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.4,
    note: `Needs any card, up to 2. Blasts for ${SIGMA_TIP} × 1.4 damage, and can fire 3 times a turn.`
  },
  soap_spray: { id: 'soap_spray', name: 'Soap Spray', cost: 60, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, kind: 'poison',
    note: `Needs any card, up to 3. A slippery coat of poison for ${SIGMA_TIP}.` },
  grapple_haul: {
    id: 'grapple_haul', name: 'Grapple Haul', cost: 75, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'sumThreshold', min: 14 }, baseMult: 1.4, drawAmount: 1, drawPerLevel: 0,
    note: `Needs cards totaling 14+. Hauls for ${SIGMA_TIP} × 1.4 damage, then reels in 1 extra card.`
  },
  claw_drop: { id: 'claw_drop', name: 'Claw Drop', cost: 65, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'exactCount', count: 2 }, flatAmount: 28,
    note: `Needs exactly 2 cards. Drops the claw for a flat 28 damage.` },
  surfboard_smack: {
    id: 'surfboard_smack', name: 'Surfboard Smack', cost: 70, maxCards: 12, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'sumThreshold', min: 18 }, flatAmount: 20, flatAmountPerLevel: 4,
    note: `Needs cards totaling ${SIGMA_TIP}18+. Swings the board for a flat 20 damage.`
  },
  life_ring: { id: 'life_ring', name: 'Life Ring', cost: 70, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.3, kind: 'defense', healAmount: 6,
    note: `Needs any card, up to 3. Blocks damage equal to ${SIGMA_TIP} × 1.3 and you heal 6 health.` },
  flood_wake: {
    id: 'flood_wake', name: 'Floodwater Wake', cost: 85, maxCards: 5, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.2,
    note: `Needs any card, up to 5. A wall of water for ${SIGMA_TIP} × 1.2 damage.`
  },
  rescue_boat: {
    id: 'rescue_boat', name: 'Rescue Boat', cost: 80, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.5, kind: 'defense',
    note: `Needs any card, up to 4. Floats you clear and blocks damage equal to ${SIGMA_TIP} × 1.5.`
  },
  defibrillator: {
    id: 'defibrillator', name: 'Defibrillator', cost: 100, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 2.4, hpCost: 10,
    note: (`Needs any card, up to 3. Shocks for ${SIGMA_TIP} × 2.4 damage, but costs you 10 ` +
      `health every time you fire it.`)
  },
  adrenaline_drip: {
    id: 'adrenaline_drip', name: 'Adrenaline Drip', cost: 70, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, healAmount: 18,
    note: `Needs any card, up to 2. Hits for ${SIGMA_TIP} damage and you heal 18 health. Pays for the Defibrillator.`
  },
  backdraft_blast: {
    id: 'backdraft_blast', name: 'Backdraft Blast', cost: 80, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, kind: 'burn',
    note: `Needs a Pair. Burn damage for ${SIGMA_TIP} - it's not supposed to start fires, but here we are.`
  },
  full_pressure_hose: {
    id: 'full_pressure_hose', name: 'Full-Pressure Hose', cost: 70, maxCards: 12, usesPerTurn: 1,
    usesPerTurnPerLevel: 1, condition: { type: 'sumThreshold', min: 10 }, flatAmount: 34, flatAmountPerLevel: 5,
    note: `Cards played must add up to ${SIGMA_TIP}10+. Blasts for a flat 34 damage at full pressure.`
  },
  afff_foam_cannon: {
    id: 'afff_foam_cannon', name: 'AFFF Foam Cannon', cost: 95, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1.15, kind: 'defense',
    note: (`Needs any cards, up to 4. Blankets the fight in firefighting foam, blocking damage ` +
      `equal to ${SIGMA_TIP} × 1.15 - built for jet fuel fires, so it smothers just about anything.`)
  },
  rapid_intervention: {
    id: 'rapid_intervention', name: 'Rapid Intervention', cost: 70, maxCards: 2, usesPerTurn: 1,
    usesPerTurnPerLevel: 1, condition: { type: 'straightLen', len: 2 }, baseMult: straightMult(2),
    bonus: { base: 0, perLevel: 0.15, maxLevel: 3 },
    note: `Needs a 2-card straight. First truck on scene hits hard and keeps improving with upgrades.`
  },
  door_breach_ram: {
    id: 'door_breach_ram', name: 'Door Breach Ram', cost: 100, maxCards: 1, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 40, flatAmountPerLevel: 6,
    note: (`Needs exactly 1 card. Rams the front-mounted breaching tool through for a flat 40 ` +
      `damage - built to take doors off their hinges.`)
  },
  grappler_hook: {
    id: 'grappler_hook', name: 'Grappler Hook', cost: 95, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.8, drawAmount: 1, drawPerLevel: 0,
    note: `Needs Two Pair. Hooks and hauls for ${SIGMA_TIP} × 1.8 damage, then reels in 1 extra card.`
  },
  opp_pair_curse: { id: 'opp_pair_curse', name: 'Repo Notice', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1,
    note: 'Needs a Pair. A plain, reliable poke.' },
  opp_single_steal: { id: 'opp_single_steal', name: 'Coin Jam', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 8, opponentEffect: 'stealFuel',
    note: 'Needs exactly 1 card. Small hit, and it siphons a bit of your fuel.' },
  low_tier_threshold: { id: 'low_tier_threshold', name: 'Static Discharge', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 10 }, flatAmount: 12,
    note: `Needs cards totaling ${SIGMA_TIP}10+. Flat attack for 12 damage.` },
  high_card_gate: { id: 'high_card_gate', name: 'Ember Flare', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 10,
    note: 'Needs exactly 1 card. Flat attack for 10 damage - the simplest hazard in the game.' },
  opp_shouting_match: { id: 'opp_shouting_match', name: 'Shouting Match', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1,
    note: 'Needs a Pair. A plain, reliable poke.' },
  opp_grudge_match: { id: 'opp_grudge_match', name: 'Grudge Match', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'any' }, suitPunish: { suit: '♥', perCard: 4, base: 6 },
    note: 'Needs any card. Hits harder for every Heart you\'ve already discarded this fight.' },
  opp_hydrant_blast: { id: 'opp_hydrant_blast', name: 'Pressure Blast Explosion', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 25 }, baseMult: 0, flatAmount: 24,
    note: `Needs cards totaling ${SIGMA_TIP}25+. Flat attack for 24 damage.` },
  opp_rancid_blaze: { id: 'opp_rancid_blaze', name: 'Rancid Blaze', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1,
    note: 'Needs Two Pair. Direct damage.' },
  opp_patch_job: { id: 'opp_patch_job', name: 'Patch Job', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, opponentEffect: 'heal',
    note: 'Needs a Pair. Hits you, and recovers some of its own HP.' },
  opp_red_alert: { id: 'opp_red_alert', name: 'Red Alert', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'any' }, colorPunish: { color: 'red', perCard: 5, base: 6 },
    note: 'Needs any card. Hits harder for every red card currently in its pool.' },
  opp_black_ice: { id: 'opp_black_ice', name: 'Black Ice', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'any' }, colorPunish: { color: 'black', perCard: 5, base: 6 },
    note: 'Needs any card. Hits harder for every black card currently in its pool.' },
  opp_sabotage_engine: { id: 'opp_sabotage_engine', name: 'Sabotage Engine', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1, kind: 'curse',
    note: 'Needs Two Pair. Curses one of your Items.' },
  opp_scorching_wave: { id: 'opp_scorching_wave', name: 'Scorching Wave', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3 }, baseMult: 1, kind: 'burn',
    note: 'Needs Three of a Kind. Burn damage.' },
  opp_aftershock: { id: 'opp_aftershock', name: 'Aftershock', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, kind: 'poison',
    note: 'Needs a Pair. Poison damage.' },
  opp_bulletin: { id: 'opp_bulletin', name: 'All-Points Bulletin', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1,
    note: 'Needs Two Pair. A hard poke.' },
  opp_gas_ignition: { id: 'opp_gas_ignition', name: 'Ignition Explosion', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 20 }, flatAmount: 30,
    note: `Needs cards totaling ${SIGMA_TIP}20+. A big flat hit.` },
  opp_gas_ignition_major: { id: 'opp_gas_ignition_major', name: 'Massive Ignition', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 25 }, flatAmount: 45,
    note: `Needs cards totaling ${SIGMA_TIP}25+. A massive flat hit.` },
  opp_gas_leak: {
    id: 'opp_gas_leak', name: 'Gas Leak', maxCards: 5, usesPerTurn: 1, condition: { type: 'any' }, baseMult: 0,
    flatAmount: 35,
    note: 'Needs any card. Hits for a flat 35.'
  },
  opp_major_gas_leak: {
    id: 'opp_major_gas_leak', name: 'Major Gas Leak', maxCards: 5, usesPerTurn: 1, condition: { type: 'any' },
    baseMult: 0, kind: 'unlock', unlockThreshold: 75, flatAmount: 65,
    note: (`<span style="color:var(--purple)">Locked: Opponent cards deposit value to charge it. ` +
      `Once unlocked, fires a 65-damage Massive Ignition.</span>`)
  },
  opp_hearts_3: { id: 'opp_hearts_3', name: 'Royal Flush Strike', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCountExact', suit: '♥', count: 3 }, flatAmount: 32,
    note: 'Needs exactly 3 Hearts. Its hardest hit.' },
  opp_hearts_2: { id: 'opp_hearts_2', name: 'Twin Hearts', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCountExact', suit: '♥', count: 2 }, flatAmount: 16,
    note: 'Needs exactly 2 Hearts.' },
  opp_hearts_1: { id: 'opp_hearts_1', name: 'Lonely Heart', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCountExact', suit: '♥', count: 1 }, flatAmount: 4, opponentEffect: 'heal',
    note: 'Needs exactly 1 Heart. A weak poke, and it recovers a little HP.' },
  opp_hearts_0: { id: 'opp_hearts_0', name: 'Empty Hand', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCountExact', suit: '♥', count: 0 }, flatAmount: 6,
    note: 'Needs zero Hearts. Its fallback when it has no Hearts at all.' },
  opp_toxic_spray: { id: 'opp_toxic_spray', name: 'Toxic Spray', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1, kind: 'poison',
    note: 'Needs Two Pair. Poison damage.' },
  opp_flash_deluge: { id: 'opp_flash_deluge', name: 'Flash Deluge', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3 }, baseMult: 1,
    note: 'Needs Three of a Kind. A hard poke.' },
  opp_rising_waters: { id: 'opp_rising_waters', name: 'Rising Waters', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 20 }, flatAmount: 28,
    note: `Needs cards totaling ${SIGMA_TIP}20+. Its fallback flat hit.` },
  opp_mob_pileon: { id: 'opp_mob_pileon', name: 'Mob Pile-On', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 8,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays.' },
  opp_blackout_surge: { id: 'opp_blackout_surge', name: 'Blackout Surge', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1,
    note: 'Needs Two Pair (2 cards). A hard poke.' },
  opp_total_shutdown: { id: 'opp_total_shutdown', name: 'Total Shutdown', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, opponentEffect: 'stealFuel',
    note: 'Needs a Pair. Hits you and siphons a bit of your fuel.' },
  opp_weld_patch: { id: 'opp_weld_patch', name: 'Weld A Patch', maxCards: 2, usesPerTurn: 1, kind: 'defense',
    condition: { type: 'any' }, flatAmount: 0, opponentEffect: 'reinforceArmor', reinforceAmount: 15,
    note: 'Needs any card. Deals no damage, but reinforces its own armor by 15.' },
  opp_tidal_slam: { id: 'opp_tidal_slam', name: 'Tidal Slam', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3 }, baseMult: 1, kind: 'burn',
    note: 'Needs Three of a Kind. Burn damage.' },
  opp_inferno_blast: { id: 'opp_inferno_blast', name: 'Inferno Blast', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 4 }, baseMult: 1, kind: 'burn',
    note: 'Needs a Straight. Burn damage.' },
  opp_structural_collapse: { id: 'opp_structural_collapse', name: 'Structural Collapse', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 30 }, flatAmount: 26, opponentEffect: 'stealFuel',
    note: `Needs cards totaling ${SIGMA_TIP}30+. Hits you and siphons a bit of your fuel.` },
  opp_curse_all: { id: 'opp_curse_all', name: 'Curse All', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1, kind: 'curse',
    note: 'Needs Two Pair. Curses one of your Items.' },
  opp_total_wreckage: { id: 'opp_total_wreckage', name: 'Total Wreckage', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 32 }, flatAmount: 32,
    note: `Needs cards totaling ${SIGMA_TIP}32+. Its fallback flat hit.` },
  opp_cornered_snarl: { id: 'opp_cornered_snarl', name: 'Cornered Snarl', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 28,
    note: 'Needs exactly 1 card. A big desperate bite.' },
  opp_snap_bite: { id: 'opp_snap_bite', name: 'Snap Bite', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: 'Needs any card. A plain, reliable poke.' },
  opp_ground_crackle: { id: 'opp_ground_crackle', name: 'Ground Crackle', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 25 }, flatAmount: 26,
    note: `Needs cards totaling ${SIGMA_TIP}25+. Its fallback flat hit.` },
  opp_chasm_collapse: { id: 'opp_chasm_collapse', name: 'Chasm Collapse', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 35 }, flatAmount: 45,
    note: `Needs cards totaling ${SIGMA_TIP}35+. Its fallback flat hit.` },
  opp_firestorm_surge: { id: 'opp_firestorm_surge', name: 'Firestorm Surge', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3 }, baseMult: 1, kind: 'burn',
    note: 'Needs Three of a Kind. Burn damage.' },
  opp_ashfall: { id: 'opp_ashfall', name: 'Ashfall', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1, kind: 'poison',
    note: 'Needs Two Pair. Poison damage.' },
  opp_total_engulfment: { id: 'opp_total_engulfment', name: 'Total Engulfment', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 12,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays.' },
  opp_castle_poke_t3: { id: 'opp_castle_poke_t3', name: 'Champion Strike', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3, exactTier: true }, baseMult: 1,
    note: 'Needs Three of a Kind. A hard poke.' },
  opp_petty_siphon: { id: 'opp_petty_siphon', name: 'Petty Siphon', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 0, opponentEffect: 'stealFuel',
    note: 'Plays its single highest-ranked card. Deals 0 damage, but siphons 1 Fuel from your tank.' },
  opp_early_escape_hatch: {
    id: 'opp_early_escape_hatch', name: 'Early Escape Hatch', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 4, exactCount: 4 }, flatAmount: 0,
    opponentEffect: 'earlyEscape',
    note: ('Needs exactly 4 Black cards. Instantly ends the fight - you clear the stop, but it ' +
      'flees with your fuel, costing you 3 Fuel.')
  },
  triple_threat: {
    id: 'triple_threat', name: 'Multi-Car Pileup', cost: 70, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 3, exactTier: true }, baseMult: 2.8,
    bonus: { base: 0, perLevel: 0.3, maxLevel: 3 },
    note: 'Needs Three of a Kind. A big hit that tunes even further with upgrades.'
  },
  bike_dash: { id: 'bike_dash', name: 'Bike Lane Dash', cost: 30, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'straightLen', len: 2 }, baseMult: straightMult(2),
    note: 'Needs a 2-card straight (example: 7-8, any suits).' },
  moto_escort: {
    id: 'moto_escort', name: 'Chain Reaction', cost: 125, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'straightLen', len: 4 }, baseMult: straightMult(4), note: 'Needs a 4-card straight.'
  },
  diamond_run: {
    id: 'diamond_run', name: 'Diamond Convoy', cost: 65, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♦', count: 1 }, baseMult: 1,
    bonus: { base: 0.25, perLevel: 0.2, maxLevel: 3, condition: { type: 'suitCount', suit: '♦', count: 3 } },
    note: (`Needs at least 1 Diamond among your played cards. ${SIGMA_TIP} for damage, plus 25% ` +
      `more if you play 3 or more Diamonds.`)
  },
  starter_red_tap: {
    id: 'starter_red_tap', name: 'Brake Light Tap', cost: 45, sellValue: 22, maxCards: 5, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'red', count: 2 }, baseMult: 1,
    note: `Needs 2+ ${kw('Red')} cards among your played cards, up to 5. ${SIGMA_TIP} damage and easy to set up.`
  },
  starter_black_tap: {
    id: 'starter_black_tap', name: 'Black Top Tap', cost: 45, sellValue: 22, maxCards: 5, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 2 }, baseMult: 1,
    note: `Needs 2+ ${kw('Black')} cards among your played cards, up to 5. ${SIGMA_TIP} damage and easy to set up.`
  },
  spade_tandem: {
    id: 'spade_tandem', name: 'Spade Tandem', cost: 50, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♠', count: 2 }, baseMult: 1.2,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 }, note: `Needs at least 2 ${kw('Spade')} among your played cards.`
  },
  heart_tandem: {
    id: 'heart_tandem', name: 'Heart Tandem', cost: 50, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♥', count: 2 }, baseMult: 1.2,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 }, note: `Needs at least 2 ${kw('Heart')} among your played cards.`
  },
  club_tandem: {
    id: 'club_tandem', name: 'Club Tandem', cost: 50, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♣', count: 2 }, baseMult: 1.2,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 }, note: `Needs at least 2 ${kw('Club')} among your played cards.`
  },
  diamond_tandem: {
    id: 'diamond_tandem', name: 'Diamond Tandem', cost: 50, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♦', count: 2 }, baseMult: 1.2,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 },
    note: `Needs at least 2 ${kw('Diamond')} among your played cards.`
  },
  red_light_runner: {
    id: 'red_light_runner', name: 'Red Light Runner', cost: 50, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'colorCount', color: 'red', count: 2 }, baseMult: 1.15,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 }, note: `Needs 2+ ${kw('Red')} cards among your played cards.`
  },
  black_top_blitz: {
    id: 'black_top_blitz', name: 'Black Top Blitz', cost: 50, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'colorCount', color: 'blk', count: 2 }, baseMult: 1.15,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 }, note: `Needs 2+ ${kw('Black')} cards among your played cards.`
  },
  club_run: { id: 'club_run', name: 'Club Convoy', cost: 65, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♣', count: 3 }, baseMult: 1.3,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 },
    note: 'Needs at least 3 Clubs among your played cards.' },
  spade_run: { id: 'spade_run', name: 'Spade Convoy', cost: 65, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♠', count: 3 }, baseMult: 1.3,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 },
    note: 'Needs at least 3 Spades among your played cards.' },
  heart_run: { id: 'heart_run', name: 'Heart Convoy', cost: 65, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♥', count: 3 }, baseMult: 1.3,
    bonus: { base: 0, perLevel: 0.2, maxLevel: 3 },
    note: 'Needs at least 3 Hearts among your played cards.' },
  odd_job: { id: 'odd_job', name: 'Odd Shift', cost: 75, maxCards: 5, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'parity', parity: 'odd', mode: 'all' }, baseMult: 1.2,
    bonus: { base: 0, perLevel: 0.25, maxLevel: 3 },
    note: 'Upgrades up to 5 cards. Every loaded card must be an odd rank.' },
  lucky_seven: {
    id: 'lucky_seven', name: 'Highway 7 Shortcut', cost: 75, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 2, condition: { type: 'exactRank', rank: 7 }, baseMult: 2.2,
    bonus: { base: 0, perLevel: 0.4, maxLevel: 3 },
    note: 'Needs a 7 among your played cards. Rare to have one ready, so it hits hard when you do.'
  },
  escort_wall: { id: 'escort_wall', name: 'Roadblock', cost: 55, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, kind: 'defense',
    note: `Needs a Pair. Blocks damage equal to ${SIGMA_TIP} of the cards played, instead of dealing damage.` },
  diamond_draw: {
    id: 'diamond_draw', name: 'Diamond Draw', cost: 55, maxCards: 1, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'suitCount', suit: '♦', count: 1 }, flatAmount: 10, drawAmount: 1, drawPerLevel: 1,
    levelCap: 3, note: `Needs a Diamond. Flat 10 damage, then draws 1 card immediately (draws 1 more per upgrade).`
  },
  guard_rail: { id: 'guard_rail', name: 'Guard Rail', cost: 55, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, kind: 'defense',
    note: `Needs any card, up to 3. Blocks damage equal to ${SIGMA_TIP} of the cards played.` },
  spare_tire: { id: 'spare_tire', name: 'Spare Tire', cost: 65, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'colorCount', color: 'blk', count: 2 }, baseMult: 1.1, kind: 'defense',
    note: `Needs 2+ ${kw('Black')} cards. Blocks damage equal to ${SIGMA_TIP} of the cards played × 1.1.` },
  toxic_spill: {
    id: 'toxic_spill', name: 'Toxic Spill', cost: 45, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 0.5, kind: 'poison', bonus: { base: 0, perLevel: 0.15, maxLevel: 3 },
    note: 'Up to 3 cards. Poison equal to half your total card value.'
  },
  toxic_flood: {
    id: 'toxic_flood', name: 'Toxic Flood', cost: 120, maxCards: 5, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'any' }, baseMult: 1, kind: 'poison', bonus: { base: 0, perLevel: 0.2, maxLevel: 3 },
    note: 'Up to 5 cards. Poison equal to 100% of your total card value.'
  },
  torch_burn: {
    id: 'torch_burn', name: 'Smoldering Engine', cost: 100, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, kind: 'burn',
    note: ('Needs a Pair. Sets one of their Items on fire. The burn grows every turn until you ' +
      'detonate it, or until they fire that Item and take the burn themselves. Burns can stack.')
  },
  supply_bag: {
    id: 'supply_bag', name: 'Cupholder Stash', cost: 65, maxCards: 2, kind: 'storage', maxStore: 2, weightless: true,
    note: ('Holds up to 2 cards of any kind turn to turn (up to 5 with Chop Shop upgrades). ' +
      'Weightless, does not use an Item slot. Never attacks, never gets cursed. Click a stored card to take it back.')
  },
  supply_bag_big: {
    id: 'supply_bag_big', name: 'Center Console Stash', cost: 65, maxCards: 5, kind: 'storage', maxStore: 5,
    weightless: true,
    note: ('Holds up to 5 cards of any kind turn to turn (up to 7 with Chop Shop upgrades). ' +
      'Weightless, does not use an Item slot. Never attacks, never gets cursed. Click a stored card to take it back.')
  },
  spade_bag: {
    id: 'spade_bag', name: 'Spade Trunk', cost: 30, maxCards: 13, kind: 'storage', maxStore: 13,
    acceptFilter: { suit: '♠' },
    note: ('Holds up to 13 Spades only (every Spade in the deck, so it will never run out of ' +
      'room). Click a stored card to take it back.')
  },
  heart_bag: {
    id: 'heart_bag', name: 'Heart Trunk', cost: 30, maxCards: 13, kind: 'storage', maxStore: 13,
    acceptFilter: { suit: '♥' },
    note: ('Holds up to 13 Hearts only (every Heart in the deck, so it will never run out of ' +
      'room). Click a stored card to take it back.')
  },
  diamond_bag: {
    id: 'diamond_bag', name: 'Diamond Trunk', cost: 30, maxCards: 13, kind: 'storage', maxStore: 13,
    acceptFilter: { suit: '♦' },
    note: ('Holds up to 13 Diamonds only (every Diamond in the deck, so it will never run out of ' +
      'room). Click a stored card to take it back.')
  },
  club_bag: {
    id: 'club_bag', name: 'Club Trunk', cost: 30, maxCards: 13, kind: 'storage', maxStore: 13,
    acceptFilter: { suit: '♣' },
    note: ('Holds up to 13 Clubs only (every Club in the deck, so it will never run out of ' +
      'room). Click a stored card to take it back.')
  },
  red_bag: { id: 'red_bag', name: 'Red Glovebox', cost: 45, maxCards: 10, kind: 'storage', maxStore: 5,
    acceptFilter: { color: 'red' },
    note: `Holds up to 5 ${kw('Red')} cards only. Click a stored card to take it back.` },
  black_bag: { id: 'black_bag', name: 'Black Glovebox', cost: 45, maxCards: 10, kind: 'storage', maxStore: 5,
    acceptFilter: { color: 'blk' },
    note: `Holds up to 5 ${kw('Black')} cards only. Click a stored card to take it back.` },
  w3_road_rage: { id: 'w3_road_rage', name: 'Road Rage', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 7 }, flatAmount: 15,
    note: 'Needs a 7. A frustrated jab, timed to the exact moment the light turns.' },
  w3_static_interference: { id: 'w3_static_interference', name: 'Dispatch Shout', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 8 }, flatAmount: 10,
    note: `Needs cards totaling ${SIGMA_TIP}8+. Screams over the radio until your ears ring.` },
  w3_propeller_slash: { id: 'w3_propeller_slash', name: 'Propeller Slash', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 9,
    note: 'Needs exactly 1 card. A quick slashing pass.' },
  w3_paper_jam: { id: 'w3_paper_jam', name: 'Paper Jam', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'red', count: 2 }, baseMult: 1.15, kind: 'burn',
    note: 'Needs 2+ Red cards. Jams on the overdue-notice paper and sparks into a small fire.' },
  w3_citation_blitz: { id: 'w3_citation_blitz', name: 'Citation Blitz', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1, kind: 'burn',
    note: 'Needs Two Pair. Issues a flaming citation.' },
  w3_signal_scramble: { id: 'w3_signal_scramble', name: 'Signal Scramble', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 22 }, flatAmount: 30, kind: 'poison',
    note: `Needs cards totaling ${SIGMA_TIP}22+. Poison damage. Every light turns red and the exhaust piles up.` },

  // World 3 (Downtown Core) attacks, round 2 - 15 more regulars for variety, mostly fire
  w3_meter_poke: { id: 'w3_meter_poke', name: 'Meter Poke', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, kind: 'burn',
    note: 'Needs a Pair. The meter head short-circuits into your paint.' },
  w3_barrier_ignite: { id: 'w3_barrier_ignite', name: 'Barrel Fire', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 14 }, flatAmount: 18, kind: 'burn',
    note: `Needs cards totaling ${SIGMA_TIP}14+. A dropped flare lights up the barrels.` },
  w3_barrier_topple: { id: 'w3_barrier_topple', name: 'Barrel Roll', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 7,
    note: 'Needs exactly 1 card. A barrel tips and rolls straight into the lane.' },
  w3_extinguisher_backfire: {
    id: 'w3_extinguisher_backfire', name: 'Extinguisher Backfire', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♦', count: 3 }, flatAmount: 22, kind: 'burn',
    note: 'Needs at least 3 Diamonds. Sprayed the wrong nozzle - that was not foam, and it went up fast.'
  },
  w3_extinguisher_swing: { id: 'w3_extinguisher_swing', name: 'Extinguisher Swing', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 6,
    note: 'Needs exactly 1 card. A wild swing of the canister.' },
  w3_streetlamp_flicker: { id: 'w3_streetlamp_flicker', name: 'Streetlamp Flicker', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 8,
    note: 'Needs exactly 1 card. Flickers out right as you pass under it.' },
  w3_dumpster_flareup: { id: 'w3_dumpster_flareup', name: 'Dumpster Flare-Up', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'straightLen', len: 3 }, baseMult: 1.45, kind: 'burn',
    note: 'Needs a 3-card straight (example: 6, 7, 8). A gust sends a line of flaming trash your way.' },
  w3_junction_spark: { id: 'w3_junction_spark', name: 'Junction Spark', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 9, kind: 'burn',
    note: 'Needs exactly 1 card. A live wire arcs across the intersection.' },
  w3_kiosk_jam: { id: 'w3_kiosk_jam', name: 'Pay Station Jam', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 7,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays.' },
  w3_panel_surge: { id: 'w3_panel_surge', name: 'Smoldering Spill', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 15 }, flatAmount: 19, kind: 'burn',
    note: `Needs cards totaling ${SIGMA_TIP}15+. A flipped dumpster spills smoldering trash across the lane.` },
  w3_valet_joyride: { id: 'w3_valet_joyride', name: 'Valet Joyride', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♥', count: 2 }, baseMult: 1.15, opponentEffect: 'stealFuel',
    note: 'Needs at least 2 Hearts. Takes it for a joyride and siphons a bit of fuel.' },
  w3_picket_shove: { id: 'w3_picket_shove', name: 'Sign Flip', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'red', count: 3 }, baseMult: 1.3,
    note: 'Needs 3+ Red cards. Flips the arrow sign across the lane when enough of them show up.' },
  w3_steam_vent: { id: 'w3_steam_vent', name: 'Steam Vent', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 12 }, flatAmount: 15, kind: 'burn',
    note: `Needs cards totaling ${SIGMA_TIP}12+. Superheated steam blasts up through the grate.` },
  w3_router_jam: { id: 'w3_router_jam', name: 'Login Screen', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 4, opponentEffect: 'draw',
    note: 'Needs exactly 1 card. Hijacks your signal with a login page and draws itself an extra card.' },
  w3_rideshare_cutoff: { id: 'w3_rideshare_cutoff', name: 'Rideshare Cutoff', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 9 }, flatAmount: 16, kind: 'poison',
    note: 'Needs a 9. Cuts you off right at exit 9 and leaves a haze of exhaust fumes. Poison damage.' },
  opp_boot_lockdown: { id: 'opp_boot_lockdown', name: 'Boot Lockdown', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3, exactTier: true }, baseMult: 1, kind: 'burn',
    note: 'Needs Three of a Kind. Boots your fleet and torches the paperwork.' },
  opp_impound_fury: { id: 'opp_impound_fury', name: 'Impound Fury', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 14,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays.' },
  w4_hull_scrape: { id: 'w4_hull_scrape', name: 'Hull Scrape', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♦', count: 2 }, baseMult: 1.15,
    note: 'Needs at least 2 Diamonds. A grinding scrape along the hardest part of the hull.' },
  w4_wake_turbulence: { id: 'w4_wake_turbulence', name: 'Wake Turbulence', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 9 }, flatAmount: 11,
    note: `Needs cards totaling ${SIGMA_TIP}9+. Rocks you with wake turbulence.` },
  w4_chum_slick: { id: 'w4_chum_slick', name: 'Chum Slick', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1, kind: 'burn',
    note: 'Needs a Pair. Burn damage.' },

  // World 4 (Riverwalk District) attacks, round 2 - 15 more regulars, curse introduced here
  w4_crab_swarm_nip: { id: 'w4_crab_swarm_nip', name: 'Dock Crab Swarm Nip', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 6 }, flatAmount: 16,
    note: 'Needs a 6. The whole colony scuttles out from under the dock at once, right on cue.' },
  w4_crab_swarm_pinch: { id: 'w4_crab_swarm_pinch', name: 'All-Out Pinch', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 7,
    note: 'Needs any card. The full colony swarms out - damage scales with face cards (J/Q/K) played.' },
  w4_crate_topple: { id: 'w4_crate_topple', name: 'Top-Heavy Tip', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 14 }, flatAmount: 18,
    note: `Needs cards totaling ${SIGMA_TIP}14+. A forklift stacked too high lets the whole load go at once.` },
  w4_bait_spill: { id: 'w4_bait_spill', name: 'Bait Bucket Spill', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 9, kind: 'poison',
    note: 'Needs exactly 1 card. Poison damage.' },
  w4_fishing_snag: {
    id: 'w4_fishing_snag', name: 'Fourth Take', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 4 }, flatAmount: 15,
    note: 'Needs a 4. Steps into the lane for the fourth take and the tripod catches a wheel well and won\'t let go.'
  },
  w4_piling_scrape: { id: 'w4_piling_scrape', name: 'Debris Snag', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 3 }, baseMult: 1.3,
    note: 'Needs 3+ Black cards. Splintered boards and tangled line leave a mark when there is enough to snag on.' },
  w4_cruise_wake_swell: {
    id: 'w4_cruise_wake_swell', name: 'Mega Yacht Swell', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 16 }, flatAmount: 22,
    note: (`Needs cards totaling ${SIGMA_TIP}16+. A mega yacht blows past the no-wake sign and ` +
      `the wake rolls the whole dock.`)
  },
  w4_haunted_piling_hex: {
    id: 'w4_haunted_piling_hex', name: 'Photobomb', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'cardIn', cards: [{ rank: 12, suit: '♠' }] }, flatAmount: 12, kind: 'curse',
    note: ('Needs the Queen of Spades. Photobombs your whole day, and the bad luck only sticks ' +
      'for her. Curses one of your Items.')
  },
  w4_fortune_tellers_hex: {
    id: 'w4_fortune_tellers_hex', name: "Fortune Teller's Hex", maxCards: 1, usesPerTurn: 1,
    condition: { type: 'cardIn', cards: [{ rank: 14, suit: '♠' }] }, flatAmount: 14, kind: 'curse',
    note: ("Needs the Ace of Spades. She warned you not to park there, and the death card " +
      "doesn't lie. Curses one of your Items.")
  },
  w4_fortune_reshuffle: {
    id: 'w4_fortune_reshuffle', name: 'Shuffle the Tarot', maxCards: 1, usesPerTurn: 1, condition: { type: 'any' },
    baseMult: 0, utilityEffect: 'followUp', followUp: { drawBonus: 2, maxDraw: 12 },
    note: ("The cards say wait. If the Item to its left didn't fire, she throws out her whole " +
      "hand, then draws that many cards plus 2 next turn.")
  },
  w4_deck_board_snap: { id: 'w4_deck_board_snap', name: 'Boardwalk Stumble', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'parity', parity: 'even', mode: 'all' }, baseMult: 1,
    note: 'Needs all played cards Even. Stops short to read a map and everyone stumbles in an even line.' },
  w4_bilge_overheat: { id: 'w4_bilge_overheat', name: 'Burning Bilge Pump', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 13 }, flatAmount: 17, kind: 'burn',
    note: `Needs cards totaling ${SIGMA_TIP}13+. The pump motor finally cooks itself.` },
  w4_cargo_winch_snap: { id: 'w4_cargo_winch_snap', name: 'Dockmaster Blowup', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'sumExact', value: 16 }, flatAmount: 24, kind: 'burn',
    note: `Cards played must total exactly ${SIGMA_TIP}16. Screams so loud the overloaded winch motor sparks.` },
  opp_bascule_crush: { id: 'opp_bascule_crush', name: 'Bascule Crush', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 38 }, flatAmount: 46,
    note: `Needs cards totaling ${SIGMA_TIP}38+. The bridge deck slams shut.` },
  opp_warning_bell: { id: 'opp_warning_bell', name: 'Warning Bell', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 10, opponentEffect: 'stealFuel',
    note: 'Needs exactly 1 card. A small hit, and it siphons a bit of your fuel.' },

  // New mechanics: Hex, Ice, and Lightning items (available to the player from any world)
  hex_five_finger: {
    id: 'hex_five_finger', name: 'Five-Finger Discount', cost: 65, maxCards: 2, usesPerTurn: 1,
    usesPerTurnPerLevel: 1, minRow: 1, condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.1, kind: 'hex',
    note: 'Needs a Pair. Deals damage and pickpockets a card straight out of their hand.'
  },
  hex_black_market: {
    id: 'hex_black_market', name: 'Black Market Parts', cost: 110, maxCards: 3, usesPerTurn: 1,
    usesPerTurnPerLevel: 1, minRow: 2, condition: { type: 'colorCount', color: 'blk', count: 3 }, baseMult: 1.3,
    kind: 'hex',
    note: 'Needs 3+ Black cards. Deals damage and swipes a card off the black market - straight into your hand.'
  },
  hex_repo_switch: {
    id: 'hex_repo_switch', name: 'Repo Switcheroo', cost: 85, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 2, condition: { type: 'suitCount', suit: '♠', count: 2 }, baseMult: 1.2, kind: 'hex',
    note: 'Needs at least 2 Spades. Deals damage and swaps a card out of their hand before they notice.'
  },
  ice_coolant_burst: {
    id: 'ice_coolant_burst', name: 'Coolant Burst', cost: 75, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 1, condition: { type: 'pokerTier', tier: 1 }, baseMult: 0, kind: 'ice', freezeThreshold: 20,
    note: 'Needs a Pair. No damage - freezes one of their Items solid until they work it off.'
  },
  ice_ac_overload: {
    id: 'ice_ac_overload', name: 'AC Overload', cost: 125, maxCards: 3, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 2, condition: { type: 'straightLen', len: 3 }, baseMult: 0, kind: 'ice', freezeThreshold: 30,
    note: ('Needs a 3-card Straight (example: 6, 7, 8). No damage - freezes one of their Items ' +
      'solid until they work it off.')
  },
  ice_brake_chill: {
    id: 'ice_brake_chill', name: 'Frozen Brake Line', cost: 55, maxCards: 1, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 1, condition: { type: 'exactRank', rank: 2 }, baseMult: 0, kind: 'ice', freezeThreshold: 14,
    note: 'Needs a 2. No damage - freezes one of their Items solid until they work it off.'
  },
  zap_power_surge: {
    id: 'zap_power_surge', name: 'Power Surge', cost: 70, maxCards: 2, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 1, condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.9, kind: 'lightning',
    note: ('Needs a Pair. Damage is randomized between 25% and 100% power every time it fires - ' +
      'high risk, high reward.')
  },
  zap_short_circuit: {
    id: 'zap_short_circuit', name: 'Short Circuit', cost: 105, maxCards: 4, usesPerTurn: 1, usesPerTurnPerLevel: 1,
    minRow: 2, condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.8, kind: 'lightning',
    note: 'Needs Two Pair. Damage is randomized between 25% and 100% power every time it fires.'
  },
  zap_faulty_alternator: {
    id: 'zap_faulty_alternator', name: 'Faulty Alternator', cost: 45, maxCards: 1, usesPerTurn: 1,
    usesPerTurnPerLevel: 1, minRow: 1, condition: { type: 'any', exactCount: 1 }, flatAmount: 18, kind: 'lightning',
    note: 'Needs exactly 1 card. Damage is randomized between 25% and 100% power every time it fires.'
  },

  // World 1 (A1A Coastline) attacks - basic hits and armor only, no burn/poison/curse
  w1_pinch_attack: { id: 'w1_pinch_attack', name: 'Pinch Attack', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'parity', parity: 'odd', mode: 'all' }, baseMult: 1,
    note: 'Needs all played cards Odd. Snaps out from its stolen shell with an odd number of legs braced.' },
  w1_wild_swing: { id: 'w1_wild_swing', name: 'Wild Swing', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 10,
    note: 'Needs exactly 1 card. Swings the detector wildly, clips your bumper.' },
  w1_net_snare: { id: 'w1_net_snare', name: 'Wake Jump', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'any' }, baseMult: 1,
    note: 'Needs any card. Cuts across the lane and throws a wake at your fleet.' },
  w1_talon_dive: { id: 'w1_talon_dive', name: 'Talon Dive', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3 }, baseMult: 1,
    note: 'Needs Three of a Kind. Drops out of the sky, talons first.' },
  w1_wave_crash: { id: 'w1_wave_crash', name: 'Bottle Service', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 25 }, flatAmount: 32,
    note: `Needs cards totaling ${SIGMA_TIP}25+. Big Al sends the whole tab your way.` },
  w1_riptide_sweep: { id: 'w1_riptide_sweep', name: 'Entourage Rush', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 10,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays.' },

  // World 1 (A1A Coastline) attacks, round 2 - 10 more regulars for variety
  w1_moat_collapse: { id: 'w1_moat_collapse', name: 'Moat Collapse', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'straightLen', len: 3 }, baseMult: 1.8,
    note: `Needs a 3-card ${kw('Straight')} (example: 6, 7, 8). The moat wall gives way in one long crumbling line.` },
  w1_trap_snap: { id: 'w1_trap_snap', name: 'Trap Snap', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 8 }, flatAmount: 20,
    note: `Needs an 8 among your played cards. The trap only springs on the right size bait.` },
  w1_coconut_drop: { id: 'w1_coconut_drop', name: 'Coconut Drop', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 11,
    note: 'Needs exactly 1 card. Gravity does all the work.' },
  w1_chain_rattle: { id: 'w1_chain_rattle', name: 'Chain Rattle', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 3 }, baseMult: 1.2,
    note: `Needs 3+ ${kw('Black')} cards. The rusted links finally give way all at once.` },
  w1_anchor_drag: { id: 'w1_anchor_drag', name: 'Anchor Drag', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 8, noScaling: true,
    note: 'Needs exactly 1 card. Dead weight scrapes along the road.' },
  w1_shell_bump: { id: 'w1_shell_bump', name: 'Shell Bump', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'allSuits' }, flatAmount: 26,
    note: 'Needs one of each Suit (4 cards). Slow to line up, but that shell hits like a truck.' },
  w1_net_haul: { id: 'w1_net_haul', name: 'Seaweed Grab', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 9,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays. Drags you into the seaweed.' },

  // World 2 (Alligator Alley) attacks - roughly half poison, rest basic, no burn/curse
  w2_mosquito_cloud_bites: {
    id: 'w2_mosquito_cloud_bites', name: 'Cloud of Bites', maxCards: 5, usesPerTurn: 1, condition: { type: 'any' },
    perFaceCardDamage: 6, kind: 'poison',
    note: 'Needs any card. The whole cloud descends - damage scales with face cards (J/Q/K) played, all of it poison.'
  },
  w2_venomous_strike: { id: 'w2_venomous_strike', name: 'Venomous Strike', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 10, kind: 'poison',
    note: 'Needs exactly 1 card. Poison damage.' },
  w2_sucking_pull: { id: 'w2_sucking_pull', name: 'Ground Collapse', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♠', count: 2 }, baseMult: 1.15,
    note: 'Needs at least 2 Spades. The pavement gives out hardest where the ground runs dark.' },
  w2_fog_swarm_thicken: { id: 'w2_fog_swarm_thicken', name: 'Thickening Smoke', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 2 }, baseMult: 1.3, kind: 'poison',
    note: 'Needs 2+ Black cards. The smoke bank swells and settles in thicker. Poison damage.' },
  w2_tusk_charge: { id: 'w2_tusk_charge', name: 'Tusk Charge', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 12,
    note: 'Needs exactly 1 card. The whole herd scatters and charges.' },
  w2_sounder_stampede: { id: 'w2_sounder_stampede', name: 'Herd Stampede', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'straightLen', len: 3 }, baseMult: straightMult(3),
    note: 'Needs a 3-card Straight. The whole herd charges in a line.' },
  w2_root_trip: { id: 'w2_root_trip', name: 'Constrict', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 10 }, flatAmount: 16,
    note: 'Needs a 10 among your played cards. It only wraps a wheel at just the right height.' },
  w2_blood_drain: { id: 'w2_blood_drain', name: 'Blood Drain', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'parity', parity: 'odd', mode: 'all' }, baseMult: 1, kind: 'poison',
    note: 'Needs all played cards Odd. Poison damage.' },
  w2_swarming_bite: { id: 'w2_swarming_bite', name: 'Swarming Bite', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 20 }, flatAmount: 26, kind: 'poison',
    note: `Needs cards totaling ${SIGMA_TIP}20+. Poison damage.` },
  w2_fire_ant_mound_boil: { id: 'w2_fire_ant_mound_boil', name: 'Mound Boils Over', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 7, kind: 'burn',
    note: 'Needs any card. The whole mound erupts - damage scales with face cards (J/Q/K) played, all of it burn.' },
  w2_death_roll_frenzy: { id: 'w2_death_roll_frenzy', name: 'Death Roll Frenzy', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 26 }, flatAmount: 34,
    note: `Needs cards totaling ${SIGMA_TIP}26+. Its full-force roll.` },
  w2_venomous_maw: { id: 'w2_venomous_maw', name: 'Venomous Maw', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 3 }, baseMult: 1, kind: 'poison',
    note: 'Needs Three of a Kind. Poison damage.' },

  // World 2 (Alligator Alley) attacks, round 2 - 10 more regulars for variety
  w2_bullfrog_lunge: { id: 'w2_bullfrog_lunge', name: 'Toad Lunge', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 5 }, flatAmount: 16, kind: 'poison',
    note: 'Needs a 5. Poison damage - the toad only lunges at the right size prey.' },
  w2_fly_swarm_bite: { id: 'w2_fly_swarm_bite', name: 'Windshield Splatter', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 10 }, flatAmount: 13, kind: 'poison',
    note: `Needs cards totaling ${SIGMA_TIP}10+. Poison damage. They coat the windshield.` },
  w2_deer_fly_cloud_descend: { id: 'w2_deer_fly_cloud_descend', name: 'Swarm Descends', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.4, kind: 'poison',
    note: 'Needs a Pair. The whole swarm drops down at once. Poison damage.' },
  w2_rat_nest_swarm: { id: 'w2_rat_nest_swarm', name: 'Trash Raid', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'any' }, perFaceCardDamage: 8,
    note: 'Needs any card. Damage scales with how many face cards (J/Q/K) it plays. Tears through the trash.' },
  w2_sewer_rat_nest_swarm: { id: 'w2_sewer_rat_nest_swarm', name: 'Midnight Raid', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.5,
    note: 'Needs Two Pair. The whole gang piles out of the trash at once.' },
  w2_reed_snare: { id: 'w2_reed_snare', name: 'Sawgrass Slice', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♣', count: 3 }, flatAmount: 22, kind: 'poison',
    note: 'Needs at least 3 Clubs. Poison damage - the blades cut deep when there are enough of them.' },
  w2_canoe_ram: { id: 'w2_canoe_ram', name: 'Kayak Ram', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 16 }, flatAmount: 20,
    note: `Needs cards totaling ${SIGMA_TIP}16+. A rental kayak rides the wake straight into your fleet.` },
  w2_fever_microbe: { id: 'w2_fever_microbe', name: 'Heat Stroke', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'any', exactCount: 1 }, flatAmount: 8, kind: 'poison',
    note: 'Needs exactly 1 card. Poison damage. The sun beats down with no shade.' },

  // World 5 (Sunrise Industrial) attacks - Ice is the signature mechanic, Hex mixed in
  w5_forklift_freeze: { id: 'w5_forklift_freeze', name: 'Frozen Forks', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.1, kind: 'ice',
    note: 'Needs a Pair. The forks are frosted solid and freeze one of your Items for 2 turns on contact.' },
  w5_fog_chill: {
    id: 'w5_fog_chill', name: 'Ice Pack Slide', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'straightLen', len: 3 }, baseMult: 1.45, kind: 'ice',
    note: ('Needs a 3-card straight (example: 6, 7, 8). Melting ice packs send a freezing slick ' +
      'across the lane and freeze an Item solid.')
  },
  w5_door_freeze: { id: 'w5_door_freeze', name: 'Cooler Door Seal', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 3 }, baseMult: 1.3, kind: 'ice',
    note: 'Needs 3+ Black cards. The cooler door slams and seals an Item under a foot of frost.' },
  w5_wrap_snag: {
    id: 'w5_wrap_snag', name: 'Wrap Roll', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♦', count: 2 }, baseMult: 1.2, kind: 'hex',
    note: ('Needs at least 2 Diamonds. A giant ball of shrink wrap rolls over an Item and feeds ' +
      'a card back to the boulder.')
  },
  w5_scan_grab: { id: 'w5_scan_grab', name: 'Scanner Grab', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 7 }, flatAmount: 14, kind: 'hex',
    note: 'Needs a 7. The scanner gun flags one of your Items as misplaced inventory and grabs a card off it.' },
  w5_bot_grab: { id: 'w5_bot_grab', name: 'Stock Check', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.1, kind: 'hex',
    note: 'Needs a Pair. Walks up, counts an Item, and quietly walks off with a card.' },
  w5_arm_snatch: { id: 'w5_arm_snatch', name: 'Pallet Wrap Snatch', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'red', count: 3 }, baseMult: 1.3, kind: 'hex',
    note: 'Needs 3+ Red cards. The wrapper mis-wraps your gear and one card ends up on its pallet instead.' },
  w5_ammonia_fumes: { id: 'w5_ammonia_fumes', name: 'Ammonia Fumes', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 12 }, flatAmount: 16, kind: 'poison',
    note: `Needs cards totaling ${SIGMA_TIP}12+. Poison damage - a coolant line lets go right next to you.` },
  w5_coil_corrode: { id: 'w5_coil_corrode', name: 'Coil Frost Flake', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♣', count: 3 }, flatAmount: 20, kind: 'poison',
    note: 'Needs at least 3 Clubs. Poison damage - thick ice on the coil breaks loose in one bad breath.' },
  w5_compressor_blowout: { id: 'w5_compressor_blowout', name: 'Compressor Blowout', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumExact', value: 18 }, flatAmount: 27, kind: 'burn',
    note: `Cards played must total exactly ${SIGMA_TIP}18. The compressor finally cooks off in one loud burst.` },
  w5_panel_arc: {
    id: 'w5_panel_arc', name: 'Compressor Arc', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'cardIn', cards: [{ rank: 11, suit: '♣' }] }, flatAmount: 13, kind: 'burn',
    note: ('Needs the Jack of Clubs. Burn damage - a blown compressor only ever picks the worst ' +
      'possible moment to arc.')
  },
  w5_catwalk_slip: { id: 'w5_catwalk_slip', name: 'Wet Floor Slip', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 5 }, flatAmount: 13, kind: 'ice',
    note: 'Needs a 5. An unmarked wet floor freezes an Item before you can catch your balance.' },
  w5_frost_seal: { id: 'w5_frost_seal', name: 'Frost Door Seal', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.35, kind: 'ice',
    note: 'Needs Two Pair. The roll-up door freezes mid-close and seals an Item shut with it.' },
  w5_naynay_mind_games: { id: 'w5_naynay_mind_games', name: 'Mind Games', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.3,
    note: 'Needs a Pair. She knows exactly what you were thinking, and uses it.' },
  w5_logi_bear_roundhouse: { id: 'w5_logi_bear_roundhouse', name: 'Roundhouse Kick', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 20 }, flatAmount: 24,
    note: 'Needs cards totaling 20 or higher. A spinning kick from a bear with a black belt.' },
  ee_logi_bear_roundhouse: { id: 'ee_logi_bear_roundhouse', name: 'Roundhouse Kick', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 14 }, flatAmount: 14,
    note: 'Needs cards totaling 14 or higher. A spinning kick from a bear with a black belt.' },
  w5_freezer_gust: {
    id: 'w5_freezer_gust', name: 'Walk-In Freezer Gust', maxCards: 4, usesPerTurn: 1, condition: { type: 'allSuits' },
    flatAmount: 32, kind: 'ice',
    note: ('Needs one of each Suit (4 cards). Slow to line up, but the door opens on a full ' +
      'blast that freezes an Item solid.')
  },
  w5_machine_jam: { id: 'w5_machine_jam', name: 'Ice Machine Jam', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♠', count: 2 }, baseMult: 1.2, kind: 'ice',
    note: 'Needs at least 2 Spades. It jams, sprays cubes everywhere, and freezes an Item in the mess.' },
  w5_elite_cryo_blast: { id: 'w5_elite_cryo_blast', name: 'Cryo-Compressor Blast', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.5, kind: 'ice',
    note: 'Needs Two Pair. The whole compressor unit vents at once and freezes an Item hard.' },
  w5_elite_cryo_slam: { id: 'w5_elite_cryo_slam', name: 'Cryo-Compressor Slam', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 18 }, flatAmount: 26,
    note: `Needs cards totaling ${SIGMA_TIP}18+. Industrial-grade, and it hits like it.` },
  w5_elite_ai_hex: { id: 'w5_elite_ai_hex', name: 'Rerouted Shipment', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'blk', count: 3 }, baseMult: 1.35, kind: 'hex',
    note: 'Needs 3+ Black cards. A tired worker reroutes one of your Items onto the wrong pallet and keeps a card.' },
  w5_elite_ai_purge: {
    id: 'w5_elite_ai_purge', name: 'Coolant Dump', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 14 }, flatAmount: 20, kind: 'poison',
    note: (`Needs cards totaling ${SIGMA_TIP}14+. Poison damage - a tired worker pulls the wrong ` +
      `lever and vents the whole coolant loop.`)
  },
  w5_boss_deepfreeze: { id: 'w5_boss_deepfreeze', name: 'Deep Freeze Purge', maxCards: 5, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 24 }, flatAmount: 34, kind: 'ice',
    note: `Needs cards totaling ${SIGMA_TIP}24+. The freezer door slams shut and the cold locks an Item in ice.` },
  w5_boss_coldsnap_hex: {
    id: 'w5_boss_coldsnap_hex', name: 'Cold Snap Repossession', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.6, kind: 'hex',
    note: ('Needs Two Pair. The Walk-In Walker has been in there a long time, and it takes a ' +
      'card off an Item for itself.')
  },

  // World 6 (Las Olas Boulevard) attacks - Lightning is the signature mechanic, Hex and Curse mixed in
  w6_umbrella_flip: { id: 'w6_umbrella_flip', name: 'Riderless Roll', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 8 }, flatAmount: 11,
    note: `Needs cards totaling ${SIGMA_TIP}8+. A bicycle with nobody on it rolls straight into your lane.` },
  w6_streetlight_arc: {
    id: 'w6_streetlight_arc', name: 'Streetlight Arc', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.9, kind: 'lightning',
    note: ('Needs a Pair. Damage is randomized between 25% and 100% power every time it fires - ' +
      'a live wire whipping in the wind.')
  },
  w6_lights_short: {
    id: 'w6_lights_short', name: 'Vespa Zip', maxCards: 1, usesPerTurn: 1, condition: { type: 'exactRank', rank: 3 },
    flatAmount: 22, kind: 'lightning',
    note: ('Needs a 3. Damage is randomized between 25% and 100% power every time it fires. Cuts ' +
      'through traffic and clips you at full speed.')
  },
  w6_alarm_shock: {
    id: 'w6_alarm_shock', name: 'Shopping Bag Swing', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♥', count: 2 }, baseMult: 2.0, kind: 'lightning',
    note: ('Needs at least 2 Hearts. Damage is randomized between 25% and 100% power every time ' +
      'it fires. Swings a pile of shopping bags with everything she has.')
  },
  w6_charger_surge: {
    id: 'w6_charger_surge', name: 'EV Charger Surge', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 2.0, kind: 'lightning',
    note: ('Needs Two Pair. Damage is randomized between 25% and 100% power every time it fires. ' +
      'The cable arcs the second it catches rain.')
  },
  w6_line_arc: {
    id: 'w6_line_arc', name: 'Downed Power Line Arc', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'straightLen', len: 3 }, baseMult: 2.5, kind: 'lightning',
    note: ('Needs a 3-card straight (example: 6, 7, 8). Damage is randomized between 25% and ' +
      '100% power every time it fires - the line is still live and whipping across the road.')
  },
  w6_signal_flicker: {
    id: 'w6_signal_flicker', name: 'Signal Blackout', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'colorCount', color: 'red', count: 2 }, baseMult: 1.9, kind: 'lightning',
    note: ('Needs 2+ Red cards. Damage is randomized between 25% and 100% power every time it ' +
      'fires. Every bulb goes dark at once, then flares back up.')
  },
  w6_laser_grab: {
    id: 'w6_laser_grab', name: 'Velvet Rope Grab', maxCards: 4, usesPerTurn: 1, condition: { type: 'allSuits' },
    flatAmount: 30, kind: 'hex', startArmor: 15,
    note: ('Needs one of each Suit (4 cards). Slow to get going, but he stops an Item at the ' +
      'rope and keeps a card for himself.')
  },
  w6_con_swindle: {
    id: 'w6_con_swindle', name: 'Sales Pitch', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'cardIn', cards: [{ rank: 13, suit: '♥' }] }, flatAmount: 14, kind: 'hex',
    note: ('Needs the King of Hearts. The pitch only works on that one card, but when it lands ' +
      'he walks off with a card of yours.')
  },
  w6_ticket_switch: { id: 'w6_ticket_switch', name: 'Valet Ticket Switch', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'suitCount', suit: '♣', count: 2 }, baseMult: 1.2, kind: 'hex',
    note: 'Needs at least 2 Clubs. Hands you back the wrong ticket, and somehow a card of yours besides.' },
  w6_awning_strike: {
    id: 'w6_awning_strike', name: 'Lightning-Struck Awning', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 14 }, flatAmount: 30, kind: 'lightning',
    note: (`Needs cards totaling ${SIGMA_TIP}14+. Damage is randomized between 25% and 100% ` +
      `power every time it fires. A direct strike sends the whole frame down.`)
  },
  w6_ac_arc: {
    id: 'w6_ac_arc', name: 'Cart Battery Arc', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'parity', parity: 'even', mode: 'all' }, baseMult: 1.8, kind: 'lightning',
    note: ('Needs all played cards Even. Damage is randomized between 25% and 100% power every ' +
      'time it fires. The battery shorts and drops sparks across the lane.')
  },
  w6_drain_curse: {
    id: 'w6_drain_curse', name: 'Storm Drain Whirlpool', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 12 }, flatAmount: 16, kind: 'curse',
    note: (`Needs cards totaling ${SIGMA_TIP}12+. Something about a whirlpool swallowing your ` +
      `hubcap curses one of your Items.`)
  },
  w6_meter_curse: {
    id: 'w6_meter_curse', name: 'Broken Meter Curse', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'cardIn', cards: [{ rank: 12, suit: '♦' }] }, flatAmount: 13, kind: 'curse',
    note: ('Needs the Queen of Diamonds. Overstay a meter that\'s already broken and something ' +
      'old and petty curses an Item.')
  },
  w6_neon_flicker: {
    id: 'w6_neon_flicker', name: 'Speaker Feedback', maxCards: 1, usesPerTurn: 1,
    condition: { type: 'exactRank', rank: 9 }, flatAmount: 23, kind: 'lightning',
    note: ('Needs a 9. Damage is randomized between 25% and 100% power every time it fires. The ' +
      'speaker feeds back and everything cuts loose all at once.')
  },
  w6_elite_van_bolt: {
    id: 'w6_elite_van_bolt', name: 'Live Shot Bolt', maxCards: 4, usesPerTurn: 2,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 2.0, kind: 'lightning',
    note: ('Needs Two Pair. Damage is randomized between 25% and 100% power every time it fires. ' +
      'The van\'s own mast rig takes a direct hit and redirects it at you - and can fire twice in one turn.')
  },
  w6_elite_thief_curse: { id: 'w6_elite_thief_curse', name: 'Fake Handoff', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 1 }, baseMult: 1.15, kind: 'curse',
    note: 'Needs a Pair. Leaves a fake behind, and it curses one of your Items on the way out.' },
  w6_boss_lightning_barrage: {
    id: 'w6_boss_lightning_barrage', name: 'Afternoon Barrage', maxCards: 5, usesPerTurn: 2,
    condition: { type: 'sumThreshold', min: 24 }, flatAmount: 56, kind: 'lightning',
    note: (`Needs cards totaling ${SIGMA_TIP}24+. Damage is randomized between 25% and 100% ` +
      `power every time it fires. The whole boulevard goes white for a second - and it can strike twice in the same turn.`)
  },
  w6_boss_static_curse: {
    id: 'w6_boss_static_curse', name: 'Afternoon Static Curse', maxCards: 4, usesPerTurn: 1,
    condition: { type: 'pokerTier', tier: 2 }, baseMult: 1.6, kind: 'curse',
    note: 'Needs Two Pair. The static charge alone is enough to curse one of your Items before the thunder even hits.'
  },

  // ---- Easter egg opponents (flat item damage, see EASTER_EGG_OPPONENTS) ----
  ee_brett_full_throttle: { id: 'ee_brett_full_throttle', name: 'Full Throttle', maxCards: 2, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 9 }, flatAmount: 12,
    note: `Needs cards totaling ${SIGMA_TIP}9+. Guns it like he's back on the track, hardware and all.` },
  ee_chris_reel_in: { id: 'ee_chris_reel_in', name: 'Getcha Filled Up', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 7 }, baseMult: 0,
    drawAmount: 2, drawPerLevel: 0,
    note: `Needs cards totaling ${SIGMA_TIP}7+. Reels in the slack and casts two more lines immediately.` },
  ee_chelsy_filing_frenzy: {
    id: 'ee_chelsy_filing_frenzy', name: 'Filing Frenzy', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 7 }, baseMult: 0, drawAmount: 1, drawPerLevel: 0,
    note: (`Needs cards totaling ${SIGMA_TIP}7+. Clears an entire inbox before you've finished ` +
      `your coffee. Draws 1 card immediately.`)
  },
  ee_drew_one_more_thing: {
    id: 'ee_drew_one_more_thing', name: 'One More Thing', maxCards: 3, usesPerTurn: 1,
    condition: { type: 'sumThreshold', min: 8 }, baseMult: 0, drawAmount: 1, drawPerLevel: 0,
    note: (`Needs cards totaling ${SIGMA_TIP}8+. Just one more agenda item before the meeting ` +
      `can end. Draws 1 card immediately.`)
  },
};
