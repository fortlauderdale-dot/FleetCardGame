// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Player Actions And Turn Flow                                                  ██
// ██  Selecting cards, firing Items, opponent attacks, end of turn and winning.     ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// ========== Lets a mouse drag sweep across several cards at once instead of clicking each one: - origin 'hand':
// dragging across cards in the hand adds the whole swept run to selectedIdx. - origin 'slot': dragging across
// cards already loaded into one item slot removes the whole swept run. This runs on plain
// mousedown/mouseenter/mouseup, not the browser's native HTML5 drag-and-drop - cards are never actually "picked
// up" or droppable onto a slot, only clicked or swept over. That keeps this gesture from fighting with (or being
// mistaken for) an actual drag, since there is no real drag happening. Only classList is touched while the sweep
// is in progress (no render()), because render() replaces the whole #app DOM and would drop the in-progress
// mouseenter listeners. The real state change (selectedIdx / BATTLE.slots) and the one render() call happen once,
// in finishDragSweep, fired by a single document-level mouseup listener set up once at load.

function startDragSweep(origin, slotKey, idx) {
  dragSweep = { origin, slotKey, sweptIdx: [idx] };
}
document.addEventListener('mouseup', () => {
  if (dragSweep) finishDragSweep();
});
function dragSweepCandidates() {
  if (!dragSweep) return [];
  const selector = dragSweep.origin === 'hand' ? '#app [data-card]' : `#app [data-unassign^="${dragSweep.slotKey}|"]`;
  return Array.from(document.querySelectorAll(selector));
}
function dragSweepIdxOf(el) {
  return dragSweep.origin === 'hand' ? +el.dataset.card : +el.dataset.unassign.split('|').pop();
}
function updateDragSweep(idx) {
  if (!dragSweep) return;
  const candidates = dragSweepCandidates();
  const idxList = candidates.map(dragSweepIdxOf);
  const anchorPos = idxList.indexOf(dragSweep.sweptIdx[0]);
  const curPos = idxList.indexOf(idx);
  if (anchorPos === -1 || curPos === -1) return;
  const lo = Math.min(anchorPos, curPos),
    hi = Math.max(anchorPos, curPos);
  dragSweep.sweptIdx = idxList.slice(lo, hi + 1);
  const previewClass = dragSweep.origin === 'hand' ? 'selected' : 'sweepRemove';
  candidates.forEach((el, pos) => el.classList.toggle(previewClass, pos >= lo && pos <= hi));
}
function finishDragSweep() {
  if (!dragSweep) return;
  const { origin, slotKey, sweptIdx } = dragSweep;
  dragSweep = null;
  if (sweptIdx.length > 1) {
    if (origin === 'hand') {
      sweptIdx.forEach((i) => {
        if (!selectedIdx.includes(i)) selectedIdx.push(i);
      });
    } else {
      BATTLE.slots[slotKey] = (BATTLE.slots[slotKey] || []).filter((i) => !sweptIdx.includes(i));
    }
    render(battleScreen());
  } else {
    document.querySelectorAll('.sweepRemove').forEach((el) => el.classList.remove('sweepRemove'));
  }
}
function assignSelectedTo(slotKey) {
  if (!selectedIdx.length) return;
  const match = slotKey.match(/^(.+)_(\d+)$/);
  if (!match) return;
  const itemId = match[1];
  const item = ITEMS[itemId];
  if (!item) return;
  // An item that's already fired all its uses this turn can never consume cards again before
  // the turn ends, so it shouldn't accept new ones - matches the same "depleted-lockout" check
  // the card's own grayed-out rendering uses (see isDepletedThisTurn in renderStandardItemCard's
  // caller). Without this, cards could sit in an already-used item's slot doing nothing useful
  // except sheltering themselves from other effects until end of turn returned them to hand.
  const usesCap = itemUsesCap(item, itemUsesLevel(itemId)) + (BATTLE && BATTLE.overtime ? 1 : 0);
  const isChargingUnlockItem = item.unlockThreshold != null && !(BATTLE.itemUnlocked && BATTLE.itemUnlocked[slotKey]);
  const usesLeft = usesCap - ((BATTLE.itemUses && BATTLE.itemUses[slotKey]) || 0);
  const isDepletedThisTurn = !isChargingUnlockItem && usesCap !== Infinity && usesLeft <= 0;
  if (isDepletedThisTurn) return;
  if (!BATTLE.slots[slotKey]) BATTLE.slots[slotKey] = [];
  const cap = effectiveMaxCards(item);
  const room = cap - BATTLE.slots[slotKey].length;
  if (room <= 0) return;
  const assignedElsewhere = new Set();
  Object.entries(BATTLE.slots).forEach(([key, ix]) => {
    if (key !== slotKey) ix.forEach((i) => assignedElsewhere.add(i));
  });
  let candidates = selectedIdx
    .filter((i) => !BATTLE.usedThisTurn.has(i))
    .filter((i) => !BATTLE.slots[slotKey].includes(i))
    .filter((i) => !assignedElsewhere.has(i));
  if (item.kind === 'storage' && item.acceptFilter) {
    candidates = candidates.filter((i) => {
      const c = BATTLE.hand[i];
      if (item.acceptFilter.suit && c.suit !== item.acceptFilter.suit) return false;
      if (item.acceptFilter.color && c.color !== item.acceptFilter.color) return false;
      if (item.acceptFilter.parity) {
        const isEven = c.rank % 2 === 0;
        if ((item.acceptFilter.parity === 'even') !== isEven) return false;
      }
      return true;
    });
  }
  const take = candidates.slice(0, room);

  BATTLE.slots[slotKey].push(...take);
  selectedIdx = [];
  render(battleScreen());
}
function removeCardFromSlot(slotKey, idx) {
  if (!BATTLE.slots[slotKey]) return;
  BATTLE.slots[slotKey] = BATTLE.slots[slotKey].filter((i) => i !== idx);
  render(battleScreen());
}
function clearSlot(slotKey) {
  BATTLE.slots[slotKey] = [];
  render(battleScreen());
}
function markSelectedForDiscard() {
  if (!selectedIdx.length) return;
  selectedIdx.forEach((i) => {
    if (!BATTLE.turnDiscard.includes(i)) BATTLE.turnDiscard.push(i);
  });
  selectedIdx = [];
  render(battleScreen());
}
function unmarkDiscard(i) {
  BATTLE.turnDiscard = BATTLE.turnDiscard.filter((x) => x !== i);
  render(battleScreen());
}
function resortHandAndRelink(mode) {
  mode = mode || 'value';
  const preserved = {};
  Object.entries(BATTLE.slots).forEach(([key, idxs]) => {
    if (idxs.length) preserved[key] = idxs.map((i) => BATTLE.hand[i]);
  });
  const preservedSelection = (typeof selectedIdx !== 'undefined' ? selectedIdx : []).map((i) => BATTLE.hand[i]);
  const suitOrder = { '♠': 0, '♥': 1, '♦': 2, '♣': 3 };
  BATTLE.hand.sort((a, b) =>
    mode === 'suit'
      ? suitOrder[a.suit] - suitOrder[b.suit] || a.rank - b.rank
      : a.rank - b.rank || suitOrder[a.suit] - suitOrder[b.suit]
  );
  Object.entries(preserved).forEach(([key, cards]) => {
    BATTLE.slots[key] = cards.map((c) => cardIndexOf(BATTLE.hand, c)).filter((i) => i !== -1);
  });
  if (typeof selectedIdx !== 'undefined')
    selectedIdx = preservedSelection.map((c) => cardIndexOf(BATTLE.hand, c)).filter((i) => i !== -1);
}
function sortHand(mode) {
  RUN.handSortMode = mode;
  saveRun();
  resortHandAndRelink(mode);
  selectedIdx = [];
  render(battleScreen());
}
function toggleHandSort() {
  sortHand((RUN.handSortMode || 'value') === 'value' ? 'suit' : 'value');
}
function scoutOpponent() {
  const cost = 10;
  if (RUN.chips < cost || BATTLE.scoutedThisTurn) return;
  RUN.chips -= cost;
  BATTLE.scoutedThisTurn = true;
  const hidden = BATTLE.oppPool.filter((c) => !c.revealed);
  const revealCount = Math.max(1, Math.ceil(BATTLE.oppPool.length / 2));
  shuffle(hidden)
    .slice(0, revealCount)
    .forEach((c) => (c.revealed = true));
  battleLog(`Scouted the ${BATTLE.opponent.name}.`);
  saveRun();
  render(battleScreen());
}
// Cards the opponent would use for its next attack with an Item that can fire (not frozen). The opponent keeps
// these back and spends everything else on thawing frozen Items first.
function opponentPlannedAttackCards(maxCards) {
  let burnPick = null;
  const items = BATTLE.opponent.items || [];
  for (let slotPos = 0; slotPos < items.length; slotPos++) {
    const item = ITEMS[items[slotPos]];
    if (!item || item.followUp) continue;
    const key = `${items[slotPos]}_${slotPos}`;
    if (BATTLE.opponentItemFrozen && BATTLE.opponentItemFrozen[key]) continue;
    const itemCap = effectiveMaxCards(item) ?? maxCards;
    const best = findOpponentCombo(BATTLE.oppPool, opponentCond(item), itemCap);
    const cond = best ? checkCondition(opponentCond(item), best.cards) : { met: false };
    if (BATTLE.opponentItemBurns && BATTLE.opponentItemBurns[key]) {
      if (!burnPick && cond.met) burnPick = best;
      continue;
    }
    if (cond.met && best && opponentAttackIsValid(item, best, BATTLE.oppPool, itemCap)) return best.cards;
  }
  return burnPick ? burnPick.cards : [];
}
function drawWithGem() {
  if (RUN.gems < 1) return;
  if (BATTLE.hand.length >= RUN.handSize) {
    battleLog('Hand is full - no room to draw with a gem right now.');
    render(battleScreen());
    return;
  }
  RUN.gems -= 1;
  const n = 1 + META.levels.gem + Number(RUN.runUpgrades?.gemDraw || 0);
  const before = BATTLE.hand.length;
  drawCards(n, false); // unlike an item's own draw power, a gem draw should never push the hand over max size
  const drawn = BATTLE.hand
    .slice(before)
    .map((c) => `${rankLabel(c.rank)}${c.suit}`)
    .join(' ');
  battleLog(`Spent a gem: Drew ${drawn || 'no cards'}.`);
  resortHandAndRelink(RUN.handSortMode);
  saveRun();
  render(battleScreen());
}
function executePlayerAttack(itemId, index) {
  const item = ITEMS[itemId];
  const slotKey = `${itemId}_${index}`;
  const idxs = BATTLE.slots[slotKey] || [];

  if (BATTLE.showTutorialBanner) {
    BATTLE.showTutorialBanner = false;
    META.hasSeenTutorial = true;
    saveMeta();
  }

  if (itemId === 'impound_release' && BATTLE.itemUnlocked?.[slotKey] && !idxs.length) {
    BATTLE.itemUses = BATTLE.itemUses || {};
    const cap = itemUsesCap(item, itemUsesLevel(itemId)) + (BATTLE && BATTLE.overtime ? 1 : 0);
    if ((BATTLE.itemUses[slotKey] || 0) < cap) {
      const drawn = [];
      for (let i = 0; i < 4; i++) {
        const before = BATTLE.hand.length;
        drawCards(1, true);
        if (BATTLE.hand.length > before) drawn.push(BATTLE.hand[BATTLE.hand.length - 1]);
      }
      BATTLE.itemUses[slotKey] = (BATTLE.itemUses[slotKey] || 0) + 1;
      battleLog(
        `${item.name} - Unlocked draw: ${drawn.map((c) => rankLabel(c.rank) + c.suit).join(' ') || 'no cards'}.`
      );
      saveRun();
      render(battleScreen());
    }
    return;
  }

  if (item.kind === 'storage') {
    render(battleScreen());
    return;
  }

  const frozenState = BATTLE.itemFrozen && BATTLE.itemFrozen[slotKey];
  if (frozenState) {
    if (!idxs.length) {
      battleLog(`${item.name} is frozen solid - drop cards into it to thaw it.`);
      render(battleScreen());
      return;
    }
    const frozenCards = idxs.map((i) => BATTLE.hand[i]);
    const rawSum = frozenCards.reduce((a, c) => a + cardValue(c.rank), 0);
    frozenState.progress += rawSum;
    const remaining = Math.max(0, frozenState.threshold - frozenState.progress);
    const frozenCardsStr = frozenCards.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
    idxs.forEach((i) => BATTLE.usedThisTurn.add(i));
    BATTLE.slots[slotKey] = [];
    if (remaining <= 0) {
      delete BATTLE.itemFrozen[slotKey];
      battleLog(`${item.name} thaws out! [${frozenCardsStr}] - it's ready to fire normally again.`);
      playSfx('freeze');
    } else {
      battleLog(`${item.name} - fed [${frozenCardsStr}] into the ice, ${remaining} more needed to thaw.`);
    }
    saveRun();
    render(battleScreen());
    return;
  }

  if (!idxs.length) {
    battleLog(`${item.name} has no cards assigned.`);
    render(battleScreen());
    return;
  }
  const oldCond = item.condition,
    oldThreshold = item.unlockThreshold;
  if (itemId === 'drawstone')
    item.condition = { ...oldCond, min: Math.max(4, oldCond.min - utilityLevel('drawstone')) };
  if (itemId === 'impound_release')
    item.unlockThreshold = Math.max(35, (oldThreshold || 45) - utilityLevel('impound_release') * 5);
  try {
    const isChargingUnlockItem = item.unlockThreshold != null && !(BATTLE.itemUnlocked && BATTLE.itemUnlocked[slotKey]);
    BATTLE.itemUses = BATTLE.itemUses || {};
    const level = itemLevel(itemId);
    const cap = itemUsesCap(item, itemUsesLevel(itemId)) + (BATTLE.overtime ? 1 : 0);
    if (!isChargingUnlockItem && (BATTLE.itemUses[slotKey] || 0) >= cap) {
      battleLog(`${item.name} has already fired ${cap} time${cap > 1 ? 's' : ''} this turn.`);
      render(battleScreen());
      return;
    }
    if (item.cooldown != null && (BATTLE.itemCooldowns?.[slotKey] || 0) > 0) {
      battleLog(
        `${item.name} is on cooldown for ${BATTLE.itemCooldowns[slotKey]} more ` +
          `turn${BATTLE.itemCooldowns[slotKey] > 1 ? 's' : ''}.`
      );
      render(battleScreen());
      return;
    }
    if (idxs.some((i) => BATTLE.usedThisTurn.has(i))) {
      BATTLE.slots[slotKey] = [];
      battleLog(`Cards already used this turn.`);
      render(battleScreen());
      return;
    }
    const cards = idxs.map((i) => BATTLE.hand[i]);
    if (item.purgeHand && !(idxs.length === BATTLE.hand.length && BATTLE.hand.length > 0)) {
      const wholeHand = [...BATTLE.hand];
      BATTLE.discard.push(...wholeHand);
      BATTLE.hand = [];
      BATTLE.slots = {};
      BATTLE.usedThisTurn = new Set();
      battleLog(`${item.name} needs your entire hand loaded in - it fizzles and purges your hand instead.`);
      saveRun();
      render(battleScreen());
      return;
    }
    const condResult = checkCondition(item.condition, cards);
    if (!condResult.met) {
      battleLog(`${item.name} - ${condResult.label || 'requirement unmet'}.`);
      render(battleScreen());
      return;
    }
    // Freeze, burn, curse and hex need a target. The first press enters target mode without spending anything; the
    // player picks one of the opponent's Items on the battle screen, then presses the same button again to confirm.
    let chosenTargetKey = null;
    {
      const preKind = effectiveKind(item, index);
      if (['ice', 'burn', 'curse', 'hex'].includes(preKind)) {
        const elig = targetEligibleKeys(preKind);
        if (elig.length) {
          const T = BATTLE.targeting;
          const same = !!(T && T.slotKey === slotKey);
          if (same && T.targetKey && elig.includes(T.targetKey)) {
            chosenTargetKey = T.targetKey;
            BATTLE.targeting = null;
          } else {
            BATTLE.targeting = {
              slotKey,
              itemId,
              index,
              type: preKind,
              itemName: item.name,
              targetKey: same && elig.includes(T.targetKey) ? T.targetKey : null,
            };
            saveRun();
            render(battleScreen());
            scrollToOpponentItems();
            return;
          }
        }
      }
    }
    if (item.hpCost) {
      // Some Items run on your own health. You cannot fire one if it would take you to 0.
      if (RUN.health <= item.hpCost) {
        battleLog(`${item.name} costs ${item.hpCost} health to fire, and ` + `you do not have enough left.`);
        render(battleScreen());
        return;
      }
      RUN.health -= item.hpCost;
      battleLog(`${item.name} costs you ${item.hpCost} health. Health: ${RUN.health}/${RUN.maxHealth}.`);
      playSfx('hurt');
      showDamagePopup(item.hpCost, item.name);
    }
    BATTLE.stagedFireCards = BATTLE.stagedFireCards || [];
    cards.forEach((c) => {
      if (c && !cardIncludes(BATTLE.stagedFireCards, c)) BATTLE.stagedFireCards.push(c);
    });
    const lightningRoll = item.kind === 'lightning' ? diffLightningRoll() : null;
    if (item.kind === 'lightning') diffRerollLightning('You');
    let { amount, breakdown } = computeItemAmount(item, cards, level, condResult, false, lightningRoll);
    if (BATTLE.charge && effectiveKind(item, index) !== 'defense') {
      amount = Math.round(amount * BATTLE.charge);
      breakdown = `${breakdown} × ${BATTLE.charge} charged`;
      BATTLE.charge = 0;
      battleLog(`${(VEHICLE_SPECIALS[RUN.hero.heroId] || {}).name || 'Your charge'} pays off.`);
    }
    const eKind = effectiveKind(item, index);
    const cardsStr = cards.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
    if (item.unlockThreshold != null) {
      BATTLE.itemUnlockProgress = BATTLE.itemUnlockProgress || {};
      BATTLE.itemUnlocked = BATTLE.itemUnlocked || {};
      if (BATTLE.itemUnlocked[slotKey]) {
        const before = BATTLE.hand.length;
        drawCards(4, true);
        const drawn = BATTLE.hand.slice(before);
        resortHandAndRelink(RUN.handSortMode);
        battleLog(
          `${item.name} - Charged! Drew ${drawn.map((c) => rankLabel(c.rank) + c.suit).join(' ') || 'no cards'}`
        );
      } else {
        const rawSum = cards.reduce((a, c) => a + cardValue(c.rank), 0);
        BATTLE.itemUnlockProgress[slotKey] = (BATTLE.itemUnlockProgress[slotKey] || 0) + rawSum;
        const remaining = Math.max(0, item.unlockThreshold - BATTLE.itemUnlockProgress[slotKey]);
        if (remaining <= 0) {
          BATTLE.itemUnlocked[slotKey] = true;
          battleLog(
            `${item.name} is fully charged! From now on it draws 4 cards each time you ` +
              `play it - once per turn, for the rest of this fight.`
          );
        } else {
          battleLog(`${item.name} - Charging: ${remaining} more needed`);
        }
      }
      idxs.forEach((i) => BATTLE.usedThisTurn.add(i));
      BATTLE.itemUses = BATTLE.itemUses || {};
      BATTLE.itemUses[slotKey] = (BATTLE.itemUses[slotKey] || 0) + 1;
      BATTLE.slots[slotKey] = [];
      saveRun();
      render(battleScreen());
      return;
    }
    if (eKind === 'ice') {
      const freezeEligible = (BATTLE.opponent.items || [])
        .map((id, i) => `${id}_${i}`)
        .filter((key) => {
          const it = ITEMS[key.replace(/_\d+$/, '')];
          return (
            it &&
            it.kind !== 'storage' &&
            !it.followUp &&
            !(BATTLE.opponentItemFrozen && BATTLE.opponentItemFrozen[key])
          );
        });
      if (freezeEligible.length) {
        BATTLE.pendingTarget = { type: 'ice', itemName: item.name, threshold: item.freezeThreshold || 20 };
        battleLog(
          `${item.name} [${cardsStr}] - ${condResult.label} Select an item slot ` +
            `on ${BATTLE.opponent.name}'s inventory to freeze.`
        );
      } else {
        battleLog(`${item.name} [${cardsStr}] - ${condResult.label} No eligible Item to freeze right now.`);
      }
      playSfx('freeze');
    } else if (amount > 0 || item.flatAmount != null) {
      if (eKind === 'defense') {
        BATTLE.playerArmor += amount;
        battleLog(`${item.name} [${cardsStr}] - ${condResult.label} +${amount} armor - ${breakdown}`);
        playSfx('armor');
        flashScreen('shield');
      } else if (eKind === 'poison') {
        BATTLE.opponent.poisonStacks = BATTLE.opponent.poisonStacks || [];
        BATTLE.opponent.poisonStacks.push(amount);
        battleLog(`${item.name} [${cardsStr}] - ${condResult.label} Applied ${amount} poison (${breakdown}).`);
        playSfx('poison');
      } else if (eKind === 'burn') {
        BATTLE.pendingTarget = { type: 'burn', amount, itemName: item.name };
        battleLog(
          `${item.name} [${cardsStr}] - ${condResult.label} Select an item slot ` +
            `on ${BATTLE.opponent.name}'s inventory to ignite for ${amount}. It grows every turn (${breakdown}).`
        );
        playSfx('burn');
      } else if (eKind === 'curse') {
        BATTLE.pendingTarget = { type: 'curse', amount, itemName: item.name };
        battleLog(
          `${item.name} [${cardsStr}] - ${condResult.label} Select an item slot ` +
            `on ${BATTLE.opponent.name}'s inventory to curse for ${amount} (${breakdown}).`
        );
        playSfx('curse');
      } else if (eKind === 'hex') {
        const atkBefore = BATTLE.opponent.hpNow;
        let dmgToApply = amount;
        let armorAbsorbed = 0;
        if (BATTLE.opponent.armor > 0) {
          armorAbsorbed = Math.min(BATTLE.opponent.armor, dmgToApply);
          BATTLE.opponent.armor -= armorAbsorbed;
          dmgToApply -= armorAbsorbed;
        }
        BATTLE.opponent.hpNow = Math.max(0, BATTLE.opponent.hpNow - dmgToApply);
        if (dmgToApply === atkBefore && atkBefore > 0) BATTLE.exactKill = true;
        const armorNote =
          armorAbsorbed > 0
            ? ` (${armorAbsorbed} blocked by their ` +
              `armor${BATTLE.opponent.armor > 0 ? `, ${BATTLE.opponent.armor} ` + `left` : ''})`
            : '';
        if (BATTLE.opponent.hpNow > 0) {
          BATTLE.pendingTarget = { type: 'hex', itemName: item.name };
          battleLog(
            `${item.name} [${cardsStr}] - ${condResult.label} ${amount} ` +
              `damage${armorNote} (${breakdown}). Pick one of ${BATTLE.opponent.name}'s Items to hex.`
          );
        } else {
          battleLog(`${item.name} [${cardsStr}] - ${condResult.label} ${amount} damage${armorNote} (${breakdown}).`);
        }
        if (armorAbsorbed > 0) playSfx('shield');
        playSfx('hex');
        flashScreen('hit-opponent');
      } else {
        const atkBefore = BATTLE.opponent.hpNow;
        let dmgToApply = amount;
        let armorAbsorbed = 0;
        if (BATTLE.opponent.armor > 0) {
          armorAbsorbed = Math.min(BATTLE.opponent.armor, dmgToApply);
          BATTLE.opponent.armor -= armorAbsorbed;
          dmgToApply -= armorAbsorbed;
        }
        BATTLE.opponent.hpNow = Math.max(0, BATTLE.opponent.hpNow - dmgToApply);
        if (dmgToApply === atkBefore && atkBefore > 0) BATTLE.exactKill = true;
        const armorNote =
          armorAbsorbed > 0
            ? ` (${armorAbsorbed} blocked by their ` +
              `armor${BATTLE.opponent.armor > 0 ? `, ${BATTLE.opponent.armor} ` + `left` : ''})`
            : '';
        battleLog(`${item.name} [${cardsStr}] - ${condResult.label} ${amount} damage${armorNote} (${breakdown}).`);
        if (armorAbsorbed > 0) playSfx('shield');
        playSfx('hit');
        flashScreen('hit-opponent');
        if (BATTLE.opponent.special?.type === 'drawOnHit' && BATTLE.opponent.hpNow > 0) {
          const drawAmt = BATTLE.opponent.special.amount || 1;
          drawOpponentPoolCards(drawAmt);
          battleLog(
            `${BATTLE.opponent.name} recoils and ` +
              `draws ${drawAmt === 1 ? 'a card' : drawAmt + ' cards'} for its next attack.`
          );
        }
      }
    }
    let selfBurn = 0;
    if (BATTLE.itemBurns && BATTLE.itemBurns[slotKey]) {
      selfBurn = BATTLE.itemBurns[slotKey];
      delete BATTLE.itemBurns[slotKey];
      if (BATTLE.itemBurnStep) delete BATTLE.itemBurnStep[slotKey];
      if (BATTLE.itemBurnFresh) delete BATTLE.itemBurnFresh[slotKey];
    }
    if (BATTLE.itemCurses && BATTLE.itemCurses[slotKey]) {
      delete BATTLE.itemCurses[slotKey];
      battleLog(`${item.name}'s curse ` + `cleared.`);
    }
    if (BATTLE.itemHexes && BATTLE.itemHexes[slotKey]) {
      const stacks = BATTLE.itemHexes[slotKey];
      delete BATTLE.itemHexes[slotKey];
      if (cards.length) {
        const stealCount = Math.min(stacks, cards.length);
        const shuffledCards = shuffle([...cards]);
        const stolenCards = shuffledCards.slice(0, stealCount);
        BATTLE.pendingHexSteal = BATTLE.pendingHexSteal || [];
        BATTLE.pendingHexSteal.push(...stolenCards);
        const stolenText = stolenCards.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
        battleLog(
          `${item.name}'s hex triggers - ` +
            `the ${stolenText} ${stolenCards.length > 1 ? 'get' : 'gets'} fed straight to ${BATTLE.opponent.name}.`
        );
        playSfx('hex');
      }
    }
    BATTLE.itemUses[slotKey] = (BATTLE.itemUses[slotKey] || 0) + 1;
    if (item.healAmount) {
      const beforeHp = RUN.health;
      RUN.health = Math.min(RUN.maxHealth, RUN.health + item.healAmount);
      if (RUN.health > beforeHp)
        battleLog(`${item.name} heals you for ${RUN.health - beforeHp}. ` + `Health: ${RUN.health}/${RUN.maxHealth}.`);
      playSfx('heal');
    }
    if (item.cooldown != null) {
      BATTLE.itemCooldowns = BATTLE.itemCooldowns || {};
      BATTLE.itemCooldowns[slotKey] = item.cooldown;
    }
    idxs.forEach((i) => BATTLE.usedThisTurn.add(i));
    BATTLE.slots[slotKey] = [];
    if (item.drawAmount || item.drawUsesCardCount) {
      const slotCardMap = {};
      Object.entries(BATTLE.slots).forEach(([key, ix]) => {
        slotCardMap[key] = ix.map((i) => BATTLE.hand[i]);
      });
      const stillUsedCards = [...BATTLE.usedThisTurn].map((i) => BATTLE.hand[i]).filter((c) => !cardIncludes(cards, c));
      const drawN = item.drawUsesCardCount
        ? cards.length + (item.drawBonusFlat || 0) + (item.drawPerLevel || 0) * level
        : item.drawAmount + (item.drawPerLevel || 0) * level;
      const sortedOut = [...idxs].sort((a, b) => b - a);
      for (const i of sortedOut) {
        BATTLE.turnSpentDiscard.push(BATTLE.hand[i]);
        BATTLE.hand.splice(i, 1);
      }
      Object.entries(slotCardMap).forEach(([key, cs]) => {
        BATTLE.slots[key] = cs.map((c) => cardIndexOf(BATTLE.hand, c)).filter((i) => i !== -1);
      });
      BATTLE.usedThisTurn = new Set(stillUsedCards.map((c) => cardIndexOf(BATTLE.hand, c)).filter((i) => i !== -1));
      const beforeDraw = BATTLE.hand.length;
      drawCards(drawN, true);
      const drawn = BATTLE.hand.slice(beforeDraw);
      battleLog(
        `${item.name} - Discarded ${cardsStr}, ` +
          `drew ${drawn.map((c) => rankLabel(c.rank) + c.suit).join(' ') || 'no cards'}.`
      );
      resortHandAndRelink(RUN.handSortMode);
    }
    if (chosenTargetKey && BATTLE.pendingTarget) {
      const pt = BATTLE.pendingTarget.type;
      if (pt === 'burn') chooseBurnTarget(chosenTargetKey, true);
      else if (pt === 'hex') chooseHexTarget(chosenTargetKey, true);
      else if (pt === 'ice') chooseIceTarget(chosenTargetKey, true);
      else if (pt === 'curse') chooseCurseTarget(chosenTargetKey, true);
    }
    saveRun();
    if (BATTLE.opponent.hpNow <= 0) {
      winBattle();
      return;
    }
    if (selfBurn > 0) {
      RUN.health = Math.max(0, RUN.health - selfBurn);
      BATTLE.lastHit = { amount: selfBurn, source: `your burning ${item.name}` };
      battleLog(
        `${item.name} was burning. The attack still lands, but the burn hits you ` +
          `for ${selfBurn}, which skips your armor. Health: ${RUN.health}/${RUN.maxHealth}.`
      );
      playSfx('hurt');
      flashScreen('hurt');
      showDamagePopup(selfBurn, 'Burn');
      saveRun();
      if (RUN.health <= 0 && !offerRevive()) {
        IN_BATTLE = false;
        clearBattleSave();
        playSfx('lose');
        render(nodeResultScreen(false, { lastHit: BATTLE.lastHit }));
        return;
      }
    }
    render(battleScreen());
  } finally {
    item.condition = oldCond;
    item.unlockThreshold = oldThreshold;
  }
}
function resolveOpponentAttackEffect(attack, oppDmg) {
  if (!attack) return '';
  if (attack.discardHand) {
    const n = Math.min(attack.discardHand.count || 1, BATTLE.hand.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * BATTLE.hand.length);
      const [card] = BATTLE.hand.splice(idx, 1);
      BATTLE.recentDiscard.push(card);
    }
    resortHandAndRelink(RUN.handSortMode);
    return n
      ? ` Knocked ${n} card${n > 1 ? 's' : ''} out of your hand.`
      : ' Tried to knock a card loose, but your hand was ' + 'empty.';
  }
  if (attack.effect === 'damage') return '';
  if (attack.effect === 'burn' && DIFF.dotHitsPlayer) {
    const amount = Math.max(3, Math.round(oppDmg * 0.45));
    const burnable = RUN.hero.items
      .map((id, i) => `${id}_${i}`)
      .filter((k) => {
        const it = ITEMS[k.replace(/_\d+$/, '')];
        return it && it.kind !== 'storage';
      });
    if (burnable.length) {
      const k = burnable[Math.floor(Math.random() * burnable.length)];
      BATTLE.itemBurns = BATTLE.itemBurns || {};
      BATTLE.itemBurnStep = BATTLE.itemBurnStep || {};
      BATTLE.itemBurnFresh = BATTLE.itemBurnFresh || {};
      BATTLE.itemBurns[k] = (BATTLE.itemBurns[k] || 0) + amount;
      BATTLE.itemBurnStep[k] = (BATTLE.itemBurnStep[k] || 0) + Math.max(1, Math.round(amount * 0.5));
      BATTLE.itemBurnFresh[k] = true;
      playSfx('burn');
      return (
        ` Your ${ITEMS[k.replace(/_\d+$/, '')].name} catches fire for ${amount}. The burn ` +
        `grows every turn. If you fire it, the attack still lands, but you take the burn damage.`
      );
    }
    BATTLE.playerBurns = BATTLE.playerBurns || [];
    BATTLE.playerBurns.push({ stages: [amount, Math.round(amount / 2), Math.round(amount / 4)], stageIdx: 0 });
    playSfx('burn');
    return ` You are burning for ${amount}.`;
  }
  if (attack.effect === 'poison' && DIFF.dotHitsPlayer) {
    const amount = Math.max(2, Math.round(oppDmg * 0.35));
    BATTLE.playerPoison = BATTLE.playerPoison || [];
    BATTLE.playerPoison.push(amount);
    playSfx('poison');
    return ` You are poisoned for ${amount}.`;
  }
  if (attack.effect === 'burn') {
    const amount = Math.max(3, Math.round(oppDmg * 0.45));
    BATTLE.opponent.burns = BATTLE.opponent.burns || [];
    BATTLE.opponent.burns.push({ stages: [amount, Math.round(amount / 2), Math.round(amount / 4)], stageIdx: 0 });
    playSfx('burn');
    return ` Applied ${amount} burn.`;
  }
  if (attack.effect === 'poison') {
    const amount = Math.max(2, Math.round(oppDmg * 0.35));
    BATTLE.opponent.poisonStacks = BATTLE.opponent.poisonStacks || [];
    BATTLE.opponent.poisonStacks.push(amount);
    playSfx('poison');
    return ` Applied ${amount} poison.`;
  }
  if (attack.effect === 'curse') {
    tryApplyCurse({
      amount: Math.round((attack.curseAmount ?? Math.max(4, Math.round(oppDmg * 0.6))) * diffCurseMult()),
      chance: 1,
      count: 1,
    });
    playSfx('curse');
    return ' Applied a curse.';
  }
  if (attack.effect === 'hex') {
    tryApplyHex({ chance: 1, count: 1 });
    playSfx('hex');
    return ' Applied a hex.';
  }
  if (attack.effect === 'ice') {
    tryApplyFreeze({
      threshold: attack.freezeThreshold ?? Math.max(14, Math.round(oppDmg * 0.9)),
      chance: 1,
      count: 1,
    });
    playSfx('freeze');
    return ' Froze one of your Items.';
  }
  if (attack.effect === 'stun') {
    BATTLE.opponentStunned = true;
    return ' Stunned your fleet for the next ' + 'counter-attack.';
  }
  if (attack.effect === 'heal') {
    const heal = Math.max(3, Math.round(oppDmg * 0.4));
    BATTLE.opponent.hpNow = Math.min(BATTLE.opponent.hp, BATTLE.opponent.hpNow + heal);
    return ` Recovered ${heal} HP.`;
  }
  if (attack.effect === 'reinforceArmor') {
    const amt = attack.reinforceAmount || 15;
    BATTLE.opponent.armor = (BATTLE.opponent.armor || 0) + amt;
    return ` Reinforces itself with ${amt} armor (${BATTLE.opponent.armor} total).`;
  }
  if (attack.effect === 'stealFuel') {
    const t = takeFuel(1);
    return t.took
      ? ` Stole ${t.took} ${t.unit}.`
      : ` Tried to steal ${t.unit === 'coins' ? 'coins' : 'fuel'}, ` + `but you had none.`;
  }
  if (attack.effect === 'draw') {
    const drawn = drawOpponentPoolCards(1);
    if (drawn.length) {
      drawn[0].revealed = false;
      return ' Drew an extra card.';
    }
  }
  return '';
}
// Opponent Items fire on exactly the hand they name. "Needs Two Pair" does not fire on a straight or a
// flush.
function opponentCond(item) {
  const c = item && item.condition;
  if (c && c.type === 'pokerTier' && c.tier >= 1 && !c.exactTier) return { ...c, exactTier: true };
  return c;
}
function opponentHasExactPokerTier(pool, tier, maxCards) {
  const cap = Math.min(maxCards, pool.length);
  if (cap <= 0) return false;
  return combinations(pool, cap).some((combo) => evaluateHand(combo).tier === tier);
}
function opponentAttackIsValid(attack, best, pool, cap) {
  if (!attack || attack.autoFire) return true;
  if (attack.id === 'opp_castle_poke_t3' || attack.name === 'Champion Strike') {
    return opponentHasExactPokerTier(pool, 3, cap);
  }
  if (attack.id === 'opp_castle_poke_t2' || attack.name === 'Guard Strike') {
    return opponentHasExactPokerTier(pool, 2, cap);
  }
  return true;
}
function endTurn() {
  BATTLE.targeting = null;
  BATTLE.stagedFireCards = [];
  // Cards discarded this turn go into recentDiscard, not the reshuffle-eligible discard pile. They are
  // promoted into BATTLE.discard at the top of the next endTurn call, so a card you just played is much
  // less likely to be redrawn right away.
  if (BATTLE.recentDiscard && BATTLE.recentDiscard.length) {
    BATTLE.discard.push(...BATTLE.recentDiscard);
    BATTLE.recentDiscard = [];
  }
  if (BATTLE.opponent.boss && BATTLE.turnStartedAt) {
    const elapsedSec = (Date.now() - BATTLE.turnStartedAt) / 1000;
    const graceSec = 25;
    if (elapsedSec > graceSec) {
      const slowDmg = Math.min(20, Math.round((elapsedSec - graceSec) / 5) * 3);
      if (slowDmg > 0) {
        RUN.health = Math.max(0, RUN.health - slowDmg);
        battleLog(
          `Took too long this turn - ${BATTLE.opponent.name} punishes the hesitation ` +
            `for ${slowDmg} damage! Health: ${RUN.health}/${RUN.maxHealth}.`
        );
        BATTLE.lastHit = { amount: slowDmg, source: `${BATTLE.opponent.name} (slow turn)` };
        playSfx('hurt');
        flashScreen('hurt');
        showDamagePopup(slowDmg, 'Took too long this turn');
      }
    }
  }
  if (BATTLE.itemCurses) {
    Object.entries(BATTLE.itemCurses).forEach(([slotKey, amount]) => {
      const itemId = slotKey.replace(/_\d+$/, '');
      const item = ITEMS[itemId];
      RUN.health = Math.max(0, RUN.health - amount);
      battleLog(
        `${item ? item.name : 'Cursed item'} never fired - you take ${amount} damage! ` +
          `Health: ${RUN.health}/${RUN.maxHealth}.`
      );
      BATTLE.lastHit = { amount, source: `${item ? item.name : 'a cursed Item'} not firing` };
      playSfx('hurt');
      flashScreen('hurt');
      showDamagePopup(amount, `${item ? item.name : 'Cursed item'} didn't fire`);
    });
    BATTLE.itemCurses = {};
  }

  if (BATTLE.turnDiscard.length)
    battleLog(`Discarded ${BATTLE.turnDiscard.length} ` + `card${BATTLE.turnDiscard.length > 1 ? 's' : ''}.`);
  const preservedStorage = {};
  Object.entries(BATTLE.slots).forEach(([key, idxs]) => {
    const itemId = key.replace(/_\d+$/, '');
    const item = ITEMS[itemId];
    if (item && item.kind === 'storage' && idxs.length) preservedStorage[key] = idxs.map((i) => BATTLE.hand[i]);
  });
  const allRemove = new Set([...BATTLE.usedThisTurn, ...BATTLE.turnDiscard]);
  const sorted = [...allRemove].sort((a, b) => b - a);
  const hexSteal = BATTLE.pendingHexSteal || [];
  for (const i of sorted) {
    const removedCard = BATTLE.hand[i];
    if (hexSteal.includes(removedCard)) {
      removedCard.revealed = false;
      BATTLE.oppPool.push(removedCard);
    } else {
      BATTLE.recentDiscard.push(removedCard);
    }
    BATTLE.hand.splice(i, 1);
  }
  BATTLE.pendingHexSteal = [];
  BATTLE.slots = {};
  Object.entries(preservedStorage).forEach(([key, cards]) => {
    BATTLE.slots[key] = cards.map((c) => cardIndexOf(BATTLE.hand, c)).filter((i) => i !== -1);
  });
  BATTLE.turnDiscard = [];
  if (BATTLE.turnSpentDiscard && BATTLE.turnSpentDiscard.length) {
    BATTLE.recentDiscard.push(...BATTLE.turnSpentDiscard);
    BATTLE.turnSpentDiscard = [];
  }
  BATTLE.usedThisTurn = new Set();
  BATTLE.itemUses = {};
  BATTLE.overtime = false;
  BATTLE.lightningRolls = {};
  if (BATTLE.itemCooldowns) {
    Object.keys(BATTLE.itemCooldowns).forEach((key) => {
      BATTLE.itemCooldowns[key] = Math.max(0, BATTLE.itemCooldowns[key] - 1);
      if (BATTLE.itemCooldowns[key] === 0) delete BATTLE.itemCooldowns[key];
    });
  }
  selectedIdx = [];
  if (BATTLE.opponent.hpNow <= 0) {
    winBattle();
    return;
  }
  if (BATTLE.opponent.poisonStacks?.length) {
    const pdmg = BATTLE.opponent.poisonStacks.reduce((a, n) => a + n, 0);
    const poisonBefore = BATTLE.opponent.hpNow;
    BATTLE.opponent.hpNow = Math.max(0, BATTLE.opponent.hpNow - pdmg);
    if (pdmg === poisonBefore && poisonBefore > 0) BATTLE.exactKill = true;
    battleLog(`Poison ticks for ${pdmg}.`);
    BATTLE.opponent.poisonStacks = BATTLE.opponent.poisonStacks.map((n) => Math.max(0, n - 3)).filter((n) => n > 0);
  }
  if (BATTLE.opponent.burns?.length) {
    const bdmg = BATTLE.opponent.burns.reduce((a, b) => a + (b.stages[b.stageIdx] || 0), 0);
    const burnBefore = BATTLE.opponent.hpNow;
    BATTLE.opponent.hpNow = Math.max(0, BATTLE.opponent.hpNow - bdmg);
    if (bdmg === burnBefore && burnBefore > 0) BATTLE.exactKill = true;
    battleLog(`Burn ticks for ${bdmg}.`);
    BATTLE.opponent.burns.forEach((b) => b.stageIdx++);
    BATTLE.opponent.burns = BATTLE.opponent.burns.filter((b) => b.stageIdx < b.stages.length);
  }
  if (BATTLE.opponent.hpNow <= 0) {
    winBattle();
    return;
  }

  let opponentLandedHit = false;
  if (BATTLE.opponentItemFrozen && Object.keys(BATTLE.opponentItemFrozen).length) {
    // The opponent thaws a frozen Item by actually feeding it cards from its pool, the same way the player does.
    // It keeps the cards its best attack with an un-frozen Item needs, and spends the spare cards on the ice first.
    // A frozen Item that finishes thawing here can fire later this same turn with whatever cards are left.
    const planned = opponentPlannedAttackCards(opponentMaxCards(BATTLE.opponent));
    Object.keys(BATTLE.opponentItemFrozen).forEach((key) => {
      const frozen = BATTLE.opponentItemFrozen[key];
      const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'frozen item';
      const spare = BATTLE.oppPool
        .filter((c) => !cardIncludes(planned, c))
        .sort((x, y) => cardValue(y.rank) - cardValue(x.rank));
      const fed = [];
      for (const c of spare) {
        if (frozen.progress >= frozen.threshold) break;
        frozen.progress += cardValue(c.rank);
        fed.push(c);
      }
      if (fed.length) {
        BATTLE.recentDiscard.push(...fed);
        BATTLE.oppPool = BATTLE.oppPool.filter((c) => !cardIncludes(fed, c));
      }
      const fedText = fed.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
      const remaining = Math.max(0, frozen.threshold - frozen.progress);
      if (remaining <= 0) {
        delete BATTLE.opponentItemFrozen[key];
        battleLog(`${BATTLE.opponent.name} feeds [${fedText}] into its frozen ${name} and it thaws out.`);
      } else if (fed.length) {
        battleLog(
          `${BATTLE.opponent.name} feeds [${fedText}] into its ` + `frozen ${name}. ${remaining} more needed to thaw.`
        );
      } else {
        battleLog(
          `${BATTLE.opponent.name}'s ${name} is still frozen, and it has no spare cards ` +
            `to thaw it with. ${remaining} more needed.`
        );
      }
    });
  }
  if (BATTLE.opponentStunned) {
    battleLog(`${BATTLE.opponent.name} is stunned and doesn't counter-attack.`);
    BATTLE.opponentStunned = false;
  } else if (BATTLE.opponent.special?.type === 'countdownStrike') {
    const spec = BATTLE.opponent.special;
    if (BATTLE.opponent.countdown == null) BATTLE.opponent.countdown = spec.threshold;
    if (BATTLE.opponent.countdown <= 0) {
      let oppDmg = spec.damage;
      let armorBlocked = 0;
      if (BATTLE.playerArmor > 0) {
        armorBlocked = Math.min(BATTLE.playerArmor, oppDmg);
        BATTLE.playerArmor -= armorBlocked;
        oppDmg -= armorBlocked;
      }
      RUN.health = Math.max(0, RUN.health - oppDmg);
      if (armorBlocked > 0) playSfx('shield');
      if (oppDmg > 0) {
        playSfx('hurt');
        flashScreen('hurt');
        BATTLE.lastHit = { amount: oppDmg, source: BATTLE.opponent.name };
        showDamagePopup(oppDmg, BATTLE.opponent.name);
      }
      const dmgPhrase =
        armorBlocked > 0
          ? `${spec.damage} damage, but your armor ` +
            `absorbed ${armorBlocked}${oppDmg > 0 ? ` (${oppDmg} got through)` : ''}${
              BATTLE.playerArmor > 0
                ? ` and you have ${BATTLE.playerArmor} armor ` + `remaining`
                : ', and your armor is ' + 'gone'
            }`
          : `${oppDmg} damage`;
      battleLog(
        `${BATTLE.opponent.name} reaches critical pressure and erupts - ${dmgPhrase}. ` +
          `Your health: ${RUN.health}/${RUN.maxHealth}.`
      );
      BATTLE.opponent.countdown = spec.threshold;
      opponentLandedHit = true;
    } else {
      battleLog(`${BATTLE.opponent.name} is building pressure. ${BATTLE.opponent.countdown} left until it erupts.`);
    }
  } else {
    const attackTimes = BATTLE.opponent.usesPerTurn ?? OPPONENT_USES_PER_TURN_DEFAULT;
    const maxCards = opponentMaxCards(BATTLE.opponent);
    let anyAttack = false;
    let attackDef = null;
    const oppItemUsesThisTurn = {};
    for (let swing = 0; swing < attackTimes; swing++) {
      if (BATTLE.opponent.items && BATTLE.opponent.items.length) {
        let itemPick = null;
        let burnBlockedPick = null;
        let burnBackfire = 0;
        for (let slotPos = 0; slotPos < BATTLE.opponent.items.length; slotPos++) {
          const itemId = BATTLE.opponent.items[slotPos];
          const item = ITEMS[itemId];
          if (!item || item.followUp) continue;
          const slotKeyForBurn = `${itemId}_${slotPos}`;
          if (BATTLE.opponentItemFrozen && BATTLE.opponentItemFrozen[slotKeyForBurn]) continue;
          const cap = item.usesPerTurn ?? 1;
          if ((oppItemUsesThisTurn[itemId] || 0) >= cap) continue;
          if (BATTLE.opponentItemBurns && BATTLE.opponentItemBurns[slotKeyForBurn]) {
            if (!burnBlockedPick) {
              const bestBurn = findOpponentCombo(
                BATTLE.oppPool,
                opponentCond(item),
                effectiveMaxCards(item) ?? maxCards
              );
              const condBurn = bestBurn ? checkCondition(opponentCond(item), bestBurn.cards) : { met: false };
              if (condBurn.met) burnBlockedPick = { item, best: bestBurn, cond: condBurn, key: slotKeyForBurn };
            }
            continue;
          }
          const itemCap = effectiveMaxCards(item) ?? maxCards;
          const best = findOpponentCombo(BATTLE.oppPool, opponentCond(item), itemCap);
          const cond = best ? checkCondition(opponentCond(item), best.cards) : { met: false };
          const validPokerAttack = best && opponentAttackIsValid(item, best, BATTLE.oppPool, itemCap);
          if (cond.met && validPokerAttack) {
            itemPick = { item, best, cond, key: slotKeyForBurn };
            break;
          }
        }
        // Burned items are only used when the opponent has no safer option. The attack still lands,
        // but the opponent also takes the burn damage that has built up on that item.
        if (!itemPick && burnBlockedPick) itemPick = burnBlockedPick;
        if (!itemPick) break;
        const { item, best, cond, key } = itemPick;
        if (item.opponentEffect === 'earlyEscape') {
          const escapeRes = takeFuel(3);
          battleLog(
            `${BATTLE.opponent.name} ` +
              `used ${item.name}${cond.label ? ` with ${cond.label}` : ''} and bolts for the exit! The fleet ` +
              `clears the stop, but ${
                escapeRes.unit === 'coins'
                  ? `it takes ${escapeRes.took} ` + `coins`
                  : `the fuel tank drops by 3 ` + `(${RUN.fuel}/${RUN.maxFuel})`
              }.`
          );
          winBattle();
          return;
        }
        oppItemUsesThisTurn[item.id] = (oppItemUsesThisTurn[item.id] || 0) + 1;
        if (BATTLE.opponentItemBurns && BATTLE.opponentItemBurns[key]) {
          burnBackfire = BATTLE.opponentItemBurns[key];
          delete BATTLE.opponentItemBurns[key];
          if (BATTLE.opponentItemBurnStep) delete BATTLE.opponentItemBurnStep[key];
        }
        if (BATTLE.opponentItemCurses && BATTLE.opponentItemCurses[key]) {
          delete BATTLE.opponentItemCurses[key];
          battleLog(`${BATTLE.opponent.name}'s ${item.name} fires and breaks the curse trap on it.`);
        }
        let hexStolenCards = [];
        if (BATTLE.opponentItemHexes && BATTLE.opponentItemHexes[key]) {
          const hexStacks = BATTLE.opponentItemHexes[key];
          delete BATTLE.opponentItemHexes[key];
          const hexStealCount = Math.min(hexStacks, best.cards.length);
          hexStolenCards = shuffle([...best.cards]).slice(0, hexStealCount);
        }
        anyAttack = true;
        if (item.unlockThreshold != null) {
          BATTLE.opponentItemUnlockProgress = BATTLE.opponentItemUnlockProgress || {};
          BATTLE.opponentItemUnlocked = BATTLE.opponentItemUnlocked || {};
          if (!BATTLE.opponentItemUnlocked[item.id]) {
            const rawSum = best.cards.reduce((a, c) => a + cardValue(c.rank), 0);
            BATTLE.opponentItemUnlockProgress[item.id] = (BATTLE.opponentItemUnlockProgress[item.id] || 0) + rawSum;
            const remaining = Math.max(0, item.unlockThreshold - BATTLE.opponentItemUnlockProgress[item.id]);
            if (remaining <= 0) {
              BATTLE.opponentItemUnlocked[item.id] = true;
              battleLog(`${BATTLE.opponent.name}'s ${item.name} is fully charged and ready to fire!`);
            } else {
              battleLog(`${BATTLE.opponent.name}'s ${item.name} is charging - ${remaining} more needed.`);
            }
            BATTLE.recentDiscard.push(...best.cards);
            BATTLE.oppPool = BATTLE.oppPool.filter((c) => !cardIncludes(best.cards, c));
            if (RUN.health <= 0) break;
            continue;
          }
        }
        const oppLightningRoll = item.kind === 'lightning' ? diffLightningRoll() : null;
        if (item.kind === 'lightning') diffRerollLightning(BATTLE.opponent.name);
        const { amount: baseAmount } = computeItemAmount(item, best.cards, 0, cond, true, oppLightningRoll);
        let oppDmg = Math.round(baseAmount);
        const swingCap = diffSwingCap();
        oppDmg = Math.min(oppDmg, swingCap);
        oppDmg = applyDodgeIfActive(oppDmg);
        const rawDmg = oppDmg;
        let armorBlocked = 0;
        if (BATTLE.playerArmor > 0) {
          armorBlocked = Math.min(BATTLE.playerArmor, oppDmg);
          BATTLE.playerArmor -= armorBlocked;
          oppDmg -= armorBlocked;
        }
        RUN.health = Math.max(0, RUN.health - oppDmg);
        if (armorBlocked > 0) playSfx('shield');
        if (oppDmg > 0) {
          playSfx('hurt');
          flashScreen('hurt');
          BATTLE.lastHit = { amount: oppDmg, source: BATTLE.opponent.name };
          showDamagePopup(oppDmg, BATTLE.opponent.name);
        }
        const usedText = best.cards.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
        attackDef = {
          effect:
            item.kind === 'curse' ||
            item.kind === 'poison' ||
            item.kind === 'burn' ||
            item.kind === 'hex' ||
            item.kind === 'ice'
              ? item.kind
              : item.opponentEffect,
          reinforceAmount: item.reinforceAmount,
          discardHand: item.utilityEffect === 'discardHand' ? { count: item.discardCount || 1 } : undefined,
        };
        let specialLog = resolveOpponentAttackEffect(attackDef, oppDmg);
        const spec = BATTLE.opponent.special;
        if (spec?.type === 'lifesteal') {
          const healAmt = Math.round(oppDmg * (spec.pct ?? 0.5));
          if (healAmt > 0) {
            BATTLE.opponent.hpNow = Math.min(BATTLE.opponent.hp, BATTLE.opponent.hpNow + healAmt);
            specialLog = ` It heals ${healAmt}.`;
          }
        } else if (spec?.type === 'redSteal') {
          const redCount = best.cards.filter((c) => c.color === 'red').length;
          if (redCount >= (spec.redThreshold ?? 3)) {
            const stealRes = takeFuel(spec.fuelSteal ?? 1);
            const fuelStolen = stealRes.took;
            drawOpponentPoolCards(spec.extraDraw ?? 1);
            specialLog = ` It steals ${fuelStolen} ${stealRes.unit} and draws an extra card!`;
          }
        }
        const dmgPhrase =
          armorBlocked > 0
            ? `${rawDmg} damage, but your armor ` +
              `absorbed ${armorBlocked}${oppDmg > 0 ? ` (${oppDmg} got through)` : ''}${
                BATTLE.playerArmor > 0
                  ? ` and you have ${BATTLE.playerArmor} armor ` + `remaining`
                  : ', and your armor is ' + 'gone'
              }`
            : `${oppDmg} damage`;
        let hexLog = '';
        if (hexStolenCards.length) {
          hexStolenCards.forEach((c) => {
            c.revealed = true;
          });
          BATTLE.hand.push(...hexStolenCards);
          resortHandAndRelink(RUN.handSortMode);
          const stolenText = hexStolenCards.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
          hexLog = ` The hex trap kicks in - you pull the ${stolenText} straight into your hand.`;
        }
        battleLog(
          `${BATTLE.opponent.name} ` +
            `used ${item.name}${cond.label ? ` with ${cond.label}` : ''} (${usedText}) ` +
            `- ${diffPureDraw(item) ? 'no damage' : dmgPhrase}.${specialLog}${hexLog} Your health: ${RUN.health}/${RUN.maxHealth}.`
        );
        BATTLE.recentDiscard.push(...best.cards.filter((c) => !cardIncludes(hexStolenCards, c)));
        BATTLE.oppPool = BATTLE.oppPool.filter((c) => !cardIncludes(best.cards, c));
        diffOppItemDraw(item);
        if (burnBackfire > 0 && RUN.health > 0) {
          const before = BATTLE.opponent.hpNow;
          BATTLE.opponent.hpNow = Math.max(0, before - burnBackfire);
          if (burnBackfire === before && before > 0) BATTLE.exactKill = true;
          battleLog(
            `${BATTLE.opponent.name}'s ${item.name} was burning. They still attack, but ` +
              `the burn hits them for ${burnBackfire} damage.`
          );
          if (BATTLE.opponent.hpNow <= 0) {
            winBattle();
            return;
          }
        }
        if (RUN.health <= 0) break;
        continue;
      }
      const choices = BATTLE.opponent.attacks && BATTLE.opponent.attacks.length ? BATTLE.opponent.attacks : [{}];
      let pick = null;
      for (const a of choices) {
        const best = a.autoFire
          ? { cards: [], tier: 999, label: 'Auto', mult: 0 }
          : bestHandFromPool(BATTLE.oppPool, a.maxCards ?? maxCards);
        if (a.minTurn != null && BATTLE.turn < a.minTurn) continue;
        let viable;
        if (a.autoFire) viable = true;
        else if (a.discardHand) viable = best.cards.length > 0;
        else if (a.exactSuitCount)
          viable = BATTLE.oppPool.filter((c) => c.suit === a.exactSuitCount.suit).length === a.exactSuitCount.count;
        else viable = best.tier >= (a.minTier ?? BATTLE.opponent.minTier);
        if (viable && !opponentAttackIsValid(a, best, BATTLE.oppPool, a.maxCards ?? maxCards)) viable = false;
        if (viable) {
          pick = { a, best };
          break;
        }
      }
      if (!pick) break;
      const { a: attackDefPicked, best } = pick;
      attackDef = attackDefPicked;
      anyAttack = true;
      let oppDmg;
      if (attackDef.autoFire) {
        oppDmg = Math.round(attackDef.autoFire.damage);
      } else if (attackDef.discardHand) {
        oppDmg = 0;
      } else if (attackDef.exactSuitCount) {
        oppDmg = Math.round(attackDef.exactSuitCount.damage);
      } else {
        oppDmg = Math.round(damageFor(best.cards, best.mult));
      }
      const swingCap = diffSwingCap();
      oppDmg = Math.min(oppDmg, swingCap);
      oppDmg = applyDodgeIfActive(oppDmg);
      const rawDmg = oppDmg;
      let armorBlocked = 0;
      if (BATTLE.playerArmor > 0) {
        armorBlocked = Math.min(BATTLE.playerArmor, oppDmg);
        BATTLE.playerArmor -= armorBlocked;
        oppDmg -= armorBlocked;
      }
      RUN.health = Math.max(0, RUN.health - oppDmg);
      if (armorBlocked > 0) playSfx('shield');
      if (oppDmg > 0) {
        playSfx('hurt');
        flashScreen('hurt');
        BATTLE.lastHit = { amount: oppDmg, source: BATTLE.opponent.name };
        showDamagePopup(oppDmg, BATTLE.opponent.name);
      }
      const usedText = best.cards.map((c) => `${rankLabel(c.rank)}${c.suit}`).join(' ');
      let specialLog = resolveOpponentAttackEffect(attackDef, oppDmg);
      const spec = BATTLE.opponent.special;
      if (spec?.type === 'lifesteal') {
        const healAmt = Math.round(oppDmg * (spec.pct ?? 0.5));
        if (healAmt > 0) {
          BATTLE.opponent.hpNow = Math.min(BATTLE.opponent.hp, BATTLE.opponent.hpNow + healAmt);
          specialLog = ` It heals ${healAmt}.`;
        }
      } else if (spec?.type === 'redSteal') {
        const redCount = best.cards.filter((c) => c.color === 'red').length;
        if (redCount >= (spec.redThreshold ?? 3)) {
          const stealRes = takeFuel(spec.fuelSteal ?? 1);
          const fuelStolen = stealRes.took;
          drawOpponentPoolCards(spec.extraDraw ?? 1);
          specialLog = ` It steals ${fuelStolen} ${stealRes.unit} and draws an extra card!`;
        }
      }
      const dmgPhrase =
        armorBlocked > 0
          ? `${rawDmg} damage, but your armor ` +
            `absorbed ${armorBlocked}${oppDmg > 0 ? ` (${oppDmg} got through)` : ''}${
              BATTLE.playerArmor > 0
                ? ` and you have ${BATTLE.playerArmor} armor ` + `remaining`
                : ', and your armor is ' + 'gone'
            }`
          : `${oppDmg} damage`;
      battleLog(
        attackDef.autoFire
          ? `${BATTLE.opponent.name}'s ${attackDef.name || 'attack'} kicks in ` +
              `- ${dmgPhrase}.${specialLog} Your health: ${RUN.health}/${RUN.maxHealth}.`
          : `${BATTLE.opponent.name} used ${attackDef.name || best.label} with ${best.label} ` +
              `(${usedText}) - ${dmgPhrase}.${specialLog} Your health: ${RUN.health}/${RUN.maxHealth}.`
      );
      BATTLE.recentDiscard.push(...best.cards);
      BATTLE.oppPool = BATTLE.oppPool.filter((c) => !cardIncludes(best.cards, c));
      if (RUN.health <= 0) break;
    }
    if (!anyAttack) {
      battleLog(`${BATTLE.opponent.name} didn't have enough to attack this turn.`);

      const stillHidden = BATTLE.oppPool.filter((c) => !c.revealed);
      if (!(BATTLE.opponent.items || []).some((id) => ITEMS[id] && ITEMS[id].followUp))
        shuffle(stillHidden)
          .slice(0, 2)
          .forEach((c) => (c.revealed = true));
    } else opponentLandedHit = true;
    // Follow-up Items sit to the right of another Item and only work when that Item did not fire:
    // the opponent throws out its whole hand and draws that many cards plus a bonus next turn.
    (BATTLE.opponent.items || []).forEach((fid, fpos) => {
      const fu = ITEMS[fid];
      if (!fu || !fu.followUp || fpos < 1) return;
      const left = ITEMS[BATTLE.opponent.items[fpos - 1]];
      if (!left || oppItemUsesThisTurn[left.id]) return;
      const dumped = BATTLE.oppPool.length;
      BATTLE.recentDiscard.push(...BATTLE.oppPool);
      BATTLE.oppPool = [];
      const nextDraw = Math.min(fu.followUp.maxDraw || 12, dumped + (fu.followUp.drawBonus || 2));
      BATTLE.opponent.nextDrawOverride = nextDraw;
      battleLog(
        `${BATTLE.opponent.name} used ${fu.name}: it threw out its whole hand ` +
          `(${dumped} card${dumped === 1 ? '' : 's'}) and will draw ${nextDraw} next turn.`
      );
    });
    if (!attackDef || attackDef.effect !== 'curse') tryApplyCurse();
  }
  if (BATTLE.opponentItemCurses && Object.keys(BATTLE.opponentItemCurses).length) {
    Object.keys(BATTLE.opponentItemCurses).forEach((k) => detonateOpponentItemCurse(k, 'it never fired this turn'));
    if (BATTLE.opponent.hpNow <= 0) {
      winBattle();
      return;
    }
  }

  if (BATTLE.opponentItemBurns && Object.keys(BATTLE.opponentItemBurns).length) {
    Object.keys(BATTLE.opponentItemBurns).forEach((k) => {
      BATTLE.opponentItemBurns[k] += (BATTLE.opponentItemBurnStep && BATTLE.opponentItemBurnStep[k]) || 1;
    });
  }
  // Burning player Items grow too, except on the turn they were set on fire.
  if (BATTLE.itemBurns && Object.keys(BATTLE.itemBurns).length) {
    BATTLE.itemBurnFresh = BATTLE.itemBurnFresh || {};
    Object.keys(BATTLE.itemBurns).forEach((k) => {
      if (BATTLE.itemBurnFresh[k]) {
        delete BATTLE.itemBurnFresh[k];
        return;
      }
      BATTLE.itemBurns[k] += (BATTLE.itemBurnStep && BATTLE.itemBurnStep[k]) || 1;
    });
  }

  diffTickPlayerDots();
  if (RUN.health <= 0 && !offerRevive()) {
    IN_BATTLE = false;
    clearBattleSave();
    playSfx('lose');
    render(nodeResultScreen(false, { lastHit: BATTLE.lastHit }));
    return;
  }

  if (BATTLE.playerHandPurgeActive) {
    const stashedIdxs = new Set();
    Object.entries(BATTLE.slots).forEach(([key, idxs]) => {
      const itemId = key.replace(/_\d+$/, '');
      const item = ITEMS[itemId];
      if (item && item.kind === 'storage') idxs.forEach((i) => stashedIdxs.add(i));
    });
    const purgeIdxs = BATTLE.hand
      .map((_, i) => i)
      .filter((i) => !stashedIdxs.has(i))
      .sort((a, b) => b - a);
    if (purgeIdxs.length) {
      purgeIdxs.forEach((i) => {
        BATTLE.recentDiscard.push(BATTLE.hand[i]);
        BATTLE.hand.splice(i, 1);
      });
      battleLog(
        `Grid Storm purges your hand - ${purgeIdxs.length} ` + `card${purgeIdxs.length > 1 ? 's' : ''} sent to discard.`
      );
    }
  }

  // Reveal the opponent's whole current pool at the end of every turn. Only cards drawn after this point
  // (via drawOpponentCards) stay hidden.
  BATTLE.oppPool.forEach((c) => {
    c.revealed = true;
  });

  BATTLE.turn++;
  BATTLE.weaken = 0;
  drawCards(RUN.drawPerTurn);
  resortHandAndRelink(RUN.handSortMode);

  if ((BATTLE.opponent.discardPoolEachTurn || BATTLE.opponent.reckless) && BATTLE.oppPool.length) {
    BATTLE.recentDiscard.push(...BATTLE.oppPool);
    BATTLE.oppPool = [];
  }
  drawOpponentCards();

  if (BATTLE.opponent.armorRegen) {
    BATTLE.opponent.armor = (BATTLE.opponent.armor || 0) + BATTLE.opponent.armorRegen;
  }
  BATTLE.turnStartedAt = Date.now();
  render(battleScreen());
}
function battleRewardsFor(opp, row) {
  const isElite = /\[Elite\]/.test(opp.name || '');
  const rating = opponentDifficultyRating(opp);
  const gemReward = opp.boss ? 5 : isElite ? 2 : rating >= 45 ? 1 : 0;
  // Regular kills do not give fuel. Fuel comes from Perfect Kills, node stops and chests.
  const fuelReward = 0;
  const rewardMult = opp.rewardMult || 1;
  // Reward scales off the difficulty rating (HP + armor + offense + draw speed) rather than
  // HP alone, so a tougher-than-average opponent at a given HP pays out more.
  const chipReward = Math.round((9 + rating * 0.95) * rewardMult);
  return { chipReward, gemReward, fuelReward };
}
function winBattle(outlast) {
  diffLogFight(true);
  IN_BATTLE = false;
  clearBattleSave();
  if (BATTLE.castleStage) {
    const stage = BATTLE.castleStage;
    const reward =
      stage === 1
        ? { coins: 45, gems: 1, fuel: 1, energy: 2 }
        : stage === 2
          ? { coins: 100, gems: 2, fuel: 2, energy: 4 }
          : { coins: 160, gems: 4, fuel: 4, energy: 8 };
    RUN.chips += reward.coins;
    RUN.gems = Math.min(RUN.maxGems, RUN.gems + reward.gems);
    addFuel(reward.fuel);
    RUN.energy = Math.min(RUN.maxEnergy, RUN.energy + reward.energy);
    if (!RUN.castleState) RUN.castleState = {};
    if (stage === 1) {
      RUN.castleState.firstDone = true;
    }
    if (stage === 2) RUN.castleState.secondDone = true;
    if (stage === 3) {
      RUN.castleState.thirdDone = true;

      {
        let wonItem;
        if (RUN.world === 1) {
          wonItem = ITEMS.supply_bag;
        } else {
          const ownedIds = new Set(RUN.hero.items);
          const fullPool = Object.values(ITEMS).filter((it) => !ownedIds.has(it.id));
          const eligiblePool =
            equippedItemCount(RUN.hero) >= RUN.itemCap ? fullPool.filter((it) => it.weightless) : fullPool;
          const pool = eligiblePool.length ? eligiblePool : fullPool;
          wonItem = (pool.length ? pool : Object.values(ITEMS))[
            Math.floor(Math.random() * (pool.length ? pool.length : Object.values(ITEMS).length))
          ];
        }
        // Weightless rewards bypass the item-cap check entirely.
        // No item reward is converted into coins; the awarded item is preserved.
        RUN.hero.items.push(wonItem.id);
        DUNGEON_WIN_POPUP = { reward, itemName: wonItem.name, itemId: wonItem.id };
      }
      saveRun();
      render(castleDungeonScreen());
      return;
    }

    DUNGEON_CONTINUE_POPUP = { stage, reward };
    saveRun();
    render(castleDungeonScreen());
    return;
  }
  const scale = outlast ? 0.7 : 1;
  const base = battleRewardsFor(BATTLE.opponent, BATTLE.row);
  const baseChipReward = Math.round(base.chipReward * scale);
  const exactKillBonus = BATTLE.exactKill && !outlast;
  let chipReward = baseChipReward + (exactKillBonus ? 15 : 0);
  const gemReward = base.gemReward + (exactKillBonus ? 1 : 0);
  // Fuel is scarce on purpose now - only a Perfect Kill refuels you at all.
  const fuelReward = exactKillBonus ? 1 : 0;
  // Career Points are otherwise a flat end-of-run bonus now, but a Perfect Kill is a
  // skill-gated moment worth a small nod on its own, same as the fuel it grants.
  const pointsReward = exactKillBonus ? PERFECT_KILL_CP : 0;
  RUN.chips += chipReward;
  RUN.gems = Math.min(RUN.maxGems, RUN.gems + gemReward);
  addFuel(fuelReward);
  if (pointsReward) {
    earnPoints(pointsReward);
    RUN.careerPointsFromPerfectKills = (RUN.careerPointsFromPerfectKills || 0) + pointsReward;
    RUN.perfectKillsThisRun = (RUN.perfectKillsThisRun || 0) + 1;
  }
  battleLog(outlast ? `You outlasted the ${BATTLE.opponent.name}!` : `${BATTLE.opponent.name} is done for!`);
  if (exactKillBonus)
    battleLog(
      `Perfect Win Bonus: +15 coins, +1 gem, +${PERFECT_KILL_CP} ` +
        `Career Points${fuelReward ? (usesCoinTravel() ? `, +${FUEL_COIN_VALUE} ` + `coins` : ', +1 fuel') : ''}!`
    );
  battleLog(formatRewardParts({ coins: chipReward, gems: gemReward, fuel: fuelReward }) + '.');
  if (BATTLE.row === RUN.bossRow) {
    RUN.pendingWorldWin = true;
  }
  if (!BATTLE.castleStage) {
    META.enemiesBeaten = (META.enemiesBeaten || 0) + 1;
    RUN.opponentsBeatenThisRun = (RUN.opponentsBeatenThisRun || 0) + 1;
    if (exactKillBonus) META.perfectWins = (META.perfectWins || 0) + 1;
    if (/\[Elite\]/.test(BATTLE.opponent.name || '')) {
      META.elitesBeaten = (META.elitesBeaten || 0) + 1;
      RUN.elitesBeatenThisRun = (RUN.elitesBeatenThisRun || 0) + 1;
      RUN.careerPointsFromElites = (RUN.careerPointsFromElites || 0) + ELITE_KILL_CP;
      earnPoints(ELITE_KILL_CP);
      battleLog(`Elite Bonus: +${ELITE_KILL_CP} Career Points!`);
    }
    saveMeta();
  }
  playSfx(exactKillBonus ? 'perfect' : 'win');
  render(
    nodeResultScreen(true, {
      chipReward: baseChipReward,
      gemReward: base.gemReward,
      fuelReward: 0,
      perfectFuel: fuelReward,
      pointsReward,
      exactKillBonus,
    })
  );
}
