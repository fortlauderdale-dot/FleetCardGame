// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Screens: Map And Stop Details                                                 ██
// ██  The top bar, the map, and the Stop Details popup.                             ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function noticeHTML() {
  if (!RUN || !RUN.lastNotice) return '';
  const msg = RUN.lastNotice;
  RUN.lastNotice = null;
  return (
    `<div class="panel" style="border-color:var(--red)"><div class="note" ` +
    `style="color:var(--red);margin:0">${msg}</div></div>`
  );
}
function currencyBar(extraHTML = '') {
  return (
    `<div class="currencies currencyHeader">
    <div class="cur health" data-title="Your health. Runs out and the run ` +
    `ends.">${ICON.heart} ${RUN.health}/${RUN.maxHealth}</div>
    <div class="cur chip" data-title="Coins are used to buy vehicles and pay for certain ` +
    `services.">${ICON.coin} ${RUN.chips} <span class="curLbl">Coins</span></div>
    <div class="cur gem" data-title="Gems let you draw extra cards during a ` +
    `battle.">${ICON.gem} ${RUN.gems}/${RUN.maxGems} <span class="curLbl">Gems</span></div>
    ${
      usesCoinTravel()
        ? `<div class="cur chip" data-title="This vehicle has no fuel tank. ` +
          `Every stop you travel to costs ${coinTravelCost()} coins. If you cannot pay, it costs you ` +
          `health, the same as running out of fuel.">${ICON.coin} ${coinTravelCost()} per stop</div>`
        : `<div class="cur fuel" data-title="Fuel is spent when ` +
          `you travel to another stop.">${ICON.fuel} ${RUN.fuel}/${RUN.maxFuel} <span class="curLbl">Fuel</span></div>`
    }
    <div class="cur energy" data-title="Energy powers vehicle ` +
    `abilities.">${ICON.energy} ${RUN.energy}/${RUN.maxEnergy} <span class="curLbl">Energy</span></div>
    <div class="cur pts" data-title="Career Points carry over between playthroughs and only buy ` +
    `Permanent Upgrades.">${ICON.star} ${META.points} <span class="curLbl">Career Points</span></div>
    <div style="margin-left:auto;display:flex;` +
    `gap:6px">${
      META.devModeActive ? `<button class="wo-btn gray runBarBtn" id="devPanelBtn">` + `[🛠️ DEV]</button>` : ''
    }<button ` +
    `class="wo-btn gray runBarBtn" id="openRunSummaryBtn">Run Dashboard</button></div>
    ${extraHTML}
  </div>`
  );
}

let MAP_POPUP = null;
let TREASURE_POPUP = null;
let GARAGE_POPUP = false;
let GARAGE_MESSAGE = '';
let ART_ZOOM = null;
function artZoomModalHTML() {
  return `<div class="treasure-modal artZoomModal" id="artZoomOverlay">
    <div class="artZoomBox">
      <button class="artZoomClose" id="artZoomCloseBtn" aria-label="Close">&times;</button>
      <div class="artZoomImgWrap">${art(ART_ZOOM, 140)}</div>
      <div class="artZoomLabel">${ART_ZOOM.name || ''}</div>
    </div>
  </div>`;
}

function suitName(s) {
  return { '♥': 'Hearts', '♦': 'Diamonds', '♣': 'Clubs', '♠': 'Spades' }[s] || s;
}
function effectPhrase(effect) {
  return (
    {
      burn: 'applies burn',
      poison: 'applies poison',
      curse: 'curses one of your Items',
      stun: 'stuns your next counter-attack',
      heal: 'heals itself',
      stealFuel: 'steals fuel',
      reinforceArmor: 'reinforces its own armor',
      draw: 'draws an extra card',
    }[effect] || effect
  );
}

