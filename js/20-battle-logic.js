// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Battle Logic                                                                  ██
// ██  Starting a fight, drawing cards, curses, burns, freezes and targeting.        ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// World 1 is a soft-difficulty world: any non-castle fight there gets its HP capped and its curse items
// stripped before the fight starts. The same function previews a fight (Stop Details) and starts it
// (startBattle), so the preview always matches the real fight.
function effectiveOpponentDef(opponentDef, castleStage = 0) {
  if (RUN.world === 1 && castleStage === 0) {
    const cappedHp = Math.min(opponentDef.hp, 60);
    const cleanItems = (opponentDef.items || []).filter((id) => (ITEMS[id] && ITEMS[id].kind) !== 'curse');
    return { ...opponentDef, hp: cappedHp, items: cleanItems, curse: undefined };
  }
  return opponentDef;
}
function startBattle(opponentDef, row, col, castleStage = 0) {
  primeAudioChannel();
  IN_BATTLE = true;
  const nodeDef = RUN.map?.nodes?.[row]?.[col];
  let oppDef = effectiveOpponentDef(opponentDef, castleStage);
  BATTLE = {
    opponent: {
      ...oppDef,
      hpNow: oppDef.hp,
      poisonStacks: [],
      armor: oppDef.startArmor || 0,
      countdown: oppDef.special?.type === 'countdownStrike' ? oppDef.special.threshold : undefined,
    },
    row,
    col,
    castleStage,
    deck: shuffle(freshDeck()),
    discard: [],
    hand: [],
    oppPool: [],
    usedThisTurn: new Set(),
    scoutedThisTurn: false,
    abilityUsedThisTurn: false,
    opponentStunned: false,
    itemCooldowns: {},
    playerArmor: (HERO_PERKS[RUN.hero.heroId] || {}).battleArmor || 0,
    turn: 1,
    slots: {},
    turnDiscard: [],
    turnSpentDiscard: [],
    recentDiscard: [],
    logLines: [],
    turnStartedAt: Date.now(),
    playerHandPurgeActive: false,
    stagedFireCards: [],
  };
  BATTLE.lightningRoll = rollLightningMultiplier();
  BATTLE.diffStartHealth = RUN.health;
  BATTLE.diffLogged = false;
  if (DIFF.mercy) {
    const hpFrac = RUN.health / RUN.maxHealth,
      m = hpFrac < 0.35 ? 0.88 : hpFrac > 0.9 ? 1.08 : 1;
    if (m !== 1) {
      BATTLE.opponent.diffDmgScale = +((BATTLE.opponent.diffDmgScale || 1) * m).toFixed(3);
      battleLog(
        m < 1
          ? 'Mercy scaling: this opponent swings a little softer ' + 'because you are hurting.'
          : 'Mercy scaling: this opponent swings a little harder ' + 'because you are fresh.'
      );
    }
  }
  if (BATTLE.playerHandPurgeActive)
    battleLog('Grid Storm detected: your hand will be purged to ' + 'discard at the end of every turn.');
  if (row === 0 && col === 0) {
    if (RUN.world === 1 && !META.hasSeenTutorial) BATTLE.showTutorialBanner = true;
    else if (RUN.world >= 2 && !META.hasSeenPoisonTutorial) {
      battleLog('Warning: Poison slips past your armor and deals damage at the end of your turn!');
      META.hasSeenPoisonTutorial = true;
      saveMeta();
    }
  }
  BATTLE.deck.forEach((c) => {
    let total = 0;
    RUN.cardBoosts.forEach((b) => {
      if (b.scope === 'card' && b.rank === c.rank && b.suit === c.suit) total += b.bonus;
      else if (b.scope === 'rank' && b.rank === c.rank) total += b.bonus;
      else if (b.scope === 'suit' && b.suit === c.suit) total += b.bonus;
    });
    if (total) c.bonus = total;
  });
  let openingDraw = 5 + (RUN.drawPerTurn - 2);
  if (RUN.suppressedHandGlitch) {
    openingDraw = Math.max(0, openingDraw - 3);
    RUN.suppressedHandGlitch = false;
    battleLog('Suppressed Hand Glitch! Your opening draw this fight is short 3 cards.');
  }
  drawCards(Math.min(openingDraw, RUN.handSize));
  resortHandAndRelink(RUN.handSortMode);
  drawOpponentStartingHand();
  // The very first battle is staged so it teaches the game: a 2-9-9-K-A hand, and an opponent with exactly 48
  // health and no armor. The two 9s make a Pair (27 with Fender Bender), which leaves 21, the 2 goes into Guard
  // Rail for armor, and next turn the King and Ace add up to exactly 21. A Perfect Win, learned by playing.
  // It is staged the same way on every run. Only a first-time player also gets the step by step hints.
  if (row === 0 && col === 0 && RUN.world === 1) {
    if (RUN.hero.items.includes('fender_bender')) stageTutorialBattle();
    else if (!META.hasSeenTutorial) {
      META.hasSeenTutorial = true;
      saveMeta();
      BATTLE.showTutorialBanner = false;
    }
  }
  if (row === 0 && col === 0 && !META.hasSeenTutorial && typeof window.renderCombatTrainingStep === 'function')
    setTimeout(() => window.renderCombatTrainingStep(1), 100);
  if (opponentDef.startPoolBonus) {
    drawOpponentPoolCards(opponentDef.startPoolBonus);
  }
  for (let i = 0; i < 1 + META.levels.reveal; i++) {
    const hidden = BATTLE.oppPool.filter((c) => !c.revealed);
    if (!hidden.length) break;
    hidden[(Math.random() * hidden.length) | 0].revealed = true;
  }
  render(battleScreen());
  scrollBattleToBoard();
  if (!BATTLE.tutorialBattle) showBattleHeadsUp(BATTLE.opponent);
}
function stageTutorialBattle() {
  const want = [
    [2, '♣'],
    [9, '♠'],
    [9, '♥'],
    [13, '♣'],
    [14, '♠'],
  ];
  const same = (c, w) => c.rank === w[0] && c.suit === w[1];
  const staged = [];
  want.forEach((w) => {
    let c = BATTLE.hand.find((x) => same(x, w) && !staged.includes(x));
    if (!c) {
      const di = BATTLE.deck.findIndex((x) => same(x, w));
      if (di >= 0) c = BATTLE.deck.splice(di, 1)[0];
    }
    if (!c) {
      const oi = BATTLE.oppPool.findIndex((x) => same(x, w));
      if (oi >= 0) {
        c = BATTLE.oppPool[oi];
        const swap = BATTLE.deck.pop();
        if (swap) {
          swap.revealed = c.revealed;
          BATTLE.oppPool[oi] = swap;
        } else BATTLE.oppPool.splice(oi, 1);
      }
    }
    if (c) {
      c.revealed = true;
      staged.push(c);
    }
  });
  const extras = BATTLE.hand.filter((c) => !staged.includes(c));
  const keepExtra = Math.max(0, BATTLE.hand.length - staged.length);
  BATTLE.hand = [...staged, ...extras.slice(0, keepExtra)];
  extras.slice(keepExtra).forEach((c) => BATTLE.deck.push(c));
  resortHandAndRelink(RUN.handSortMode);
  const o = BATTLE.opponent;
  o.hp = 48;
  o.hpNow = 48;
  o.armor = 0;
  o.startArmor = 0;
  o.armorRegen = 0;
  delete o.special;
  delete o.diffInfo;
  BATTLE.tutorialBattle = true;
}
function reshuffleSharedDeck() {
  if (!BATTLE.discard.length) return;
  const live = new Set(
    [...BATTLE.hand, ...BATTLE.oppPool, ...(BATTLE.stagedFireCards || [])].filter(Boolean).map((c) => c.cid)
  );
  BATTLE.deck = shuffle([...BATTLE.deck, ...BATTLE.discard].filter((c) => !live.has(c.cid)));
  BATTLE.discard = [];
}
function drawCards(n, allowOverflow = false) {
  for (let i = 0; i < n; i++) {
    if (!allowOverflow && BATTLE.hand.length >= RUN.handSize) break;
    if (!BATTLE.deck.length) {
      reshuffleSharedDeck();
      if (!BATTLE.deck.length) break;
    }
    BATTLE.hand.push(BATTLE.deck.pop());
  }
}
function drawOpponentPoolCards(n) {
  const opp = BATTLE.opponent;
  const drawn = [];
  for (let i = 0; i < n; i++) {
    if (!BATTLE.deck.length) {
      reshuffleSharedDeck();
      if (!BATTLE.deck.length) break;
    }
    const c = BATTLE.deck.pop();
    drawn.push(c);
    BATTLE.oppPool.push(c);
  }
  if (opp.revealedOnDraw != null || opp.hiddenOnDraw != null) {
    const revealCount =
      opp.revealedOnDraw != null ? opp.revealedOnDraw : Math.max(0, drawn.length - (opp.hiddenOnDraw || 0));
    drawn.forEach((c, i) => {
      c.revealed = i < revealCount;
    });
  } else {
    drawn.forEach((c) => {
      c.revealed = Math.random() < revealFraction(BATTLE.row);
    });
  }
  return drawn;
}
function drawOpponentCards() {
  BATTLE.scoutedThisTurn = false;
  BATTLE.abilityUsedThisTurn = false;
  let drawCount = BATTLE.opponent.drawRate;
  if (BATTLE.opponent.nextDrawOverride != null) {
    drawCount = BATTLE.opponent.nextDrawOverride;
    delete BATTLE.opponent.nextDrawOverride;
  }
  const drawn = drawOpponentPoolCards(drawCount);
  if (BATTLE.opponent.special?.type === 'countdownStrike') {
    if (BATTLE.opponent.countdown == null) BATTLE.opponent.countdown = BATTLE.opponent.special.threshold;
    const rankTotal = drawn.reduce((a, c) => a + cardValue(c.rank), 0);
    BATTLE.opponent.countdown = Math.max(0, BATTLE.opponent.countdown - rankTotal);
  }
}
function drawOpponentStartingHand() {
  BATTLE.scoutedThisTurn = false;
  BATTLE.abilityUsedThisTurn = false;
  const n = BATTLE.opponent.startHandSize != null ? BATTLE.opponent.startHandSize : BATTLE.opponent.drawRate;
  drawOpponentPoolCards(n);
}
function battleLog(msg) {
  BATTLE.logLines.push({ turn: BATTLE.turn, msg });
  if (BATTLE.logLines.length > 200) BATTLE.logLines.shift();
  if (typeof document !== 'undefined') {
    const el = document.getElementById('battleLogEl');
    if (el) el.scrollTop = el.scrollHeight;
  }
}
function tryApplyCurse(specOverride) {
  const spec = specOverride || BATTLE.opponent.curse;
  if (!spec) return;
  if (Math.random() > (spec.chance ?? 1)) return;
  const eligible = RUN.hero.items
    .map((id, i) => `${id}_${i}`)
    .filter((key) => {
      const item = ITEMS[key.replace(/_\d+$/, '')];
      return item && item.kind !== 'storage';
    });
  if (!eligible.length) return;
  const count =
    spec.count === 'all'
      ? eligible.length
      : spec.count === 'random'
        ? 1 + Math.floor(Math.random() * Math.min(3, eligible.length))
        : Math.min(spec.count, eligible.length);
  const chosen = shuffle([...eligible]).slice(0, count);
  BATTLE.itemCurses = BATTLE.itemCurses || {};
  chosen.forEach((key) => {
    const item = ITEMS[key.replace(/_\d+$/, '')];
    const prior = BATTLE.itemCurses[key];
    if (prior) {
      RUN.health = Math.max(0, RUN.health - prior);
      battleLog(
        `${item.name}'s old curse goes off before the new one lands - you take ${prior} ` +
          `damage! Health: ${RUN.health}/${RUN.maxHealth}.`
      );
    }
    BATTLE.itemCurses[key] = spec.amount;
  });
  const names = chosen.map((key) => ITEMS[key.replace(/_\d+$/, '')].name).join(', ');
  battleLog(
    `${BATTLE.opponent.name} curses your ${names} - ` +
      `fire ${chosen.length > 1 ? 'them' : 'it'} this turn or take ${spec.amount} damage${chosen.length > 1 ? ' each' : ''}.`
  );
}
function tryApplyHex(specOverride) {
  const spec = specOverride || BATTLE.opponent.hex;
  if (!spec) return;
  if (Math.random() > (spec.chance ?? 1)) return;
  const eligible = RUN.hero.items
    .map((id, i) => `${id}_${i}`)
    .filter((key) => {
      const item = ITEMS[key.replace(/_\d+$/, '')];
      return item && item.kind !== 'storage';
    });
  if (!eligible.length) return;
  const count = Math.min(spec.count || 1, eligible.length);
  const chosen = shuffle([...eligible]).slice(0, count);
  BATTLE.itemHexes = BATTLE.itemHexes || {};
  chosen.forEach((key) => {
    BATTLE.itemHexes[key] = (BATTLE.itemHexes[key] || 0) + 1;
  });
  const names = chosen
    .map(
      (key) =>
        `${ITEMS[key.replace(/_\d+$/, '')].name}${BATTLE.itemHexes[key] > 1 ? ` (x${BATTLE.itemHexes[key]})` : ''}`
    )
    .join(', ');
  battleLog(
    `${BATTLE.opponent.name} hexes your ${names} - the next time you ` +
      `fire ${chosen.length > 1 ? 'them' : 'it'}, that many of the cards you play get fed straight ` +
      `into ${BATTLE.opponent.name}'s hand.`
  );
}
function tryApplyFreeze(specOverride) {
  const spec = specOverride || BATTLE.opponent.ice;
  if (!spec) return;
  if (Math.random() > (spec.chance ?? 1)) return;
  const eligible = RUN.hero.items
    .map((id, i) => `${id}_${i}`)
    .filter((key) => {
      const item = ITEMS[key.replace(/_\d+$/, '')];
      return item && item.kind !== 'storage' && !(BATTLE.itemFrozen && BATTLE.itemFrozen[key]);
    });
  if (!eligible.length) return;
  const count = Math.min(spec.count || 1, eligible.length);
  const chosen = shuffle([...eligible]).slice(0, count);
  BATTLE.itemFrozen = BATTLE.itemFrozen || {};
  chosen.forEach((key) => {
    BATTLE.itemFrozen[key] = { threshold: spec.threshold || 20, progress: 0 };
  });
  const names = chosen.map((key) => ITEMS[key.replace(/_\d+$/, '')].name).join(', ');
  battleLog(
    `${BATTLE.opponent.name} freezes your ${names} solid - drop cards into it to thaw ` +
      `it before you can use it again.`
  );
}
function detonateBurn() {
  if (!BATTLE || !BATTLE.opponent.burns?.length) return;
  const dmg = BATTLE.opponent.burns.reduce((a, b) => a + (b.stages[b.stageIdx] || 0), 0);
  const detBefore = BATTLE.opponent.hpNow;
  BATTLE.opponent.hpNow = Math.max(0, BATTLE.opponent.hpNow - dmg);
  if (dmg === detBefore && detBefore > 0) BATTLE.exactKill = true;
  battleLog(`Detonated the burn early for ${dmg} damage, forfeiting the remaining ticks.`);
  BATTLE.opponent.burns = [];
  saveRun();
  if (BATTLE.opponent.hpNow <= 0) {
    winBattle();
    return;
  }
  render(battleScreen());
}
function applyOpponentItemCurse(key, amount) {
  BATTLE.opponentItemCurses = BATTLE.opponentItemCurses || {};
  if (BATTLE.opponentItemCurses[key]) detonateOpponentItemCurse(key, 'a new curse replaced the old one');
  BATTLE.opponentItemCurses[key] = amount;
}
function detonateOpponentItemCurse(key, why) {
  const amt = BATTLE.opponentItemCurses && BATTLE.opponentItemCurses[key];
  if (!amt) return;
  delete BATTLE.opponentItemCurses[key];
  const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'Cursed Item';
  const before = BATTLE.opponent.hpNow;
  BATTLE.opponent.hpNow = Math.max(0, before - amt);
  if (amt === before && before > 0) BATTLE.exactKill = true;
  battleLog(`${BATTLE.opponent.name}'s ${name} - ${amt} curse damage${why ? ' (' + why + ')' : ''}.`);
}
function applyOpponentItemBurn(key, amount) {
  BATTLE.opponentItemBurns = BATTLE.opponentItemBurns || {};
  BATTLE.opponentItemBurns[key] = (BATTLE.opponentItemBurns[key] || 0) + amount;
  BATTLE.opponentItemBurnStep = BATTLE.opponentItemBurnStep || {};
  BATTLE.opponentItemBurnStep[key] = (BATTLE.opponentItemBurnStep[key] || 0) + Math.max(1, Math.round(amount * 0.5));
}
// Player chooses to cash in a burning Item early for whatever it has built up to so far.
function detonateOpponentItemBurn(key) {
  if (!BATTLE || !BATTLE.opponentItemBurns || !BATTLE.opponentItemBurns[key]) return;
  const amt = BATTLE.opponentItemBurns[key];
  delete BATTLE.opponentItemBurns[key];
  if (BATTLE.opponentItemBurnStep) delete BATTLE.opponentItemBurnStep[key];
  const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'Item';
  const before = BATTLE.opponent.hpNow;
  BATTLE.opponent.hpNow = Math.max(0, before - amt);
  if (amt === before && before > 0) BATTLE.exactKill = true;
  battleLog(`You detonate ${BATTLE.opponent.name}'s burning ${name} for ${amt} damage.`);
  playSfx('hit');
  flashScreen('hit-opponent');
  saveRun();
  if (BATTLE.opponent.hpNow <= 0) {
    winBattle();
    return;
  }
  render(battleScreen());
}
function targetVerb(type) {
  return type === 'ice' ? 'Freeze' : type === 'burn' ? 'Burn' : type === 'curse' ? 'Curse' : 'Hex';
}
function targetEligibleKeys(type) {
  return (BATTLE.opponent.items || [])
    .map((id, i) => `${id}_${i}`)
    .filter((key) => {
      const it = ITEMS[key.replace(/_\d+$/, '')];
      if (!it || it.kind === 'storage' || it.followUp) return false;
      if (type === 'ice' && BATTLE.opponentItemFrozen && BATTLE.opponentItemFrozen[key]) return false;
      return true;
    });
}
function scrollToOpponentItems() {
  if (!isPhonePortrait()) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const el = document.querySelector('#battle-viewport .opponentSide');
      if (!el) return;
      const hdr = document.querySelector('.currencyHeader');
      const strip = document.querySelector('#battle-viewport .duelSide.you');
      const top =
        (hdr ? hdr.getBoundingClientRect().height : 0) + (strip ? strip.getBoundingClientRect().height : 0) + 8;
      window.scrollTo(0, Math.max(0, window.scrollY + el.getBoundingClientRect().top - top));
    })
  );
}
function chooseCurseTarget(key, quiet) {
  if (!BATTLE.pendingTarget || BATTLE.pendingTarget.type !== 'curse') return;
  const { amount, itemName } = BATTLE.pendingTarget;
  BATTLE.pendingTarget = null;
  applyOpponentItemCurse(key, amount);
  const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'Item';
  battleLog(
    `${itemName} locks a ${amount}-damage curse onto ${BATTLE.opponent.name}'s ${name}. ` +
      `If it doesn't fire before their turn ends, it triggers.`
  );
  saveRun();
  // Re-cursing an item that already has a curse detonates the old one immediately (see
  // applyOpponentItemCurse). If that finishes the opponent, the battle ends here, the same way the
  // end-of-turn curse detonation does.
  if (quiet) return;
  if (BATTLE.opponent.hpNow <= 0) {
    winBattle();
    return;
  }
  render(battleScreen());
}
function chooseBurnTarget(key, quiet) {
  if (!BATTLE.pendingTarget || BATTLE.pendingTarget.type !== 'burn') return;
  const { amount, itemName } = BATTLE.pendingTarget;
  BATTLE.pendingTarget = null;
  applyOpponentItemBurn(key, amount);
  const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'Item';
  battleLog(
    `${itemName} ignites ${BATTLE.opponent.name}'s ${name} ` +
      `for ${BATTLE.opponentItemBurns[key]} burn. The burn grows ` +
      `by ${BATTLE.opponentItemBurnStep[key]} each turn. Detonate it now or let it build. If they fire ` +
      `it, they take the burn damage.`
  );
  saveRun();
  if (!quiet) render(battleScreen());
}
function chooseHexTarget(key, quiet) {
  if (!BATTLE.pendingTarget || BATTLE.pendingTarget.type !== 'hex') return;
  const { itemName } = BATTLE.pendingTarget;
  BATTLE.pendingTarget = null;
  BATTLE.opponentItemHexes = BATTLE.opponentItemHexes || {};
  BATTLE.opponentItemHexes[key] = (BATTLE.opponentItemHexes[key] || 0) + 1;
  const stacks = BATTLE.opponentItemHexes[key];
  const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'Item';
  battleLog(
    `${itemName} hexes ${BATTLE.opponent.name}'s ${name}${stacks > 1 ? ` (now stacked ${stacks}x)` : ''} ` +
      `- the next time they fire it, you ` +
      `pull ${stacks > 1 ? `${stacks} of the cards` : 'one of the cards'} they use straight into your hand.`
  );
  saveRun();
  if (!quiet) render(battleScreen());
}
function chooseIceTarget(key, quiet) {
  if (!BATTLE.pendingTarget || BATTLE.pendingTarget.type !== 'ice') return;
  const { itemName, threshold } = BATTLE.pendingTarget;
  BATTLE.pendingTarget = null;
  BATTLE.opponentItemFrozen = BATTLE.opponentItemFrozen || {};
  BATTLE.opponentItemFrozen[key] = { threshold: threshold || 20, progress: 0 };
  const name = ITEMS[key.replace(/_\d+$/, '')]?.name || 'Item';
  battleLog(
    `${itemName} freezes ${BATTLE.opponent.name}'s ${name} solid - it'll thaw out on ` +
      `its own over their next few turns.`
  );
  playSfx('freeze');
  saveRun();
  if (!quiet) render(battleScreen());
}
function cancelPendingTarget() {
  BATTLE.pendingTarget = null;
  render(battleScreen());
}
function toggleCardSelect(i) {
  const pos = selectedIdx.indexOf(i);
  if (pos === -1) selectedIdx.push(i);
  else selectedIdx.splice(pos, 1);
  render(battleScreen());
}
