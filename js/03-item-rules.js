// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Attack Catalog                                                                ██
// ██  Where opponent and player attack Items are registered.                        ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Item Cards: Conditions                                                        ██
// ██  What each Item needs in order to fire, and how that text reads.               ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function checkCondition(cond, cards) {
  let result;
  if (!cond || cond.type === 'any') result = { met: cards.length > 0, label: '' };
  else if (cond.type === 'exactCount')
    result = {
      met: cards.length === cond.count,
      label: `Exactly ${cond.count} ` + `card${cond.count === 1 ? '' : 's'}`,
    };
  else if (cond.type === 'pokerTier') {
    const ev = evaluateHand(cards);
    result =
      cond.exactTier || cond.tier >= 1
        ? { met: ev.tier === cond.tier, label: ev.label, mult: ev.mult }
        : { met: ev.tier >= cond.tier, label: ev.label, mult: ev.mult };
  } else if (cond.type === 'straightLen') {
    const ok =
      cards.length === cond.len &&
      isConsecutive(cards) &&
      !(cards.length >= 3 && new Set(cards.map((c) => c.suit)).size === 1);
    result = { met: ok, label: `${cond.len}-Card Straight` };
  } else if (cond.type === 'suitCount') {
    const n = cards.filter((c) => c.suit === cond.suit).length;
    result = { met: n >= (cond.count ?? 1), label: `${n} of ${cond.suit}`, count: n };
  } else if (cond.type === 'suitCountExact') {
    const n = cards.filter((c) => c.suit === cond.suit).length;
    result = { met: n === cond.count, label: `${n} of ${cond.suit}`, count: n };
  } else if (cond.type === 'colorCount') {
    const n = cards.filter((c) => c.color === cond.color).length;
    result = { met: n >= cond.count, label: `${n} ${cond.color === 'red' ? 'Red' : 'Black'}`, count: n };
  } else if (cond.type === 'allSuits') {
    const suits = new Set(cards.map((c) => c.suit));
    result = { met: suits.size === 4, label: 'One of Each Suit' };
  } else if (cond.type === 'cardIn') {
    const hit = cards.find((c) => cond.cards.some((cc) => cc.rank === c.rank && cc.suit === c.suit));
    result = { met: !!hit, label: hit ? `${rankLabel(hit.rank)}${hit.suit}` : '' };
  } else if (cond.type === 'parity') {
    const effRank = (c) => (c.rank === 14 ? 1 : c.rank);
    const matchFn = cond.parity === 'even' ? (c) => effRank(c) % 2 === 0 : (c) => effRank(c) % 2 !== 0;
    const n = cards.filter(matchFn).length;
    if (cond.mode === 'all')
      result = { met: cards.length > 0 && n === cards.length, label: `All ${cond.parity}`, count: n };
    else result = { met: n >= cond.count, label: `${n} ${cond.parity}`, count: n };
  } else if (cond.type === 'exactRank') {
    const n = cards.filter((c) => c.rank === cond.rank).length;
    if (cond.requireAll)
      result = { met: cards.length > 0 && n === cards.length, label: `All ${rankLabel(cond.rank)}s`, count: n };
    else result = { met: n > 0, label: `Has a ${rankLabel(cond.rank)}`, count: n };
  } else if (cond.type === 'sumThreshold') {
    const sum = cards.reduce((a, c) => a + cardValue(c.rank) + (c.bonus || 0), 0);
    result = { met: cards.length > 0 && sum >= cond.min, label: `${SIGMA_TIP}${sum}`, sum };
  } else if (cond.type === 'sumExact') {
    const sum = cards.reduce((a, c) => a + cardValue(c.rank) + (c.bonus || 0), 0);
    result = { met: cards.length > 0 && Math.round(sum) === cond.value, label: `${SIGMA_TIP}${sum}`, sum };
  } else result = { met: false, label: '' };

  if (cond && cond.exactCount != null) result.met = result.met && cards.length === cond.exactCount;
  return result;
}
function bonusConditionText(cond) {
  if (cond?.type === 'suitCount') return `${cond.count}${suitMicroCardHTML(cond.suit)}!`;
  return `${describeCondition(cond)}!`;
}
function itemBonusLineHTML(item, level) {
  if (!item.bonus) return '';
  const bonusPct = Math.round((item.bonus.base + (item.bonus.perLevel || 0) * level) * 100);
  if (bonusPct <= 0) return '';
  // Only show an "if <condition>" clause when the bonus has its own, genuinely stricter
  // condition than what's already required to fire the item at all. Several items reused
  // the item's own firing condition here, which just restated the requirement back as if
  // it were a special extra bonus (e.g. "Bonus +100% if Three of a Kind" on an item that
  // already needs Three of a Kind to fire in the first place) - that's not a real condition,
  // just a flat power increase from tuning, so it reads as a plain tune bonus instead.
  // A conditionless bonus isn't necessarily from tuning - several items (Rapid Intervention, etc.)
  // ship with a real base bonus baked into their own definition, present from level 0 on a shop copy
  // that's never been tuned. Only call it "from tuning" once an actual tuning level (> 0) is
  // contributing to the number; otherwise it's just the item's own built-in bonus.
  const text = item.bonus.condition
    ? `Bonus <b>+${bonusPct}%</b> if ${bonusConditionText(item.bonus.condition)}`
    : level > 0
      ? `Bonus <b>+${bonusPct}%</b> from tuning`
      : `Bonus <b>+${bonusPct}%</b>`;
  return `<div class="itemBonusLine">${text}</div>`;
}
function describeCondition(cond) {
  if (!cond || cond.type === 'any') return 'Any cards';
  if (cond.type === 'exactCount') return `exactly ${cond.count} cards`;
  if (cond.type === 'pokerTier') return cond.tier === 0 ? 'Any card' : TIERS[cond.tier];
  if (cond.type === 'straightLen') return `a ${cond.len}-card straight`;
  if (cond.type === 'suitCount') return `${cond.count}+ ${cond.suit}`;
  if (cond.type === 'colorCount') return `${cond.count}+ ${cond.color === 'red' ? 'Red' : 'Black'} cards`;
  if (cond.type === 'allSuits') return 'one of each suit';
  if (cond.type === 'cardIn') return cond.cards.map((c) => rankSuitMiniCardHTML(c.rank, c.suit)).join(' or ');
  if (cond.type === 'parity')
    return cond.mode === 'all' ? `all ${cond.parity}` : `${cond.count}+ ${cond.parity} ` + `cards`;
  if (cond.type === 'exactRank') return cond.requireAll ? `all ${rankLabel(cond.rank)}s` : `a ${rankLabel(cond.rank)}`;
  if (cond.type === 'sumThreshold') return `${SIGMA_TIP}${cond.min}+`;
  if (cond.type === 'sumExact') return `${SIGMA_TIP} = ${cond.value} exactly`;
  return '';
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Item Cards: Glossary And Upgrade Math                                         ██
// ██  Hover keywords, damage amounts, levels and upgrade costs for Items.           ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

const GLOSSARY = {
  attack: 'Deals damage straight to the opponent.',
  defense: 'Blocks incoming damage instead of dealing damage (adds Armor).',
  defend: 'Blocks incoming damage instead of dealing damage (adds Armor).',
  suit: 'The 4 suits are Diamonds (♦), Clubs (♣), Hearts (♥), and Spades (♠).',
  red: 'Hearts (♥) or Diamonds (♦).',
  black: 'Spades (♠) or Clubs (♣).',
  diamond: 'Diamond (♦) suited cards.',
  club: 'Club (♣) suited cards.',
  heart: 'Heart (♥) suited cards.',
  spade: 'Spade (♠) suited cards.',
  flush: 'A flush is 3 or more cards that are all the same suit.',
  straight: 'A straight is 3 or more cards with consecutive ranks, any suits (example: 6, 7, 8).',
};
function kw(text, key) {
  const g = GLOSSARY[(key || text).toLowerCase()];
  return g ? `<span class="hoverTip" data-title="${g}">${text}</span>` : text;
}
// Even and Odd are called out in bold amber with a hover popup, since players often forget which ranks count.
function parityWordHTML(parity) {
  const even = parity === 'even';
  const tip = even ? 'Even Cards: 2, 4, 6, 8, 10 and Queen.' : 'Odd Cards: Ace, 3, 5, 7, 9, Jack and King.';
  return `<span class="hoverTip parityWord" data-title="${tip}">${even ? 'Even' : 'Odd'}</span>`;
}
function itemRequirementText(item) {
  if (item.followUp) return "Only if the Item to its left didn't fire";
  const max = effectiveMaxCards(item);
  let cond = item.condition;
  if (item.id === 'drawstone' && cond?.type === 'sumThreshold')
    cond = { ...cond, min: Math.max(4, cond.min - utilityLevel('drawstone')) };
  let specific = '';
  if (cond?.type === 'suitCount')
    specific =
      cond.count === 1
        ? max > 1
          ? `1-${max} ${suitMicroCardHTML(cond.suit)} ` + `cards`
          : `Any ${suitMicroCardHTML(cond.suit)}`
        : `At least ${cond.count} ${suitMicroCardHTML(cond.suit)}`;
  else if (cond?.type === 'colorCount')
    specific = `${cond.count}+ ${kw(cond.color === 'red' ? 'Red' : 'Black')} ` + `cards`;
  else if (cond?.type === 'allSuits') specific = `one of each ${kw('Suit')}`;
  else if (cond?.type === 'cardIn') specific = describeCondition(cond);
  else if (cond?.type === 'parity') specific = `Up to ${max} ${parityWordHTML(cond.parity)} cards`;
  else if (cond?.type === 'exactRank')
    specific = cond.requireAll ? `all ${rankLabel(cond.rank)}s` : `Any ${rankLabel(cond.rank)}`;
  else if (cond?.type === 'straightLen') specific = `${cond.len}-card ${kw('Straight')}`;
  else if (cond?.type === 'sumThreshold') specific = `Card(s) need to total ${cond.min} or higher`;
  else if (cond?.type === 'sumExact') specific = `${SIGMA_TIP} = ${cond.value} exactly`;
  else if (cond?.type === 'exactCount') specific = cond.count === 1 ? 'Any card' : `Any ${cond.count} cards`;
  else if (cond?.type === 'pokerTier' && cond.tier > 0)
    specific = cond.tier === 5 ? kw('Flush') : cond.tier === 4 ? kw('Straight') : TIERS[cond.tier];
  else if (cond?.type === 'any')
    specific = cond.exactCount === 1 ? 'Any card' : cond.exactCount ? `Any ${cond.exactCount} ` + `cards` : '';
  if (cond?.exactCount != null && cond?.type !== 'exactCount' && cond?.type !== 'any' && specific)
    specific = `${specific} (${cond.exactCount === 1 ? '1 card' : `${cond.exactCount} cards`})`;
  const base = max === 1 ? '1 card' : `Up to ${max} cards`;
  return specific || base;
}
function formatKindAmount(item, kindTagHTML) {
  const hasKindAmount = item.flatAmount != null || (item.baseMult ?? 1) > 0;
  if (!hasKindAmount) return kindTagHTML || '';
  if (item.flatAmount != null && (item.baseMult ?? 0) === 0) {
    const amountText = `${item.flatAmount}`;
    return kindTagHTML ? [kindTagHTML, amountText].filter(Boolean).join(' ') : `<b>Attack</b> ${amountText}`;
  }
  const maxC = effectiveMaxCards(item);
  const multVal = item.baseMult ?? 1;
  const amountText = multVal !== 1 ? `&times;${multVal}` : maxC > 1 ? SIGMA_TIP : '';
  if (!amountText) return kindTagHTML || '';
  return kindTagHTML ? [kindTagHTML, amountText].filter(Boolean).join(' ') : `<b>Attack</b> ${amountText}`;
}
let LIGHTNING_MIN_ROLL = 0.25;
const LIGHTNING_MAX_ROLL = 1.0;
let LIGHTNING_AVG_MULT = (LIGHTNING_MIN_ROLL + LIGHTNING_MAX_ROLL) / 2;
function rollLightningMultiplier() {
  return LIGHTNING_MIN_ROLL + Math.random() * (LIGHTNING_MAX_ROLL - LIGHTNING_MIN_ROLL);
}
function computeItemAmount(item, cards, level, condResult, isOpponent, lightningRoll) {
  const base = computeItemAmountBase(item, cards, level, condResult, isOpponent);
  if (item.kind !== 'lightning' || !base.amount) return base;
  if (lightningRoll == null) {
    const previewAmount = Math.round(base.amount * LIGHTNING_AVG_MULT);
    return {
      amount: previewAmount,
      breakdown:
        `${base.breakdown} ⚡ ` +
        `rolls ${Math.round(LIGHTNING_MIN_ROLL * 100)}-${Math.round(LIGHTNING_MAX_ROLL * 100)}% power on fire`,
    };
  }
  const finalAmount = Math.round(base.amount * lightningRoll);
  return {
    amount: finalAmount,
    breakdown: `${base.breakdown} ⚡ ${Math.round(lightningRoll * 100)}% ` + `surge = ${finalAmount}`,
  };
}
function computeItemAmountBase(item, cards, level, condResult, isOpponent) {
  const worldMult = isOpponent
    ? BATTLE && BATTLE.opponent && BATTLE.opponent.fixedNumbers
      ? 1
      : (RUN.worldMultiplier || 1.0) * ((BATTLE && BATTLE.opponent && BATTLE.opponent.diffDmgScale) || 1)
    : 1;
  if (item.perFaceCardDamage != null) {
    const faceCount = cards.filter((c) => c.rank >= 11 && c.rank <= 13).length;
    const amount = Math.round(faceCount * item.perFaceCardDamage * worldMult);
    return {
      amount,
      breakdown: `${faceCount} face card${faceCount === 1 ? '' : 's'} ` + `× ${item.perFaceCardDamage} = ${amount}`,
    };
  }
  if (item.utilityEffect) {
    return { amount: 0, breakdown: item.utilityEffect };
  }
  if (item.suitPunish) {
    const suitCount = [...BATTLE.discard, ...(BATTLE.recentDiscard || [])].filter(
      (c) => c.suit === item.suitPunish.suit
    ).length;
    const amount = Math.round(((item.suitPunish.base || 0) + suitCount * item.suitPunish.perCard) * worldMult);
    return { amount, breakdown: `${item.suitPunish.base || 0} + ${suitCount}×${item.suitPunish.perCard} = ${amount}` };
  }
  if (item.colorPunish) {
    const isRed = (c) => c.suit === '♥' || c.suit === '♦';
    const count = BATTLE.oppPool.filter((c) => (item.colorPunish.color === 'red') === isRed(c)).length;
    const amount = Math.round(((item.colorPunish.base || 0) + count * item.colorPunish.perCard) * worldMult);
    return { amount, breakdown: `${item.colorPunish.base || 0} + ${count}×${item.colorPunish.perCard} = ${amount}` };
  }
  if (item.flatAmount != null) {
    const amount = Math.round((item.flatAmount + (item.flatAmountPerLevel || 0) * level) * worldMult);
    return {
      amount,
      breakdown: `flat ${item.flatAmount}${item.flatAmountPerLevel ? ` +${item.flatAmountPerLevel}/lv` : ''}`,
    };
  }
  let mult = item.baseMult ?? condResult.mult ?? 1;
  let bonusApplied = false;
  if (item.bonus) {
    const bonusMet = !item.bonus.condition || checkCondition(item.bonus.condition, cards).met;
    if (bonusMet) {
      const lvl = Math.min(level, item.bonus.maxLevel ?? level);
      const bonusAmt = item.bonus.base + item.bonus.perLevel * lvl;
      mult += bonusAmt;
      if (bonusAmt > 0) bonusApplied = true;
    }
  }
  if (item.perCardBonus && cards.length > 1) mult += item.perCardBonus * (cards.length - 1);

  const rawSum = cards.reduce((a, c) => a + cardValue(c.rank) + (c.bonus || 0), 0);
  const flatBonus = (item.flatBonus || 0) + (item.flatBonusPerLevel || 0) * level;
  const amount = Math.round((Math.round(rawSum * mult) + flatBonus) * worldMult);
  const breakdown =
    `${rawSum} × ${mult
      .toFixed(2)
      .replace(/^0/, '')
      .replace(/\.?0+$/, '')}${flatBonus ? ` +${flatBonus}` : ''}${bonusApplied ? ' (bonus)' : ''} ` + `= ${amount}`;
  return { amount, breakdown };
}
function itemLevel(itemId) {
  return (RUN && RUN.itemLevels && RUN.itemLevels[itemId]) || 0;
}
function itemTuneCost(item, lvl) {
  return 40 * Math.pow(2, lvl);
}
function itemLevelCap(item) {
  if (item.bonus) return item.bonus.maxLevel ?? 0;
  if (item.drawPerLevel) return item.levelCap || 0;
  return 0;
}
function itemUsesLevel(itemId) {
  return (RUN.itemUsesLevels && RUN.itemUsesLevels[itemId]) || 0;
}
function itemUsesTuneCost(lvl) {
  return Math.round(50 * Math.pow(2.5, lvl));
}
const ITEM_MAX_USES_LEVEL = 2;
function itemMaxCardsLevel(itemId) {
  return (RUN && RUN.itemMaxCardsLevels && RUN.itemMaxCardsLevels[itemId]) || 0;
}
function utilityLevel(id) {
  return (RUN?.itemUtilityLevels && RUN.itemUtilityLevels[id]) || 0;
}
function itemMaxCardsTuneCost(lvl) {
  return Math.round(60 * Math.pow(2.5, lvl));
}
const ITEM_MAX_CARDS_BONUS_CAP = 2;
const POKER_TIER_CARD_COUNT = { 0: 1, 1: 2, 2: 4, 3: 3, 5: 5, 6: 5, 7: 4 };
function pokerTierNaturalCap(item) {
  const cond = item && item.condition;
  if (!cond) return null;
  if (cond.type === 'suitCountExact') return cond.count;
  if (cond.type !== 'pokerTier') return null;
  let natural = POKER_TIER_CARD_COUNT[cond.tier] ?? null;
  if (item.bonus && item.bonus.condition && item.bonus.condition.type === 'pokerTier') {
    const bonusNatural = POKER_TIER_CARD_COUNT[item.bonus.condition.tier];
    if (bonusNatural != null) natural = natural != null ? Math.max(natural, bonusNatural) : bonusNatural;
  }
  return natural;
}
function effectiveMaxCards(item) {
  const raw = (item.maxStore ?? item.maxCards) + itemMaxCardsLevel(item.id);
  const natural = pokerTierNaturalCap(item);
  return natural != null ? Math.min(raw, natural) : raw;
}
function normalizeItemKind(kind) {
  const k = String(kind || 'damage').toLowerCase();
  return k.includes('defend') || k === 'defense' ? 'defense' : k;
}
function effectiveKind(item, instanceIndex = null) {
  const key = instanceIndex == null ? item.id : `${item.id}_${instanceIndex}`;
  const baseKind = normalizeItemKind(item.kind || item.itemType || 'damage');
  const override = RUN && RUN.itemKindOverride && (RUN.itemKindOverride[key] || RUN.itemKindOverride[item.id]);

  return baseKind === 'defense' ? 'defense' : normalizeItemKind(override || baseKind);
}
function itemKindConvertCost() {
  return 100;
}
function itemUsesCap(item, usesLevel) {
  return item.usesPerTurn + (item.usesPerTurnPerLevel || 0) * usesLevel;
}
