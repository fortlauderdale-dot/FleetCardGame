const DIFF_KEY = 'fleetduel-difficulty-v1';
const DIFF_FIGHT_KEY = 'fleetduel-fights-v1';
function diffLoadSaved() {
  try {
    const o = JSON.parse(localStorage.getItem(DIFF_KEY) || '{}');
    return o && o.v === DIFFICULTY_VERSION && o.set ? o.set : {};
  } catch (e) {
    return {};
  }
}
let DIFF_SAVED = diffLoadSaved();
let DIFF = Object.assign({}, DIFFICULTY_DEFAULTS, DIFF_SAVED);
const DIFF_STYLE_TEXT = {
  Bruiser: 'Hits reliably almost every turn with plain damage.',
  Snowball: 'Quiet at first, dangerous by turn three or four once its hand fills up.',
  Grinder: 'Wears you down with poison and burn that keep ticking.',
  Saboteur: 'Curses, hexes, freezes, discards or draws. Lower damage, more decisions.',
  Fortress: 'Armored and sturdy. Hits less often but takes longer to bring down.',
  Combo: 'Several items work together, so one hit can set up the next.',
  Gambler: 'Swingy lightning damage. Sometimes a scratch, sometimes a wallop.',
  Predator: 'Swings more than once a turn.',
};
const DIFF_ZONE_TEXT = {
  quiet: ['Quiet', 'Hardly threatens you. Fine as a simple teacher, otherwise consider a second item.', '#7fa8c9'],
  light: ['Light', 'A little under the healthy range.', '#4caf7d'],
  healthy: ['Healthy', 'Inside the healthy range for this kind of fight.', '#4caf7d'],
  spicy: ['Spicy', 'A little above the healthy range. Fine if its mechanic is fun.', '#e0b84a'],
  watch: ['Watch', 'Well above the healthy range. Worth a look.', '#e07a3f'],
  review: ['Review', 'Far above the healthy range. Check that this is intentional.', '#c0392b'],
};
// Only the dials you changed on the tuning screen are saved. Everything else follows DIFFICULTY_DEFAULTS above.
function saveDiff() {
  try {
    DIFF_SAVED = {};
    Object.keys(DIFFICULTY_DEFAULTS).forEach((k) => {
      if (JSON.stringify(DIFF[k]) !== JSON.stringify(DIFFICULTY_DEFAULTS[k])) DIFF_SAVED[k] = DIFF[k];
    });
    if (Object.keys(DIFF_SAVED).length)
      localStorage.setItem(DIFF_KEY, JSON.stringify({ v: DIFFICULTY_VERSION, set: DIFF_SAVED }));
    else localStorage.removeItem(DIFF_KEY);
  } catch (e) {}
  diffApplyGlobals();
}
function diffRec(id, world) {
  const t = DIFF_TABLE[id];
  return t ? t[world] : null;
}
function diffPace(row) {
  const p = DIFF.paceByRow;
  return DIFF.pacing ? p[Math.max(0, Math.min(p.length - 1, row))] : 1;
}
// Items that say "Needs Two Pair" but can only hold 3 cards can never make two pair (three of a kind is the only
// way in). This lets them hold 4 cards.
const DIFF_TWOPAIR = Object.values(ITEMS)
  .filter(
    (it) => it && it.condition && it.condition.type === 'pokerTier' && it.condition.tier === 2 && (it.maxCards || 1) < 4
  )
  .map((it) => ({ id: it.id, orig: it.maxCards }));