function nodePopupContent(r, c) {
  const node = RUN.map.nodes[r][c];
  const glyph = (svg) => `<span class="vart" style="width:64px;height:64px;font-size:64px">${svg}</span>`;
  if (node.type === 'battle') {
    // Preview the fight using the SAME stat adjustments startBattle actually applies (the World 1
    // HP cap and curse-item strip), so what's shown here always matches what you actually fight and win.
    const o = effectiveOpponentDef(node.opponent);
    const isElite = /\[Elite\]/.test(o.name || '');
    const { chipReward, gemReward, fuelReward } = battleRewardsFor(o, r);
    const specialNote =
      o.special?.type === 'drawOnHit'
        ? `<div class="note" style="margin-top:4px">Draws ` +
          `+${o.special.amount || 1} card${(o.special.amount || 1) > 1 ? 's' : ''} into its hand every time you ` +
          `land a direct hit on it.</div>`
        : o.startPoolBonus
          ? `<div class="note" style="margin-top:4px">Starts the fight ` +
            `with ${o.startPoolBonus} extra card${o.startPoolBonus > 1 ? 's' : ''} already in hand.</div>`
          : o.special?.type === 'lifesteal'
            ? `<div class="note" style="margin-top:4px">` +
              `Heals ${Math.round((o.special.pct || 0.5) * 100)}% of the damage its attacks deal.</div>`
            : '';
    const headsUpNote = opponentHeadsUp(o)
      .map((n) => `<div class="note" style="margin-top:4px;color:#ffb0a8">` + `<b>Heads up:</b> ${n}</div>`)
      .join('');
    // Armor is folded into the HP line ("HP 47 + 15 Armor"), with the regen detail in a hover tip.
    const armorTag = o.startArmor
      ? ` <span class="hoverTip" style="color:#cd7f32;` +
        `font-weight:800" data-title="Armor blocks your direct hits before HP, but poison/burn/curse ` +
        `skip it.${
          o.armorRegen
            ? ` Regenerates ${o.armorRegen} more each ` + `turn.`
            : ' Only comes back if it reinforces ' + 'itself.'
        }">` +
        `+ ${o.startArmor} Armor</span>`
      : '';
    const diff = opponentDifficultyInfo(o);
    const rewardsInline = `<div class="currencies stopRewardInline">
      ${chipReward ? `<span class="cur chip" data-title="Coins earned for winning.">${ICON.coin} ${chipReward}</span>` : ''}
      ${gemReward ? `<span class="cur gem" data-title="Gems earned for winning.">${ICON.gem} ${gemReward}</span>` : ''}
      ${fuelReward ? `<span class="cur fuel" data-title="Fuel earned for winning.">${ICON.fuel} ${fuelReward}</span>` : ''}
    </div>`;
    return {
      title: o.name,
      art: art(o, 140),
      bigArt: true,
      rewardsInline,
      titleTag: o.boss ? '<span class="stopBossTag">World Boss</span>' : '',
      rows: [['HP', `${o.hp}${armorTag}`], ['Draws', `${o.drawRate}/turn`], ...diffDifficultyRow(o, diff)],
      itemsHTML: `<div class="popupItemRow">${opponentAttackBoxHTML(o)}</div>`,
      extra: `${specialNote}${headsUpNote}${
        o.boss
          ? ''
          : isElite
            ? `<div class="note" style="color:#d9861f;font-weight:700;` + `margin-top:4px">Elite Battle</div>`
            : ''
      }`,
      rewards: { chipReward, gemReward, fuelReward },
      actionLabel: o.boss ? 'Battle Boss' : isElite ? 'Battle Elite' : 'Battle',
      eyebrow: o.boss ? 'Boss Battle' : isElite ? 'Elite Battle' : 'Stop Details',
      accent: o.boss ? '#7a0000' : isElite ? '#d9861f' : null,
    };
  }
  if (node.type === 'shop')
    return {
      title: 'Dealership',
      art: iconImg('node-dealership.png', ICON.cart, 64),
      heroImg: 'Icons/node-dealership.png',
      heroFallback: ICON.cart,
      rows: [],
      extra: '<div class="note">Buy a vehicle with ' + 'coins.</div>',
      actionLabel: 'Enter',
    };
  if (node.type === 'rest')
    return {
      title: 'Service Station',
      art: iconImg('node-service-station.png', ICON.wrench, 64),
      heroImg: 'Icons/node-service-station.png',
      heroFallback: ICON.wrench,
      rows: [],
      extra: '<div class="note">Restore 30 ' + 'health.</div>',
      actionLabel: 'Go Here',
    };
  if (node.type === 'blacksmith')
    return {
      title: 'Tuning Garage',
      art: iconImg('node-tuning-garage.png', ICON.hammer, 64),
      heroImg: 'Icons/node-tuning-garage.png',
      heroFallback: ICON.hammer,
      rows: [],
      extra:
        '<div class="note">Spend coins to permanently boost a ' +
        'card (or a whole rank/suit), for this run only.</div>',
      actionLabel: 'Go Here',
    };
  if (node.type === 'chopshop')
    return {
      title: 'Chop Shop',
      art: iconImg('node-chop-shop.png', ICON.curse, 64),
      heroImg: 'Icons/node-chop-shop.png',
      heroFallback: ICON.curse,
      rows: [],
      extra:
        '<div class="note">Spend coins to convert an Item to ' + 'poison, burn, or curse, or add card slots.</div>',
      actionLabel: 'Go Here',
    };
  if (node.type === 'overdrive')
    return {
      title: 'Overdrive Bay',
      art: iconImg('node-overdrive-bay.png', ICON.energy, 64),
      heroImg: 'Icons/node-overdrive-bay.png',
      heroFallback: ICON.energy,
      rows: [],
      extra: '<div class="note">Spend coins to add uses per turn to ' + 'your equipped Items.</div>',
      actionLabel: 'Go Here',
    };
  if (node.type === 'treasure')
    return {
      title: node.big ? 'Big Supply Cache' : 'Supply Cache',
      art: iconImg('node-supply-cache.png', ICON.gift, 64),
      heroImg: 'Icons/node-supply-cache.png',
      heroFallback: ICON.gift,
      rows: [],
      extra: `<div class="note">${
        node.big
          ? 'A bigger haul for taking the risky route: double-value ' +
            'reward of coins, fuel, gems, energy, or Career Points.'
          : 'One random reward: coins, fuel, gems, energy, or ' + 'Career Points.'
      }</div>`,
      actionLabel: 'Go Here',
    };
  if (node.type === 'match_hazard')
    return {
      title: 'Grid Anomaly',
      art: glyph(JOKER_MAP_ICON),
      heroImg: 'Hazards/joker-map.png',
      heroFallback: '🃏',
      rows: [],
      centerTitle: true,
      extra:
        `<div class="note" style="text-align:center">Grid ` +
        `Anomaly Detected: Tap to hack the Carnival Board for extra fleet gear.</div>`,
      actionLabel: 'Go Here',
    };
  if (node.type === 'plinko_hazard')
    return {
      title: 'Fleet Plinko',
      art: iconImg('node-fleet-plinko.png', '🎯', 64),
      heroImg: 'Icons/node-fleet-plinko.png',
      heroFallback: '🎯',
      rows: [],
      extra: `<div class="note">A Plinko board found out on the ` + `road: drop chips for coins, fuel, or gems.</div>`,
      actionLabel: 'Go Here',
    };
  if (node.type === 'blackjack_hazard')
    return {
      title: 'Fleet Blackjack',
      art: iconImg('node-fleet-blackjack.png', '♠️', 64),
      heroImg: 'Icons/node-fleet-blackjack.png',
      heroFallback: '♠️',
      rows: [],
      extra: `<div class="note">A roadside Blackjack table: draw and ` + `Stand against the dealer for a haul.</div>`,
      actionLabel: 'Go Here',
    };
  if (node.type === 'poker_hazard')
    return {
      title: 'Fleet Poker',
      art: iconImg('node-fleet-poker.png', '♣️', 64),
      heroImg: 'Icons/node-fleet-poker.png',
      heroFallback: '♣️',
      rows: [],
      extra:
        `<div class="note">A roadside Hold'em table: build your ` + `best hands against the dealer for a haul.</div>`,
      actionLabel: 'Go Here',
    };
  if (node.type === 'auction_hazard')
    return {
      title: 'Fleet Auction',
      art: iconImg('node-fleet-auction.png', '🔨', 64),
      heroImg: 'Icons/node-fleet-auction.png',
      heroFallback: '🔨',
      rows: [],
      extra: `<div class="note">A pop-up Fleet Auction: bid for ` + `coins, fuel, gems, or Items.</div>`,
      actionLabel: 'Go Here',
    };
  return {
    title: 'Fleet Compound',
    art: iconImg('node-fleet-compound.png', ICON.castle, 64),
    heroImg: 'Icons/node-fleet-compound.png',
    heroFallback: ICON.castle,
    rows: [],
    extra: '<div class="note">Battles, the Dealership, refueling, ' + 'a card match game, and more.</div>',
    actionLabel: 'Go Here',
  };
}
function nodePopupScreen(r, c) {
  const isAvail = availableNextNodes().some((n) => n.row === r && n.col === c);
  const nodeType = RUN.map.nodes[r][c].type;
  const isReenterable = ['shop', 'rest', 'blacksmith', 'chopshop', 'castle'].includes(nodeType);
  const isCurrent = r === RUN.currentRow && c === RUN.currentCol && isReenterable;
  const info = nodePopupContent(r, c);
  const rewardsHTML = info.rewards
    ? `
    <div class="hdr" style="margin-top:10px"><span class="hoverTip" data-title="Awarded when ` +
      `your final hit exactly matches their remaining HP.">Perfect Win Bonus:</span><span></span></div>
    <div class="currencies">
      <div class="cur chip">${ICON.coin} +15 coins</div>
      <div class="cur gem">${ICON.gem} +1 gem</div>
      <div class="cur pts">${ICON.star} +${PERFECT_KILL_CP} Career Points</div>
      ${fuelChipHTML(1, true)}
    </div>`
    : '';
  const buttonsHTML = `<div class="popupTopBtns">
          ${
            isAvail
              ? `<button class="wo-btn ${info.accent ? 'red' : 'amber'}" id="popupGoBtn" ` +
                `style="flex:1">${info.actionLabel}</button>`
              : isCurrent
                ? `<button class="wo-btn amber" id="popupReenterBtn" ` + `style="flex:1">Go Back In</button>`
                : ''
          }
          <button class="wo-btn gray" id="popupCloseBtn" style="flex:1">Close</button>
        </div>`;
  return (
    `<div class="map-popup-overlay popupBtnsTop">
    <div class="popupTopWrap${info.bigArt ? ' wide' : ''}">
${buttonsHTML}
    <div class="wo${info.bigArt ? ' wide' : ''}" ` +
    `style="width:100%${info.accent ? `;border-color:${info.accent}` : ''}">
      <div class="wo-stripe" ${info.accent ? `style="background:${info.accent}"` : ''}></div>
      <div class="wo-body">
        ${
          info.bigArt
            ? `
        <div class="wo-eyebrow"${info.accent ? ` style="color:${info.accent}"` : ''}>${info.eyebrow || 'Stop Details'}</div>
        <div class="stopTitleRow">
          <h1 style="margin:2px 0 0">${info.title}</h1>
          ${info.rewardsInline || ''}
          ${info.titleTag || ''}
        </div>
        <div class="stopArtRow">
          <div class="sdLeftCol">
            <div class="stopArtStats">${info.rows
              .map(
                ([k, v]) =>
                  `<div class="stopStatLine"><span ` +
                  `class="stopStatLabel">${k}</span><span class="stopStatValue">${v}</span></div>`
              )
              .join('')}</div>
            ${info.itemsHTML || ''}
          </div>
          <div class="stopArtBig">${info.art}</div>
        </div>`
            : `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
          <div style="flex:1;min-width:0${info.centerTitle ? ';text-align:center' : ''}">
            <div class="wo-eyebrow"${info.accent ? ` style="color:${info.accent}"` : ''}>${info.eyebrow || 'Stop Details'}</div>
            <h1 style="margin:2px 0 0">${info.title}</h1>
          </div>
          ${info.heroImg ? '' : `<div style="flex-shrink:0">${info.art}</div>`}
        </div>
        ${
          info.heroImg
            ? `<div class="popupHeroArt"><img src="${info.heroImg}" alt="" ` +
              `onerror="this.outerHTML='<div class=&quot;popupHeroFallback&quot;>${info.heroFallback || ''}</div>'"></div>`
            : ''
        }
        ${
          info.rows.length
            ? `<div class="note" style="margin:8px 0;font-weight:700;` +
              `color:var(--ink);font-size:13px">${info.rows
                .map(([k, v]) => `${k}: ${v}`)
                .join(' &nbsp;&middot;&nbsp;' + ' ')}</div>`
            : ''
        }`
        }
        ${info.extra || ''}
        ${rewardsHTML}
      </div>
    </div>
    </div>
  </div>`
  );
}
function mapScreen() {
  const rows = RUN.map.nodes;
  const colW = 118;
  // Taller map on a phone held upright so it fills more of the screen
  const mapH =
    window.innerHeight > window.innerWidth && window.innerWidth <= 700
      ? Math.round(Math.min(620, Math.max(336, window.innerHeight * 0.58)))
      : 336;
  // Rows keep a small fixed margin from the top and bottom edge, so a taller map spreads the rows apart
  // instead of adding empty space above and below them.
  // The map box has 16px of padding and border above the nodes and 14px below, so the top row sits 6px in from the
  // top (still room for the tag) and the bottom row ends 22px above the bottom edge. Both edges then look the same.
  const NODE_R = 45;
  const rowTop = 6 + NODE_R,
    rowBottom = mapH - 38 - NODE_R;
  const rowY = [rowTop, Math.round((rowTop + rowBottom) / 2), rowBottom];
  const CASTLE_GAP = 65;
  const castleR = rows.findIndex((row) => row.some((n) => n && n.type === 'castle'));
  const colX = (r) =>
    25 + r * colW + colW / 2 + (castleR < 0 ? 0 : r > castleR ? CASTLE_GAP * 2 : r === castleR ? CASTLE_GAP : 0);
  const totalW = rows.length * colW + 50 + (castleR >= 0 ? CASTLE_GAP * 2 : 0);
  const totalH = mapH;
  const avail = availableNextNodes();
  const visibleRange = 3 + META.levels.range + (RUN.runUpgrades?.sightRange || 0);
  let svgLines = '';

  for (const e of RUN.map.edges) {
    const x1 = colX(e.fromRow);
    const x2 = colX(e.toRow);
    // Nodes from a run saved before lanes existed have no .lane - fall back to the column index (same
    // rule the node placement below uses) so the connection lines still draw for those saves.
    const fromNode = rows[e.fromRow] && rows[e.fromRow][e.fromCol],
      toNode = rows[e.toRow] && rows[e.toRow][e.toCol];
    const fromLane = fromNode && fromNode.lane != null ? fromNode.lane : e.fromCol;
    const toLane = toNode && toNode.lane != null ? toNode.lane : e.toCol;
    const y1 = rowY[Math.min(fromLane, rowY.length - 1)];
    const y2 = rowY[Math.min(toLane, rowY.length - 1)];
    const traveled =
      RUN.path.some((p) => p.row === e.fromRow && p.col === e.fromCol) &&
      RUN.path.some((p) => p.row === e.toRow && p.col === e.toCol);
    svgLines +=
      `<path d="M ${x1} ${y1} C ${x1 + 28} ${y1}, ${x2 - 28} ${y2}, ${x2} ${y2}"
      fill="none" stroke="${traveled ? '#ffc44d' : '#7f9180'}" stroke-width="${traveled ? 5 : 3}" ` +
      `stroke-linecap="round" ${traveled ? 'style="filter:drop-shadow(0 0 4px ' + '#1fb6a6)"' : ''}/>`;
  }

  let nodesHTML = '';
  const NODE_ICON = {
    shop: ICON.cart,
    rest: ICON.wrench,
    blacksmith: ICON.hammer,
    chopshop: ICON.curse,
    overdrive: ICON.energy,
    treasure: ICON.gift,
    castle: ICON.castle,
    match_hazard: JOKER_MAP_ICON,
    plinko_hazard: '🎯',
    blackjack_hazard: '♠️',
    poker_hazard: '♣️',
    auction_hazard: '🔨',
  };
  // Icon file for each map-node type. match_hazard is left out because it uses Hazards/joker-map.png
  // (NODE_ICON.match_hazard). Anything without a file falls back to its NODE_ICON emoji through
  // iconImg()'s onerror handler.
  const NODE_ICON_FILE = {
    shop: 'node-dealership.png',
    rest: 'node-service-station.png',
    blacksmith: 'node-tuning-garage.png',
    chopshop: 'node-chop-shop.png',
    overdrive: 'node-overdrive-bay.png',
    treasure: 'node-supply-cache.png',
    castle: 'node-fleet-compound.png',
    plinko_hazard: 'node-fleet-plinko.png',
    blackjack_hazard: 'node-fleet-blackjack.png',
    poker_hazard: 'node-fleet-poker.png',
    auction_hazard: 'node-fleet-auction.png',
  };
  const NODE_TITLE = {
    shop: 'Dealership',
    rest: 'Service Station',
    blacksmith: 'Tuning Garage',
    chopshop: 'Chop Shop',
    overdrive: 'Overdrive Bay',
    treasure: 'Supply Cache',
    castle: 'Fleet Compound',
    match_hazard: 'Grid Anomaly',
    plinko_hazard: 'Fleet Plinko',
    blackjack_hazard: 'Fleet Blackjack',
    poker_hazard: 'Fleet Poker',
    auction_hazard: 'Fleet Auction',
  };

  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      const node = rows[r][c],
        x = colX(r),
        lane = node.lane != null ? node.lane : c,
        y = rowY[Math.min(lane, rowY.length - 1)];
      const isDone = RUN.path.some((p) => p.row === r && p.col === c);
      const isCurrent = r === RUN.currentRow && c === RUN.currentCol;
      const isAvail = avail.some((n) => n.row === r && n.col === c);
      const isBoss = r === rows.length - 1;
      const isCastle = node.type === 'castle';
      const isElite = node.type === 'battle' && node.opponent && /\[Elite\]/.test(node.opponent.name || '');
      const withinSight = r <= RUN.currentRow + visibleRange;
      const showReal = isBoss || isDone || isAvail || withinSight || isCastle;
      const isWorldBossNode = isBoss;
      const cls =
        (isCurrent
          ? 'current'
          : isDone
            ? 'done'
            : isAvail
              ? 'avail'
              : withinSight || isCastle
                ? 'future'
                : 'farfuture') +
        (isWorldBossNode ? ' worldboss' : '') +
        (isElite ? ' elitenode' : '') +
        (showReal ? '' : ' fogged');
      const iconSize = isCastle && showReal ? 104 : isWorldBossNode && showReal ? 62 : 56;
      const battleIconSize = isWorldBossNode ? 104 : 94;
      const icon = !showReal
        ? ''
        : node.type === 'battle'
          ? art(node.opponent, battleIconSize)
          : NODE_ICON_FILE[node.type]
            ? iconImg(NODE_ICON_FILE[node.type], NODE_ICON[node.type], iconSize)
            : `<span class="vart" style="width:${iconSize}px;` +
              `height:${iconSize}px;font-size:${iconSize}px">${NODE_ICON[node.type]}</span>`;
      const title = !showReal ? 'Unscouted' : node.type === 'battle' ? node.opponent.name : NODE_TITLE[node.type];
      let tip;
      if (!showReal) tip = 'Move closer to scout this stop.';
      else if (node.type === 'battle') {
        const o = effectiveOpponentDef(node.opponent);
        tip = `HP: ${o.hp}<br>Draws ${o.drawRate}/turn${o.boss ? '<br><b>World Boss</b>' : ''}${
          node.gridStorm ? '<br><b style="color:var(--red)">Grid Storm: purges ' + 'your hand at end of turn</b>' : ''
        }`;
      } else if (node.type === 'shop') tip = 'Dealership - buy and sell Items.';
      else if (node.type === 'rest') tip = 'Restore 30 health.';
      else if (node.type === 'blacksmith') tip = 'Spend coins to permanently boost a card, rank, or suit for this run.';
      else if (node.type === 'chopshop')
        tip = 'Spend coins to convert an Item to poison, burn, or ' + 'curse, or add card slots.';
      else if (node.type === 'overdrive') tip = 'Spend coins to add uses per turn to your equipped Items.';
      else if (node.type === 'castle') tip = 'Choose battles, shopping, refueling, a matching game, or other rewards.';
      else if (node.type === 'match_hazard')
        tip = 'Grid Anomaly Detected: Tap to hack the Carnival Board ' + 'for extra fleet gear.';
      else if (node.type === 'plinko_hazard')
        tip = 'A Plinko board found out on the road: drop chips for ' + 'coins, fuel, or gems.';
      else if (node.type === 'blackjack_hazard')
        tip = 'A roadside Blackjack table: draw and Stand against the ' + 'dealer for a haul.';
      else if (node.type === 'poker_hazard')
        tip = "A roadside Hold'em table: build your best hands " + 'against the dealer for a haul.';
      else if (node.type === 'auction_hazard') tip = 'A pop-up Fleet Auction: bid for coins, fuel, gems, or Items.';
      else tip = 'Find coins, fuel, and gems.';

      nodesHTML +=
        `<div class="mapnode-wrap ${isBoss ? 'bossnode ' : ''}${isCastle ? 'castlenode ' : ''}${lane === 0 ? 'toprow' : lane === 1 ? 'midrow' : 'bottomrow'}" ` +
        `style="left:${(x / totalW) * 100}%;top:${y}px">
        ${isCurrent ? '<div class="hereTag">You Are Here</div>' : ''}
        <button class="mapnode ${cls} ` +
        `type-${node.type}" ${showReal ? `data-nodeinfo="${r}:${c}"` : ''} ${showReal ? '' : 'disabled'}>${icon}</button>
        <div class="tooltip">` +
        `<b>${title}</b>${isCurrent ? ' <span style="color:var(--amber)">(current)</span>' : ''}<br>${tip}</div>
      </div>`;
    }
  }
  return (
    `<div id="map-viewport">${noticeHTML()}<div ` +
    `class="panel">${currencyBar(
      `<div style="margin-left:auto;display:flex;gap:6px">` +
        `<button class="wo-btn purple runBarBtn" id="openRunUpgradeFromMapBtn">Run Upgrade</button>` +
        `<button class="wo-btn red runBarBtn" id="forfeitRunBtn">Forfeit Run</button></div>`
    )}</div>` +
    `<div class="panel"><div class="mapwrap" style="width:100%;height:${totalH}px;overflow-x:auto;` +
    `overflow-y:hidden;position:relative"><div style="position:relative;width:${totalW}px;` +
    `height:${totalH}px"><svg width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" ` +
    `style="position:absolute;left:0;top:0;` +
    `pointer-events:none">${svgLines}</svg>${nodesHTML}${(() => {
      const parsedName = String(META.playerName || 'Commander')
        .trim()
        .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      return RUN.world === 1 && RUN.currentRow === -1 && !RUN.onboardingDismissed
        ? `<div class="floating-tutorial-card"><div ` +
            `class="wo-eyebrow">Fleet Onboarding</div><h3>Welcome, ${parsedName}!</h3><p>Click the node to ` +
            `the left to start your journey.</p></div>`
        : '';
    })()}</div>${MAP_POPUP ? nodePopupScreen(MAP_POPUP.row, MAP_POPUP.col) : ''}${TREASURE_POPUP ? treasureScreen(TREASURE_POPUP) : ''}${GARAGE_POPUP ? garageScreen(GARAGE_MESSAGE) : ''}${MATCH_OVERLAY_ACTIVE ? castleMatchScreen() : ''}${RULES_NOTE_POPUP ? rulesNotePopupHTML() : ''}</div>` +
    `<div class="regionCaption">World ${RUN.world}: ${WORLD_NAMES[RUN.world] || WORLD_NAMES[1]}</div></div></div>`
  );
}
