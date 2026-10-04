// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Sound And Screen Effects                                                      ██
// ██  Sound effects, screen flashes and damage popups.                              ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

let AUDIO_CTX = null;
function getAudioCtx() {
  if (AUDIO_CTX) return AUDIO_CTX;
  try {
    AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    return null;
  }
  return AUDIO_CTX;
}
function primeAudioChannel() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator(),
      g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.001);
  } catch (e) {}
}
function playSfx(kind) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const fire = () => {
    try {
      const now = ctx.currentTime;
      const tone = (freqStart, freqEnd, dur, type = 'sine', vol = 0.13, delay = 0) => {
        const osc = ctx.createOscillator(),
          g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, now + delay);
        osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + delay + dur);
        g.gain.setValueAtTime(vol, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.02);
      };
      const clang = (freq, dur, vol = 0.15, delay = 0, q = 14) => {
        const size = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 2);
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = freq;
        bp.Q.value = q;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        noise.connect(bp);
        bp.connect(g);
        g.connect(ctx.destination);
        noise.start(now + delay);
        noise.stop(now + delay + dur + 0.02);
      };
      const ring = (freq, dur, vol = 0.1, delay = 0, type = 'triangle') => {
        const osc = ctx.createOscillator(),
          g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(vol, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + dur + 0.02);
      };
      if (kind === 'hit') tone(220, 90, 0.16, 'sawtooth', 0.11);
      else if (kind === 'hurt') {
        tone(150, 55, 0.26, 'square', 0.15);
        tone(70, 35, 0.3, 'sine', 0.09, 0.02);
      } else if (kind === 'heal') tone(440, 880, 0.25, 'sine', 0.11);
      else if (kind === 'shield') {
        clang(2600, 0.09, 0.15);
        ring(1760, 0.22, 0.09, 0.006);
        ring(2480, 0.15, 0.06, 0.012);
        tone(210, 95, 0.14, 'triangle', 0.11, 0.01);
      } else if (kind === 'dodge') tone(600, 1200, 0.15, 'triangle', 0.1);
      else if (kind === 'match') tone(500, 950, 0.18, 'sine', 0.11);
      else if (kind === 'matchHappy') {
        tone(523, 523, 0.1, 'triangle', 0.13);
        tone(659, 659, 0.1, 'triangle', 0.13, 0.09);
        tone(784, 784, 0.1, 'triangle', 0.13, 0.18);
        tone(1047, 1047, 0.3, 'triangle', 0.15, 0.27);
      } else if (kind === 'wahwah') {
        tone(392, 330, 0.3, 'sawtooth', 0.09);
        tone(294, 196, 0.55, 'sawtooth', 0.09, 0.34);
      } else if (kind === 'win') {
        tone(440, 440, 0.11, 'square', 0.09);
        tone(660, 660, 0.11, 'square', 0.09, 0.12);
        tone(880, 880, 0.24, 'square', 0.1, 0.24);
      } else if (kind === 'perfect') {
        tone(523, 523, 0.09, 'square', 0.1);
        tone(659, 659, 0.09, 'square', 0.1, 0.1);
        tone(784, 784, 0.09, 'square', 0.1, 0.2);
        tone(1047, 1047, 0.4, 'square', 0.13, 0.3);
        tone(1319, 1319, 0.25, 'sine', 0.08, 0.3);
      } else if (kind === 'lose') tone(280, 110, 0.5, 'sawtooth', 0.13);
      else if (kind === 'buy') {
        tone(400, 600, 0.08, 'triangle', 0.1);
        tone(600, 900, 0.1, 'triangle', 0.1, 0.06);
      } else if (kind === 'sell') {
        tone(500, 350, 0.12, 'triangle', 0.1);
      } else if (kind === 'upgrade') {
        tone(440, 660, 0.09, 'square', 0.09);
        tone(660, 990, 0.16, 'square', 0.1, 0.09);
      } else if (kind === 'open') {
        tone(300, 500, 0.12, 'sawtooth', 0.08);
        tone(700, 1000, 0.22, 'sine', 0.11, 0.1);
      } else if (kind === 'poison') {
        tone(120, 180, 0.07, 'triangle', 0.25, 0.0);
        tone(90, 150, 0.08, 'triangle', 0.22, 0.05);
        tone(110, 160, 0.07, 'triangle', 0.25, 0.11);
        tone(85, 130, 0.09, 'triangle', 0.2, 0.16);
      } else if (kind === 'curse') {
        tone(120, 60, 0.5, 'sawtooth', 0.14);
        tone(127, 64, 0.5, 'sawtooth', 0.06, 0.02);
      } else if (kind === 'burn') {
        tone(150, 650, 0.25, 'triangle', 0.16);
      } else if (kind === 'armor') {
        clang(3100, 0.08, 0.18);
        ring(2080, 0.2, 0.1, 0.005);
        ring(3020, 0.14, 0.07, 0.011);
        tone(220, 85, 0.16, 'triangle', 0.14, 0.012);
      } else if (kind === 'freeze') {
        tone(1900, 700, 0.22, 'sine', 0.12);
        tone(2400, 1100, 0.16, 'sine', 0.07, 0.05);
      } else if (kind === 'zap') {
        clang(4200, 0.05, 0.22, 0, 22);
        tone(1400, 300, 0.14, 'sawtooth', 0.14, 0.01);
      } else if (kind === 'hex') {
        tone(320, 520, 0.1, 'sawtooth', 0.12);
        tone(190, 90, 0.35, 'sawtooth', 0.1, 0.05);
      }
    } catch (e) {}
  };
  if (ctx.state === 'suspended') {
    ctx
      .resume()
      .then(fire)
      .catch(() => {});
  } else fire();
}