function diffApplyGlobals() {
  DIFF_TWOPAIR.forEach((x) => {
    if (ITEMS[x.id]) ITEMS[x.id].maxCards = DIFF.fixTwoPair ? 4 : x.orig;
  });
  LIGHTNING_MIN_ROLL = DIFF.lightningFromZero ? 0 : 0.25;
  LIGHTNING_AVG_MULT = (LIGHTNING_MIN_ROLL + LIGHTNING_MAX_ROLL) / 2;
  const pct = Math.round(LIGHTNING_MIN_ROLL * 100);
  Object.values(ITEMS).forEach((it) => {
    if (!it || typeof it.note !== 'string') return;
    if (it._lab0 === undefined) {
      if (it.note.indexOf('25% and 100%') === -1) {
        it._lab0 = null;
        return;
      }
      it._lab0 = it.note;
    }
    if (it._lab0) it.note = it._lab0.replace(/25% and 100%/g, pct + '% and 100%');
  });
}
// Difficulty: add the extra items that give elites and bosses 2-4 items.
function diffAddItems(scaled, base) {
  const add = DIFF_PATCH.opponents[base.id];
  if (!add) return;
  scaled.items = [...(scaled.items || base.items || [])];
  add.add.forEach((id) => {
    if (!scaled.items.includes(id)) scaled.items.push(id);
  });
}
// Difficulty: tune one scaled opponent (regular, elite or boss). Opponents inside their threat band are left alone.
// Only outliers move, and only part of the way.
function diffTuneOpponent(scaled, base, row, kind) {
  if (DIFF.extraItems) diffAddItems(scaled, base);
  // Opponent health: a flat bonus per kind (every world), a ramp that builds across the rows, and a bonus per world
  // after the first.
  {
    const fade = DIFF.hpEarlyFade >= 99 ? 1 : Math.max(0, 1 - (RUN.world - 1) / Math.max(1, DIFF.hpEarlyFade - 1));
    const flat =
      (kind === 'boss' ? DIFF.hpBonusBoss : kind === 'elite' ? DIFF.hpBonusElite : DIFF.hpBonusRegular) * fade;
    const ramp = kind === 'boss' ? 0 : DIFF.hpRowRamp * Math.min(1, Math.max(0, row) / 19);
    // bosses already scale with the world multiplier, so they skip this extra bonus
    const perWorld = kind === 'boss' ? 0 : DIFF.hpPerWorld * Math.max(0, RUN.world - 1);
    scaled.hp = Math.max(1, Math.round(scaled.hp * (1 + (flat + ramp + perWorld) / 100)));
  }
  const rec = diffRec(base.id, RUN.world);
  if (!rec) return scaled;
  const st = DIFF.tuning ? DIFF.strength / 100 : 0,
    diff = DIFF.difficulty / 100;
  const pace = kind === 'regular' ? diffPace(row) : kind === 'elite' ? Math.sqrt(diffPace(row)) : 1;
  const s = Math.pow(rec.s, st) * diff * pace;
  const hpF = Math.pow(rec.h, st) * Math.pow(diff, 0.5);
  scaled.diffDmgScale = base.fixedNumbers ? 1 : +s.toFixed(3);
  if (DIFF.curseBoost && rec.cm > 1) scaled.diffCurseMult = rec.cm;
  if (st >= 0.5) {
    if (rec.d !== base.drawRate) scaled.drawRate = rec.d;
    // Draw on hit starts after the Fleet Compound in World 1 (row 10), never before it.
    if (DIFF.drawOnHit && rec.dh && !scaled.special && (RUN.world >= 2 || row > 10))
      scaled.special = { type: 'drawOnHit', amount: 1 };
  }
  scaled.hp = Math.max(1, Math.round(scaled.hp * hpF));
  // estimate: blend between the raw number and the fully corrected number by strength, then apply the damage dials
  const blend = Math.exp((1 - st) * Math.log(Math.max(0.3, rec.b)) + st * Math.log(Math.max(0.3, rec.a)));
  const est = blend * diff * pace;
  const pressure = rec.p + (est - rec.b) * 0.5;
  scaled.diffInfo = {
    est: +est.toFixed(1),
    was: rec.b,
    cx: rec.c,
    pressure: +Math.max(est, pressure).toFixed(1),
    styles: rec.r,
    kind: rec.k,
    world: RUN.world,
    lo: rec.lo,
    hi: rec.hi,
    bc: rec.bc,
    keeper: rec.kp,
  };
  if (DIFF.rewardsScale)
    scaled.rewardMult = +(
      (scaled.rewardMult || 1) * Math.max(0.85, Math.min(1.35, 1 + 0.35 * (est / rec.bc - 1)))
    ).toFixed(3);
  return scaled;
}
// Difficulty: pick a regular opponent for a row. Early rows favor simple opponents that teach one thing, complexity
// ramps up later, no style repeats back to back, fair rotation.
function diffPickRegular(list, row, use, recent) {
  const cxTarget = row <= 5 ? 0.8 : row <= 11 ? 2.4 : 4.0;
  let best = null,
    bestScore = Infinity;
  list.forEach((o) => {
    const rec = diffRec(o.id, RUN.world);
    const cx = rec ? rec.c : 1,
      style = rec ? rec.r[0] : 'Bruiser';
    let score = Math.abs(cx - cxTarget) * 0.9 + (use[o.id] || 0) * 2.2 + Math.random() * 1.4;
    if (recent.slice(-3).includes(style)) score += 1.6;
    if (row <= 5 && rec) {
      if (rec.n === 1) score -= 0.6;
      // let them meet each effect early, at low numbers
      if (rec.r.some((x) => x === 'Saboteur' || x === 'Grinder' || x === 'Gambler') && rec.c <= 3.5) score -= 0.5;
    }
    if (score < bestScore) {
      bestScore = score;
      best = { o, style };
    }
  });
  use[best.o.id] = (use[best.o.id] || 0) + 1;
  recent.push(best.style);
  return best.o;
}
function diffSwingCap() {
  const t = BATTLE.opponent.tier;
  const tierCap = OPPONENT_SWING_CAP[t ?? OPPONENT_SWING_CAP.length - 1] ?? 60;
  if (DIFF.swingCap === 'base' || (t != null && t < OPPONENT_SWING_CAP.length - 1)) return tierCap;
  if (DIFF.swingCap === 'health') return Math.max(30, Math.round(0.45 * RUN.maxHealth));
  return 99;
}
function diffCurseMult() {
  return (BATTLE.opponent && BATTLE.opponent.diffCurseMult) || 1;
}
function diffPureDraw(item) {
  return !!(item && item.drawAmount && item.flatAmount == null && !(item.baseMult > 0) && !item.kind);
}
// Difficulty: opponents can use draw items too. Whatever the player can do, the computer can do.
function diffOppItemDraw(item) {
  const n = item && item.drawAmount ? item.drawAmount : 0;
  if (!n) return;
  const drawn = drawOpponentPoolCards(n);
  battleLog(`${BATTLE.opponent.name} draws ${drawn.length} card${drawn.length === 1 ? '' : 's'} for its next attack.`);
}
// Difficulty: Lightning uses one shared roll. Whenever either side fires a Lightning attack, the roll is used and
// then rerolled.
function diffLightningRoll() {
  if (BATTLE.lightningRoll == null) BATTLE.lightningRoll = rollLightningMultiplier();
  return BATTLE.lightningRoll;
}
function diffRerollLightning(who) {
  const old = Math.round(diffLightningRoll() * 100);
  BATTLE.lightningRoll = rollLightningMultiplier();
  battleLog(
    `Lightning: ${who} fired at ${old}% power. The shared roll is ` + `now ${Math.round(BATTLE.lightningRoll * 100)}%.`
  );
}
function diffLightningChip() {
  const has =
    (RUN.hero.items || []).some((id) => ITEMS[id] && ITEMS[id].kind === 'lightning') ||
    (BATTLE.opponent.items || []).some((id) => ITEMS[id] && ITEMS[id].kind === 'lightning');
  if (!has) return '';
  const pct = Math.round(diffLightningRoll() * 100);
  return (
    `<span class="status hoverTip" style="color:var(--lightning)" data-title="Lightning ` +
    `uses one shared roll between ${Math.round(LIGHTNING_MIN_ROLL * 100)}% and 100%. Whoever fires a ` +
    `Lightning attack next, you or the opponent, hits at this power. After any Lightning attack the ` +
    `roll is rerolled.">${ICON.lightning} Lightning roll ${pct}%</span>`
  );
}
// Difficulty: poison and burn that opponents fire now land on YOU (in the base game they were being added to the
// opponent).
function diffTickPlayerDots() {
  if (!DIFF.dotHitsPlayer) return;
  const b = BATTLE;
  let total = 0,
    parts = [];
  if ((b.playerPoison || []).length) {
    const d = b.playerPoison.reduce((a, n) => a + n, 0);
    total += d;
    parts.push(`poison ${d}`);
    b.playerPoison = b.playerPoison.map((n) => Math.max(0, n - 3)).filter((n) => n > 0);
  }
  if ((b.playerBurns || []).length) {
    const d = b.playerBurns.reduce((a, x) => a + (x.stages[x.stageIdx] || 0), 0);
    total += d;
    parts.push(`burn ${d}`);
    b.playerBurns.forEach((x) => x.stageIdx++);
    b.playerBurns = b.playerBurns.filter((x) => x.stageIdx < x.stages.length);
  }
  if (total > 0) {
    RUN.health = Math.max(0, RUN.health - total);
    b.lastHit = { amount: total, source: `${b.opponent.name} (${parts.join(' and ')})` };
    battleLog(
      `You take ${total} from ${parts.join(' and ')}, which skips your armor. ` +
        `Health: ${RUN.health}/${RUN.maxHealth}.`
    );
    playSfx('hurt');
    flashScreen('hurt');
    showDamagePopup(total, parts.join(' and '));
  }
}
// Difficulty: fight log, so your real fights can be compared with the engine's estimates.
function diffFights() {
  try {
    return JSON.parse(localStorage.getItem(DIFF_FIGHT_KEY) || '[]');
  } catch (e) {
    return [];
  }
}
function diffLogFight(won) {
  try {
    if (!DIFF.logFights) return;
    const b = BATTLE;
    if (!b || !b.opponent || b.diffLogged || b.diffStartHealth == null) return;
    b.diffLogged = true;
    const li = b.opponent.diffInfo || {};
    const lost = Math.max(0, b.diffStartHealth - RUN.health);
    const kind = li.kind || (b.opponent.boss ? 'boss' : /\[Elite\]/.test(b.opponent.name || '') ? 'elite' : 'regular');
    const list = diffFights();
    list.push({
      w: RUN.world,
      row: b.row,
      name: b.opponent.name,
      kind,
      turns: b.turn,
      lostPct: Math.round((100 * lost) / RUN.maxHealth),
      est: li.est != null ? li.est : null,
      lo: li.lo || null,
      hi: li.hi || null,
      won,
    });
    localStorage.setItem(DIFF_FIGHT_KEY, JSON.stringify(list.slice(-300)));
  } catch (e) {}
}
function diffClearFights() {
  try {
    localStorage.removeItem(DIFF_FIGHT_KEY);
  } catch (e) {}
  render(diffScreen());
}
function diffIntensity(o) {
  const li = o.diffInfo;
  if (!li) return null;
  const label = li.est < li.lo ? 'Easy' : li.est <= li.hi ? 'Moderate' : li.est <= li.hi * 1.15 ? 'Hard' : 'Brutal';
  const color = { Easy: '#4caf7d', Moderate: '#e0b84a', Hard: '#e07a3f', Brutal: '#c0392b' }[label];
  const pressure = li.cx < 1.5 ? 'Low' : li.cx < 4 ? 'Medium' : 'High';
  return { label, color, pressure, styles: li.styles, est: li.est, was: li.was, sp: li.pressure };
}
function diffDifficultyRow(o, diff) {
  // Returns a list of stat rows: Difficulty, then Strategic pressure on its own line directly below it.
  const li = diffIntensity(o);
  if (!li)
    return [
      [
        'Difficulty',
        `<span class="hoverTip" style="color:${diff.color};` +
          `font-weight:800" data-title="A gauge of how tough this fight is, based on its HP, armor, and ` +
          `item power - higher difficulty pays out better rewards.">${diff.label}</span>`,
      ],
    ];
  const styleTip = li.styles.map((s) => `${s}: ${DIFF_STYLE_TEXT[s] || ''}`).join(' ');
  return [
    [
      'Difficulty',
      `<span class="hoverTip" style="color:${li.color};font-weight:800" ` +
        `data-title="How much of your health this fight is expected to cost, compared with the healthy ` +
        `range for this kind of fight in this world. Better fights pay slightly better rewards.">${li.label}</span>` +
        (` <span class="hoverTip" style="opacity:.85" ` +
          `data-title="${styleTip.replace(/"/g, '&quot;')}">&middot; ${li.styles[0]}</span>`),
    ],
    [
      'Strategic pressure',
      `<span class="hoverTip" style="font-weight:800" data-title="How many ` +
        `decisions this opponent forces on you (curses, freezes, hexes, poison, draws). Low means play ` +
        `your best cards.">${li.pressure}</span>` +
        (DIFF.showNumbers
          ? `<div class="note" style="margin:2px 0 0;font-size:11px;` +
            `font-weight:400">Engine estimate: raw threat about ${li.est}% of your health, strategic ` +
            `pressure about ${li.sp}% (untuned raw threat ${li.was}%, healthy ` +
            `range ${li.lo.toFixed(0)}-${li.hi.toFixed(0)}%)</div>`
          : ''),
    ],
  ];
}
let DIFF_REPORT_WORLD = 1;
function diffIsChanged(key) {
  return JSON.stringify(DIFF[key]) !== JSON.stringify(DIFFICULTY_DEFAULTS[key]);
}
function diffMark(key) {
  return diffIsChanged(key)
    ? ' <span class="note" style="font-size:11px;' +
        'color:#e0b84a">(changed, built-in is ' +
        (typeof DIFFICULTY_DEFAULTS[key] === 'boolean'
          ? DIFFICULTY_DEFAULTS[key]
            ? 'On'
            : 'Off'
          : DIFFICULTY_DEFAULTS[key]) +
        ')</span>'
    : '';
}
function diffToggleHTML(key, title, sub) {
  const on = !!DIFF[key];
  return (
    `<div class="diffRow"><div><b>${title}</b>${diffMark(key)}<div class="note" ` +
    `style="margin:2px 0 0;font-size:12px">${sub}</div></div>
    <button class="wo-btn ${on ? 'green' : 'gray'}" style="min-width:64px;padding:5px 10px" ` +
    `onclick="diffSet('${key}', ${!on})">${on ? 'On' : 'Off'}</button></div>`
  );
}
function diffSliderHTML(key, title, sub, min, max, step, unit) {
  unit = unit == null ? '%' : unit;
  return (
    `<div class="diffRow" style="flex-direction:column;align-items:stretch"><div ` +
    `style="display:flex;justify-content:space-between;gap:8px"><b>${title}${diffMark(key)}</b><span ` +
    `id="diffVal_${key}" style="font-weight:800">${DIFF[key]}${unit}</span></div>
    <div class="note" style="margin:2px 0 4px;font-size:12px">${sub}</div>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${DIFF[key]}" ` +
    `style="width:100%" oninput="document.getElementById('diffVal_${key}').textContent=this.value+'${unit}'" ` +
    `onchange="diffSet('${key}', +this.value)"></div>`
  );
}
function diffSelectHTML(key, title, sub, opts) {
  return (
    `<div class="diffRow"><div><b>${title}</b>${diffMark(key)}<div class="note" ` +
    `style="margin:2px 0 0;font-size:12px">${sub}</div></div>
    <select class="diffSelect" onchange="diffSet('${key}', ` +
    `this.value)">${opts.map(([v, t]) => `<option value="${v}" ${DIFF[key] === v ? 'selected' : ''}>${t}</option>`).join('')}</select>` +
    `</div>`
  );
}
function diffSet(key, val) {
  DIFF[key] = val;
  saveDiff();
  render(diffScreen());
}
function diffResetSettings() {
  DIFF = Object.assign({}, DIFFICULTY_DEFAULTS);
  saveDiff();
  render(diffScreen());
}
function diffSetReportWorld(w) {
  DIFF_REPORT_WORLD = w;
  render(diffScreen());
}
function diffReportHTML() {
  const w = DIFF_REPORT_WORLD;
  const pools = WORLD_POOLS_BY_WORLD[w];
  const rows = [];
  const add = (o, kind) => {
    const rec = diffRec(o.id, w);
    if (rec)
      rows.push({
        name: o.name,
        kind,
        rec,
        items:
          (o.items || []).length +
          (DIFF.moreItems && DIFF_PATCH.opponents[o.id] ? DIFF_PATCH.opponents[o.id].add.length : 0),
      });
  };
  pools.regulars.forEach((o) => add(o, 'Regular'));
  EASTER_EGG_OPPONENTS.forEach((o) => add(o, 'Easter egg'));
  pools.elites.forEach((o) => add(o, 'Elite'));
  add(pools.boss, 'Boss');
  const order = { Regular: 0, 'Easter egg': 1, Elite: 2, Boss: 3 };
  rows.sort((a, b) => order[a.kind] - order[b.kind] || b.rec.b - a.rec.b);
  const counts = {};
  const tr = rows
    .map((r) => {
      const rc = r.rec,
        st = DIFF.strength / 100;
      const est = DIFF.tuning
        ? Math.exp((1 - st) * Math.log(Math.max(0.3, rc.b)) + st * Math.log(Math.max(0.3, rc.a)))
        : rc.b;
      const zone = DIFF.tuning
        ? est > rc.hi * 1.45
          ? 'review'
          : est > rc.hi * 1.15
            ? 'watch'
            : est > rc.hi
              ? 'spicy'
              : est >= rc.lo
                ? 'healthy'
                : est >= rc.lo * 0.4
                  ? 'light'
                  : 'quiet'
        : rc.z;
      counts[zone] = (counts[zone] || 0) + 1;
      const zt = DIFF_ZONE_TEXT[zone];
      const lever = DIFF.tuning && rc.tn ? ` Lever: ${rc.tn}.` : '';
      const keeper = rc.kp ? ' Keeper: rarely attacks but hits big, so the engine leaves it alone.' : '';
      const flag =
        `<span style="color:${zt[2]};font-weight:800" ` +
        `title="${(zt[1] + lever + keeper).replace(/"/g, '&quot;')}">${zt[0]}${rc.kp ? ' (keeper)' : ''}</span>`;
      return (
        `<tr><td>${r.name}</td><td>${r.kind}</td><td>${rc.r.join(', ')}</td><td ` +
        `class="num">${r.items}</td><td class="num">${rc.b}%</td><td class="num" ` +
        `style="font-weight:800">${est.toFixed(1)}%</td><td ` +
        `class="num">${rc.lo.toFixed(0)}-${rc.hi.toFixed(0)}%</td><td ` +
        `class="num">${Math.max(est, rc.p + (est - rc.b) * 0.5).toFixed(1)}%</td><td>${flag}</td></tr>`
      );
    })
    .join('');
  const tabs = [1, 2, 3, 4, 5, 6, 7, 8]
    .map(
      (i) =>
        `<button class="wo-btn ${i === w ? 'amber' : 'gray'}" ` +
        `style="padding:4px 10px;font-size:12px" onclick="diffSetReportWorld(${i})">World ${i}</button>`
    )
    .join(' ');
  const sum = Object.keys(DIFF_ZONE_TEXT)
    .filter((z) => counts[z])
    .map((z) => `${DIFF_ZONE_TEXT[z][0]} ${counts[z]}`)
    .join(' &middot; ');
  return (
    `<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">${tabs}</div>
    <div class="note" style="margin:4px 0;font-size:12px">${sum}</div>
    <div style="overflow-x:auto"><table class="diffTable"><thead><tr><th>Opponent</th><th>` +
    `Type</th><th>Style</th><th class="num">Items</th><th class="num">Raw before</th><th class="num">` +
    `Raw now</th><th class="num">Healthy range</th><th class="num">Strategic pressure</th><th>` +
    `Flag</th></tr></thead><tbody>${tr}</tbody></table></div>
    <div class="note" style="font-size:12px">Raw threat is the expected cost of one fight as a ` +
    `percent of your health. Strategic pressure adds the weight of the decisions the opponent forces ` +
    `on you (curses, freezes, hexes, discards, draw chains), so an opponent can hit softly and still ` +
    `score high. The engine only moves opponents that fall well outside their range, and only part ` +
    `of the way (the tuning strength). Everything else, weird ones included, is left alone. Hover a flag to see why.</div>`
  );
}
function diffFightsHTML() {
  const list = diffFights();
  if (!list.length)
    return (
      '<div class="note" style="font-size:12px">No fights recorded yet. ' +
      'Play a few and they show up here with what each one actually cost you.</div>'
    );
  const by = {};
  list.forEach((f) => {
    const k = f.kind + ' world ' + f.w;
    (by[k] = by[k] || []).push(f);
  });
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const sumRows = Object.entries(by)
    .sort()
    .map(
      ([k, a]) =>
        `<tr><td>${k}</td><td class="num">${a.length}</td><td ` +
        `class="num">${avg(a.map((f) => f.lostPct)).toFixed(1)}%</td><td ` +
        `class="num">${a.filter((f) => f.est != null).length ? avg(a.filter((f) => f.est != null).map((f) => f.est)).toFixed(1) + '%' : '-'}</td>` +
        `<td class="num">${avg(a.map((f) => f.turns)).toFixed(1)}</td></tr>`
    )
    .join('');
  const recent = list
    .slice(-12)
    .reverse()
    .map(
      (f) =>
        `<tr><td>${f.name}</td><td>${f.kind}, world ${f.w}</td>` +
        `<td class="num">${f.lostPct}%</td><td class="num">${f.est != null ? f.est + '%' : '-'}</td><td ` +
        `class="num">${f.turns}</td><td>${f.won ? 'Won' : 'Lost'}</td></tr>`
    )
    .join('');
  return (
    `<div style="overflow-x:auto"><table class="diffTable"><thead><tr><th>Group</th><th ` +
    `class="num">Fights</th><th class="num">Avg health lost</th><th class="num">Engine estimate</th>` +
    `<th class="num">Avg turns</th></tr></thead><tbody>${sumRows}</tbody></table></div>
    <div style="overflow-x:auto;margin-top:8px"><table class="diffTable"><thead><tr><th>Latest ` +
    `fights</th><th>Type</th><th class="num">Health lost</th><th class="num">Estimate</th><th ` +
    `class="num">Turns</th><th>Result</th></tr></thead><tbody>${recent}</tbody></table></div>
    <div class="note" style="font-size:12px">The engine assumes about 3 turns for a regular ` +
    `fight, 4 to 5 for an elite and 6 to 7 for a boss. If your fights run much shorter or longer, ` +
    `tell me and I will change that assumption.</div>
    <div style="margin-top:8px"><button class="wo-btn gray" style="padding:5px 12px" ` +
    `onclick="diffClearFights()">Clear fight log</button></div>`
  );
}
function diffScreen() {
  if (!META.devModeActive) return metaScreen();
  const heroOpts = STARTERS.map((id) => `<option value="${id}">${HEROES[id].name}</option>`).join('');
  const worldOpts = [1, 2, 3, 4, 5, 6, 7, 8]
    .map((i) => `<option value="${i}">World ${i} - ${WORLD_NAMES[i]}</option>`)
    .join('');
  const changed = Object.keys(DIFFICULTY_DEFAULTS).filter(diffIsChanged).length;
  return (
    `<div class="wo" style="max-width:860px;margin:0 auto"><div class="wo-stripe"></div><div class="wo-body">
    <style>.diffRow{display:flex;gap:12px;align-items:center;justify-content:space-between;` +
    `padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.08)}
      .labTable{border-collapse:collapse;width:100%;font-size:12px}.labTable th,.labTable ` +
    `td{padding:4px 7px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:left}.labTable ` +
    `.num{text-align:right;white-space:nowrap}
      .diffSelect{background:#1a2038;color:#fff;border:2px solid #1fb6a6;border-radius:6px;` +
    `padding:6px 8px;font-size:13px}</style>
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;` +
    `flex-wrap:wrap"><h1 style="margin:0">Difficulty <em>Tuning</em></h1>
      <button class="wo-btn gray" style="padding:5px 12px" onclick="render(metaScreen())">Back</button></div>
    <div class="wo-sub">The built-in numbers live in one block at the top of the game file, ` +
    `called DIFFICULTY_DEFAULTS. Changes you make here are saved in this browser only and sit on top ` +
    `of those numbers. ${
      changed
        ? `<b>${changed} setting${changed === 1 ? ' is' : 's are'} ` +
          `currently changed from the built-in numbers.</b>`
        : 'Nothing is changed from the built-in numbers right ' + 'now.'
    }</div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Test run</span><span></span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px">
        <select id="diffHero" class="diffSelect">${heroOpts}</select><select id="diffWorld" ` +
    `class="diffSelect">${worldOpts}</select>
        <button class="wo-btn amber" onclick="diffStartRun()">Start</button></div>
      <div class="note" style="font-size:12px;margin-top:6px">Jump straight into any world with ` +
    `any vehicle to check how it plays. Later worlds start you with more health and some coins so ` +
    `you are not hopelessly under-built (health is 100 plus 18 per world after the first, which is ` +
    `what the threat engine assumes). This does not change your saved progress.</div></div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Opponent health</span><span></span></div>
      ${diffSliderHTML(
        'hpBonusRegular',
        'Regular opponents',
        'Extra health on every regular opponent, strongest in ' +
          'World 1. Early fights were ending in two turns, so this keeps them at three or so.',
        0,
        100,
        5
      )}
      ${diffSliderHTML('hpBonusElite', 'Elites', 'Extra health on elites, strongest in World 1.', 0, 100, 5)}
      ${diffSliderHTML('hpBonusBoss', 'Bosses', 'Extra health on bosses, strongest in World 1.', 0, 100, 5)}
      ${diffSliderHTML(
        'hpEarlyFade',
        'Early bonus fades out by world',
        'The three bonuses above apply fully in World 1 and ' +
          'fade to nothing by this world. Set to 99 to keep them in every world.',
        2,
        99,
        1,
        ''
      )}
      ${diffSliderHTML(
        'hpRowRamp',
        'Build up across the world',
        'Extra health that grows from nothing at the first row ' +
          'to this amount near the boss. Regulars and elites. It is why an opponent late in a world is ' +
          'tougher than one at the start, since you will have more damage items by then.',
        0,
        60,
        5
      )}
      ${diffSliderHTML(
        'hpPerWorld',
        'Extra per world',
        'Adds this much for every world after the first. 15 ' +
          'means World 2 has 15 percent more, World 6 has 75 percent more, World 8 has 105 percent more.',
        0,
        40,
        5
      )}
    </div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Difficulty ideas</span><span></span></div>
      ${diffToggleHTML(
        'tuning',
        'Threat tuning',
        'Every opponent has a healthy range for how much of ' +
          'your health a fight should cost. Opponents inside the range are left alone. Only outliers get ' +
          'nudged, using damage, cards drawn per turn or draw on hit, and only part of the way.'
      )}
      ${diffSliderHTML(
        'strength',
        'Tuning strength',
        "How much of the engine's correction to apply. 0 means " +
          "none, 100 means all of it. 65 keeps most of each opponent's personality.",
        0,
        100,
        5
      )}
      ${diffSliderHTML(
        'difficulty',
        'Overall difficulty',
        '100 is the range the engine was built around. Try 80 ' + 'for a gentler run or 120 for a rough one.',
        60,
        150,
        5
      )}
      ${diffToggleHTML(
        'pacing',
        'Pacing',
        'The first five fights are gentle and teach one thing ' +
          'each. After that fights rise and relax across the world, with a breather after the Fleet ' +
          'Compound, get more complicated later, and the same style does not repeat back to back. The ' +
          'numbers for each row are paceByRow in the settings block.'
      )}
      ${diffToggleHTML(
        'rewardsScale',
        'Rewards follow difficulty',
        'Tougher-than-usual fights pay a little more coins, ' + 'easier ones a little less (85 to 135 percent).'
      )}
      ${diffToggleHTML(
        'mercy',
        'Mercy scaling',
        'Off is recommended. When on, opponents hit a little ' +
          'softer if you start the fight under 35 percent health, and a little harder above 90 percent.'
      )}
      ${diffToggleHTML(
        'extraItems',
        'More opponent items',
        'Elites get 2 to 3 items and bosses 3 to 4. The extra ' +
          'ones sit to the right so the strong attack still comes first. Many of them draw cards, freeze, ' +
          'curse, hex or knock a card out of your hand, so they change what you want to do.'
      )}
      ${diffToggleHTML(
        'drawOnHit',
        'Draw on hit',
        'A few opponents with hard hands (like Two Pair or ' +
          'Three of a Kind) draw a card each time you hit them. The card says so under their health bar. ' +
          'Opponents also draw with their draw items now, including the Easter egg ones.'
      )}
      ${diffToggleHTML(
        'curseBoost',
        'Curses on elites and bosses hurt more',
        'Elite curses go off for about 25 percent more and boss ' +
          'curses for about 50 percent more, so hit plus curse is a real threat.'
      )}
    </div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Rules that changed</span><span></span></div>
      ${diffToggleHTML(
        'dotHitsPlayer',
        'Poison and Burn hit their target',
        'A Poison or Burn attack from an opponent lands on you, ' +
          'ticking at the end of each opponent turn and skipping armor. Yours still land on them. In the ' +
          "old game the opponent's version was landing on the opponent."
      )}
      ${diffToggleHTML(
        'fixTwoPair',
        'Two Pair items can hold 4 cards',
        'Sixteen items say Needs Two Pair but could only hold 3 ' +
          'cards, so they could only ever fire on Three of a Kind. On means they fire on an actual Two ' +
          'Pair. The engine numbers assume this is on.'
      )}
      ${diffToggleHTML(
        'lightningFromZero',
        'Lightning rolls 0 to 100 percent',
        'One roll is shared by everyone. Whenever you or an ' +
          'opponent fires a Lightning attack, that roll is used and then rerolled. The current roll shows ' +
          'in your status bar, so you can plan around it, or fire a Lightning attack to reroll it.'
      )}
      ${diffSelectHTML(
        'swingCap',
        'Damage cap per swing',
        'The old game capped one swing between 22 and 60. Flat ' +
          '99 fits a 100 health start, so a big hit plus a curse can finish you if you ignore the curse.',
        [
          ['flat99', 'Flat 99'],
          ['health', '45 percent of health'],
          ['base', 'Old caps (22 to 60)'],
        ]
      )}
    </div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Display</span><span></span></div>
      ${diffToggleHTML(
        'showNumbers',
        'Show engine numbers on stop details',
        "Adds the engine's raw threat and strategic pressure " + 'under Difficulty when you tap a battle stop.'
      )}
      ${diffToggleHTML(
        'logFights',
        'Record my fights',
        'Saves what each fight actually cost you so it can be ' + "compared with the engine's estimate."
      )}
      <div style="margin-top:10px"><button class="wo-btn gray" style="padding:5px 12px" ` +
    `onclick="diffResetSettings()">Reset to built-in settings</button></div></div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Threat report</span><span>` +
    `</span></div>${diffReportHTML()}</div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Your fights</span><span>` +
    `</span></div>${diffFightsHTML()}</div>
    <div class="panel" style="margin:10px 0"><div class="hdr"><span>Styles</span><span></span></div>
      ${Object.entries(DIFF_STYLE_TEXT)
        .map(([k, v]) => `<div class="note" style="margin:3px 0"><b>${k}.</b>` + ` ${v}</div>`)
        .join('')}</div>
  </div></div>`
  );
}
function diffStartRun() {
  const hero = document.getElementById('diffHero').value,
    world = +document.getElementById('diffWorld').value;
  clearRunSave();
  initRunWithStarter(hero);
  if (world > 1) {
    RUN.world = world;
    RUN.worldMultiplier = worldDifficultyMultiplier(world);
    RUN.maxHealth += 18 * (world - 1);
    RUN.health = RUN.maxHealth;
    RUN.chips += 250 * (world - 1);
    RUN.gems = RUN.maxGems;
    RUN.fuel = RUN.maxFuel;
    RUN.map = generateMap();
    RUN.bossRow = RUN.map.nodes.length - 1;
    RUN.currentRow = -1;
    RUN.currentCol = null;
    RUN.path = [];
  }
  saveRun();
  render(mapScreen());
}
diffApplyGlobals();
