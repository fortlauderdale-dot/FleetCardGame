// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Item Cards: Display                                                           ██
// ██  How an Item card is drawn on every screen.                                    ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function renderStandardItemCard(item, opts = {}) {
  const {
    interactive = false,
    slotKey = null,
    cards = [],
    cursedAmt = null,
    ready = false,
    usesBadgeText = null,
    usesDepleted = false,
    cooldownLeft = 0,
    hypPreviewHTML = '',
    footerHTML = null,
    level = 0,
    kindOverride = null,
    frozenState = null,
    burnTargetKey = null,
    burnTargetAmount = null,
    burnedAmt = null,
    burnedStep = 0,
    burnedDetonateKey = null,
    pickKey = null,
    picked = false,
    scaleOpp = null,
  } = opts;
  const eKind = kindOverride || effectiveKind(item);
  const burnOverlayHTML = burnTargetKey
    ? `<div class="burnTargetOverlay"><span>` + `Burn: ${burnTargetAmount}</span></div>`
    : burnedAmt
      ? `<div class="burnedOverlay"><span class="burnedLabel">` +
        `Burn: ${burnedAmt} (+${burnedStep || 1} each ` +
        `turn)</span>${
          burnedDetonateKey
            ? `<button class="detonateItemBtn" ` +
              `data-detonateitem="${burnedDetonateKey}">Detonate for ${burnedAmt}</button>`
            : ''
        }</div>`
      : '';
  const dragAttrs = pickKey
    ? ` data-targetkey="${pickKey}" data-title="Tap to select ${item.name}" style="cursor:pointer"`
    : burnTargetKey
      ? ` data-targetkey="${burnTargetKey}" data-title="Click to ignite ${item.name}" style="cursor:pointer"`
      : interactive
        ? ` data-assign="${slotKey}" style="border-style:dashed;border-width:2px"`
        : ` style="cursor:default"`;
  const usesBadge =
    usesBadgeText != null
      ? `<div class="usesBadge ${usesDepleted ? 'depleted' : ''} ` +
        `hoverTip" data-title="Uses left this turn">${usesBadgeText}</div>`
      : '';
  if (item.kind === 'storage') {
    const cardHTML = cards
      .map((c, i) => {
        const handIdx = opts.idxs ? opts.idxs[i] : i;
        return (
          `<div class="card mini ${suitColorClass(c.color, c.suit)}" ${
            interactive ? `data-unassign="${slotKey}|${handIdx}" ` + `data-title="Click to take this card back"` : ''
          }>` + `<div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
        );
      })
      .join('');
    const weightlessTag = item.weightless
      ? `<span class="effectTip" style="color:#1a1a2e" ` +
        `data-tip="Doesn't consume an item card slot">Weightless</span>`
      : '';
    return (
      `<div class="itemCard ` +
      `kind-storage${item.weightless ? ' kind-weightless' : ''}${burnTargetKey ? ' burnTargetable' : ''}"${dragAttrs}>
      ${
        interactive
          ? `<div class="usesBadge hoverTip" data-title="Cards currently ` +
            `held">${cards.length}/${effectiveMaxCards(item)}</div>`
          : ''
      }
      <div class="itemCard-sec">
        <div class="hdr" style="font-weight:600">${item.name}</div>
        ${weightlessTag ? `<div class="note" style="margin:2px 0">${weightlessTag}</div>` : ''}
        <div class="note" style="font-size:11px">${stashHoldsLineHTML(item)}</div>
      </div>
      <div class="itemDivider"></div>
      <div class="itemCard-cards-sec">
        ${
          interactive
            ? `<div class="vcards">${cardHTML}</div>${
                cards.length > 0
                  ? `<button class="wo-btn gray" style="padding:3px 6px;` +
                    `font-size:10px;margin-top:6px" data-clear="${slotKey}">Release All</button>`
                  : ''
              }`
            : ''
        }
      </div>
      ${
        footerHTML != null
          ? `<div class="itemCard-footer"><div class="itemDivider"></div><div ` +
            `class="itemCard-sec">${footerHTML}</div></div>`
          : ''
      }
      ${burnOverlayHTML}
    </div>`
    );
  }
  const drawN = item.drawUsesCardCount
    ? (cards.length ? cards.length : item.maxCards) + (item.drawBonusFlat || 0) + (item.drawPerLevel || 0) * level
    : item.drawAmount
      ? item.drawAmount + (item.drawPerLevel || 0) * level
      : 0;
  const drawBonusLine =
    item.drawAmount || item.drawUsesCardCount
      ? `<div class="itemBonusLine hoverTip" ` +
        `data-title="Draws ${drawN} card${drawN === 1 ? '' : 's'} immediately after this item is used.">` +
        `Draw ${drawN} card${drawN === 1 ? '' : 's'}</div>`
      : '';
  const bonusLine = itemBonusLineHTML(item, level);
  const kindTag =
    eKind === 'poison'
      ? `<span class="effectTip poisonText" data-tip="Poison ` +
        `deals its damage at the end of the opponent's turn, then drops by 3 each turn until it's gone.">Poison</span>`
      : eKind === 'burn'
        ? `<span class="effectTip burnText" data-tip="Burn sets an Item on fire. ` +
          `The burn grows every turn, so you can detonate it right away for less or let it build. If the ` +
          `Item is fired while it burns, it still attacks, but its owner takes the burn damage.">Burn</span>`
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
                  }">${item.freezeThreshold ? `Frozen: ${item.freezeThreshold} to ` + `thaw` : 'Freeze'}</span>`
                : eKind === 'lightning'
                  ? `<span class="effectTip" style="color:var(--lightning)" ` +
                    `data-tip="Lightning uses one shared roll between ${Math.round(LIGHTNING_MIN_ROLL * 100)}% and ` +
                    `100%. Whenever anyone fires a Lightning attack, that roll is used and then rerolled.">Lightning</span>`
                  : '';
  const effUnlockThreshold =
    item.id === 'impound_release'
      ? Math.max(35, (item.unlockThreshold || 45) - utilityLevel('impound_release') * 5)
      : item.unlockThreshold;
  const unlockLine =
    item.unlockThreshold != null && footerHTML == null
      ? `<div class="note" style="margin:2px 0 0"><span ` +
        `class="hoverTip" data-title="Play cards through it to count down a ${effUnlockThreshold}-point ` +
        `charge (based on the cards' value, no damage dealt). Once charged, it draws 4 cards each use, ` +
        `once per turn, for the rest of that battle. Charge resets every new battle.">Charges ` +
        `at ${effUnlockThreshold}${item.id === 'impound_release' ? ', then Draw 4' : ''}</span></div>`
      : '';
  const staticKindLine =
    footerHTML == null ? `<div class="note" style="margin:0">${formatKindAmount(item, kindTag, opponentFlatShown(item, scaleOpp))}</div>` : '';
  const cardHTML = cards
    .map((c, i) => {
      const handIdx = opts.idxs ? opts.idxs[i] : i;
      return (
        `<div class="card mini ${suitColorClass(c.color, c.suit)}" ${interactive ? `data-unassign="${slotKey}|${handIdx}"` : ''}>` +
        `<div>${rankLabel(c.rank)}</div><div>${c.suit}</div></div>`
      );
    })
    .join('');

  const frozenReqLine = frozenState
    ? `<span class="hoverTip" data-title="This Item is frozen ` +
      `solid and can't fire. It thaws out on its own as its owner works through it.">` +
      `Frozen: ${Math.max(0, frozenState.threshold - frozenState.progress)} to thaw</span>`
    : null;
  return (
    `<div class="itemCard ` +
    `kind-${eKind} ${ready ? 'ready' : ''} ${cursedAmt ? 'cursed' : ''} ${frozenState ? 'frozenLock' : ''} ${burnTargetKey ? 'burnTargetable' : ''} ${pickKey ? 'targetPickable' : ''} ${picked ? 'targetPicked' : ''} ${burnedAmt ? 'burned' : ''} ${burnedDetonateKey && burnedAmt ? 'burnedOpp' : ''}"${dragAttrs}>
    ${usesBadge}
    <div class="itemCard-sec">
      <div class="hdr" ` +
    `style="font-weight:600">${item.name}${
      cursedAmt
        ? ` <span class="vart" style="width:12px;height:12px;` +
          `font-size:12px;color:var(--purple)">${ICON.curse}</span> cursed`
        : ''
    }</div>
      <div class="itemReqLine">${frozenReqLine || itemRequirementText(item, eKind)}</div>
    </div>
    <div class="itemDivider"></div>
    <div class="itemCard-cards-sec">
      ${bonusLine}${drawBonusLine}${hypPreviewHTML}
      ${interactive ? `<div class="vcards">${cardHTML}</div>` : ''}
    </div>
    <div class="itemCard-footer">
      <div class="itemDivider"></div>
      <div class="itemCard-sec">
        ${footerHTML != null ? footerHTML : frozenState ? `<div class="note" style="margin:0">Frozen solid</div>` : `${staticKindLine}${unlockLine}`}
      </div>
    </div>
    ${burnOverlayHTML}
  </div>`
  );
}


// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Vehicles: Ability Cards And Unlocks                                           ██
// ██  Ability and perk cards, plus what unlocks each vehicle.                       ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function heroAbilityCardHTML(heroId) {
  const sp = VEHICLE_SPECIALS[heroId];
  if (!sp) return '';
  const cost = sp.energyCost ?? sp.energyPerUnit;
  // Short on-card blurb (the full description stays available on hover) so this card is never taller
  // than a real item card, no matter how wordy the vehicle's ability description is.
  const shortDesc =
    sp.type === 'shield'
      ? `Every ${sp.energyPerUnit} Energy: +${sp.amountPerUnit} armor.`
      : sp.type === 'heal'
        ? `Every ${sp.energyPerUnit} Energy: ` + `heal ${sp.amountPerUnit}${sp.cleanse ? ' and clear effects' : ''}.`
        : sp.type === 'draw'
          ? `Every ${sp.energyPerUnit} Energy: draw ${sp.amountPerUnit} ` + `card${sp.amountPerUnit === 1 ? '' : 's'}.`
          : sp.type === 'coins'
            ? `Every ${sp.energyPerUnit} Energy: +${sp.amountPerUnit} coins.`
            : sp.type === 'gem'
              ? `Every ${sp.energyPerUnit} Energy: +${sp.amountPerUnit} ` + `gem${sp.amountPerUnit === 1 ? '' : 's'}.`
              : sp.type === 'dodge'
                ? `${Math.round(sp.chance * 100)}% chance to dodge the next attack.`
                : sp.type === 'overtime'
                  ? `Every Item fires one extra time this turn.`
                  : sp.type === 'refuel'
                    ? `Refill ${sp.amountPerUnit} Fuel.`
                    : sp.type === 'cleanse'
                      ? `Every ${sp.energyPerUnit} Energy: remove all ` +
                        `effects${sp.amountPerUnit ? `, +${sp.amountPerUnit} ` + `armor` : ''}.`
                      : sp.type === 'charge'
                        ? `Every ${sp.energyPerUnit} Energy: your next attack deals ${sp.amountPerUnit}x.`
                        : sp.type === 'weaken'
                          ? `Opponent's next attacks hit ${sp.amountPerUnit}% softer.`
                          : sp.type === 'dump'
                            ? `Discard your hand and deal ${Math.round(sp.amountPerUnit * 100)}% of its total as damage.`
                            : sp.type === 'scout'
                              ? `Show the opponent's hand and draw ${sp.amountPerUnit || 0} card.`
                              : sp.type === 'revive'
                                ? `Get back up with ${sp.amountPerUnit}% health when defeated.`
                                : sp.type === 'reroll'
                                  ? `Every ${sp.energyPerUnit} Energy: redraw your ` +
                                    `hand${sp.armor ? `, +${sp.armor} armor` : ''}.`
                                  : sp.desc;
  const tip = String(sp.desc).replace(/"/g, '&quot;');
  return `<div class="abilityCard" data-title="${tip}">
    <div class="abilityTag">Ability</div>
    <div class="abilityName">${sp.name}</div>
    <div class="abilityCost">${sp.type === 'revive' ? 'Once per run' : `${ICON.energy} ${cost} Energy`}</div>
    <div class="abilityDesc">${shortDesc}</div>
  </div>`;
}
function heroPerkCardHTML(heroId) {
  const h = HEROES[heroId];
  if (h && !h.travelCoinCost && HERO_PERKS[heroId]) {
    const line = heroPerkLine(heroId);
    return `<div class="abilityCard" data-title="${line}">
    <div class="abilityTag">Perk</div>
    <div class="abilityName">Head Start</div>
    <div class="abilityCost">${HERO_PERKS[heroId].battleArmor ? ICON.shield || '' : ''} ${HERO_PERKS[heroId].battleArmor ? HERO_PERKS[heroId].battleArmor + ' armor' : HERO_PERKS[heroId].startEnergy + ' Energy'}</div>
    <div class="abilityDesc">${line}</div>
  </div>`;
  }
  if (!h || !h.travelCoinCost) return '';
  const tip = String(h.perk || '').replace(/"/g, '&quot;');
  return (
    `<div class="abilityCard" data-title="${tip}">
    <div class="abilityTag">Perk</div>
    <div class="abilityName">Pay As You Go</div>
    <div class="abilityCost">${ICON.coin} ${h.travelCoinCost} per stop</div>
    <div class="abilityDesc">No fuel tank. Fuel rewards pay out as coins. ` +
    `+${h.startBonusCoins || 0} starting coins.</div>
  </div>`
  );
}
// How each vehicle unlocks. One place to change them: type 'world' = beat that world, 'perfect' = Perfect Wins in
// total, 'elite' = Elites beaten in total, 'cp' = Career Points earned in total (lifetime, not what you have left
// to spend).
const STARTER_UNLOCKS = {
  beachtractor: { type: 'world', n: 1 },
  towtruck: { type: 'world', n: 2 },
  crownvic: { type: 'world', n: 3 },
  firetruck: { type: 'world', n: 4 },
  arff: { type: 'world', n: 5 },
  bearcat: { type: 'world', n: 6 },
  ambulance: { type: 'world', n: 7 },
  highwater: { type: 'world', n: 8 },
  washer: { type: 'perfect', n: 100 },
  garbagetruck: { type: 'elite', n: 25 },
  mower: { type: 'cp', n: 150 },
  bobcat: { type: 'cp', n: 400 },
  harley: { type: 'cp', n: 800 },
  backhoe: { type: 'cp', n: 1300 },
  forklift: { type: 'cp', n: 1900 },
  dumptruck: { type: 'cp', n: 2600 },
  grapple: { type: 'cp', n: 3400 },
  tanker: { type: 'cp', n: 4400 },
  interstate: { type: 'cp', n: 5600 },
  convoy: { type: 'cp', n: 7000 },
  beachatv: { type: 'cp', n: 8500 },
  oceanrescue: { type: 'cp', n: 10000 },
};
function starterUnlockProgress(id) {
  const u = STARTER_UNLOCKS[id];
  if (!u) return null;
  if (u.type === 'world')
    return { have: (META.bestWorld || 1) > u.n || !!META['world' + u.n + 'Cleared'] ? u.n : 0, need: u.n };
  if (u.type === 'perfect') return { have: META.perfectWins || 0, need: u.n };
  if (u.type === 'elite') return { have: META.elitesBeaten || 0, need: u.n };
  return { have: META.lifetimePoints || 0, need: u.n };
}
function isStarterUnlocked(id) {
  if (id === 'sidebyside' || id === 'admin') return true;
  const pr = starterUnlockProgress(id);
  return !!pr && pr.have >= pr.need;
}
function starterLockNote(id) {
  const u = STARTER_UNLOCKS[id],
    pr = starterUnlockProgress(id);
  if (!u) return id === 'comingsoon1' || id === 'comingsoon2' ? 'Coming soon' : '';
  if (u.type === 'world') return u.n === 8 ? 'Unlocks after beating World 8' : `Unlocks after beating World ${u.n}`;
  const shown = `${Math.min(pr.have, pr.need)}/${pr.need}`;
  if (u.type === 'perfect') return `Unlocks after ${u.n} Perfect Wins (${shown})`;
  if (u.type === 'elite') return `Unlocks after beating ${u.n} Elites (${shown})`;
  return `Unlocks at ${u.n} Career Points earned in total (${shown})`;
}
