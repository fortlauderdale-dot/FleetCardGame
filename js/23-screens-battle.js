// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Screens: Battle, Shops And Run Screens                                        ██
// ██  Run Upgrades, the battle screen, shops, results and the vehicle picker.       ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const MAX_ITEM_CAP = 9;
const RUN_UPGRADE_DEFS = {
  itemSlots: {
    label: 'Item Slot',
    desc: '+1 Item slot.',
    baseCost: 100,
    mult: 2,
    cap: 6,
    base: () => Math.min(MAX_ITEM_CAP, 3 + (META.levels.garage || 0)),
  },
  drawPerTurn: {
    label: 'Cards Drawn/Turn',
    desc: '+1 card drawn at the start of each turn.',
    baseCost: 60,
    mult: 2,
    cap: 5,
    base: () => 2 + (META.levels.draw || 0),
  },
  sightRange: {
    label: 'Map Sight Range',
    desc: '+1 route space visible ahead on the map.',
    baseCost: 40,
    mult: 1.8,
    cap: 5,
    base: () => 3 + (META.levels.range || 0),
  },
  gemDraw: {
    label: 'Gem Draw',
    desc: '+1 card drawn per gem spent.',
    baseCost: 50,
    mult: 2,
    cap: 4,
    base: () => 1 + (META.levels.gem || 0),
  },
};
function runUpgradeCost(kind) {
  const def = RUN_UPGRADE_DEFS[kind],
    n = RUN.runUpgrades[kind] || 0;
  return def.mult ? Math.round(def.baseCost * Math.pow(def.mult, n)) : def.baseCost + def.add * n;
}
let RUN_UPGRADE_RETURN = 'map';
let RUN_UPGRADE_RETURN_FROMCASTLE = false;
function runUpgradeScreen() {
  const rows = Object.entries(RUN_UPGRADE_DEFS)
    .map(([kind, def]) => {
      const n = RUN.runUpgrades[kind] || 0;
      const maxed = n >= def.cap;
      const full = kind === 'health' && RUN.health >= RUN.maxHealth;
      const cost = runUpgradeCost(kind);
      const canAfford = RUN.chips >= cost && !maxed && !full;
      const currentLabel = def.isHeal ? `${RUN.health}/${RUN.maxHealth} HP` : `${def.base ? def.base() : 0} (+${n})`;
      return (
        `<div class="shopcard" style="padding:8px 10px"><div class="hdr" style="margin:0">` +
        `<span>${def.label}</span><span class="note" style="margin:0">Current: ${currentLabel}</span></div>
      <div class="note" style="margin:2px 0 6px">${def.desc}</div>
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px">
        <span class="price" style="white-space:nowrap">${maxed ? 'Maxed' : cost + ' coins'}</span>
        <button class="wo-btn amber" data-runupgrade="${kind}" ${canAfford ? '' : 'disabled'} ` +
        `style="padding:8px 12px;font-size:13px;` +
        `white-space:nowrap">${maxed ? 'Maxed for this run' : full ? 'Full health' : 'Buy'}</button>
      </div>
    </div>`
      );
    })
    .join('');
  const backLabel =
    RUN_UPGRADE_RETURN === 'battle'
      ? 'Back to Battle'
      : RUN_UPGRADE_RETURN === 'shop'
        ? RUN_UPGRADE_RETURN_FROMCASTLE
          ? 'Back to Compound'
          : roadExitLabel()
        : RUN_UPGRADE_RETURN === 'blacksmith'
          ? 'Back to Tuning Garage'
          : RUN_UPGRADE_RETURN === 'rest'
            ? 'Back to Service Station'
            : RUN_UPGRADE_RETURN === 'chopshop'
              ? 'Back to Chop Shop'
              : RUN_UPGRADE_RETURN === 'overdrive'
                ? 'Back to Overdrive Bay'
                : RUN_UPGRADE_RETURN === 'dungeon'
                  ? 'Back to Dungeon'
                  : RUN_UPGRADE_RETURN === 'inn'
                    ? 'Back to Body Shop'
                    : roadExitLabel();
  return (
    `${noticeHTML()}<div class="wo" style="max-width:640px;margin-left:auto;` +
    `margin-right:auto"><div class="wo-stripe"></div><div class="wo-body">
    <div class="wo-eyebrow">Run Upgrade</div><h1>Run <em>Upgrades</em></h1>${currencyBar()}
    <div style="margin:6px 0">${rows}</div>
    <button class="wo-btn teal" id="leaveRunUpgradeBtn" style="width:100%;margin-top:10px">${backLabel}</button>
  </div></div>`
  );
}