function unlockAudioCtx() {
  const ctx = getAudioCtx();
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
}
document.addEventListener('click', unlockAudioCtx, true);
document.addEventListener('pointerdown', unlockAudioCtx, true);
function flashScreen(kind) {
  try {
    let el = document.getElementById('screenFlash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'screenFlash';
      el.style.cssText =
        'position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0;' + 'transition:opacity .09s ease-out;';
      document.body.appendChild(el);
    }
    const colors = {
      hurt: 'rgba(220,40,40,.32)',
      'hit-opponent': 'rgba(255,255,255,.16)',
      heal: 'rgba(60,200,90,.22)',
      dodge: 'rgba(90,160,255,.22)',
      shield: 'rgba(90,160,255,.18)',
    };
    el.style.background = colors[kind] || 'rgba(255,255,255,.14)';
    el.style.opacity = '1';
    if (kind === 'hurt') {
      document.body.classList.add('screen-shake');
      setTimeout(() => document.body.classList.remove('screen-shake'), 220);
    }
    setTimeout(() => {
      el.style.opacity = '0';
    }, 90);
  } catch (e) {}
}
const ACTIVE_DMG_POPUPS = [];
function showDamagePopup(amount, sourceName) {
  try {
    const el = document.createElement('div');
    el.className = 'dmgPopup';
    el.innerHTML =
      `<div class="dmgPopupAmt">` +
      `-${amount}</div>${sourceName ? `<div class="dmgPopupSrc">${sourceName}</div>` : ''}`;
    const stackIndex = ACTIVE_DMG_POPUPS.length;
    el.style.marginTop = stackIndex * 48 + 'px';
    document.body.appendChild(el);
    ACTIVE_DMG_POPUPS.push(el);
    setTimeout(() => {
      el.classList.add('fadeout');
    }, 1900);
    setTimeout(() => {
      el.remove();
      const idx = ACTIVE_DMG_POPUPS.indexOf(el);
      if (idx !== -1) ACTIVE_DMG_POPUPS.splice(idx, 1);
    }, 2400);
  } catch (e) {}
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Opponent Difficulty Rating                                                    ██
// ██  Power scores and the difficulty rating shown on Stop Details.                 ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function avgCardValue() {
  let total = 0;
  for (let r = 2; r <= 14; r++) total += cardValue(r);
  return total / 13;
}
const AVG_CARD_VALUE = avgCardValue();

