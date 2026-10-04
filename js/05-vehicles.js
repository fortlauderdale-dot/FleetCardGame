// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Vehicles                                                                      ██
// ██  The starting vehicles, ordered from everyday fleet vehicles up to emergency rigs.██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// prettier-ignore
const HEROES = {
  sidebyside:   {
    id: 'sidebyside', name: 'Golf Cart', icon: '🛺', image: 'Vehicles/golf-cart.png',
    starterItems: ['fender_bender','guard_rail']
  },
  admin:        {
    id: 'admin', name: 'Admin Vehicle', icon: '🚗', image: 'Vehicles/admin-vehicle.png',
    starterItems: ['fender_bender','diamond_draw'], travelCoinCost: 5, startBonusCoins: 20,
    perk: ('No fuel tank. Every stop costs 5 coins instead of fuel, and fuel rewards pay out as ' +
      'coins (5 coins per fuel). Starts with 20 extra coins.')
  },
  beachtractor: {
    id: 'beachtractor', name: 'Beach Tractor', icon: '🚜', image: 'Vehicles/beach-tractor.png',
    starterItems: ['taylor_sift','sand_trap']
  },
  interstate:   {
    id: 'interstate', name: 'Work Truck', icon: '🏁', image: 'Vehicles/work-truck.png',
    starterItems: ['card_draw','diamond_run']
  },
  forklift:     {
    id: 'forklift', name: 'Forklift', icon: '🏗️', image: 'Vehicles/forklift.png',
    starterItems: ['pallet_drop','full_pallet']
  },
  convoy:       {
    id: 'convoy', name: 'Large SUV', icon: '🚙', image: 'Vehicles/large-suv.png',
    starterItems: ['roof_rack','triple_threat']
  },
  towtruck:     {
    id: 'towtruck', name: 'Tow Truck', icon: '🚨', image: 'Vehicles/tow-truck.png',
    starterItems: ['drawstone','starter_black_tap']
  },
  tanker:       {
    id: 'tanker', name: 'Fuel Tanker', icon: '⛽', image: 'Vehicles/fuel-tanker.png',
    starterItems: ['hose_slam','toxic_flood']
  },
  crownvic:     {
    id: 'crownvic', name: 'Crown Vic', icon: '🚔', image: 'Vehicles/crown-vic.png',
    starterItems: ['hot_pursuit','donut_break']
  },
  firetruck:    {
    id: 'firetruck', name: 'Fire Truck', icon: '🚒', image: 'Vehicles/fire-truck.png',
    starterItems: ['backdraft_blast','full_pressure_hose']
  },
  arff:         {
    id: 'arff', name: 'ARFF', icon: '🧯', image: 'Vehicles/arff.png',
    starterItems: ['afff_foam_cannon','starter_red_tap']
  },
  bearcat:      {
    id: 'bearcat', name: 'BearCat', icon: '🛡️', image: 'Vehicles/bearcat.png',
    starterItems: ['door_breach_ram','grappler_hook']
  },
  // ---- Expansion vehicles ----
  mower:        {
    id: 'mower', name: 'Riding Mower', icon: '🌿', image: 'Vehicles/riding-mower.png',
    starterItems: ['mower_trim','grass_catcher']
  },
  beachatv:     {
    id: 'beachatv', name: 'Beach Rescue ATV', icon: '🏖️', image: 'Vehicles/beach-rescue-atv.png',
    starterItems: ['stretcher_run','sand_dash']
  },
  harley:       {
    id: 'harley', name: 'Police Motorcycle', icon: '🏍️', image: 'Vehicles/police-motorcycle.png',
    starterItems: ['wheelie_strike','traffic_stop']
  },
  bobcat:       {
    id: 'bobcat', name: 'Skid Steer', icon: '🛠️', image: 'Vehicles/skid-steer.png',
    starterItems: ['bucket_jab','push_back']
  },
  backhoe:      {
    id: 'backhoe', name: 'Backhoe', icon: '⛏️', image: 'Vehicles/backhoe.png',
    starterItems: ['bucket_scoop','hydraulic_slam']
  },
  dumptruck:    {
    id: 'dumptruck', name: 'Dump Truck', icon: '🚛', image: 'Vehicles/dump-truck.png',
    starterItems: ['heavy_load','gravel_drop']
  },
  garbagetruck: {
    id: 'garbagetruck', name: 'Garbage Truck', icon: '♻️', image: 'Vehicles/garbage-truck.png',
    starterItems: ['compactor','dumpster_dive']
  },
  washer:       {
    id: 'washer', name: 'Pressure Washer Truck', icon: '🚿', image: 'Vehicles/pressure-washer-truck.png',
    starterItems: ['pressure_washer','soap_spray']
  },
  grapple:      {
    id: 'grapple', name: 'Grapple Truck', icon: '🪝', image: 'Vehicles/grapple-truck.png',
    starterItems: ['grapple_haul','claw_drop']
  },
  oceanrescue:  {
    id: 'oceanrescue', name: 'Ocean Rescue Truck', icon: '🏄', image: 'Vehicles/ocean-rescue-truck.png',
    starterItems: ['surfboard_smack','life_ring']
  },
  highwater:    {
    id: 'highwater', name: 'High Water Rescue Truck', icon: '🌊', image: 'Vehicles/high-water-truck.png',
    starterItems: ['flood_wake','rescue_boat']
  },
  ambulance:    {
    id: 'ambulance', name: 'Ambulance', icon: '🚑', image: 'Vehicles/ambulance.png',
    starterItems: ['defibrillator','adrenaline_drip']
  },
};
// prettier-ignore
const VEHICLE_SPECIALS = {
  sidebyside:   {
    name: 'Quick Shield', type: 'shield', energyPerUnit: 4, amountPerUnit: 20,
    desc: 'Spend 4 Energy for +20 armor. Use it as many times as you have Energy.'
  },
  admin:        {
    name: 'Expense Report', type: 'coins', energyPerUnit: 6, amountPerUnit: 8,
    desc: ('Spend 6 Energy to file expenses and get 8 coins back. Use it as many times as you ' +
      'have Energy. Helps pay for your 5 coin stops.')
  },
  beachtractor: {
    name: 'Sift the Sand', type: 'reroll', energyPerUnit: 4, amountPerUnit: 0,
    desc: ('Spend 4 Energy to throw your whole hand back and draw the same number of fresh ' +
      'cards. Use it as many times as you have Energy to dig for the hand you need.')
  },
  interstate:   {
    name: 'Overtime', type: 'overtime', energyCost: 8,
    desc: ('Spend 8 Energy to put in overtime. Every Item you own can fire one extra time this ' +
      'turn. Save your cards for a big double turn.')
  },
  forklift:     {
    name: 'Reach Truck', type: 'draw', energyPerUnit: 3, amountPerUnit: 1,
    desc: ('Spend 3 Energy to draw 1 card. Use it as many times as you have Energy to fill up ' +
      'the 5 cards Full Pallet needs.')
  },
  convoy:       {
    name: 'Limp Home', type: 'revive', amountPerUnit: 50,
    desc: ('Once per run. When you would be defeated, you can choose to get back up with half ' +
      'your health and every effect cleared. It never happens on its own, so you decide.')
  },
  towtruck:     {
    name: 'Salvage Run', type: 'gem', energyPerUnit: 6, amountPerUnit: 1,
    desc: 'Spend 6 Energy to salvage 1 gem. Use it as many times as you have Energy. Gems draw extra cards in battle.'
  },
  tanker:       {
    name: 'Hose Down', type: 'cleanse', energyPerUnit: 5, amountPerUnit: 0,
    desc: ('Spend 5 Energy to wash every effect off your Items. Removes freezes, burns, curses ' +
      'and hexes from your Item cards and clears any poison on you.')
  },
  crownvic:     {
    name: 'Code 3 Evade', type: 'dodge', energyCost: 5, chance: 0.6,
    desc: 'Spend 5 Energy for a 60% chance to dodge the opponent\'s next attack entirely.'
  },
  firetruck:    {
    name: 'Emergency Response', type: 'heal', energyPerUnit: 5, amountPerUnit: 25,
    desc: 'Spend 5 Energy to heal 25 health. Use it as many times as you have Energy.'
  },
  arff:         {
    name: 'Foam Blanket', type: 'cleanse', energyPerUnit: 6, amountPerUnit: 35,
    desc: ('Spend 6 Energy to smother every effect on you and gain +35 armor. Removes freezes, ' +
      'burns, curses and hexes from your Item cards and clears any poison on you.')
  },
  bearcat:      {
    name: 'Armor Plating', type: 'shield', energyPerUnit: 3, amountPerUnit: 30,
    desc: 'Spend 3 Energy for +30 armor. Use it as many times as you have Energy.'
  },
  mower:        {
    name: 'Lawn Job', type: 'coins', energyPerUnit: 5, amountPerUnit: 6,
    desc: 'Spend 5 Energy to mow a side job for 6 coins. Use it as many times as you have Energy.'
  },
  beachatv:     {
    name: 'Beach Rescue', type: 'heal', energyPerUnit: 4, amountPerUnit: 12,
    desc: 'Spend 4 Energy to patch yourself up for 12 health. Use it as many times as you have Energy.'
  },
  harley:       {
    name: 'Weave', type: 'dodge', energyCost: 3, chance: 0.6,
    desc: 'Spend 3 Energy for a 60% chance to weave around the opponent\'s next attack entirely.'
  },
  bobcat:       {
    name: 'Skid Turn', type: 'weaken', energyCost: 4, amountPerUnit: 50,
    desc: 'Spend 4 Energy to spin out of the way. The opponent\'s attacks hit 50% softer until your next turn.'
  },
  backhoe:      {
    name: 'Hydraulic Charge', type: 'charge', energyPerUnit: 5, amountPerUnit: 2,
    desc: 'Spend 5 Energy to charge the hydraulics. Your next attack deals double damage.'
  },
  dumptruck:    {
    name: 'Dump Load', type: 'dump', energyPerUnit: 5, amountPerUnit: 0.9,
    desc: ('Spend 5 Energy to dump your whole hand on the opponent. You deal 90% of the total ' +
      'value of the cards you threw away, so a full hand is a big hit.')
  },
  garbagetruck: {
    name: 'Compact and Collect', type: 'reroll', energyPerUnit: 4, amountPerUnit: 0, armor: 10,
    desc: 'Spend 4 Energy to crush your hand and draw the same number of fresh cards. You also gain +10 armor.'
  },
  washer:       {
    name: 'Rinse', type: 'cleanse', energyPerUnit: 4, amountPerUnit: 0,
    desc: ('Spend 4 Energy to wash every effect off your Items. Removes freezes, burns, curses ' +
      'and hexes from your Item cards and clears any poison on you.')
  },
  grapple:      {
    name: 'Grapple Scout', type: 'scout', energyPerUnit: 3, amountPerUnit: 1,
    desc: ('Spend 3 Energy to hook the opponent\'s hand and flip every card in it face up, and ' +
      'pull 1 extra card into your own hand.')
  },
  oceanrescue:  {
    name: 'Lifeguard Save', type: 'heal', energyPerUnit: 5, amountPerUnit: 20, cleanse: true,
    desc: 'Spend 5 Energy to heal 20 health and wash every effect off you and your Items.'
  },
  highwater:    {
    name: 'Raise the Water', type: 'weaken', energyCost: 6, amountPerUnit: 70,
    desc: 'Spend 6 Energy to flood the road. The opponent\'s attacks hit 70% softer until your next turn.'
  },
  ambulance:    {
    name: 'Emergency Care', type: 'heal', energyPerUnit: 5, amountPerUnit: 35,
    desc: ('Spend 5 Energy to heal 35 health. Use it as many times as you have Energy to keep ' +
      'paying for the Defibrillator.')
  },

};
// Everything that can be sitting on you or your Items: freezes, burns, curses, hexes and poison.
function playerHasEffects() {
  const b = BATTLE;
  if (!b) return false;
  return !!(
    Object.keys(b.itemFrozen || {}).length ||
    Object.keys(b.itemBurns || {}).length ||
    Object.keys(b.itemCurses || {}).length ||
    Object.keys(b.itemHexes || {}).length ||
    (b.playerPoison || []).length
  );
}
function clearPlayerEffects() {
  const b = BATTLE,
    out = [];
  if (Object.keys(b.itemFrozen || {}).length) {
    out.push('freezes');
    b.itemFrozen = {};
  }
  if (Object.keys(b.itemBurns || {}).length) {
    out.push('burns');
    b.itemBurns = {};
    b.itemBurnStep = {};
    b.itemBurnFresh = {};
  }
  if (Object.keys(b.itemCurses || {}).length) {
    out.push('curses');
    b.itemCurses = {};
  }
  if (Object.keys(b.itemHexes || {}).length) {
    out.push('hexes');
    b.itemHexes = {};
    b.pendingHexSteal = [];
  }
  if ((b.playerPoison || []).length) {
    out.push('poison');
    b.playerPoison = [];
  }
  return out;
}
// Head-start perks. startEnergy fills the Energy bar when the run begins, so abilities work in the first fights.
// battleArmor is free armor you begin every fight with.
const HERO_PERKS = {
  admin: { startEnergy: 6 },
  beachtractor: { startEnergy: 4, battleArmor: 15 },
  interstate: { startEnergy: 8, battleArmor: 10 },
  forklift: { startEnergy: 9, battleArmor: 12 },
  convoy: { battleArmor: 20 },
  towtruck: { startEnergy: 6, battleArmor: 10 },
  tanker: { startEnergy: 5, battleArmor: 10 },
  crownvic: { startEnergy: 5 },
  firetruck: { startEnergy: 5 },
  arff: { startEnergy: 10, battleArmor: 45 },
  bearcat: { battleArmor: 15 },
  mower: { startEnergy: 5, battleArmor: 10 },
  beachatv: { startEnergy: 3 },
  harley: { startEnergy: 6 },
  bobcat: { startEnergy: 4, battleArmor: 10 },
  backhoe: { startEnergy: 5 },
  dumptruck: { startEnergy: 6, battleArmor: 15 },
  garbagetruck: { startEnergy: 4, battleArmor: 15 },
  washer: { startEnergy: 8, battleArmor: 15 },
  grapple: { startEnergy: 6 },
  oceanrescue: { startEnergy: 5, battleArmor: 10 },
  highwater: { startEnergy: 6, battleArmor: 20 },
  ambulance: { startEnergy: 10 },
};
function heroPerkLine(id) {
  const k = HERO_PERKS[id];
  if (!k) return '';
  const parts = [];
  if (k.battleArmor) parts.push(`Start every fight with ${k.battleArmor} armor.`);
  if (k.startEnergy) parts.push(`Start the run with ${k.startEnergy} Energy.`);
  return parts.join(' ');
}
// One-time revive (Large SUV). Shows an in-game pop-up the first time you fall in a run. Returns true when it
// took over (the pop-up is up and one of its buttons finishes the job), false when there is nothing to offer.
// afterRevive runs once the player says yes; saying no ends the fight as a loss.
function offerRevive(afterRevive) {
  const sp = RUN && RUN.hero ? VEHICLE_SPECIALS[RUN.hero.heroId] : null;
  if (!sp || sp.type !== 'revive' || RUN.reviveUsed || !IN_BATTLE || !BATTLE) return false;
  const hp = Math.max(1, Math.round((RUN.maxHealth * sp.amountPerUnit) / 100));
  const old = document.getElementById('revivePopup');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = 'revivePopup';
  box.innerHTML =
    `<div class="map-popup-overlay"><div class="wo" style="max-width:380px"><div class="wo-stripe"></div>` +
    `<div class="wo-body" style="text-align:center"><div class="wo-eyebrow">Defeated</div>` +
    `<h1>${sp.name}</h1>` +
    `<p class="note">Get back up with ${hp} health and every effect cleared? You can only do this once per run.</p>` +
    `<button class="wo-btn teal" id="reviveYesBtn" style="width:100%;margin-bottom:8px">Get Back Up</button>` +
    `<button class="wo-btn gray" id="reviveNoBtn" style="width:100%">Accept Defeat</button>` +
    `</div></div></div>`;
  document.body.appendChild(box);
  document.getElementById('reviveYesBtn').onclick = () => {
    box.remove();
    RUN.reviveUsed = true;
    RUN.health = hp;
    clearPlayerEffects();
    BATTLE.dodgeChance = 0;
    battleLog(`${sp.name}! You get back up with ${hp} health and every effect cleared.`);
    playSfx('heal');
    flashScreen('heal');
    saveRun();
    if (afterRevive) afterRevive();
  };
  document.getElementById('reviveNoBtn').onclick = () => {
    box.remove();
    IN_BATTLE = false;
    clearBattleSave();
    playSfx('lose');
    render(nodeResultScreen(false, { lastHit: BATTLE.lastHit }));
  };
  return true;
}
function useVehicleSpecial() {
  if (!IN_BATTLE || !BATTLE) return;
  if ((VEHICLE_SPECIALS[RUN.hero.heroId] || {}).type === 'revive') return;
  const special = VEHICLE_SPECIALS[RUN.hero.heroId];
  if (!special) return;
  if (special.type === 'dodge') {
    if (RUN.energy < special.energyCost) {
      battleLog(`Not enough Energy for ${special.name} ` + `(needs ${special.energyCost}).`);
      render(battleScreen());
      return;
    }
    RUN.energy -= special.energyCost;
    BATTLE.dodgeChance = special.chance;
    battleLog(`${special.name}! ${Math.round(special.chance * 100)}% chance to dodge the opponent's next attack.`);
    playSfx('shield');
    flashScreen('shield');
  } else if (special.type === 'weaken') {
    if (RUN.energy < special.energyCost) {
      battleLog(`Not enough Energy for ${special.name} ` + `(needs ${special.energyCost}).`);
      render(battleScreen());
      return;
    }
    if (BATTLE.weaken) {
      battleLog(`${special.name} is already active, so no Energy was spent.`);
      render(battleScreen());
      return;
    }
    RUN.energy -= special.energyCost;
    BATTLE.weaken = special.amountPerUnit / 100;
    battleLog(`${special.name}! The opponent's next attacks hit ${special.amountPerUnit}% softer.`);
    playSfx('shield');
    flashScreen('shield');
  } else if (special.type === 'overtime') {
    if (RUN.energy < special.energyCost) {
      battleLog(`Not enough Energy for ${special.name} ` + `(needs ${special.energyCost}).`);
      render(battleScreen());
      return;
    }
    if (BATTLE.overtime) {
      battleLog(`${special.name} is already running this turn, so no Energy was spent.`);
      render(battleScreen());
      return;
    }
    RUN.energy -= special.energyCost;
    BATTLE.overtime = true;
    battleLog(`${special.name}! Every Item can fire one extra time this turn.`);
    playSfx('shield');
    flashScreen('shield');
  } else if (special.type === 'refuel') {
    if (RUN.energy < special.energyCost) {
      battleLog(`Not enough Energy for ${special.name} ` + `(needs ${special.energyCost}).`);
      render(battleScreen());
      return;
    }
    RUN.energy -= special.energyCost;
    const before = RUN.fuel;
    RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + special.amountPerUnit);
    battleLog(`${special.name}! Spent ${special.energyCost} Energy to refill ${RUN.fuel - before} fuel.`);
    playSfx('heal');
    flashScreen('heal');
  } else {
    const cost = special.energyPerUnit;
    const amount = special.amountPerUnit;
    if (RUN.energy < cost) {
      battleLog(`Not enough Energy for ${special.name} (needs ${cost} per use).`);
      render(battleScreen());
      return;
    }
    // Don't spend Energy on something that would do nothing.
    if (special.type === 'gem' && RUN.gems >= RUN.maxGems) {
      battleLog(
        `${special.name}: your gems are already full ` + `(${RUN.gems}/${RUN.maxGems}), so no Energy was spent.`
      );
      render(battleScreen());
      return;
    }
    if (special.type === 'draw' && BATTLE.hand.length >= RUN.handSize) {
      battleLog(`${special.name}: your hand is already full, so no ` + `Energy was spent.`);
      render(battleScreen());
      return;
    }
    if (special.type === 'charge' && BATTLE.charge) {
      battleLog(`${special.name} is already charged, so no Energy was ` + `spent.`);
      render(battleScreen());
      return;
    }
    if (special.type === 'dump' && !BATTLE.hand.length) {
      battleLog(`${special.name}: your hand is empty, so no Energy was ` + `spent.`);
      render(battleScreen());
      return;
    }
    if (special.type === 'scout' && !BATTLE.oppPool.some((c) => !c.revealed) && BATTLE.hand.length >= RUN.handSize) {
      battleLog(`${special.name}: nothing hidden to see, so no Energy ` + `was spent.`);
      render(battleScreen());
      return;
    }
    if (special.type === 'cleanse' && !playerHasEffects()) {
      battleLog(`${special.name}: nothing to clean off, so no Energy ` + `was spent.`);
      render(battleScreen());
      return;
    }
    if (special.type === 'reroll' && !BATTLE.hand.length) {
      battleLog(`${special.name}: your hand is empty, so no Energy was ` + `spent.`);
      render(battleScreen());
      return;
    }
    if (special.type === 'heal' && RUN.health >= RUN.maxHealth) {
      battleLog(`${special.name}: your health is already full, so no ` + `Energy was spent.`);
      render(battleScreen());
      return;
    }
    RUN.energy -= cost;
    if (special.type === 'shield') {
      BATTLE.playerArmor += amount;
      battleLog(`${special.name}! Spent ${cost} Energy for +${amount} armor.`);
      playSfx('shield');
      flashScreen('shield');
    } else if (special.type === 'heal') {
      const before = RUN.health;
      RUN.health = Math.min(RUN.maxHealth, RUN.health + amount);
      const cleared = special.cleanse ? clearPlayerEffects() : [];
      battleLog(
        `${special.name}! Spent ${cost} Energy to heal ${RUN.health - before} ` +
          `health${cleared.length ? ` and clear ${cleared.join(', ')}` : ''}.`
      );
      playSfx('heal');
      flashScreen('heal');
    } else if (special.type === 'charge') {
      BATTLE.charge = amount;
      battleLog(`${special.name}! Your next attack deals ${amount}x damage.`);
      playSfx('shield');
      flashScreen('shield');
    } else if (special.type === 'scout') {
      BATTLE.oppPool.forEach((c) => {
        c.revealed = true;
      });
      let hooked = 0;
      if (amount && BATTLE.hand.length < RUN.handSize) {
        const before = BATTLE.hand.length;
        drawCards(amount, false);
        hooked = BATTLE.hand.length - before;
        resortHandAndRelink(RUN.handSortMode);
      }
      battleLog(
        `${special.name}! Every card in ${BATTLE.opponent.name}'s hand is now face ` +
          `up${hooked ? ` and you hook ${hooked} card${hooked === 1 ? '' : 's'} ` + `for your own hand` : ''}.`
      );
      playSfx('shield');
      flashScreen('shield');
    } else if (special.type === 'dump') {
      const total = BATTLE.hand.reduce((a, c) => a + cardValue(c.rank), 0);
      const dmg = Math.round(total * amount);
      BATTLE.discard.push(...BATTLE.hand);
      BATTLE.hand = [];
      BATTLE.slots = {};
      BATTLE.usedThisTurn = new Set();
      selectedIdx = [];
      let toApply = dmg,
        absorbed = 0;
      if (BATTLE.opponent.armor > 0) {
        absorbed = Math.min(BATTLE.opponent.armor, toApply);
        BATTLE.opponent.armor -= absorbed;
        toApply -= absorbed;
      }
      BATTLE.opponent.hpNow = Math.max(0, BATTLE.opponent.hpNow - toApply);
      battleLog(
        `${special.name}! Spent ${cost} Energy to dump your whole hand (${total} total) ` +
          `for ${dmg} damage${absorbed ? ` (${absorbed} blocked by their ` + `armor)` : ''}.`
      );
      playSfx('shield');
      flashScreen('hit-opponent');
      if (BATTLE.opponent.hpNow <= 0) {
        saveRun();
        winBattle();
        return;
      }
    } else if (special.type === 'cleanse') {
      const removed = clearPlayerEffects();
      if (amount) BATTLE.playerArmor += amount;
      battleLog(
        `${special.name}! Spent ${cost} Energy to ` +
          `clear ${removed.join(', ')}${amount ? ` and gain +${amount} ` + `armor` : ''}.`
      );
      playSfx('heal');
      flashScreen('heal');
    } else if (special.type === 'reroll') {
      const n = BATTLE.hand.length;
      BATTLE.discard.push(...BATTLE.hand);
      BATTLE.hand = [];
      BATTLE.slots = {};
      BATTLE.usedThisTurn = new Set();
      selectedIdx = [];
      drawCards(n);
      resortHandAndRelink(RUN.handSortMode);
      if (special.armor) BATTLE.playerArmor += special.armor;
      battleLog(
        `${special.name}! Spent ${cost} Energy to throw back your hand and draw ${n} ` +
          `fresh card${n === 1 ? '' : 's'}${special.armor ? ` and gain +${special.armor} ` + `armor` : ''}.`
      );
      playSfx('shield');
      flashScreen('shield');
    } else if (special.type === 'coins') {
      RUN.chips += amount;
      battleLog(`${special.name}! Spent ${cost} Energy to get ${amount} coins back.`);
      playSfx('buy');
      flashScreen('heal');
    } else if (special.type === 'gem') {
      const beforeGems = RUN.gems;
      RUN.gems = Math.min(RUN.maxGems, RUN.gems + amount);
      battleLog(
        `${special.name}! Spent ${cost} Energy to salvage ${RUN.gems - beforeGems} ` +
          `gem${RUN.gems - beforeGems === 1 ? '' : 's'}.`
      );
      playSfx('shield');
      flashScreen('shield');
    } else if (special.type === 'draw') {
      drawCards(amount);
      resortHandAndRelink(RUN.handSortMode);
      battleLog(`${special.name}! Spent ${cost} Energy to draw ${amount} card${amount > 1 ? 's' : ''}.`);
      playSfx('shield');
      flashScreen('shield');
    }
  }
  saveRun();
  render(battleScreen());
}
function applyDodgeIfActive(oppDmg) {
  if (BATTLE.weaken) oppDmg = Math.round(oppDmg * (1 - BATTLE.weaken));
  if (!BATTLE.dodgeChance) return oppDmg;
  const chance = BATTLE.dodgeChance;
  BATTLE.dodgeChance = 0;
  if (Math.random() < chance) {
    const specialName = (VEHICLE_SPECIALS[RUN.hero?.heroId] || {}).name || 'Evasive Maneuver';
    battleLog(`${specialName} pays off - you dodge the hit entirely!`);
    playSfx('dodge');
    flashScreen('dodge');
    return 0;
  }
  return oppDmg;
}
const STARTERS = [
  'sidebyside',
  'admin',
  'mower',
  'beachatv',
  'harley',
  'beachtractor',
  'interstate',
  'bobcat',
  'forklift',
  'convoy',
  'backhoe',
  'towtruck',
  'tanker',
  'dumptruck',
  'garbagetruck',
  'crownvic',
  'washer',
  'grapple',
  'firetruck',
  'oceanrescue',
  'arff',
  'highwater',
  'bearcat',
  'ambulance',
];
function heroItemCardPreviewHTML(itemId) {
  const item = ITEMS[itemId];
  if (!item) return '';
  return renderStandardItemCard(item, {});
}