function battleScreen() {
  const opp = BATTLE.opponent;
  const hpPct = Math.max(0, (opp.hpNow / opp.hp) * 100);
  const healthPct = Math.max(0, (RUN.health / RUN.maxHealth) * 100);

  // The opponent's face-up cards can be sorted by value or suit, same as your hand. Face-down cards always sit at
  // the end so sorting never gives away where they are.
  const oppSuitOrder = { '♠': 0, '♥': 1, '♦': 2, '♣': 3 };
  const oppSortMode = RUN.handSortMode || 'value';
  const oppUp = BATTLE.oppPool
    .filter((c) => c.revealed)
    .sort((a, b) =>
      oppSortMode === 'suit'
        ? oppSuitOrder[a.suit] - oppSuitOrder[b.suit] || a.rank - b.rank
        : a.rank - b.rank || oppSuitOrder[a.suit] - oppSuitOrder[b.suit]
    );
  const oppDown = BATTLE.oppPool.filter((c) => !c.revealed);
  const poolHTML =
    [
      ...oppUp.map(
        (c) =>
          `<div class="card ${suitColorClass(c.color, c.suit)}">` +
          `<div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
      ),
      ...oppDown.map(() => `<div class="card back">` + `</div>`),
    ].join('') || '<span class="note" style="margin:0">' + 'empty</span>';

  const hero = HEROES[RUN.hero.heroId];
  const itemsHTML = RUN.hero.items
    .map((itemId, index) => {
      const item = ITEMS[itemId];
      if (!item) return `<div class="shopcard error">Missing Item Data: ${itemId}</div>`;

      const slotKey = `${itemId}_${index}`;
      const idxs = BATTLE.slots[slotKey] || [];
      const cards = idxs.map((i) => BATTLE.hand[i]);
      const level = itemLevel(itemId);
      const cursedAmt = BATTLE.itemCurses && BATTLE.itemCurses[slotKey];
      const burnedAmt = BATTLE.itemBurns && BATTLE.itemBurns[slotKey];
      const hexedFlag = BATTLE.itemHexes && BATTLE.itemHexes[slotKey];
      const frozenState = BATTLE.itemFrozen && BATTLE.itemFrozen[slotKey];

      if (item.kind === 'storage') {
        const cardHTML = idxs
          .map((cardHandIdx) => {
            const c = BATTLE.hand[cardHandIdx];
            return (
              `<div class="card mini ${suitColorClass(c.color, c.suit)}" ` +
              `data-unassign="${slotKey}|${cardHandIdx}" data-title="Click to take this card back"
          onmousedown="startDragSweep('slot','${slotKey}',${cardHandIdx})"
          onmouseenter="if(event.buttons===1)updateDragSweep(${cardHandIdx})">` +
              `<div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
            );
          })
          .join('');
        return (
          `<div class="itemCard kind-storage${item.weightless ? ' kind-weightless' : ''}" ` +
          `data-assign="${slotKey}" style="border-style:dashed;border-width:2px">
        <div class="usesBadge hoverTip" data-title="Cards currently ` +
          `held">${idxs.length}/${effectiveMaxCards(item)}</div>
        <div class="itemCard-sec">
          <div class="${itemNameClass(item.name)}" style="font-weight:600">${item.name}</div>
          ${
            item.weightless
              ? `<div class="note" style="margin:2px 0"><span class="effectTip" ` +
                `style="color:#1a1a2e" data-tip="Doesn't consume an item card slot">Weightless</span></div>`
              : ''
          }
          <div class="note" style="font-size:11px">${stashHoldsLineHTML(item)}</div>
        </div>
        <div class="itemDivider"></div>
        <div class="itemCard-cards-sec">
          <div class="vcards">${cardHTML}</div>
          ${
            idxs.length > 0
              ? `<button class="wo-btn gray" style="padding:3px 6px;` +
                `font-size:10px;margin-top:6px" data-clear="${slotKey}">Release All</button>`
              : ''
          }
        </div>
      </div>`
        );
      }

      const condResult = frozenState
        ? { met: cards.length > 0, label: 'Thawing' }
        : cards.length
          ? checkCondition(item.condition, cards)
          : { met: false, label: '' };
      const ready = condResult.met;
      let lightningRollForPreview = null;
      if (ready && !frozenState && item.kind === 'lightning') {
        lightningRollForPreview = diffLightningRoll();
      }
      const previewCalc =
        ready && !frozenState
          ? computeItemAmount(item, cards, level, condResult, false, lightningRollForPreview)
          : null;

      let hypPreviewHTML = '';
      if (!frozenState && !idxs.length && typeof selectedIdx !== 'undefined' && selectedIdx.length) {
        const hypCards = selectedIdx
          .filter((i) => !BATTLE.usedThisTurn.has(i))
          .slice(0, effectiveMaxCards(item))
          .map((i) => BATTLE.hand[i]);
        const hypCond = hypCards.length ? checkCondition(item.condition, hypCards) : { met: false };
        if (hypCond.met) {
          const hypCalc = computeItemAmount(item, hypCards, level, hypCond);
          const hypKind = effectiveKind(item, index);
          const hypWord =
            hypKind === 'defense'
              ? 'armor'
              : hypKind === 'poison'
                ? 'poison'
                : hypKind === 'burn'
                  ? 'burn (1st turn)'
                  : hypKind === 'curse'
                    ? 'curse'
                    : 'damage';
          if (hypCalc.amount > 0)
            hypPreviewHTML =
              `<div class="note hoverTip" style="margin:4px 0 0;` +
              `color:var(--amber);font-weight:700" data-title="What your selected cards would do if dropped ` +
              `into this Item.">${hypCalc.amount} ${hypWord}</div>`;
        }
      }
      const eKind = effectiveKind(item, index);
      const effectWord =
        eKind === 'defense'
          ? 'armor'
          : eKind === 'poison'
            ? 'poison'
            : eKind === 'burn'
              ? 'burn'
              : eKind === 'curse'
                ? 'curse'
                : 'dmg';
      const cap = itemUsesCap(item, itemUsesLevel(itemId)) + (BATTLE && BATTLE.overtime ? 1 : 0);
      const usesLeft = cap - ((BATTLE.itemUses && BATTLE.itemUses[slotKey]) || 0);

      const isChargingUnlockItem =
        item.unlockThreshold != null && !(BATTLE.itemUnlocked && BATTLE.itemUnlocked[slotKey]);
      const cardHTML = idxs
        .map((cardHandIdx) => {
          const c = BATTLE.hand[cardHandIdx];
          return (
            `<div class="card mini ${suitColorClass(c.color, c.suit)}" data-unassign="${slotKey}|${cardHandIdx}"
        onmousedown="startDragSweep('slot','${slotKey}',${cardHandIdx})"
        onmouseenter="if(event.buttons===1)updateDragSweep(${cardHandIdx})">` +
            `<div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
          );
        })
        .join('');
      const bonusLine = itemBonusLineHTML(item, level);
      // Lightning items roll a random power multiplier (25%-100%) each time they're loaded up to
      // fire. Roll it as soon as the slot is active - not only once it's actually ready - and show
      // it in the bonus section so the player knows what they're working with before committing cards.
      let lightningRollLine = '';
      if (item.kind === 'lightning' && !frozenState) {
        const rollPct = Math.round(diffLightningRoll() * 100);
        lightningRollLine =
          `<div class="itemBonusLine hoverTip" style="color:var(--lightning)" ` +
          `data-title="Lightning uses one shared roll. Whoever fires a Lightning attack next, you or the ` +
          `opponent, uses this roll, then it rerolls.">⚡ Shared roll ${rollPct}% power</div>`;
      }
      const drawNPreview = item.drawUsesCardCount
        ? cards.length + (item.drawBonusFlat || 0) + (item.drawPerLevel || 0) * level
        : item.drawAmount
          ? item.drawAmount + (item.drawPerLevel || 0) * level
          : 0;
      const drawBonusLine =
        item.drawAmount || item.drawUsesCardCount
          ? `<div class="itemBonusLine hoverTip" ` +
            `data-title="Draws ${drawNPreview} card${drawNPreview === 1 ? '' : 's'} immediately after this item is ` +
            `used.">Draw ${drawNPreview} card${drawNPreview === 1 ? '' : 's'}</div>`
          : '';

      const usesBadgeText = isChargingUnlockItem ? '∞' : cap === Infinity ? '∞' : `${Math.max(0, usesLeft)}`;
      const cooldownLeft = item.cooldown != null ? BATTLE.itemCooldowns?.[slotKey] || 0 : 0;
      const isDepletedThisTurn = !isChargingUnlockItem && cap !== Infinity && usesLeft <= 0;
      return (
        `<div class="itemCard ` +
        `kind-${eKind} ${ready ? 'ready' : ''} ${cursedAmt ? 'cursed' : ''} ${burnedAmt ? 'burned' : ''} ${frozenState ? 'frozenLock' : ''} ${isDepletedThisTurn ? 'depleted-lockout' : ''}" ` +
        `data-assign="${slotKey}" style="border-style:dashed;border-width:2px">
      ${
        isDepletedThisTurn
          ? ''
          : `<div class="usesBadge hoverTip" data-title="Uses left this ` + `turn">${usesBadgeText}</div>`
      }
      <div class="itemCard-sec">
        <div class="${itemNameClass(item.name)}" ` +
        `style="font-weight:600">${item.name}${
          cursedAmt
            ? ` <span class="vart" style="width:12px;height:12px;` +
              `font-size:12px;color:var(--purple)">${ICON.curse}</span> cursed`
            : ''
        }${
          burnedAmt
            ? ` <span class="burnBadge hoverTip" data-title="This ` +
              `Item is on fire. The burn grows ` +
              `by ${(BATTLE.itemBurnStep && BATTLE.itemBurnStep[slotKey]) || 1} each turn. If you fire it, the ` +
              `attack still lands, but you take ${burnedAmt} burn damage.">Burn ${burnedAmt}</span>`
            : ''
        }${
          hexedFlag
            ? ` <span class="vart" style="width:12px;height:12px;` +
              `font-size:12px;color:var(--hex)">${ICON.hex}</span> hexed${hexedFlag > 1 ? ` x${hexedFlag}` : ''}`
            : ''
        }${
          frozenState
            ? ` <span class="vart" style="width:12px;height:12px;` +
              `font-size:12px;color:var(--ice)">${ICON.ice}</span> frozen`
            : ''
        }</div>
        <div class="itemReqLine">${
          frozenState
            ? `<span class="hoverTip" data-title="This Item is frozen ` +
              `and can't fire normally. Drop any cards into it - their value counts toward thawing it out.">` +
              `Frozen: ${Math.max(0, frozenState.threshold - frozenState.progress)} to thaw</span>`
            : itemRequirementText(item, eKind)
        }</div>
      </div>
      <div class="itemDivider"></div>
      <div class="itemCard-cards-sec">
        ${bonusLine}
        ${lightningRollLine}
        ${drawBonusLine}
        ${
          item.unlockThreshold != null
            ? `<div class="itemBonusLine" style="color:#f5c451;` +
              `font-weight:700;text-align:center">${
                item.id === 'impound_release'
                  ? 'Once charged: Draw 4 cards each ' + 'turn'
                  : 'Draw 4 cards each turn once ' + 'unlocked'
              }</div>`
            : ''
        }
        ${hypPreviewHTML}
        <div class="vcards">${cardHTML}</div>
      </div>
      <div class="itemCard-footer">
      <div class="itemDivider"></div>
      <div class="itemCard-sec">
      ${
        cooldownLeft > 0
          ? `<div class="note" style="margin:4px 0 0"><span class="hoverTip" ` +
            `data-title="This item can't be used again until its cooldown runs out.">On ` +
            `cooldown: ${cooldownLeft} turn${cooldownLeft > 1 ? 's' : ''} left</span></div>`
          : ''
      }
      ${(() => {
        const hasKindAmount = item.flatAmount != null || (item.baseMult ?? 1) > 0;
        const kindTag =
          eKind === 'poison'
            ? `<span class="effectTip poisonText" data-tip="Poison ` +
              `deals its damage at the end of the opponent's turn, then drops by 3 each turn until it's gone.">Poison</span>`
            : eKind === 'burn'
              ? `<span class="effectTip burnText" data-tip="Burn sets an Item on ` +
                `fire. The burn grows every turn, so you can detonate it right away for less or let it build. If ` +
                `the Item is fired while it burns, it still attacks, but its owner takes the burn damage.">Burn</span>`
              : eKind === 'curse'
                ? `<span class="effectTip curseText" data-tip="Curse goes off if this ` +
                  `item isn't fired again before the opponent's next turn.">Curse</span>`
                : eKind === 'defense'
                  ? `<span class="effectTip" style="color:var(--defense)" ` +
                    `data-tip="Armor protects against incoming attacks, absorbing damage equal to the amount shown.">Armor</span>`
                  : eKind === 'hex'
                    ? `<span class="effectTip" style="color:var(--hex)" data-tip="Hex messes ` +
                      `with card flow between you and the opponent - firing a hexed Item feeds one of its cards to ` +
                      `whoever cast the hex.">Hex</span>`
                    : eKind === 'ice'
                      ? `<span class="effectTip" style="color:var(--ice)" ` +
                        `data-tip="${
                          item.freezeThreshold
                            ? `Freezes one of their Items solid. It stays frozen ` +
                              `until ${item.freezeThreshold} points of cards have been dropped into it.`
                            : "Freezes an Item solid so it can't fire until it thaws " + 'out on its own.'
                        }">${item.freezeThreshold ? `Freeze ${item.freezeThreshold}` : 'Freeze'}</span>`
                      : eKind === 'lightning'
                        ? `<span class="effectTip" style="color:var(--lightning)" ` +
                          `data-tip="Lightning uses one shared roll between ${Math.round(LIGHTNING_MIN_ROLL * 100)}% and ` +
                          `100%. Whenever anyone fires a Lightning attack, that roll is used and then rerolled.">Lightning</span>`
                        : '';
        const effUnlockThreshold =
          item.id === 'impound_release'
            ? Math.max(35, (item.unlockThreshold || 45) - utilityLevel('impound_release') * 5)
            : item.unlockThreshold;
        const unlockText =
          item.unlockThreshold != null
            ? BATTLE.itemUnlocked && BATTLE.itemUnlocked[slotKey]
              ? '<span class="hoverTip" data-title="Charged for the ' +
                'rest of this battle - playing cards through it now draws 4, once per turn.">Charged: Draw 4/turn</span>'
              : `<span class="hoverTip" data-title="Locked: This card ` +
                `cannot trigger actions until you drop cards into it to fulfill the listed Σ.">` +
                `Locked</span>: ${Math.max(0, effUnlockThreshold - ((BATTLE.itemUnlockProgress && BATTLE.itemUnlockProgress[slotKey]) || 0))} ` +
                `to charge`
            : '';
        if (frozenState) {
          const feedText = cards.length
            ? `<b>Feeds the ice ${cards.reduce((a, c) => a + cardValue(c.rank), 0)} points</b>`
            : '<b>Frozen</b> - drop cards in to ' + 'thaw';
          return `<div class="note" style="margin:4px 0 0">${feedText}</div>`;
        }
        if (cards.length && ready) {
          const kindText = hasKindAmount
            ? `${previewCalc.breakdown} ${kindTag || '<b>Damage</b>'}`
            : kindTag || '<b>Ready</b>';
          return (
            `<div class="note" style="margin:4px 0 ` +
            `0">${kindText}</div>${
              unlockText ? `<div class="note" style="margin:2px 0 ` + `0">${unlockText}</div>` : ''
            }`
          );
        }
        if (cards.length && !ready) return `<div class="note" style="margin:4px 0 0">Requirement not met</div>`;
        const staticKindText = formatKindAmount(item, kindTag);
        return (
          `<div class="note" style="margin:4px 0 ` +
          `0">${staticKindText}</div>${
            unlockText ? `<div class="note" style="margin:2px 0 ` + `0">${unlockText}</div>` : ''
          }`
        );
      })()}
      <div>
        <div style="margin-top:4px">
          ${
            ready && (usesLeft > 0 || isChargingUnlockItem || frozenState) && cooldownLeft <= 0
              ? `<span class="attackChip ${eKind === 'defense' ? 'defendChip' : eKind === 'burn' ? 'burnChip' : ''}" ` +
                `data-attack="${slotKey}" style="font-size:10px; padding:3px ` +
                `6px">${BATTLE.targeting && BATTLE.targeting.slotKey === slotKey ? (BATTLE.targeting.targetKey ? targetVerb(BATTLE.targeting.type) + ' ▶' : 'Pick a target') : frozenState ? 'Feed Cards ▶' : item.unlockThreshold != null ? (isChargingUnlockItem ? 'Deposit Card(s) ▶' : 'Draw ▶') : eKind === 'defense' ? 'Defend ▶' : item.flatAmount == null && (item.baseMult ?? 1) === 0 && (item.drawAmount || item.drawUsesCardCount) ? 'Draw ▶' : 'Attack ▶'}</span>`
              : ''
          }
        </div>
      </div>
      </div>
      </div>
    ${burnedAmt ? '<div class="burnedOverlay"></div>' : ''}
    </div>`
      );
    })
    .join('');
  const assignedIdx = new Set(Object.values(BATTLE.slots).flat());
  const handHTML = BATTLE.hand
    .map((c, i) => {
      if (assignedIdx.has(i) || BATTLE.turnDiscard.includes(i) || BATTLE.usedThisTurn.has(i)) return '';
      return (
        `<div class="card ${suitColorClass(c.color, c.suit)} ${selectedIdx.includes(i) ? 'selected' : ''}" ` +
        `data-card="${i}"
      onmousedown="startDragSweep('hand',null,${i})"
      onmouseenter="if(event.buttons===1)updateDragSweep(${i})" style="position:relative">
    ${
      c.bonus
        ? `<div style="position:absolute;bottom:1px;right:2px;font-size:8px;` + `color:var(--green)">+${c.bonus}</div>`
        : ''
    }
    <div>${rankLabel(c.rank)}</div><div>${c.suit}</div>
  </div>`
      );
    })
    .join('');

  return (
    `<div id="battle-viewport">
    <div class="panel">${currencyBar(`<div style="margin-left:auto;display:flex;gap:6px">
        <button class="wo-btn purple runBarBtn" id="openRunUpgradeFromBattleBtn">Run Upgrade</button>
        <button class="wo-btn red runBarBtn" id="forfeitRunBtn">Forfeit Run</button>
      </div>`)}</div>
    <div class="panel duelHead">
      <div class="duelArt you"><div class="artZoomTrigger" ` +
    `data-artzoom="you">${art(HEROES[RUN.hero?.heroId] || PLAYER_ART, 72)}</div></div>
      <div class="duelSide you">
        <div class="sideInfo">
          <h3 style="justify-content:flex-end"><span style="color:var(--blue)">${fleetLabel()}</span></h3>
          <div class="bar-wrap"><div class="bar-fill bar-health" style="width:${healthPct}%">` +
    `</div><div class="bar-text">${RUN.health} / ${RUN.maxHealth}</div></div>
          <div class="sideRow" style="margin-top:6px;display:flex;justify-content:space-between;` +
    `align-items:center;gap:10px;flex-wrap:wrap">
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-start">
              ${
                BATTLE.playerArmor
                  ? `<span class="armorText hoverTip" style="font-weight:800;` +
                    `font-size:13px" data-title="Armor protects against incoming attacks, absorbing damage equal to ` +
                    `the amount shown."><span class="vart" style="width:12px;height:12px;` +
                    `font-size:12px">${ICON.shield}</span> ${BATTLE.playerArmor} armor</span>`
                  : ''
              }
              ${diffLightningChip()}
              ${
                (BATTLE.playerPoison || []).length
                  ? `<span class="status poisonStatus hoverTip" ` +
                    `data-title="Poison hits you for ${(BATTLE.playerPoison || []).reduce((a, n) => a + n, 0)} at the end of ` +
                    `this turn and skips armor. It weakens by 3 after each ` +
                    `tick.">${ICON.poison} ${(BATTLE.playerPoison || []).reduce((a, n) => a + n, 0)}</span>`
                  : ''
              }
              ${
                BATTLE.itemBurns && Object.keys(BATTLE.itemBurns).length
                  ? `<span class="status burnStatus hoverTip" ` +
                    `data-title="${Object.entries(BATTLE.itemBurns)
                      .map(([k, v]) => `${ITEMS[k.replace(/_\d+$/, '')]?.name || 'Item'}: ${v}`)
                      .join(' | ')}. ` +
                    `Fire a burning Item and the attack still lands, but you take its burn ` +
                    `damage.">${ICON.fire} ${Object.keys(BATTLE.itemBurns).length} of your Items burning</span>`
                  : ''
              }
              ${
                (BATTLE.playerBurns || []).length
                  ? `<span class="status burnStatus hoverTip" ` +
                    `data-title="Burn hits you ` +
                    `for ${BATTLE.playerBurns.reduce((a, x) => a + (x.stages[x.stageIdx] || 0), 0)} at the end of this turn, ` +
                    `then fades.">${ICON.fire} ${BATTLE.playerBurns.reduce((a, x) => a + (x.stages[x.stageIdx] || 0), 0)}</span>`
                  : ''
              }
              ${
                BATTLE.itemCurses && Object.keys(BATTLE.itemCurses).length
                  ? `<span class="status curseStatus hoverTip" ` +
                    `data-title="One or more of your Items is cursed - fire it before your turn ends or take its ` +
                    `curse damage."><span class="vart" style="width:12px;height:12px;` +
                    `font-size:12px">${ICON.curse}</span> ${Object.keys(BATTLE.itemCurses).length} ` +
                    `Item${Object.keys(BATTLE.itemCurses).length > 1 ? 's' : ''} cursed</span>`
                  : ''
              }
              ${
                BATTLE.itemHexes && Object.keys(BATTLE.itemHexes).length
                  ? `<span class="status hoverTip" style="color:var(--hex);` +
                    `font-weight:800;font-size:13px" data-title="One or more of your Items is hexed - firing it will ` +
                    `feed a card to the opponent."><span class="vart" style="width:12px;height:12px;` +
                    `font-size:12px">${ICON.hex}</span> ${Object.keys(BATTLE.itemHexes).length} ` +
                    `Item${Object.keys(BATTLE.itemHexes).length > 1 ? 's' : ''} hexed</span>`
                  : ''
              }
              ${
                BATTLE.itemFrozen && Object.keys(BATTLE.itemFrozen).length
                  ? `<span class="status hoverTip" style="color:var(--ice);` +
                    `font-weight:800;font-size:13px" data-title="One or more of your Items is frozen - drop cards ` +
                    `into it to thaw it."><span class="vart" style="width:12px;height:12px;` +
                    `font-size:12px">${ICON.ice}</span> ${Object.keys(BATTLE.itemFrozen).length} ` +
                    `Item${Object.keys(BATTLE.itemFrozen).length > 1 ? 's' : ''} frozen</span>`
                  : ''
              }
            </div>
            <button class="wo-btn green" id="fuelHealBtn" ` +
    `data-title="${
      usesCoinTravel()
        ? 'Coins also pay for every stop on the map - spending ' + 'them here means less for travel.'
        : 'Fuel also gets you across the map - spending it here ' + 'means less for travel.'
    }" ` +
    `style="padding:6px 10px;font-size:11px;` +
    `white-space:nowrap" ${(usesCoinTravel() ? RUN.chips < FUEL_HESTORE_COST * FUEL_COIN_VALUE : RUN.fuel < FUEL_HESTORE_COST) || RUN.health >= RUN.maxHealth ? 'disabled' : ''}>` +
    `Heal ${FUEL_HEAL_AMOUNT} ` +
    `= ${usesCoinTravel() ? `${FUEL_HESTORE_COST * FUEL_COIN_VALUE} ${ICON.coin}` : `${FUEL_HESTORE_COST} ${ICON.fuel}`}</button>
          </div>
        </div>
      </div>
      <div class="vsMark">vs</div>
      <div class="duelSide opp">
        <div class="sideInfo">
          <h3 style="justify-content:flex-start;gap:6px;flex-wrap:nowrap"><span ` +
    `style="color:var(--red)">${opp.name}</span>${
      opp.boss
        ? ` <span class="hoverTip" style="color:var(--red);` +
          `font-size:13px" data-title="This is a boss fight - taking too long on a turn costs extra health,` +
          ` so don't sit on it.">&#9201;</span>`
        : ''
    }
    ${
      opp.armorRegen
        ? ` <span class="hoverTip" style="color:#5a9fe0;font-weight:800;font-size:11px;` +
          `white-space:nowrap;margin-left:auto" data-title="Regenerates ${opp.armorRegen} armor at the start of each of its ` +
          `turns, with no limit.">+${opp.armorRegen} armor/turn</span>`
        : ''
    }
          </h3>
          <div class="bar-wrap"><div class="bar-fill bar-hp" style="width:${hpPct}%"></div><div ` +
    `class="bar-text">${opp.hpNow} / ${opp.hp}</div></div>
          <div class="sideRow" style="margin-top:6px;display:flex;justify-content:space-between;` +
    `align-items:center;gap:10px;flex-wrap:wrap">
            ${
              BATTLE.opponent.burns?.length
                ? `<span class="attackChip" data-detonate="1" ` +
                  `style="background:var(--amber);color:#062622;border-color:#0d8377;font-size:10px;padding:4px ` +
                  `8px;white-space:nowrap">Detonate for ${BATTLE.opponent.burns.reduce((a, b) => a + (b.stages[b.stageIdx] || 0), 0)} now</span>`
                : opp.special?.type === 'drawOnHit'
                  ? `<span class="hoverTip" style="font-size:12px;` +
                    `font-style:italic;color:var(--dim);font-weight:700" data-title="Every time you land a direct ` +
                    `hit on it, it draws ${opp.special.amount || 1} card${(opp.special.amount || 1) > 1 ? 's' : ''} ` +
                    `into its hand for its next attack.">*Draws ${opp.special.amount || 1} when hit*</span>`
                  : '<span></span>'
            }
            <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
              ${
                BATTLE.opponent.armor > 0
                  ? `<span class="status hoverTip" style="color:#5a7fa8;` +
                    `font-weight:800;font-size:13px" data-title="Armor absorbs damage from your direct attacks ` +
                    `before it reaches their health. Poison, burn, and curse damage ignore ` +
                    `it.">${ICON.defense || '🛡️'} ${BATTLE.opponent.armor} armor</span>`
                  : ''
              }
              ${
                (BATTLE.opponent.poisonStacks || []).length
                  ? `<span class="status poisonStatus hoverTip" ` +
                    `data-title="Poison now: ${(BATTLE.opponent.poisonStacks || []).reduce((a, n) => a + n, 0)} damage. Next ` +
                    `turn: ${(BATTLE.opponent.poisonStacks || []).map((n) => Math.max(0, n - 3)).reduce((a, n) => a + n, 0)} ` +
                    `damage.">${ICON.poison} ${(BATTLE.opponent.poisonStacks || []).reduce((a, n) => a + n, 0)} poison</span>`
                  : ''
              }
              ${
                BATTLE.opponent.burns?.length
                  ? (() => {
                      const burns = BATTLE.opponent.burns;
                      const now = burns.reduce((a, b) => a + (b.stages[b.stageIdx] || 0), 0);
                      const future = [1, 2]
                        .map((offset) => burns.reduce((a, b) => a + (b.stages[b.stageIdx + offset] || 0), 0))
                        .filter((n) => n > 0);
                      const nextText = future.length ? `Next: ${future.join(', ')}` : 'No more burn damage.';
                      return (
                        `<span class="status burnStatus hoverTip" ` +
                        `data-title="${nextText}">${ICON.fire} ${now} <b><u>Burn Damage</u></b></span>`
                      );
                    })()
                  : ''
              }
              ${
                BATTLE.opponentItemCurses && Object.keys(BATTLE.opponentItemCurses).length
                  ? `<span class="status curseStatus hoverTip" ` +
                    `data-title="${Object.entries(BATTLE.opponentItemCurses)
                      .map(([k, v]) => `${ITEMS[k.replace(/_\d+$/, '')]?.name || 'Item'}: ${v} if ` + `not fired`)
                      .join(' | ')}">${ICON.curse} ${Object.keys(BATTLE.opponentItemCurses).length} ` +
                    `Item${Object.keys(BATTLE.opponentItemCurses).length > 1 ? 's' : ''} cursed</span>`
                  : ''
              }
              ${
                BATTLE.opponentItemBurns && Object.keys(BATTLE.opponentItemBurns).length
                  ? `<span class="status burnStatus hoverTip" ` +
                    `data-title="${Object.entries(BATTLE.opponentItemBurns)
                      .map(
                        ([k, v]) =>
                          `${ITEMS[k.replace(/_\d+$/, '')]?.name || 'Item'}: ${v} ` +
                          `(+${(BATTLE.opponentItemBurnStep && BATTLE.opponentItemBurnStep[k]) || 1} each turn)`
                      )
                      .join(' | ')}">${ICON.fire} ${Object.keys(BATTLE.opponentItemBurns).length} ` +
                    `Item${Object.keys(BATTLE.opponentItemBurns).length > 1 ? 's' : ''} burned</span>`
                  : ''
              }
              ${
                BATTLE.opponentItemHexes && Object.keys(BATTLE.opponentItemHexes).length
                  ? `<span class="status hoverTip" style="color:var(--hex)" ` +
                    `data-title="${Object.entries(BATTLE.opponentItemHexes)
                      .map(
                        ([k, v]) =>
                          `${ITEMS[k.replace(/_\d+$/, '')]?.name || 'Item'}: ` +
                          `steals ${v} card${v > 1 ? 's' : ''} when fired`
                      )
                      .join(' | ')}">${ICON.hex} ${Object.keys(BATTLE.opponentItemHexes).length} ` +
                    `Item${Object.keys(BATTLE.opponentItemHexes).length > 1 ? 's' : ''} hexed</span>`
                  : ''
              }

            </div>
          </div>
        </div>
      </div>
      <div class="duelArt opp"><div class="artZoomTrigger" data-artzoom="opp">${art(opp, 72)}</div></div>
    </div>
    <div class="duelBoard">
      <div class="panel">
        ${
          BATTLE.showTutorialBanner
            ? `<div class="note" style="border:1px solid var(--amber);` +
              `border-radius:6px;padding:8px 10px;margin-bottom:8px;text-align:center;color:var(--amber)">` +
              `Click or drag cards from your hand, then click a matching item slot below.</div>`
            : ''
        }
        <div class="handWorkspace"><div class="handCapacity hoverTip" data-title="Your Maximum ` +
    `Hand Size. Drawing stops at this cap, but a gem draw works while you are under it and can take you past it.">Max ${RUN.handSize}</div><div ` +
    `class="hand">${handHTML}</div></div>
        ${
          BATTLE.turnDiscard.length
            ? `<div class="stagedDiscardPanel" style="margin-top:8px;` +
              `padding:8px;border:1px dashed var(--dim);border-radius:8px">
          <div class="note" style="margin:0 0 6px;font-weight:700">[ Staged for Discard ]</div>
          <div class="hand">${BATTLE.turnDiscard
            .map((i) => {
              const c = BATTLE.hand[i];
              return (
                `<div class="card ${suitColorClass(c.color, c.suit)}" data-unstage="${i}" ` +
                `data-title="Click to return this card to your hand" style="cursor:pointer;opacity:0.75">
              <div>${rankLabel(c.rank)}</div><div>${c.suit}</div>
            </div>`
              );
            })
            .join('')}</div>
        </div>`
            : ''
        }
        <div class="playerActionGrid">
          <button class="wo-btn gray" id="sortToggleBtn" style="padding:6px 3px;font-size:10px;` +
    `flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">` +
    `Sort: ${(RUN.handSortMode || 'value') === 'value' ? 'Value' : 'Suit'}</button>
          ${(() => {
            const sp = VEHICLE_SPECIALS[RUN.hero.heroId];
            if (!sp) return '';
            if (sp.type === 'revive')
              return (
                `<div class="abilityWrap"><button class="wo-btn amber ` +
                `hoverTip abilityBtn" id="vehicleSpecialBtn" style="padding:6px 3px;font-size:10px;flex:1 1 0;` +
                `min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" data-title="${sp.desc}" ` +
                `disabled>${sp.name}: ${RUN.reviveUsed ? 'Used' : 'Ready'}</button><button class="wo-btn gray ` +
                `abilityInfoBtn" id="abilityInfoBtn" aria-label="What this ability does">i</button></div>`
              );
            const minNeed = sp.energyCost ?? sp.energyPerUnit;
            return (
              `<div class="abilityWrap"><button class="wo-btn amber ` +
              `hoverTip abilityBtn" id="vehicleSpecialBtn" style="padding:6px 3px;font-size:10px;flex:1 1 0;` +
              `min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" ` +
              `data-title="${sp.desc}" ${RUN.energy < minNeed ? 'disabled' : ''}>${sp.name} ` +
              `= ${minNeed} ${ICON.energy}</button><button class="wo-btn gray abilityInfoBtn" ` +
              `id="abilityInfoBtn" aria-label="What this ability does">i</button></div>`
            );
          })()}
          <button class="wo-btn purple" id="gemDrawBtn" style="padding:6px 3px;font-size:10px;` +
    `flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;` +
    `text-overflow:ellipsis" ${RUN.gems < 1 || visibleHandCount() >= RUN.handSize ? 'disabled' : ''} ${
      visibleHandCount() >= RUN.handSize
        ? 'data-title="Your hand is full ' +
          '(' +
          visibleHandCount() +
          '/' +
          RUN.handSize +
          ('). Play or discard a card to make ' + 'room."')
        : ''
    }>${visibleHandCount() >= RUN.handSize && RUN.gems >= 1 ? 'Hand full' : `Draw = ${GEM_DRAW_COST} ${ICON.gem}`}</button>
          <button class="wo-btn gray" id="discardSelectedBtn" style="padding:6px 3px;` +
    `font-size:10px;flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;` +
    `text-overflow:ellipsis" data-title="Fold selected cards face-down instead of playing ` +
    `them." ${!selectedIdx.length ? 'disabled' : ''}>Discard</button>
    </div>
        ${BATTLE.abilityInfoOpen && (VEHICLE_SPECIALS[RUN.hero.heroId] || {}).desc ? `<div class="note abilityInfoLine">${(VEHICLE_SPECIALS[RUN.hero.heroId] || {}).desc}</div>` : ''}
      </div>
      <div class="deckStack" style="flex-direction:column;align-items:center;gap:10px">
        <div style="display:flex;align-items:center;gap:4px;justify-content:center;flex-wrap:wrap">
          <span class="hoverTip" style="font-family:var(--mono);font-weight:400;font-size:11px;` +
    `color:var(--dim)" data-title="How many cards you draw at the start of each of your turns.">${RUN.drawPerTurn}</span>
          <div class="card back" style="position:relative"><span style="position:absolute;` +
    `inset:0;display:flex;align-items:center;justify-content:center;color:#fff;` +
    `font-family:var(--mono);font-weight:700;font-size:16px">${BATTLE.deck.length}</span></div>
          <span class="hoverTip" style="font-family:var(--mono);font-weight:400;font-size:11px;` +
    `color:var(--dim)" data-title="How many new cards this opponent draws at the start of each of ` +
    `its turns.">${opp.drawRate}</span>
        </div>
        <button class="wo-btn red" id="endTurnBtn" style="padding:14px 4px;font-size:13px;` +
    `font-weight:800;width:100%;max-width:82px;box-sizing:border-box;` +
    `margin-top:6px" ${BATTLE.pendingTarget ? 'disabled' : ''}>End Turn</button>
      </div>
      <div class="panel oppPoolPanel">
        <div class="hand">${poolHTML}</div>
        <div class="scoutRow" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <button class="wo-btn amber" id="scoutBtn" style="padding:8px 12px;` +
    `font-size:12px" ${BATTLE.scoutedThisTurn || RUN.chips < 10 ? 'disabled' : ''}>Reveal a card ` +
    `<span class="revCost">= 10 ${ICON.coin}</span></button>
        </div>
      </div>
    </div>
        <div class="duelMatchup">
      <div class="matchupSide playerSide">
        ${
          BATTLE.itemCurses && Object.keys(BATTLE.itemCurses).length
            ? `<div class="panel curseShield"><div class="note" ` +
              `style="margin:0 0 6px"><b>Active Curse Traps</b>` +
              ` ${Object.keys(BATTLE.itemCurses)
                .map((k) => `<span class="curseBadge">` + `Cursed: ${BATTLE.itemCurses[k]}</span>`)
                .join(' ')}</div>` +
              `</div>`
            : ''
        }
        <div class="panel">
          <div class="itemGrid">
            ${itemsHTML}
            ${(() => {
              const owned = RUN.hero.items.length;
              const rowsForOwned = Math.max(1, Math.ceil(owned / 3));
              const visibleSlots = Math.min(RUN.itemCap, rowsForOwned * 3);
              const emptyCount = Math.max(0, visibleSlots - owned);
              return Array.from({ length: emptyCount })
                .map(
                  () =>
                    `<div class="itemCard" style="display:flex;` +
                    `align-items:center;justify-content:center;text-align:center;border:2px dashed var(--blue-light);` +
                    `color:var(--dim);font-size:11px">Open item slot<br>(buy at the Dealership)</div>`
                )
                .join('');
            })()}
          </div>
        </div>
      </div>

      <div class="matchupSide opponentSide">
        <div class="panel">
          ${
            BATTLE.pendingTarget && BATTLE.pendingTarget.type === 'burn'
              ? `<div class="burnTargetBanner">
            <span>Click one of ${BATTLE.opponent.name}'s Items to ignite it for ${BATTLE.pendingTarget.amount}.</span>
            <button class="wo-btn gray" id="cancelPendingTargetBtn" style="padding:3px 10px;` +
                `font-size:11px;white-space:nowrap">Cancel</button>
          </div>`
              : ''
          }
          <div class="itemGrid">
            ${opponentAttackBoxHTML(opp, true)}
          </div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="log" id="battleLogEl">${(() => {
        const turns = [...new Set(BATTLE.logLines.map((l) => l.turn))];
        return turns
          .map(
            (t) =>
              `<div class="note" style="margin:6px 0 2px;color:var(--blue);` +
              `font-weight:700">Turn ${t}</div>${BATTLE.logLines
                .filter((l) => l.turn === t)
                .map((l) => `<div>${l.msg}</div>`)
                .join('')}`
          )
          .join('');
      })()}</div>
    </div>
    ${(() => {
      if (!BATTLE.pendingTarget || BATTLE.pendingTarget.type === 'burn') return '';
      const targetType = BATTLE.pendingTarget.type;
      const isHex = targetType === 'hex';
      const isIce = targetType === 'ice';
      const cardsHTML = (BATTLE.opponent.items || [])
        .map((id, i) => {
          const it = ITEMS[id];
          if (!it || it.kind === 'storage' || it.followUp) return '';
          const key = `${id}_${i}`;
          const curseAmt = BATTLE.opponentItemCurses && BATTLE.opponentItemCurses[key];
          const burnAmt = BATTLE.opponentItemBurns && BATTLE.opponentItemBurns[key];
          const hexStacks = BATTLE.opponentItemHexes && BATTLE.opponentItemHexes[key];
          const frozenAmt = BATTLE.opponentItemFrozen && BATTLE.opponentItemFrozen[key];
          const tag = curseAmt
            ? `<span class="curseBadge">Cursed: ${curseAmt}</span>`
            : burnAmt
              ? `<span class="curseBadge">` + `Burn: ${burnAmt}</span>`
              : hexStacks
                ? `<span class="curseBadge">Hexed ` + `x${hexStacks}</span>`
                : frozenAmt
                  ? `<span class="curseBadge">` +
                    `Frozen: ${Math.max(0, frozenAmt.threshold - frozenAmt.progress)} to thaw</span>`
                  : '';
          const card = renderStandardItemCard(it);
          if (isIce && frozenAmt)
            return (
              `<div class="targetableCard" ` +
              `style="opacity:0.55">${card}${
                tag ? `<div class="note" style="margin:2px 0 0;` + `text-align:center">${tag}</div>` : ''
              }</div>`
            );
          return (
            `<div class="targetableCard" data-targetkey="${key}" data-title="Click to ` +
            `target ${it.name}">${card}${
              tag ? `<div class="note" style="margin:2px 0 0;` + `text-align:center">${tag}</div>` : ''
            }</div>`
          );
        })
        .join('');
      const title = isHex ? 'Hex an Item' : isIce ? 'Freeze an Item' : 'Curse an Item';
      const explain = isHex
        ? `This item slot gets marked. The next ` +
          `time ${BATTLE.opponent.name} fires it, you pull one of the cards they use straight into your ` +
          `hand. Hex the same Item again before they fire it and the steal stacks.`
        : isIce
          ? `This item slot freezes solid and can't fire. It thaws out ` +
            `as ${BATTLE.opponent.name} works through it over their next few turns.`
          : `This item slot is trapped. It stays cursed until ${BATTLE.opponent.name} fires it ` +
            `before their turn ends, or it detonates.`;
      return (
        `<div class="targetPickerOverlay" style="position:fixed;inset:0;` +
        `background:#12163acc;display:flex;align-items:center;justify-content:center;z-index:110;padding:20px">
        <div class="wo" style="max-width:460px;width:100%"><div class="wo-stripe"></div><div class="wo-body">
          <div class="wo-eyebrow">${title}</div>
          <h1>Pick ${BATTLE.opponent.name}'s <em>Item</em></h1>
          <div class="note" style="margin-bottom:10px">${explain}</div>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;` +
        `margin-bottom:10px">${cardsHTML || '<div class="note">No eligible item ' + 'slots.</div>'}</div>
            <button class="wo-btn gray" id="cancelPendingTargetBtn" style="width:100%;margin-top:4px">Cancel</button>
        </div></div>
      </div>`
      );
    })()}
    ${
      BATTLE.showFuelHealWarning
        ? `<div class="treasure-modal fuelHealModal">
      <div class="wo" style="max-width:420px">
        <div class="wo-stripe"></div>
        <div class="wo-body" style="text-align:center">
          <h1>Spending <em>${usesCoinTravel() ? 'Coins' : 'Fuel'}</em></h1>
          <div class="wo-sub" style="margin:10px ` +
          `0">${
            usesCoinTravel()
              ? 'Coins also pay for every stop on the map. Healing with ' +
                'them here means less left for travel, so spend them carefully.'
              : 'Fuel also gets your vehicle across the map. Healing ' +
                'with it here means less fuel left for travel, so spend it carefully.'
          }</div>
          <button class="wo-btn amber" id="fuelHealWarningOkBtn" style="width:100%;margin-top:8px">Got It</button>
        </div>
      </div>
    </div>`
        : ''
    }
    ${
      BATTLE.targeting
        ? (() => {
            const T = BATTLE.targeting;
            const verb = targetVerb(T.type);
            return (
              `<div class="targetBar"><div ` +
              `class="targetBarText">Tap one of ${BATTLE.opponent.name}'s items to ${verb.toLowerCase()}</div>
        <button class="wo-btn gray" id="cancelTargetingBtn" style="padding:8px 12px;font-size:12px">Cancel</button>
      </div>`
            );
          })()
        : ''
    }
    ${ART_ZOOM ? artZoomModalHTML() : ''}
  </div>`
  );
}

function nodeResultScreen(won, rewards) {
  if (!won) diffLogFight(false);
  const rewardsHTML = won
    ? `
    <div class="hdr" style="margin-top:10px"><span>Rewards</span><span></span></div>
    <div class="currencies" style="justify-content:center">
      ${rewards.chipReward ? `<div class="cur chip">${ICON.coin} ${rewards.chipReward} coins</div>` : ''}
      ${rewards.gemReward ? `<div class="cur gem">${ICON.gem} ${rewards.gemReward} gems</div>` : ''}
      ${rewards.fuelReward ? `<div class="cur fuel">${ICON.fuel} ${rewards.fuelReward} fuel</div>` : ''}
    </div>
    ${
      rewards.exactKillBonus
        ? `
    <div class="hdr" style="margin-top:8px"><span class="hoverTip" data-title="Your final hit ` +
          `exactly matched their remaining HP.">Perfect Win Bonus</span><span></span></div>
    <div class="currencies" style="justify-content:center">
      <div class="cur chip">${ICON.coin} +15 coins</div>
      <div class="cur gem">${ICON.gem} +1 gem</div>
      <div class="cur pts">${ICON.star} +${PERFECT_KILL_CP} Career Points</div>
      ${rewards.perfectFuel ? fuelChipHTML(1, true) : ''}
    </div>`
        : ''
    }
  `
    : `<div class="wo-sub">Your health ran ` +
      `out${
        rewards.lastHit ? ` after taking ${rewards.lastHit.amount} damage ` + `from ${rewards.lastHit.source}` : ''
      }. ` +
      `Run ends here.</div>`;
  return `
    <div class="wo" style="max-width:420px;margin:40px auto">
      <div class="wo-stripe"></div>
      <div class="wo-body" style="text-align:center">
        ${won && rewards.exactKillBonus ? '' : `<div class="wo-eyebrow">${won ? 'Battle Won' : 'Battle Lost'}</div>`}
        <h1>${won ? (rewards.exactKillBonus ? 'Perfect <em>Win!</em>' : 'Nice <em>Work</em>') : 'Fleet <em>Beaten</em>'}</h1>
        ${rewardsHTML}
        ${
          won
            ? `<button class="wo-btn" id="continueBtn" data-won="1" style="width:100%;margin-top:12px">Continue</button>`
            : `<button class="wo-btn" id="continueBtn" style="width:100%">See Run Summary</button>`
        }
      </div>
    </div>
  `;
}

function pickShopStock() {
  const row = Math.max(0, RUN.currentRow || 0);
  const SUIT_STASH_IDS = ['spade_bag', 'heart_bag', 'club_bag', 'diamond_bag'];
  const SUIT_INFERNO_IDS = ['spade_inferno', 'heart_inferno', 'club_inferno', 'diamond_inferno'];
  const ownedIds = new Set(RUN.hero?.items || []);
  const starterIds = new Set(RUN.starterItemIds || []);
  const allowHexItems = Math.random() < HEX_SHOP_CHANCE;
  const pool = Object.values(ITEMS).filter(
    (it) =>
      it.cost > 0 &&
      (it.minRow == null || it.minRow <= row) &&
      (it.kind !== 'hex' || allowHexItems) &&
      (!ownedIds.has(it.id) || starterIds.has(it.id)) &&
      (it.kind !== 'storage' || it.id === 'supply_bag' || SUIT_STASH_IDS.includes(it.id))
  );
  const defensePool = pool.filter((it) => it.kind === 'defense');
  const nonDefensePool = pool.filter((it) => it.kind !== 'defense');
  const picked = [];
  let suitStashUsed = false;
  let suitInfernoUsed = false;
  const tryAdd = (it) => {
    if (picked.length >= 6 || picked.includes(it)) return;
    if (SUIT_STASH_IDS.includes(it.id)) {
      if (suitStashUsed) return;
      suitStashUsed = true;
    }
    if (SUIT_INFERNO_IDS.includes(it.id)) {
      if (suitInfernoUsed) return;
      suitInfernoUsed = true;
    }
    picked.push(it);
  };
  // Guarantee at least one defense/armor card on the shelves when one is available.
  if (defensePool.length) tryAdd(shuffle([...defensePool])[0]);
  // Early on, make sure the shelves carry easy-to-read attacks (2 of a suit, or 2-3 Red/Black) so
  // new players have an obvious first purchase: two of them in World 1, one in Worlds 2 and 3.
  const easyWanted = (RUN.world || 1) <= 1 ? 2 : (RUN.world || 1) <= 3 ? 1 : 0;
  if (easyWanted) {
    const easyPool = shuffle(
      nonDefensePool.filter(
        (it) =>
          it.condition &&
          ((it.condition.type === 'suitCount' && it.condition.count <= 2) ||
            (it.condition.type === 'colorCount' && it.condition.count <= 3))
      )
    );
    let added = 0;
    for (const it of easyPool) {
      if (added >= easyWanted) break;
      const before = picked.length;
      tryAdd(it);
      if (picked.length > before) added++;
    }
  }
  const shuffled = shuffle([...nonDefensePool]);
  for (const it of shuffled) {
    if (picked.length >= 6) break;
    tryAdd(it);
  }
  // The guaranteed defense/armor card was always pushed in first above, which made it land in
  // the same shelf slot every visit - shuffle the final picks so its position (and everything
  // else's) is randomized each time instead of feeling staged.
  return shuffle(picked);
}

function dealerItemCardHTML(item, opts) {
  const priceLabel = opts.mode === 'buy' ? `${item.cost} coins` : `${opts.sell} coins`;
  const footer =
    opts.mode === 'buy'
      ? `<button class="wo-btn amber" data-buy="${item.id}" ` +
        `data-cost="${item.cost}" ${opts.disabled ? 'disabled' : ''} style="padding:5px 8px;` +
        `font-size:11px;white-space:nowrap;width:100%">${opts.disabledLabel || 'Purchase'}</button>`
      : `<button class="wo-btn gray" data-sell="${opts.index}" style="padding:5px 8px;` +
        `font-size:11px;white-space:nowrap;width:100%">Sell</button>`;

  return (
    `<div class="dealerCardPanel panel">
    ${renderStandardItemCard(item, {})}
    <div class="dealerMetaDivider"></div>
    <div class="dealerMeta">
      <div class="price" style="white-space:nowrap">${priceLabel}</div>
      <div class="hoverTip note" style="margin:0;font-size:10px;white-space:nowrap" ` +
    `data-title="A rough gauge of how hard this item can hit at full setup.">` +
    `Power ${item.kind === 'storage' ? 0 : itemPowerScore(item)}</div>
      ${footer}
    </div>
  </div>`
  );
}
function emptyItemSlotHTML() {
  return (
    `<div class="dealerCardPanel panel"><div ` +
    `class="emptyItemSlot">Open Slot</div><div class="dealerMetaDivider"></div><div class="dealerMeta"></div></div>`
  );
}
function shopScreen(fromCastle = false) {
  // Stock is tied to the specific node you're standing on (row:col), not just "do we have any
  // stock at all" - that way re-entering the same Dealership visit keeps the same 6 items, but
  // arriving at a genuinely different node (a new world's Fleet Compound, a different roadside
  // Dealership) always reshuffles, even via paths that don't explicitly clear RUN.shopStock
  // (like the Fleet Compound's "Visit the Dealership" button).
  const nodeKey = `${RUN.currentRow}:${RUN.currentCol}`;
  if (!RUN.shopStock || RUN.shopStockNodeKey !== nodeKey) {
    RUN.shopStock = pickShopStock().map((it) => it.id);
    RUN.shopStockNodeKey = nodeKey;
  }
  const options = RUN.shopStock.map((id) => ITEMS[id]).filter(Boolean);
  const itemRows = options
    .map((it) =>
      dealerItemCardHTML(it, {
        mode: 'buy',
        disabled: RUN.chips < it.cost || equippedItemCount(RUN.hero) >= RUN.itemCap,
        disabledLabel: equippedItemCount(RUN.hero) >= RUN.itemCap ? 'No open slot' : null,
      })
    )
    .join('');
  const ownedRows = RUN.hero.items
    .map((id, i) => {
      const it = ITEMS[id];
      if (!it) return '';
      const modCost =
        (itemLevel(id) > 0 ? itemTuneCost(it, Math.max(0, itemLevel(id) - 1)) : 0) +
        (itemUsesLevel(id) > 0 ? itemUsesTuneCost(itemUsesLevel(id) - 1) : 0) +
        (itemMaxCardsLevel(id) > 0 ? itemMaxCardsTuneCost(itemMaxCardsLevel(id) - 1) : 0) +
        (RUN.itemKindOverride[`${id}_${i}`] || RUN.itemKindOverride[id] ? itemKindConvertCost() : 0);
      const sell = it.sellValue != null ? it.sellValue + Math.floor(modCost / 2) : Math.floor((it.cost + modCost) / 2);
      return dealerItemCardHTML(it, { mode: 'sell', sell, index: i });
    })
    .join('');
  const emptyCount = Math.max(0, RUN.itemCap - equippedItemCount(RUN.hero));
  const emptySlotRows = Array.from({ length: emptyCount }, emptyItemSlotHTML).join('');
  return (
    `${noticeHTML()}
  <div id="dealer-viewport">
    <div class="wo">
      <div class="wo-stripe"></div><div class="wo-body">
        <h1>Dealership</h1>${currencyBar()}
        <div style="display:flex;gap:8px;margin:10px 0">
          <button class="wo-btn teal" id="leaveShopBtn" ` +
    `style="flex:1">${fromCastle ? 'Back to Compound' : roadExitLabel()}</button>
          <button class="wo-btn purple" id="openRunUpgradeFromShopBtn" ` +
    `data-fromcastle="${fromCastle ? '1' : '0'}" style="flex:1">Upgrades</button>
        </div>
        <div class="dealerRow" style="margin:10px 0 ` +
    `12px">${itemRows || '<div class="note">No items in this ' + 'category.</div>'}</div>
        <div class="hdr" style="margin-top:14px;font-weight:800;font-size:14px"><span>Equipped ` +
    `Items</span><span>${equippedItemCount(RUN.hero)}/${RUN.itemCap}</span></div>
        ${
          ownedRows || emptySlotRows
            ? `<div class="dealerRow" style="margin-top:8px;` +
              `justify-content:start;margin-left:0">${ownedRows}${emptySlotRows}</div>`
            : `<div class="note" style="margin-top:6px">Nothing ` + `equipped yet.</div>`
        }
      </div>
      </div>
    </div>`
  );
}

function garageScreen(message = '') {
  const restAvailable =
    RUN.health < RUN.maxHealth &&
    !(RUN.restStopUsed && RUN.restStopUsed.row === RUN.currentRow && RUN.restStopUsed.col === RUN.currentCol);
  return `<div class="map-popup-overlay">
    <div class="wo" style="max-width:420px">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <div class="wo-eyebrow">Service Station</div>
        <h1>Fuel &amp; <em>Repairs</em></h1>
        <div class="wo-sub">Pull over to heal or top off your gas tank.</div>
        ${currencyBar()}
        <div style="display:flex;gap:8px;margin:10px 0">
          <button class="wo-btn teal" id="leaveStationBtn" style="flex:1">${roadExitLabel()}</button>
          <button class="wo-btn purple" id="openRunUpgradeFromRestBtn" style="flex:1">Upgrades</button>
        </div>
        ${message ? `<div class="panel"><div class="note">${message}</div></div>` : ''}

        <div class="shopcard">
          <h3>Fleet Maintenance</h3>
          <button class="wo-btn" id="restBtn" ${restAvailable ? '' : 'disabled'}>Rest (+30 Health)</button>
          <div class="note" style="margin-top:6px">Single-use per visit.</div>
        </div>

        ${
          usesCoinTravel()
            ? ''
            : `        <div class="shopcard">
          <h3>Fuel Dispenser</h3>
          <button class="wo-btn amber hoverTip" id="stationFuelBtn" data-title="Fuel gets more ` +
              `expensive the more you buy here in one world. The price resets in the next ` +
              `world." ${RUN.chips < bodyShopFuelUnitPrice(stationFuelBought()) || RUN.fuel >= RUN.maxFuel ? 'disabled' : ''}>` +
              `1 Fuel = ${bodyShopFuelUnitPrice(stationFuelBought())} Coins</button>
        </div>`
        }
      </div>
    </div>
  </div>`;
}

function blacksmithScreen() {
  const rows = BLACKSMITH_OPTIONS.map((opt, i) => {
    const b = findBoost(opt);
    const bonus = b ? b.bonus : 0;
    const count = b ? b.count || 0 : 0;
    const maxed = count >= SCOPE_TUNE_MAX_STACKS;
    const isPrimary = BLACKSMITH_VISIT.primary === i;
    const isSecondary = BLACKSMITH_VISIT.secondary === i;
    const primaryTaken = BLACKSMITH_VISIT.primary !== null;
    const secondaryTaken = BLACKSMITH_VISIT.secondary !== null;
    const cost = SCOPE_TUNE_COST[opt.scope];
    let btnHTML;
    if (isPrimary || isSecondary) {
      btnHTML = `<button class="wo-btn gray" disabled style="padding:8px 12px;font-size:13px">Upgraded ✓</button>`;
    } else if (maxed) {
      btnHTML = `<button class="wo-btn gray" disabled style="padding:8px 12px;font-size:13px">Maxed out</button>`;
    } else if (!primaryTaken || !secondaryTaken) {
      btnHTML =
        `<button class="wo-btn amber" data-forge="${i}" style="padding:6px 14px;` +
        `font-size:14px;font-weight:800" ${RUN.chips < cost ? 'disabled' : ''}>Upgrade</button>`;
    } else {
      btnHTML =
        `<button class="wo-btn gray" disabled style="padding:8px 12px;font-size:13px">` +
        `Visit's extra upgrade used</button>`;
    }
    // All three upgrade options - single card, whole rank, whole suit - use the exact same card
    // shape and background so "every 7" or "every heart" reads as a card upgrade too, not a
    // smaller, differently-styled afterthought next to the one that upgrades a single card.
    const leftVisual =
      opt.scope === 'card'
        ? `<div class="card ${suitColorClass(SUITS.find((s) => s.s === opt.suit)?.color, opt.suit)}">` +
          `<div>${rankLabel(opt.rank)}</div><div style="font-size:16px">${opt.suit}</div></div>`
        : opt.scope === 'rank'
          ? `<div class="card"><div>${rankLabel(opt.rank)}</div><div style="font-size:11px;` +
            `letter-spacing:.02em">All</div></div>`
          : `<div class="card ${suitColorClass(SUITS.find((s) => s.s === opt.suit)?.color, opt.suit)}">` +
            `<div style="font-size:11px;letter-spacing:.02em">All</div><div style="font-size:16px">${opt.suit}</div></div>`;
    const badge = (amt) =>
      amt > 0
        ? `<span style="position:absolute;top:-6px;right:-6px;` +
          `background:#2fae66;color:#fff;font-size:10px;font-weight:800;border-radius:10px;padding:1px 5px;` +
          `box-shadow:0 0 0 2px #12163a">+${amt}</span>`
        : '';
    const leftMini = `<div style="position:relative;display:inline-block">${leftVisual}${badge(bonus)}</div>`;
    const rightMini =
      `<div style="position:relative;` +
      `display:inline-block">${leftVisual}${badge(maxed ? bonus : bonus + SCOPE_TUNE_DAMAGE[opt.scope])}</div>`;
    return `<div class="shopcard">
      <div style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:nowrap">
        ${leftMini}
        <span style="font-size:20px;color:var(--dim)">➔</span>
        <div style="display:flex;flex-direction:column;align-items:center;gap:3px">
          ${btnHTML}
          ${maxed || isPrimary || isSecondary ? '' : `<span class="price" style="font-size:11px">${cost} coins</span>`}
        </div>
        <span style="font-size:20px;color:var(--dim)">➔</span>
        ${rightMini}
      </div>
    </div>`;
  }).join('');
  const equippedChecklist = [...new Set(RUN.hero.items)]
    .map((id) => {
      const item = ITEMS[id];
      if (!item) return '';
      const lvlCap = itemLevelCap(item);
      if (lvlCap <= 0) return '';
      const lvl = itemLevel(id),
        maxed = lvl >= lvlCap;
      const cost = maxed ? 0 : itemTuneCost(item, lvl);
      const before = renderStandardItemCard(item, { level: lvl });
      const after = maxed ? before : renderStandardItemCard(item, { level: lvl + 1 });
      return `<div class="shopcard holoCard">
      <div class="holoRow" style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:nowrap">
        <div>${before}</div>
        <div class="holoMid" style="display:flex;flex-direction:column;align-items:center;gap:4px;flex-shrink:0">
          <span style="font-size:24px;color:var(--amber);line-height:1">➔</span>
          ${
            maxed
              ? `<span class="wo-btn gray" style="padding:8px 12px;font-size:13px;opacity:0.7">Maxed</span>`
              : `<button class="wo-btn amber" data-bonusup="${id}" ` +
                `style="padding:6px 14px;font-size:14px;font-weight:800" ${RUN.chips < cost ? 'disabled' : ''}>Level Up</button>`
          }
          ${maxed ? '' : `<span class="price" style="font-size:12px;white-space:nowrap">${cost} coins</span>`}
          ${
            lvl > 0
              ? `<button class="wo-btn gray" data-bonusdown="${id}" style="padding:3px ` +
                `8px;font-size:10px;margin-top:2px">Refund</button>`
              : ''
          }
        </div>
        <div>${after}</div>
      </div>
    </div>`;
    })
    .filter(Boolean)
    .join('');
  return (
    `<div id="blacksmith-viewport">${noticeHTML()}
    <div class="wo">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1>Tuning <em>Garage</em></h1>
        ${currencyBar()}
        <div style="display:flex;gap:8px;margin:10px 0">
          <button class="wo-btn facilityExitBtn" id="leaveBlacksmithBtn" ` +
    `style="flex:1">${RETURN_TO_CASTLE_MENU ? 'Back to Compound' : roadExitLabel()}</button>
          <button class="wo-btn purple" id="openRunUpgradeFromBlacksmithBtn" style="flex:1">Upgrades</button>
        </div>
        <div style="font-weight:800;font-size:15px;text-align:center;margin:14px 0 8px">Card Upgrades</div>
        <div class="panel" style="max-width:420px;margin:0 auto">${rows}</div>
        <div style="font-weight:800;font-size:15px;text-align:center;margin:18px 0 8px">Item Tuning</div>
        <div class="panel" style="max-width:500px;margin:0 ` +
    `auto">${equippedChecklist || '<div class="note">No items with a Bonus Level track ' + 'equipped.</div>'}</div>
      </div>
    </div></div>
  `
  );
}
function treasureScreen(found) {
  if (found.choice) {
    const fuelRatio = usesCoinTravel() ? 2 : RUN.fuel / RUN.maxFuel,
      gemRatio = RUN.gems / RUN.maxGems,
      energyRatio = RUN.energy / RUN.maxEnergy;
    const safeKind = fuelRatio <= gemRatio ? 'fuel' : 'gems';
    const safeLabel = safeKind === 'fuel' ? '+4 Fuel' : '+2 Gems';
    const siphonKind = [
      ['fuel', fuelRatio],
      ['gems', gemRatio],
      ['energy', energyRatio],
    ].sort((a, b) => a[1] - b[1])[0][0];
    const siphonLabel = siphonKind === 'fuel' ? '+15 Fuel' : siphonKind === 'gems' ? '+6 Gems' : '+12 Energy';
    return (
      `
    <div class="map-popup-overlay">
      <div class="wo" style="width:100%">
        <div class="wo-stripe"></div>
        <div class="wo-body">
          <div class="wo-eyebrow">Supply Cache</div>
          <h1>Choose Your <em>Reward</em></h1>
          <div class="note" style="text-align:center;margin-bottom:10px">Pick one - the other ` +
      `two are left behind.</div>
          <div class="cacheGrid">
            <button class="cacheOpt cacheGreen" data-cachechoice="safe" data-safekind="${safeKind}">
              <span class="cacheReward">${safeLabel}</span><span class="cacheNote">No side effects</span>
            </button>
            <button class="cacheOpt cacheTeal" data-cachechoice="siphon" data-siphonkind="${siphonKind}">
              <span class="cacheReward">${siphonLabel}</span><span class="cacheNote cacheBad">` +
      `Your next battle's opening draw is 3 cards smaller</span>
            </button>
            <button class="cacheOpt cachePurple" data-cachechoice="overclock">
              <span class="cacheReward">+20 Max HP</span><span class="cacheNote cacheBad">Only ` +
      `a 70% chance. Otherwise you lose 15 HP</span>
            </button>
          </div>
        </div>
      </div>
    </div>`
    );
  }
  const curClass = { coins: 'chip', fuel: 'fuel', gems: 'gem', energy: 'energy', points: 'pts' }[found.kind] || '';
  const text =
    found.amount > 0
      ? `You found ${found.amount} ${found.label.toLowerCase()}!`
      : `Your ${found.label.toLowerCase()} was already ` + `full.`;
  return (
    `
    <div class="map-popup-overlay">
      <div class="wo" style="width:100%">
        <div class="wo-stripe"></div>
        <div class="wo-body">
          <div class="wo-eyebrow">Supply Cache</div>
          <h1>Treasure <em>Found</em></h1>
          <div class="treasure-prize" style="display:flex;justify-content:center"><span ` +
    `class="cur ${curClass}" style="font-size:22px;padding:6px 14px;display:inline-flex;` +
    `align-items:center;gap:8px"><span class="vart" style="width:28px;height:28px;` +
    `font-size:28px">${found.icon}</span> ${text}</span></div>
          <div style="text-align:center"><button class="wo-btn amber" id="leaveTreasureBtn">` +
    `Continue Route</button></div>
        </div>
      </div>
    </div>
  `
  );
}
// The image goes at /Transitions/world-<fromWorld>-complete.jpg (e.g. Transitions/world-1-complete.jpg
// for the A1A Coastline screen, Transitions/world-2-complete.jpg for Alligator Alley, and so on -
// one JPG per world, named after the world you're LEAVING). It renders at a wide, banner-like
// aspect ratio; if the file isn't there yet, the slot just collapses so nothing breaks.
function worldCompleteScreen(fromWorld, toWorld) {
  const fromName = WORLD_NAMES[fromWorld] || `World ${fromWorld}`;
  const toName = WORLD_NAMES[toWorld] || `World ${toWorld}`;
  return (
    `
    <div class="treasure-modal">
      <div class="wo worldCompleteWo" style="max-width:560px">
        <div class="wo-stripe"></div>
        <div class="wo-body" style="text-align:center">
          <div class="wo-eyebrow">World Complete</div>
          <h1 class="worldCompleteTitle">${fromName}</h1>
          <div class="worldCompleteBanner">Complete</div>
          <div class="wo-sub" style="margin:14px 0">That boss didn't stand a chance. The ` +
    `route's clear and Fort Lauderdale owes your fleet one. Fuel up, because ${toName} is coming in hot.</div>
          <img class="worldCompleteImg" src="Transitions/world-${fromWorld}-complete.jpg" ` +
    `alt="" onerror="this.style.display='none'">
          <button class="wo-btn amber" id="advanceWorldBtn" style="width:100%;margin-top:14px;` +
    `font-size:16px;padding:14px">Head Into ${toName}</button>
        </div>
      </div>
    </div>
  `
  );
}
function world3ClearedScreen() {
  const nextName = WORLD_NAMES[4] || 'World 4';
  return (
    `
    <div class="treasure-modal">
      <div class="wo">
        <div class="wo-stripe"></div>
        <div class="wo-body" style="text-align:center">
          <div class="wo-eyebrow">Downtown Core Secured</div>
          <h1>World 3 <em>Cleared</em></h1>
          <div class="wo-sub" style="margin:10px 0">Downtown Core is secured. Your fleet is ` +
    `advancing to the ${nextName}.</div>
          <button class="wo-btn amber" id="advanceWorldBtn" style="width:100%;margin-top:8px">` +
    `Advance to the ${nextName}</button>
        </div>
      </div>
    </div>
  `
  );
}
function victoryScreen() {
  return (
    `
    <div class="treasure-modal">
      <div class="wo">
        <div class="wo-stripe"></div>
        <div class="wo-body" style="text-align:center">
          <div class="wo-eyebrow">The Fleet Compound Secured</div>
          <h1>Campaign <em>Complete</em></h1>
          <div class="wo-sub" style="margin:10px 0">Eight worlds down. Fort Lauderdale's fleet ` +
    `is clear from the coast to the port to the Compound, and the Evil Mechanic is out of tools. Thanks for playing.</div>
          <button class="wo-btn amber" id="claimVictoryBtn" style="width:100%;margin-top:8px">Finish Run</button>
        </div>
      </div>
    </div>
  `
  );
}
function runEndScreen(won, bonus, bonusWorld, cleared) {
  const worldName = WORLD_NAMES[bonusWorld] || `World ${bonusWorld}`;
  const bestWorldName = WORLD_NAMES[META.bestWorld] || `World ${META.bestWorld}`;
  const items = [...new Set(RUN.hero.items)].map((id) => ITEMS[id]).filter(Boolean);
  const itemListHTML = items.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;` +
      `margin-top:8px">${items.map((it) => renderStandardItemCard(it, {})).join('')}</div>`
    : `<div class="note" style="text-align:center">No Items equipped.</div>`;
  const statRow = (label, value) =>
    `<div class="runStatRow"><span ` + `class="runStatLabel">${label}:</span> <b>${value}</b></div>`;
  const perfectCP = RUN.careerPointsFromPerfectKills || 0;
  const eliteCP = RUN.careerPointsFromElites || 0;
  const treasureCP = RUN.careerPointsFromTreasure || 0;
  const matchCP = RUN.careerPointsFromMatchGame || 0;
  return (
    `
    <div class="wo">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1 style="${won ? '' : 'color:var(--red)'}">${won ? 'Route <em>Cleared</em>' : 'Run Ended'}</h1>
        <div class="wo-sub">This run's score: ${RUN.scoreThisRun} &middot; High score: ${META.highScore}</div>
        <div class="panel" style="text-align:left">
          ${statRow('World Reached', worldName)}
          ${statRow('Best World Reached (all-time)', bestWorldName)}
          ${statRow('Nodes Cleared', RUN.path.length)}
          ${statRow(
            'Opponents Beaten (this run / lifetime)',
            `${RUN.opponentsBeatenThisRun || 0} ` + `/ ${META.enemiesBeaten || 0}`
          )}
          ${statRow(
            'Elites Beaten (this run / lifetime)',
            `${RUN.elitesBeatenThisRun || 0} ` + `/ ${META.elitesBeaten || 0}`
          )}
          ${statRow('Upgrades Obtained', runUpgradeCount())}
        </div>
        <div class="hdr" style="margin:0 0 6px"><span>Career Points Breakdown</span><span>` +
    `<b>${RUN.scoreThisRun}</b></span></div>
        <div class="panel" style="text-align:left">
          ${statRow(cleared ? `Reaching &amp; Clearing ${worldName}` : `Reaching ${worldName}`, `+${bonus}`)}
          ${statRow(`Perfect Kills (${RUN.perfectKillsThisRun || 0})`, `+${perfectCP}`)}
          ${statRow(`Elite Kills (${RUN.elitesBeatenThisRun || 0})`, `+${eliteCP}`)}
          ${statRow('Treasure &amp; Chests', `+${treasureCP}`)}
          ${statRow('Fleet Matching Game', `+${matchCP}`)}
        </div>
        <div style="font-weight:800;font-size:15px;margin:16px 0 4px;text-align:center">Items Used This Run</div>
        ${itemListHTML}
        <div style="font-weight:800;font-size:15px;margin:18px 0 4px;text-align:center">Run Dashboard</div>
        <div class="runSummary">${runUpgradeRows().join('')}</div>
        <button class="wo-btn" id="backToMetaBtn" style="width:100%;margin-top:14px">Back to Home Base</button>
      </div>
    </div>
  `
  );
}