function expectedMultForPoolSize(poolSize) {
  if (poolSize <= 1) return 1.0;
  if (poolSize <= 2) return 1.1;
  if (poolSize <= 3) return 1.25;
  if (poolSize <= 4) return 1.4;
  return 1.55;
}
function opponentPowerScore(opp, turn = 3) {
  const attacks = opp.attacks && opp.attacks.length ? opp.attacks : [{ maxCards: 3 }];
  const avgMaxCards = attacks.reduce((a, x) => a + (x.maxCards || 3), 0) / attacks.length;
  const poolAvailable = Math.min(avgMaxCards, (opp.drawRate || 2) * turn + (opp.startPoolBonus || 0));
  const mult = expectedMultForPoolSize(poolAvailable);
  const usesPerTurn = opp.usesPerTurn || 1;
  return Math.round(usesPerTurn * avgMaxCards * AVG_CARD_VALUE * mult);
}
// Difficulty rating: a single number that gauges how hard an opponent actually is to fight,
// combining survivability (HP, starting armor, armor regen) with offense (its items' power
// scores, factoring in how many times per turn it can fire them, plus how fast it draws into
// its pool) so a heavily-armored regenerating opponent with strong items rates higher than a
// same-HP opponent with a weak single item, not just whichever has more raw HP.
function opponentDifficultyRating(opp) {
  const items = (opp.items || []).map((id) => ITEMS[id]).filter(Boolean);
  const totalItemPower = items.length ? items.reduce((a, it) => a + itemPowerScore(it), 0) : opponentPowerScore(opp);
  const usesPerTurn = opp.usesPerTurn || 1;
  const offenseScore = totalItemPower * usesPerTurn;
  const armorScore = (opp.startArmor || 0) * 1.5 + (opp.armorRegen || 0) * 8;
  const drawScore = (opp.drawRate || 2) * 6;
  const specialScore = opp.special ? 20 : 0;
  const raw = opp.hp * 0.6 + offenseScore * 1.1 + armorScore + drawScore + specialScore;
  return Math.max(1, Math.round(raw / 6));
}
function opponentDifficultyInfo(opp) {
  const rating = opponentDifficultyRating(opp);
  if (rating < 20) return { rating, label: 'Easy', color: '#4caf7d' };
  if (rating < 35) return { rating, label: 'Moderate', color: '#e0b84a' };
  if (rating < 55) return { rating, label: 'Hard', color: '#e07a3f' };
  return { rating, label: 'Brutal', color: '#c0392b' };
}
// Rough odds that a given condition is actually satisfiable with the cards on hand, on a
// scale from ~0.25 (rare) to 1.0 (always available). Used to discount an item's power score
// so two items with the same maxCards/baseMult but very different draw requirements (Any
// card vs. an exact rank vs. Two Pair) aren't scored - or priced - as if they hit equally
// often. Numbers are hand-tuned estimates of how often each condition shape comes up in a
// typical hand, not a full combinatorial simulation.
function conditionProbabilityFactor(cond) {
  if (!cond) return 1;
  switch (cond.type) {
    case 'any':
    case 'exactCount':
      return 1;
    case 'colorCount':
      return 0.85;
    case 'parity':
      return cond.mode === 'all' ? 0.55 : 0.85;
    case 'suitCount':
      return cond.count >= 2 ? 0.45 : 0.7;
    case 'cardIn':
      return 0.6;
    case 'sumThreshold':
      return 0.75;
    case 'sumExact':
      return 0.4;
    case 'straightLen':
      return 0.5;
    case 'allSuits':
      return 0.3;
    case 'exactRank':
      return 0.32; // a specific rank showing up among a small played hand - roughly a 1-in-13-per-card shot
    case 'pokerTier': {
      const byTier = { 1: 0.8, 2: 0.5, 3: 0.4, 4: 0.3, 5: 0.22 };
      return byTier[cond.tier] ?? 0.6;
    }
    default:
      return 0.6;
  }
}
function itemPowerScore(item) {
  // Defense and poison items are scored the same way damage items are - they use the exact same
  // amount formula (computeItemAmountBase doesn't branch on kind at all), so a shield that fills
  // easily (an 'any' condition, up to 3 cards) legitimately scores higher than one that needs a
  // rarer hand, same as it would for damage. Only storage (holds cards, deals nothing itself) and
  // burn (its output ramps over several turns rather than landing at once, so a single-hit power
  // number would be misleading) stay excluded.
  if (item.kind === 'storage' || item.kind === 'burn') return 0;
  const maxCards = item.maxCards || 1;
  const usesPerTurn = item.usesPerTurn || 1;
  const bonusMult = 1 + (item.bonus ? item.bonus.base || 0 : 0);
  const lightningDiscount = item.kind === 'lightning' ? LIGHTNING_AVG_MULT : 1;
  const oddsFactor = conditionProbabilityFactor(item.condition);
  if (item.flatAmount != null) {
    return Math.round((item.flatAmount + (item.flatAmountPerLevel || 0) * 0) * usesPerTurn * oddsFactor);
  }
  return Math.round(
    usesPerTurn * maxCards * AVG_CARD_VALUE * (item.baseMult ?? 1) * bonusMult * lightningDiscount * oddsFactor
  );
}
// Opponents that mess with hands get a plain heads-up, shown when you tap their stop and again as a popup when the
// fight starts.
function opponentHeadsUp(o) {
  const out = [];
  if (!o) return out;
  if (o.discardPoolEachTurn || o.reckless)
    out.push(
      'It throws away its whole hand at the end of every turn ' +
        'and draws a fresh one, so the cards you can see now will not be there for its next attack.'
    );
  if (
    (o.attacks || []).some((a) => a.discardHand) ||
    (o.items || []).some((id) => ITEMS[id] && ITEMS[id].utilityEffect === 'discardHand')
  )
    out.push('It can make you discard cards from your ' + 'hand.');
  if ((o.items || []).some((id) => ITEMS[id] && ITEMS[id].followUp))
    out.push(
      'Every turn it cannot attack, it throws out its whole ' +
        'hand and draws extra cards next turn, so the longer it waits the bigger its hand gets.'
    );
  return out;
}
function showBattleHeadsUp(o) {
  const notes = opponentHeadsUp(o);
  if (!notes.length) return;
  const old = document.getElementById('headsUpModal');
  if (old) old.remove();
  const m = document.createElement('div');
  m.id = 'headsUpModal';
  m.className = 'treasure-modal';
  m.innerHTML =
    `<div class="wo" style="max-width:420px"><div class="wo-stripe"></div><div ` +
    `class="wo-body" style="text-align:center">
    <div class="wo-eyebrow">Heads Up</div><h1 style="font-size:26px">${o.name}</h1>
    ${notes.map((n) => `<div class="wo-sub" style="margin:8px 0">${n}</div>`).join('')}
    <button class="wo-btn amber" id="headsUpOk" style="width:100%;margin-top:10px">Got It</button></div></div>`;
  document.body.appendChild(m);
  document.getElementById('headsUpOk').onclick = () => m.remove();
}
function isConsecutive(cards) {
  if (cards.length < 2) return false;
  const ranks = [...new Set(cards.map((c) => c.rank))].sort((a, b) => a - b);
  if (ranks.length !== cards.length) return false;
  return ranks[ranks.length - 1] - ranks[0] === cards.length - 1;
}
function straightMult(len) {
  return 1 + (len - 2) * 0.45;
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Icons And Pictures                                                            ██
// ██  Resource icons, node icons and the art helper.                                ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████


// Resource icons (coins/gems/fuel/energy/career points/health) render real art from Icons/ with
// an onerror fallback to the original emoji, same pattern as art() for heroes/opponents. Sized in
// em units (not a fixed px) so the icon scales with whatever font-size context it's dropped into,
// same as the emoji it replaces did automatically - these are used inline in dozens of different
// text sizes across the game (currency bar, item cards, reward lines, hover tips), so a fixed
// pixel size would look right in one place and wrong in most others.
function resIcon(file, emoji, folder = 'Icons/') {
  return (
    `<span class="vart" style="width:1em;height:1em;font-size:1em"><img ` +
    `src="${folder}${file}" alt="" onerror="this.style.display='none';` +
    `this.nextElementSibling.style.display='inline-flex';"><span style="display:none;width:100%;` +
    `height:100%;align-items:center;justify-content:center;line-height:1;font-size:1em">${emoji}</span></span>`
  );
}
// Same image-with-emoji-fallback pattern as resIcon/art(), but at a fixed pixel size instead of 1em -
// used for map-node art (Dealership, Fleet Compound, Fleet Blackjack, etc.) where the icon renders at
// several different fixed sizes (small on the map, larger in the Stop Details popup) rather than
// scaling with surrounding text.
function iconImg(file, fallback, px, folder = 'Icons/') {
  return (
    `<span class="vart" style="width:${px}px;height:${px}px;font-size:${px}px"><img ` +
    `src="${folder}${file}" alt="" onerror="this.style.display='none';` +
    `this.nextElementSibling.style.display='inline-flex';"><span style="display:none;width:100%;` +
    `height:100%;align-items:center;justify-content:center;line-height:1;font-size:${px}px">${fallback}</span></span>`
  );
}
// The Grid Anomaly map-node icon gets its own dedicated joker image (distinct from the two
// matching-game tile jokers), since it sits on the map's light pastel node badges rather than the
// dark panels the tile jokers render on.
const JOKER_MAP_ICON = resIcon('joker-map.png', '🃏', 'Hazards/');
const ICON = {
  coin: resIcon('coin.png', '💰'),
  gem: resIcon('gem.png', '💎'),
  fuel: resIcon('fuel.png', '⛽'),
  energy: resIcon('energy.png', '⚡'),
  star: resIcon('career-points.png', '⭐'),
  heart: resIcon('heart.png', '❤️'),
  shield: `🛡️`,
  poison: `☠️`,
  lock: `🔒`,
  gift: `🎁`,
  wrench: `🔧`,
  hammer: `🔨`,
  cart: `🛒`,
  castle: `🏢`,
  fog: `🌫️`,
  truck: `🚚`,
  fire: `🔥`,
  curse: `💀`,
  stash: `📦`,
  palm: `🌴`,
  sun: `☀️`,
  hex: `🔮`,
  ice: `❄️`,
  lightning: `⚡`,
};
function art(entity, px) {
  const fb = (entity && entity.icon) || ICON.truck;
  const img = entity && entity.image;
  if (img) {
    return (
      `<span class="vart" style="width:${px}px;height:${px}px;font-size:${px}px"><img ` +
      `src="${img}" alt="" onerror="this.style.display='none';` +
      `this.nextElementSibling.style.display='inline-flex';"><span style="display:none;width:100%;` +
      `height:100%;align-items:center;justify-content:center;line-height:1;font-size:${px}px">${fb}</span></span>`
    );
  }
  return `<span class="vart" style="width:${px}px;height:${px}px;font-size:${px}px">${fb}</span>`;
}
const PLAYER_ART = { name: 'Your Fleet', icon: '🚚', image: 'Vehicles/work-truck.png' };
function fleetLabel() {
  return META.playerName ? `${META.playerName}'s Fleet` : 'Your Fleet';
}
function roadExitLabel() {
  return `Back to ${WORLD_NAMES[RUN && RUN.world] || WORLD_NAMES[1]}`;
}
function opponentAttackBoxHTML(opp, showStatus) {
  const rawAttacks = opp.attacks && opp.attacks.length ? opp.attacks : [{}];
  const swings = opp.usesPerTurn ?? OPPONENT_USES_PER_TURN_DEFAULT;
  if (opp.items && opp.items.length) {
    const pendingBurn =
      showStatus && BATTLE.pendingTarget && BATTLE.pendingTarget.type === 'burn' ? BATTLE.pendingTarget : null;
    const tgt = showStatus && BATTLE.targeting ? BATTLE.targeting : null;
    const tgtElig = tgt ? new Set(targetEligibleKeys(tgt.type)) : null;
    return opp.items
      .map((itemId, i) => {
        const item = ITEMS[itemId];
        if (!item) return '';
        const key = `${itemId}_${i}`;
        const frozenAmt = showStatus && BATTLE.opponentItemFrozen && BATTLE.opponentItemFrozen[key];
        const isBurnTarget = !!(pendingBurn && item.kind !== 'storage' && !item.followUp);
        const burnedNow = showStatus && BATTLE.opponentItemBurns && BATTLE.opponentItemBurns[key];
        const burnedStepNow = burnedNow ? (BATTLE.opponentItemBurnStep && BATTLE.opponentItemBurnStep[key]) || 1 : 0;
        const card = renderStandardItemCard(item, {
          usesBadgeText: item.followUp ? null : swings === Infinity ? '∞' : String(swings),
          frozenState: frozenAmt || null,
          burnedAmt: burnedNow || null,
          burnedStep: burnedStepNow,
          burnedDetonateKey: burnedNow ? key : null,
          burnTargetKey: isBurnTarget ? key : null,
          burnTargetAmount: isBurnTarget ? pendingBurn.amount : null,
          pickKey: tgtElig && tgtElig.has(key) ? key : null,
          picked: !!(tgt && tgt.targetKey === key),
        });
        if (!showStatus) return card;
        if (isBurnTarget) return card;
        const curseAmt = BATTLE.opponentItemCurses && BATTLE.opponentItemCurses[key];
        const hexStacks = BATTLE.opponentItemHexes && BATTLE.opponentItemHexes[key];
        const tag = curseAmt
          ? `<span class="curseBadge">Cursed: ${curseAmt}</span>`
          : hexStacks
            ? `<span class="curseBadge">Hexed ` + `x${hexStacks}</span>`
            : '';
        return tag ? `${card}<div class="note" style="margin:2px 0 0;text-align:center">${tag}</div>` : card;
      })
      .join('');
  }
  const EFFECT_TIP = {
    burn:
      'Burn sets an Item on fire. The burn grows every turn, so you can detonate it right ' +
      'away for less or let it build. If the Item is fired while it burns, it still attacks, but its ' +
      'owner takes the burn damage.',
    poison: 'Poison deals damage at the end of a turn, then weakens after it ticks.',
    curse:
      'Curse locks onto one of your equipped Items - fire that Item before your turn ends ' +
      'or take the curse damage instead.',
    stun: 'Stun cancels your next counter-attack.',
    heal: "Heal restores some of this opponent's own HP.",
    stealFuel: "Steals fuel you'd otherwise use to travel the map.",
    draw: 'Draws this opponent an extra card to attack with next.',
  };
  const kindClass = (e) =>
    e === 'burn' ? 'kind-burn' : e === 'poison' ? 'kind-poison' : e === 'curse' ? 'kind-curse' : 'kind-damage';

  return rawAttacks
    .map((a) => {
      const name = a.name || opp.name;
      const minTier = a.minTier ?? opp.minTier ?? 0;
      const cap = a.maxCards ?? opponentMaxCards(opp);
      const effect = a.effect || 'damage';
      const flatCapMatch = a.fewCardsThreshold && cap === a.fewCardsThreshold.max;
      const capLine = a.autoFire
        ? 'No card needed'
        : a.straightLen
          ? `Any ${a.straightLen} cards in a row`
          : minTier > 0
            ? `${TIERS[minTier]} to ` + `Attack`
            : flatCapMatch
              ? cap === 1
                ? 'Any card'
                : `Any ${cap} cards`
              : cap === 1
                ? '1 card'
                : `Up to ${cap} cards`;
      let bonusLine = '';
      let damageLine = '';
      if (a.autoFire) {
        bonusLine = a.minTurn ? `Kicks in on its own from turn ${a.minTurn} onward` : `Kicks in on its own`;
        damageLine = `Attack ${a.autoFire.damage}`;
      } else if (a.sumThreshold) {
        bonusLine = `Card(s) need to total ${a.sumThreshold.min} or higher`;
        damageLine = `Attack ${a.sumThreshold.damage}`;
      } else if (a.fewCardsThreshold) {
        bonusLine =
          cap > a.fewCardsThreshold.max
            ? `Only works using ${a.fewCardsThreshold.max} ` + `card${a.fewCardsThreshold.max > 1 ? 's' : ''} or fewer`
            : '';
        damageLine = `Attack ${a.fewCardsThreshold.damage}`;
      } else if (a.perFaceCard) {
        bonusLine = `Extra damage per face card (J/Q/K) played`;
        damageLine = `Attack ${a.perFaceCard.damage} × number of face cards used`;
      } else if (a.discardHand) {
        damageLine =
          `No damage - knocks ${a.discardHand.count} ` +
          `card${a.discardHand.count > 1 ? 's' : ''} out of your hand instead`;
      } else if (a.suitPunish) {
        bonusLine = `Bonus scales with ${a.suitPunish.suit} cards already in your discard pile`;
        damageLine = `Attack ${a.suitPunish.base || 0} + ${a.suitPunish.perCard} per ${a.suitPunish.suit} discarded`;
      } else if (minTier > 0) {
        bonusLine = '';
        damageLine = a.straightLen
          ? `Attack straight value × ${TIER_MULT[minTier].toFixed(1)}`
          : `Attack ${SIGMA_TIP} ` + `× ${TIER_MULT[minTier].toFixed(1)}`;
      } else {
        damageLine = a.straightLen ? 'Attack straight value' : `Attack ${SIGMA_TIP}`;
      }
      const STATUS_EFFECTS = { burn: 'Burn', poison: 'Poison', curse: 'Curse' };
      const effectLabel = STATUS_EFFECTS[effect];
      const effectTag = effectLabel
        ? `<span class="effectTip ${effect}Text" ` + `data-tip="${EFFECT_TIP[effect]}">${effectLabel}</span>`
        : '';
      const effectLine =
        effect === 'curse'
          ? `${effectTag} one of your Items`
          : effectTag
            ? `Applies ${effectTag}`
            : effect === 'heal'
              ? 'Restores its own HP'
              : effect === 'stealFuel'
                ? 'Can steal fuel'
                : effect === 'draw'
                  ? 'Draws itself an extra card'
                  : effect === 'stun'
                    ? `<span class="hoverTip" data-title="${EFFECT_TIP.stun}">Stuns</span>` +
                      ` your next counter-attack`
                    : '';

      return (
        `<div class="itemCard ${kindClass(effect)}" style="cursor:default">
      <div class="usesBadge hoverTip" data-title="Attacks per turn">${swings === Infinity ? '∞' : swings}</div>
      <div class="itemCard-sec">
        <div class="hdr">${name}</div>
        <div class="itemReqLine">${capLine}</div>
      </div>
      <div class="itemDivider"></div>
      <div class="itemCard-cards-sec">${bonusLine ? `<div class="itemBonusLine">${bonusLine}</div>` : ''}</div>
      <div class="itemDivider"></div>
      <div class="itemCard-sec"><div ` +
        `class="note">${damageLine}${effectLine ? ` · ${effectLine}` : ''}${a.minTurn && !a.autoFire ? ` · from turn ${a.minTurn}` : ''}</div>` +
        `</div>
    </div>`
      );
    })
    .join('');
}