function starterSelectScreen() {
  const rows = STARTERS.map((id) => {
    if (id === 'comingsoon1' || id === 'comingsoon2') {
      return (
        `<div class="pickrow locked" style="display:flex;align-items:center;gap:14px;` +
        `padding:14px;margin-bottom:10px">
        <div style="width:44px;text-align:center;flex-shrink:0"><span class="vart" ` +
        `style="width:36px;height:36px;font-size:36px">${ICON.lock}</span></div>
        <div style="flex:1">
          <div class="pname">Coming Soon</div>
          <div class="ptag">A new vehicle is on the way.</div>
        </div>
      </div>`
      );
    }
    const hero = HEROES[id];
    const unlocked = isStarterUnlocked(id);
    if (!unlocked) {
      return (
        `<div class="pickrow locked" style="padding:10px;margin-bottom:8px">
        <div class="pickLeftCol">
          <div class="pname">${hero.name}</div>
          <div class="pickPortrait lockedPortrait" data-hero="${hero.id}">${art(hero, 140)}</div>
        </div>
        <div class="pickItemRow lockedNote" style="align-items:center;min-height:100px">
          <div style="display:flex;align-items:center;gap:10px;padding:8px 4px"><span ` +
        `class="vart" style="width:28px;height:28px;font-size:28px;flex:0 0 28px">${ICON.lock}</span>` +
        `<div class="ptag" style="margin:0">${starterLockNote(id)}</div></div>
        </div>
      </div>`
      );
    }
    const itemCards = (hero.starterItems || []).map(heroItemCardPreviewHTML).join('');
    const abilityCard = heroPerkCardHTML(id) + heroAbilityCardHTML(id);
    return (
      `<div class="pickrow" style="padding:10px;margin-bottom:8px">
      <div class="pickLeftCol">
        <div class="pname">${hero.name}</div>
        <div class="chooseBtnWrap"><button class="wo-btn amber" data-pick="${hero.id}" ` +
      `style="padding:3px 14px;font-size:12px;white-space:nowrap">Choose</button></div>
        <div class="pickPortrait" data-hero="${hero.id}">${art(hero, 140)}</div>
      </div>
      <div class="pickItemRow">${abilityCard}${itemCards}</div>
    </div>`
    );
  }).join('');
  return `
    <div class="wo" style="max-width:800px;margin:0 auto">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1>Pick Your <em>Vehicle</em></h1>
        ${runRulesPanelHTML()}
        <div style="display:flex;gap:8px;margin:8px 0">
          <button class="wo-btn gray" id="starterBackBtn" style="flex:1">Back</button>
          <button class="wo-btn amber" id="starterUpgradesBtn" style="flex:1">Spend Career Points</button>
        </div>
        <div style="margin:12px 0">${rows}</div>
      </div>
    </div>
  `;
}

function upgradeScreen() {
  // One long list. The colour stripe and bar show which kind of upgrade it is: red = core stats, teal = resource
  // capacity, blue = situational and utility. Upgrades are in the order they unlock (see UPGRADE_DEFS,
  // unlock.points).
  const TIER_COLOR = { high: 'var(--red)', medium: 'var(--amber)', low: '#5a8fe8' };
  const cardFor = (u) => {
    const lvl = META.levels[u.id];
    const maxed = lvl >= MAX_LEVEL;
    const unlocked = upgradeUnlocked(u);
    const col = TIER_COLOR[u.tier || 'medium'];
    const cost = maxed ? 0 : upgradeCost(u, lvl);
    const refund = lvl > 0 ? upgradeCost(u, lvl - 1) : 0;
    if (!unlocked) {
      return (
        `<div class="shopcard upgRow" style="opacity:0.6;border-left:5px solid ${col}">
        <div class="hdr" style="margin:0"><span><b>${u.label}</b></span><span ` +
        `class="price">${ICON.lock || '🔒'} Locked</span></div>
        <div class="note" style="margin:2px 0 0;color:var(--red)">Unlock: ${upgradeUnlockText(u)}</div>
      </div>`
      );
    }
    return (
      `<div class="shopcard upgRow" style="border-left:5px solid ${col}">
      <div class="hdr" style="margin:0"><span><b>${u.label}</b> (Lv ${lvl}/${MAX_LEVEL})</span></div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;` +
      `flex-wrap:wrap;margin-top:3px">
        <div class="note hoverTip" style="margin:0;font-weight:700;color:var(--ink)" ` +
      `data-title="${u.desc}">Currently: ${u.currentValue(lvl)}</div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap">
          <span class="price" style="white-space:nowrap">${maxed ? 'Max' : cost + ' pts'}</span>
          ${
            lvl > 0
              ? `<button class="wo-btn gray hoverTip" data-leveldown="${u.id}" ` +
                `data-title="Refunds +${refund} points" style="padding:6px 10px;font-size:12px;white-space:nowrap">Refund</button>`
              : ''
          }
          ${
            maxed
              ? ''
              : `<button class="wo-btn amber" data-levelup="${u.id}" ` +
                `style="padding:6px 10px;font-size:12px;white-space:nowrap" ${META.points < cost ? 'disabled' : ''}>Level Up</button>`
          }
        </div>
      </div>
      <div class="upgBar"><i style="width:${(lvl / MAX_LEVEL) * 100}%;background:${col}"></i></div>
    </div>`
    );
  };
  const legend = `<div style="display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 4px;font-size:12px;color:var(--dim)">
      <span><span class="upgDot" style="background:var(--red)"></span>Core stats</span>
      <span><span class="upgDot" style="background:var(--amber)"></span>Resource capacity</span>
      <span><span class="upgDot" style="background:#5a8fe8"></span>Situational and utility</span></div>`;
  return (
    `
    <div class="wo" style="max-width:820px;margin:16px auto">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1>Spend Your <em>Career Points</em></h1>
        <div class="wo-sub">Career Points: ${META.points} &middot; Earned in ` +
    `total: ${META.lifetimePoints} &middot; High score: ${META.highScore}</div>
        ${legend}
        <button class="wo-btn" id="upgradeContinueBtn" style="width:100%;margin-bottom:6px">Back</button>
        <div style="margin:8px 0">${UPGRADE_DEFS.map(cardFor).join('')}</div>
        <button class="wo-btn" id="upgradeContinueBtn2" style="width:100%;margin-top:12px">Back</button>
      </div>
    </div>
  `
  );
}
