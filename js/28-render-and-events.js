// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Rendering And Button Events                                                   ██
// ██  render() swaps the screen, then every button is wired up here.                ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// Stop Details' picture sits to the right of the stats+item-card column (sdLeftCol) and is meant to
// fill exactly that column's height, not the picture's own natural aspect ratio - CSS alone can't
// express "match this sibling's rendered height" reliably here, so this measures sdLeftCol directly
// after every render() and sets the picture's height inline to match. Called on every render since
// only a small fraction of screens have a .stopArtRow at all, so the querySelectorAll is cheap when
// there's nothing to do.
function syncStopArtHeights(root) {
  root.querySelectorAll('.stopArtRow').forEach((row) => {
    const leftCol = row.querySelector(':scope > .sdLeftCol');
    const art = row.querySelector(':scope > .stopArtBig');
    if (!leftCol || !art) return;
    const set = () => {
      const h = leftCol.getBoundingClientRect().height;
      if (h > 0) art.style.height = h + 'px';
    };
    set();
    requestAnimationFrame(() => {
      set();
      fitAllArt(row);
    }); // catch layout that settles a frame late (e.g. web-font swap)
  });
}
function isPhonePortrait() {
  return !!(window.matchMedia && window.matchMedia('(max-width:700px) and ' + '(orientation:portrait)').matches);
}
let BATTLE_HDR_OBSERVER = null;
function fitDuelNames() {
  const phone = isPhonePortrait();
  document.querySelectorAll('#battle-viewport .duelSide h3').forEach((h) => {
    h.style.fontSize = '';
    if (!phone) return;
    let fs = parseFloat(getComputedStyle(h).fontSize) || 13;
    while (h.scrollWidth > h.clientWidth && fs > 9) {
      fs -= 0.5;
      h.style.fontSize = fs + 'px';
    }
  });
}
function battleLayoutPass() {
  // Runs on every screen (not just battles) so the page content always starts right under the fixed
  // resource bar, with no leftover blank gap above the title. With no bar on screen, --curH is 0.
  const hdr = document.querySelector('.currencyHeader');
  const setH = () => {
    document.documentElement.style.setProperty(
      '--curH',
      (hdr ? Math.ceil(hdr.getBoundingClientRect().height) : 0) + 'px'
    );
  };
  setH();
  if (BATTLE_HDR_OBSERVER) {
    BATTLE_HDR_OBSERVER.disconnect();
    BATTLE_HDR_OBSERVER = null;
  }
  if (hdr && window.ResizeObserver) {
    BATTLE_HDR_OBSERVER = new ResizeObserver(setH);
    BATTLE_HDR_OBSERVER.observe(hdr);
  }
  if (document.getElementById('battle-viewport')) fitDuelNames();
}
function scrollBattleToBoard() {
  if (!isPhonePortrait()) return;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const strip = document.querySelector('#battle-viewport .duelSide.you');
      if (!strip) return;
      const hdr = document.querySelector('.currencyHeader');
      const hh = hdr ? hdr.getBoundingClientRect().height : 0;
      window.scrollTo(0, Math.max(0, window.scrollY + strip.getBoundingClientRect().top - hh));
    })
  );
}
window.addEventListener('resize', () => {
  if (document.getElementById('battle-viewport')) battleLayoutPass();
});
// Remembers the last real screen so the Run Dashboard's Back button can return to it instead of the home page.
let LAST_SCREEN_HTML = null;
function render(html) {
  const app = document.getElementById('app');
  if (!String(html).includes('id="leaveRunSummaryBtn"')) LAST_SCREEN_HTML = html;
  // Every click that calls render() (a card, a match tile, an item slot...) replaces the whole
  // #app subtree, which destroys whatever element currently has focus - the button just clicked,
  // almost always. Losing a focused element mid-interaction makes some browsers (especially on
  // phones) snap the page's scroll position back toward the top as focus resets to <body>, which
  // reads as the page randomly jumping every time something is tapped. Capturing and restoring the
  // scroll position around the DOM swap keeps the page exactly where it was. Both an immediate and
  // a next-frame restore are needed since that browser-driven scroll can land a frame late.
  const scrollX = window.scrollX,
    scrollY = window.scrollY;
  app.innerHTML = `<div class="game-stage">${html}</div>`;
  window.scrollTo(scrollX, scrollY);
  requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
  if (IN_BATTLE) saveBattleState();
  const mw = app.querySelector('.mapwrap');

  if (mw && !GARAGE_POPUP && !TREASURE_POPUP) {
    mw.scrollLeft = MAP_SCROLL_X;
    mw.onscroll = () => {
      MAP_SCROLL_X = mw.scrollLeft;
    };
    if (RUN && mw.querySelector('.mapnode-wrap')) {
      requestAnimationFrame(() => {
        const row = Math.max(0, RUN.currentRow);
        const colW = 118;
        const target = Math.max(0, row * colW - mw.clientWidth * 0.15);
        mw.scrollLeft = target;
        MAP_SCROLL_X = target;
      });
    }
  }
  syncStopArtHeights(app);
  fitHomeStats();
  fitAllArt(app);
  requestAnimationFrame(() => fitAllArt(app));
  battleLayoutPass();
  if (window.__combatTrainingStep && typeof window.renderCombatTrainingStep === 'function')
    window.renderCombatTrainingStep(window.__combatTrainingStep);
  placeMatchPopup();
  if (!IN_BATTLE) {
    const hu = document.getElementById('headsUpModal');
    if (hu) hu.remove();
  }

  // Mouse selection uses the plain click handler, not pointerdown, because pointerdown's preventDefault
  // blocks the browser's native drag-and-drop (dragging a card onto an item slot) and click-and-drag
  // multi-select. Touch and pen select on pointerdown, with the ph flag guarding against the synthetic
  // click that follows a tap.
  app.querySelectorAll('[data-card]').forEach((el) => {
    let ph = false;
    el.onclick = () => {
      if (ph) {
        ph = false;
        return;
      }
      toggleCardSelect(+el.dataset.card);
    };
    el.onpointerdown = (e) => {
      if (e.pointerType !== 'mouse') {
        e.preventDefault();
        ph = true;
        toggleCardSelect(+el.dataset.card);
      }
    };
  });
  app.querySelectorAll('[data-assign]').forEach(
    (el) =>
      (el.onclick = (e) => {
        if (
          e.target.closest('[data-clear]') ||
          e.target.closest('[data-unassign]') ||
          e.target.closest('[data-ability]') ||
          e.target.closest('[data-attack]')
        )
          return;
        assignSelectedTo(el.dataset.assign);
      })
  );
  app.querySelectorAll('[data-unassign]').forEach(
    (el) =>
      (el.onclick = (e) => {
        e.stopPropagation();
        const parts = el.dataset.unassign.split('|');
        const idx = +parts.pop();
        const slotKey = parts.join('|');
        removeCardFromSlot(slotKey, idx);
      })
  );
  app.querySelectorAll('[data-clear]').forEach(
    (el) =>
      (el.onclick = (e) => {
        e.stopPropagation();
        clearSlot(el.dataset.clear);
      })
  );
  app.querySelectorAll('[data-ability]').forEach(
    (el) =>
      (el.onclick = (e) => {
        e.stopPropagation();
        useAbility(el.dataset.ability);
      })
  );
  app.querySelectorAll('[data-attack]').forEach((el) => {
    el.onclick = (e) => {
      e.stopPropagation();
      const match = el.dataset.attack.match(/^(.+)_(\d+)$/);
      if (!match) return;
      const wasStep = window.__combatTrainingStep;
      executePlayerAttack(match[1], Number(match[2]));
      if ((wasStep === 3 || wasStep === 4) && typeof window.renderCombatTrainingStep === 'function')
        window.renderCombatTrainingStep(4);
    };
  });
  const forfeitRunBtn = document.getElementById('forfeitRunBtn');
  if (forfeitRunBtn) forfeitRunBtn.onclick = () => window.forfeitRun();
  const endTurnBtn = document.getElementById('endTurnBtn');
  if (endTurnBtn)
    endTurnBtn.onclick = () => {
      const trainingStep = window.__combatTrainingStep;
      endTurn();
      // Ending the turn at the armor step or the last step finishes the walkthrough.
      if ((trainingStep === 4 || trainingStep === 5) && typeof window.finishCombatTraining === 'function')
        window.finishCombatTraining();
    };
  const vehicleSpecialBtn = document.getElementById('vehicleSpecialBtn');
  if (vehicleSpecialBtn) vehicleSpecialBtn.onclick = () => useVehicleSpecial();
  app.querySelectorAll('[data-detonateitem]').forEach(
    (el) =>
      (el.onclick = (e) => {
        e.stopPropagation();
        detonateOpponentItemBurn(el.dataset.detonateitem);
      })
  );
  app.querySelectorAll('[data-detonate]').forEach(
    (el) =>
      (el.onclick = (e) => {
        e.stopPropagation();
        detonateBurn();
      })
  );
  const sortToggleBtn = document.getElementById('sortToggleBtn');
  if (sortToggleBtn) sortToggleBtn.onclick = toggleHandSort;
  const scoutBtn = document.getElementById('scoutBtn');
  if (scoutBtn) scoutBtn.onclick = scoutOpponent;
  const gemDrawBtn = document.getElementById('gemDrawBtn');
  if (gemDrawBtn) gemDrawBtn.onclick = drawWithGem;
  const performFuelHeal = () => {
    const coinHeal = usesCoinTravel();
    const fuelCost = coinHeal ? FUEL_HESTORE_COST * FUEL_COIN_VALUE : FUEL_HESTORE_COST;
    const healAmount = FUEL_HEAL_AMOUNT + (BATTLE.opponent.fuelHealModifier || OPPONENT_FUEL_HEAL_MODIFIER_DEFAULT);
    if ((coinHeal ? RUN.chips : RUN.fuel) < fuelCost || RUN.health >= RUN.maxHealth) return;
    if (coinHeal) RUN.chips -= fuelCost;
    else RUN.fuel -= fuelCost;
    RUN.health = Math.min(RUN.maxHealth, RUN.health + healAmount);
    battleLog(
      coinHeal
        ? `Spent ${fuelCost} coins for +${healAmount} health. ` +
            `Health: ${RUN.health}/${RUN.maxHealth}, Coins: ${RUN.chips}.`
        : `Used ${FUEL_HESTORE_COST} fuel for +${healAmount} ` +
            `health. Health: ${RUN.health}/${RUN.maxHealth}, Fuel: ${RUN.fuel}/${RUN.maxFuel}.`
    );
    saveRun();
    render(battleScreen());
  };
  const fuelHealBtn = document.getElementById('fuelHealBtn');
  if (fuelHealBtn)
    fuelHealBtn.onclick = () => {
      if (!META.hasSeenFuelHealTip) {
        BATTLE.showFuelHealWarning = true;
        render(battleScreen());
        return;
      }
      performFuelHeal();
    };
  const fuelHealWarningOkBtn = document.getElementById('fuelHealWarningOkBtn');
  if (fuelHealWarningOkBtn)
    fuelHealWarningOkBtn.onclick = () => {
      BATTLE.showFuelHealWarning = false;
      META.hasSeenFuelHealTip = true;
      saveMeta();
      performFuelHeal();
    };
  app.querySelectorAll('[data-artzoom]').forEach(
    (el) =>
      (el.onclick = () => {
        const side = el.dataset.artzoom;
        const entity = side === 'you' ? HEROES[RUN.hero?.heroId] || PLAYER_ART : BATTLE.opponent;
        ART_ZOOM = { image: entity.image, icon: entity.icon, name: entity.name || fleetLabel() };
        render(battleScreen());
      })
  );
  const artZoomCloseBtn = document.getElementById('artZoomCloseBtn');
  if (artZoomCloseBtn)
    artZoomCloseBtn.onclick = () => {
      ART_ZOOM = null;
      render(battleScreen());
    };
  const artZoomOverlay = document.getElementById('artZoomOverlay');
  if (artZoomOverlay)
    artZoomOverlay.onclick = () => {
      ART_ZOOM = null;
      render(battleScreen());
    };
  const discardSelectedBtn = document.getElementById('discardSelectedBtn');
  if (discardSelectedBtn) discardSelectedBtn.onclick = markSelectedForDiscard;
  app.querySelectorAll('[data-unstage]').forEach(
    (el) =>
      (el.onclick = (e) => {
        e.stopPropagation();
        unmarkDiscard(+el.dataset.unstage);
      })
  );

  app.querySelectorAll('[data-nodeinfo]').forEach(
    (el) =>
      (el.onclick = () => {
        const [r, c] = el.dataset.nodeinfo.split(':').map(Number);
        MAP_POPUP = { row: r, col: c };
        render(mapScreen());
      })
  );
  const popupCloseBtn = document.getElementById('popupCloseBtn');
  if (popupCloseBtn)
    popupCloseBtn.onclick = () => {
      MAP_POPUP = null;
      render(mapScreen());
    };
  const popupGoBtn = document.getElementById('popupGoBtn');
  if (popupGoBtn)
    popupGoBtn.onclick = () => {
      const p = MAP_POPUP;
      MAP_POPUP = null;
      if (p) selectNode(p.row, p.col);
    };
  const popupReenterBtn = document.getElementById('popupReenterBtn');
  if (popupReenterBtn)
    popupReenterBtn.onclick = () => {
      const p = MAP_POPUP;
      MAP_POPUP = null;
      if (p) reenterCurrentNode(p.row, p.col);
    };

  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn)
    continueBtn.onclick = () => {
      const won = continueBtn.parentElement.querySelector('.wo-eyebrow').textContent.includes('Won');
      if (won) {
        commitNode(BATTLE.row, BATTLE.col);
        if (RUN.pendingWorldWin) {
          RUN.pendingWorldWin = false;
          RUN.worldCleared = true;
          saveRun();
          if (RUN.world === 1) {
            RUN.pendingNextWorld = 2;
            render(worldCompleteScreen(1, 2));
          } else if (RUN.world === 2) {
            META.world2Cleared = true;
            saveMeta();
            RUN.pendingNextWorld = 3;
            render(worldCompleteScreen(2, 3));
          } else if (RUN.world === 3) {
            META.world3Cleared = true;
            saveMeta();
            RUN.pendingNextWorld = 4;
            render(world3ClearedScreen());
          } else if (RUN.world === 4) {
            META.world4Cleared = true;
            saveMeta();
            RUN.pendingNextWorld = 5;
            render(worldCompleteScreen(4, 5));
          } else if (RUN.world === 5) {
            META.world5Cleared = true;
            saveMeta();
            RUN.pendingNextWorld = 6;
            render(worldCompleteScreen(5, 6));
          } else if (RUN.world === 6) {
            META.world6Cleared = true;
            saveMeta();
            RUN.pendingNextWorld = 7;
            render(worldCompleteScreen(6, 7));
          } else if (RUN.world === 7) {
            META.world7Cleared = true;
            saveMeta();
            RUN.pendingNextWorld = 8;
            render(worldCompleteScreen(7, 8));
          } else if (RUN.world === 8) {
            META.world8Cleared = true;
            saveMeta();
            render(victoryScreen());
          } else {
            endRun(true);
          }
        } else {
          // The first battle you ever win shows the Career Points note one time.
          if (!META.seenRunRulesNote) {
            META.seenRunRulesNote = true;
            saveMeta();
            RULES_NOTE_POPUP = true;
          }
          render(mapScreen());
        }
      } else endRun(false);
    };
  const advanceWorldBtn = document.getElementById('advanceWorldBtn');
  if (advanceWorldBtn)
    advanceWorldBtn.onclick = () => {
      RUN.world = RUN.pendingNextWorld || 2;
      RUN.worldCleared = false;
      RUN.worldMultiplier = worldDifficultyMultiplier(RUN.world);
      RUN.map = generateMap();
      RUN.bossRow = RUN.map.nodes.length - 1;
      RUN.currentRow = -1;
      RUN.currentCol = null;
      RUN.path = [];
      RUN.pendingNextWorld = null;
      resetDungeonState();
      resetPlinkoState();
      resetBlackjackState();
      resetPokerState();
      resetAuctionState();
      resetMatchPlayedState();
      resetBodyShopFuelState();
      META.bestWorld = Math.max(META.bestWorld || 1, RUN.world);
      saveMeta();
      saveRun();
      render(mapScreen());
    };
  const upgradeContinueBtn = document.getElementById('upgradeContinueBtn');
  const upgradeContinueBtn2 = document.getElementById('upgradeContinueBtn2');
  if (upgradeContinueBtn) upgradeContinueBtn.onclick = () => render(metaScreen());
  if (upgradeContinueBtn2) upgradeContinueBtn2.onclick = () => render(metaScreen());
  const playerNameInput = document.getElementById('playerNameInput');
  if (playerNameInput) {
    playerNameInput.oninput = () => {
      META.playerName = playerNameInput.value.trim().slice(0, 18);
      META.devModeActive = META.playerName.toLowerCase() === 'devmode';
      saveMeta();
      if (META.devModeActive) render(metaScreen());
    };
    playerNameInput.onblur = () => {
      if (!META.devModeActive) render(metaScreen());
    };
  }
  const starterBackBtn = document.getElementById('starterBackBtn');
  if (starterBackBtn) starterBackBtn.onclick = () => render(metaScreen());
  const starterUpgradesBtn = document.getElementById('starterUpgradesBtn');
  if (starterUpgradesBtn) starterUpgradesBtn.onclick = () => render(upgradeScreen());
  const rulesNoteOkBtn = document.getElementById('rulesNoteOkBtn');
  if (rulesNoteOkBtn)
    rulesNoteOkBtn.onclick = () => {
      RULES_NOTE_POPUP = false;
      render(mapScreen());
    };
  const homeTipShowBtn = document.getElementById('homeTipShowBtn');
  if (homeTipShowBtn)
    homeTipShowBtn.onclick = () => {
      HOME_TIP_POPUP = true;
      render(metaScreen());
    };
  const homeTipHideBtn = document.getElementById('homeTipHideBtn');
  if (homeTipHideBtn)
    homeTipHideBtn.onclick = (e) => {
      e.stopPropagation();
      META.hideHomeTip = true;
      saveMeta();
      render(metaScreen());
    };
  const homeSaveHideBtn = document.getElementById('homeSaveHideBtn');
  if (homeSaveHideBtn)
    homeSaveHideBtn.onclick = () => {
      META.hideSaveBox = true;
      saveMeta();
      render(metaScreen());
    };
  const homeSaveShowBtn = document.getElementById('homeSaveShowBtn');
  if (homeSaveShowBtn)
    homeSaveShowBtn.onclick = () => {
      META.hideSaveBox = false;
      saveMeta();
      render(metaScreen());
    };
  const homeTipOkBtn = document.getElementById('homeTipOkBtn');
  if (homeTipOkBtn)
    homeTipOkBtn.onclick = () => {
      HOME_TIP_POPUP = false;
      render(metaScreen());
    };
  const homeTipNeverBtn = document.getElementById('homeTipNeverBtn');
  if (homeTipNeverBtn)
    homeTipNeverBtn.onclick = () => {
      HOME_TIP_POPUP = false;
      META.hideHomeTip = true;
      saveMeta();
      render(metaScreen());
    };
  const viewUpgradesBtn = document.getElementById('viewUpgradesBtn');
  if (viewUpgradesBtn) viewUpgradesBtn.onclick = () => render(upgradeScreen());
  const leaveChopShopBtn = document.getElementById('leaveChopShopBtn');
  if (leaveChopShopBtn)
    leaveChopShopBtn.onclick = () => render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
  const leaveOverdriveBtn = document.getElementById('leaveOverdriveBtn');
  if (leaveOverdriveBtn)
    leaveOverdriveBtn.onclick = () => render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());

  const stationFuelBtn = document.getElementById('stationFuelBtn');
  if (stationFuelBtn) {
    stationFuelBtn.onclick = () => {
      const stationPrice = bodyShopFuelUnitPrice(stationFuelBought());
      if (RUN.chips >= stationPrice && RUN.fuel < RUN.maxFuel) {
        RUN.chips -= stationPrice;
        RUN.fuel += 1;
        if (!RUN.castleState) RUN.castleState = {};
        RUN.castleState.stationFuelBought = stationFuelBought() + 1;
        playSfx('buy');
        saveRun();
        render(mapScreen());
      }
    };
  }

  const restBtn = document.getElementById('restBtn');
  if (restBtn) {
    restBtn.onclick = () => {
      RUN.health = Math.min(RUN.maxHealth, RUN.health + 30);
      RUN.restStopUsed = { row: RUN.currentRow, col: RUN.currentCol };
      playSfx('heal');
      saveRun();
      GARAGE_MESSAGE = 'Rested up: +30 Health.';
      render(mapScreen());
    };
  }

  const leaveStationBtn = document.getElementById('leaveStationBtn');
  if (leaveStationBtn) {
    leaveStationBtn.onclick = () => {
      GARAGE_POPUP = false;
      render(mapScreen());
    };
  }

  const castleFuelBtn = document.getElementById('castleFuelBtn');
  if (castleFuelBtn) {
    castleFuelBtn.onclick = () => {
      const quote = bodyShopFuelQuote();
      const purchaseLimit = quote.units,
        totalCost = quote.cost;
      if (purchaseLimit > 0 && RUN.chips >= totalCost) {
        RUN.chips -= totalCost;
        RUN.fuel += purchaseLimit;
        if (!RUN.castleState) RUN.castleState = {};
        RUN.castleState.fuelBought = (RUN.castleState.fuelBought || 0) + purchaseLimit;
        saveRun();
        render(castleInnScreen(`Topped off tank: added +${purchaseLimit} fuel for ${totalCost} coins.`));
      }
    };
  }

  const castleRestBtn = document.getElementById('castleRestBtn');
  if (castleRestBtn) {
    castleRestBtn.onclick = () => {
      const cost = RUN.innSleeps === 0 ? 0 : 20 * RUN.innSleeps;
      if (RUN.chips < cost || RUN.health >= RUN.maxHealth) return;
      RUN.chips -= cost;
      RUN.innSleeps = (RUN.innSleeps || 0) + 1;
      RUN.health = Math.min(RUN.maxHealth, RUN.health + 30);
      saveRun();
      render(castleInnScreen(`You slept and recovered 30 health${cost ? ` for ${cost} coins` : ''}.`));
    };
  }

  app.querySelectorAll('[data-garageselect]').forEach(
    (el) =>
      (el.onclick = () => {
        GARAGE_SELECTED_ITEM = el.dataset.garageselect;
        render(blacksmithScreen());
      })
  );

  app.querySelectorAll('[data-bonusup]').forEach(
    (el) =>
      (el.onclick = () => {
        const item = ITEMS[el.dataset.bonusup];
        const cap = itemLevelCap(item);
        if (cap <= 0) return;
        const lvl = itemLevel(item.id);
        if (lvl >= cap) return;
        const cost = itemTuneCost(item, lvl);
        if (RUN.chips < cost) return;
        RUN.chips -= cost;
        RUN.itemLevels[item.id] = lvl + 1;
        saveRun();
        render(blacksmithScreen());
      })
  );
  app.querySelectorAll('[data-bonusdown]').forEach(
    (el) =>
      (el.onclick = () => {
        const item = ITEMS[el.dataset.bonusdown];
        const lvl = itemLevel(item.id);
        if (lvl <= 0) return;
        const refund = itemTuneCost(item, lvl - 1);
        RUN.itemLevels[item.id] = lvl - 1;
        RUN.chips += refund;
        saveRun();
        render(blacksmithScreen());
      })
  );
  app.querySelectorAll('[data-usesup]').forEach(
    (el) =>
      (el.onclick = () => {
        const item = ITEMS[el.dataset.usesup];
        const lvl = itemUsesLevel(item.id);
        if (lvl >= ITEM_MAX_USES_LEVEL) return;
        const cost = itemUsesTuneCost(lvl);
        if (RUN.chips < cost) return;
        RUN.chips -= cost;
        RUN.itemUsesLevels[item.id] = lvl + 1;
        saveRun();
        render(overdriveBayScreen());
      })
  );
  app.querySelectorAll('[data-usesdown]').forEach(
    (el) =>
      (el.onclick = () => {
        const item = ITEMS[el.dataset.usesdown];
        const lvl = itemUsesLevel(item.id);
        if (lvl <= 0) return;
        const refund = itemUsesTuneCost(lvl - 1);
        RUN.itemUsesLevels[item.id] = lvl - 1;
        RUN.chips += refund;
        saveRun();
        render(overdriveBayScreen());
      })
  );
  app.querySelectorAll('[data-cardsup]').forEach(
    (el) =>
      (el.onclick = () => {
        const item = ITEMS[el.dataset.cardsup];
        const lvl = itemMaxCardsLevel(item.id);
        if (lvl >= ITEM_MAX_CARDS_BONUS_CAP) return;
        const cost = itemMaxCardsTuneCost(lvl);
        if (RUN.chips < cost) return;
        RUN.chips -= cost;
        RUN.itemMaxCardsLevels[item.id] = lvl + 1;
        saveRun();
        render(chopShopScreen());
      })
  );
  app.querySelectorAll('[data-cardsdown]').forEach(
    (el) =>
      (el.onclick = () => {
        const item = ITEMS[el.dataset.cardsdown];
        const lvl = itemMaxCardsLevel(item.id);
        if (lvl <= 0) return;
        const refund = itemMaxCardsTuneCost(lvl - 1);
        RUN.itemMaxCardsLevels[item.id] = lvl - 1;
        RUN.chips += refund;
        saveRun();
        render(chopShopScreen());
      })
  );
  app.querySelectorAll('[data-kindconvert]').forEach(
    (el) =>
      (el.onclick = () => {
        const itemId = el.dataset.kindconvert;
        const to = el.dataset.kindto;
        const cost = itemKindConvertCost();
        if (RUN.chips < cost) return;
        RUN.chips -= cost;
        RUN.itemKindOverride[`${itemId}_${el.dataset.itemIndex}`] = to;
        saveRun();
        render(chopShopScreen());
      })
  );
  app.querySelectorAll('[data-kindrevert]').forEach(
    (el) =>
      (el.onclick = () => {
        const itemId = el.dataset.kindrevert;
        const key = el.dataset.itemIndex ? `${itemId}_${el.dataset.itemIndex}` : itemId;
        if (!RUN.itemKindOverride[key]) return;
        delete RUN.itemKindOverride[key];
        RUN.chips += itemKindConvertCost();
        saveRun();
        render(chopShopScreen());
      })
  );

  app.querySelectorAll('[data-runupgrade]').forEach(
    (el) =>
      (el.onclick = () => {
        const kind = el.dataset.runupgrade;
        const def = RUN_UPGRADE_DEFS[kind];
        const n = RUN.runUpgrades[kind] || 0;
        if (n >= def.cap) return;
        if (kind === 'health' && RUN.health >= RUN.maxHealth) return;
        const cost = runUpgradeCost(kind);
        if (RUN.chips < cost) return;
        RUN.chips -= cost;
        RUN.runUpgrades[kind] = n + 1;
        if (kind === 'itemSlots') RUN.itemCap = Math.min(MAX_ITEM_CAP, RUN.itemCap + 1);
        else if (kind === 'drawPerTurn') RUN.drawPerTurn += 1;
        else if (kind === 'health') RUN.health = Math.min(RUN.maxHealth, RUN.health + 25);
        playSfx('upgrade');
        saveRun();
        render(runUpgradeScreen());
      })
  );
  const leaveRunUpgradeBtn = document.getElementById('leaveRunUpgradeBtn');
  if (leaveRunUpgradeBtn)
    leaveRunUpgradeBtn.onclick = () => {
      if (RUN_UPGRADE_RETURN === 'rest') {
        GARAGE_POPUP = true;
        render(mapScreen());
        return;
      }
      render(
        RUN_UPGRADE_RETURN === 'battle'
          ? battleScreen()
          : RUN_UPGRADE_RETURN === 'shop'
            ? shopScreen(RUN_UPGRADE_RETURN_FROMCASTLE)
            : RUN_UPGRADE_RETURN === 'blacksmith'
              ? blacksmithScreen()
              : RUN_UPGRADE_RETURN === 'chopshop'
                ? chopShopScreen()
                : RUN_UPGRADE_RETURN === 'overdrive'
                  ? overdriveBayScreen()
                  : RUN_UPGRADE_RETURN === 'dungeon'
                    ? castleDungeonScreen()
                    : RUN_UPGRADE_RETURN === 'inn'
                      ? castleInnScreen()
                      : mapScreen()
      );
    };
  const openRunUpgradeFromMapBtn = document.getElementById('openRunUpgradeFromMapBtn');
  if (openRunUpgradeFromMapBtn)
    openRunUpgradeFromMapBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'map';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromBattleBtn = document.getElementById('openRunUpgradeFromBattleBtn');
  if (openRunUpgradeFromBattleBtn)
    openRunUpgradeFromBattleBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'battle';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromShopBtn = document.getElementById('openRunUpgradeFromShopBtn');
  if (openRunUpgradeFromShopBtn)
    openRunUpgradeFromShopBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'shop';
      RUN_UPGRADE_RETURN_FROMCASTLE = openRunUpgradeFromShopBtn.dataset.fromcastle === '1';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromBlacksmithBtn = document.getElementById('openRunUpgradeFromBlacksmithBtn');
  if (openRunUpgradeFromBlacksmithBtn)
    openRunUpgradeFromBlacksmithBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'blacksmith';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromRestBtn = document.getElementById('openRunUpgradeFromRestBtn');
  if (openRunUpgradeFromRestBtn)
    openRunUpgradeFromRestBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'rest';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromChopShopBtn = document.getElementById('openRunUpgradeFromChopShopBtn');
  if (openRunUpgradeFromChopShopBtn)
    openRunUpgradeFromChopShopBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'chopshop';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromOverdriveBtn = document.getElementById('openRunUpgradeFromOverdriveBtn');
  if (openRunUpgradeFromOverdriveBtn)
    openRunUpgradeFromOverdriveBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'overdrive';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromDungeonBtn = document.getElementById('openRunUpgradeFromDungeonBtn');
  if (openRunUpgradeFromDungeonBtn)
    openRunUpgradeFromDungeonBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'dungeon';
      render(runUpgradeScreen());
    };
  const openRunUpgradeFromInnBtn = document.getElementById('openRunUpgradeFromInnBtn');
  if (openRunUpgradeFromInnBtn)
    openRunUpgradeFromInnBtn.onclick = () => {
      RUN_UPGRADE_RETURN = 'inn';
      render(runUpgradeScreen());
    };
  app.querySelectorAll('[data-levelup]').forEach(
    (el) =>
      (el.onclick = () => {
        const u = UPGRADE_DEFS.find((x) => x.id === el.dataset.levelup);
        if (!upgradeUnlocked(u)) return;
        const lvl = META.levels[u.id];
        if (lvl >= MAX_LEVEL) return;
        const cost = upgradeCost(u, lvl);
        if (META.points < cost) return;
        META.points -= cost;
        META.levels[u.id]++;
        playSfx('upgrade');
        saveMeta();
        render(upgradeScreen());
      })
  );
  app.querySelectorAll('[data-leveldown]').forEach(
    (el) =>
      (el.onclick = () => {
        const u = UPGRADE_DEFS.find((x) => x.id === el.dataset.leveldown);
        const lvl = META.levels[u.id];
        if (lvl <= 0) return;
        const refund = upgradeCost(u, lvl - 1);
        META.levels[u.id]--;
        META.points += refund;
        saveMeta();
        render(upgradeScreen());
      })
  );

  const castleDungeonNavBtn = document.getElementById('castleDungeonNavBtn');
  if (castleDungeonNavBtn) castleDungeonNavBtn.onclick = () => render(castleDungeonScreen());
  const castleWizardNavBtn = document.getElementById('castleWizardNavBtn');
  if (castleWizardNavBtn)
    castleWizardNavBtn.onclick = () => {
      if (!RUN.castleState) RUN.castleState = {};
      if (RUN.castleState.matchPlayed) return;
      openMatchGame();
      MATCH_RETURN_TO_MAP = false;
      MATCH_OVERLAY_ACTIVE = true;
      renderMatchOverlay();
    };
  const castlePlinkoNavBtn = document.getElementById('castlePlinkoNavBtn');
  if (castlePlinkoNavBtn)
    castlePlinkoNavBtn.onclick = () => {
      if (!RUN.castleState) RUN.castleState = {};
      if (RUN.castleState.plinkoPlayed) return;
      RETURN_TO_CASTLE_MENU = true;
      openFleetPlinko({ onComplete: applyPlinkoHaul });
    };
  const castleBlackjackNavBtn = document.getElementById('castleBlackjackNavBtn');
  if (castleBlackjackNavBtn)
    castleBlackjackNavBtn.onclick = () => {
      if (!RUN.castleState) RUN.castleState = {};
      if (RUN.castleState.blackjackPlayed) return;
      RETURN_TO_CASTLE_MENU = true;
      openFleetBlackjack({ onComplete: applyBlackjackHaul });
    };
  const castlePokerNavBtn = document.getElementById('castlePokerNavBtn');
  if (castlePokerNavBtn)
    castlePokerNavBtn.onclick = () => {
      if (!RUN.castleState) RUN.castleState = {};
      if (RUN.castleState.pokerPlayed) return;
      RETURN_TO_CASTLE_MENU = true;
      openFleetPoker({ onComplete: applyPokerHaul });
    };
  const castleAuctionNavBtn = document.getElementById('castleAuctionNavBtn');
  if (castleAuctionNavBtn)
    castleAuctionNavBtn.onclick = () => {
      if (!RUN.castleState) RUN.castleState = {};
      if (RUN.castleState.auctionPlayed) return;
      RETURN_TO_CASTLE_MENU = true;
      openFleetAuction({ onComplete: applyAuctionHaul });
    };
  const castleBlacksmithNavBtn = document.getElementById('castleBlacksmithNavBtn');
  if (castleBlacksmithNavBtn)
    castleBlacksmithNavBtn.onclick = () => {
      RETURN_TO_CASTLE_MENU = true;
      BLACKSMITH_OPTIONS = pickBlacksmithOptions();
      BLACKSMITH_VISIT = { primary: null, secondary: null };
      render(blacksmithScreen());
    };
  const castleChopShopNavBtn = document.getElementById('castleChopShopNavBtn');
  if (castleChopShopNavBtn)
    castleChopShopNavBtn.onclick = () => {
      RETURN_TO_CASTLE_MENU = true;
      render(chopShopScreen());
    };
  const castleOverdriveNavBtn = document.getElementById('castleOverdriveNavBtn');
  if (castleOverdriveNavBtn)
    castleOverdriveNavBtn.onclick = () => {
      RETURN_TO_CASTLE_MENU = true;
      render(overdriveBayScreen());
    };
  const castleShopNavBtn = document.getElementById('castleShopNavBtn');
  if (castleShopNavBtn)
    castleShopNavBtn.onclick = () => {
      RETURN_TO_CASTLE_MENU = true;
      render(shopScreen(true));
    };
  const castleInnNavBtn = document.getElementById('castleInnNavBtn');
  if (castleInnNavBtn) castleInnNavBtn.onclick = () => render(castleInnScreen());
  const backToCastleMenuBtn = document.getElementById('backToCastleMenuBtn');
  if (backToCastleMenuBtn) backToCastleMenuBtn.onclick = () => render(castleMenuScreen());
  const castleBattle1Btn = document.getElementById('castleBattle1Btn');
  if (castleBattle1Btn)
    castleBattle1Btn.onclick = () => {
      if (!RUN.castleState) RUN.castleState = {};
      startBattle(CASTLE_FIRST, 10, 0, 1);
    };
  const dungeonContinueBtn = document.getElementById('dungeonContinueBtn');
  if (dungeonContinueBtn)
    dungeonContinueBtn.onclick = () => {
      const p = DUNGEON_CONTINUE_POPUP;
      DUNGEON_CONTINUE_POPUP = null;
      if (!p) {
        render(castleDungeonScreen());
        return;
      }
      if (p.stage === 1) startBattle(CASTLE_SECOND, 10, 0, 2);
      else startBattle(CASTLE_THIRD, 10, 0, 3);
    };
  const dungeonCashOutBtn = document.getElementById('dungeonCashOutBtn');
  if (dungeonCashOutBtn)
    dungeonCashOutBtn.onclick = () => {
      DUNGEON_CONTINUE_POPUP = null;
      if (!RUN.castleState) RUN.castleState = {};
      RUN.castleState.dungeonLocked = true;
      saveRun();
      render(castleDungeonScreen());
    };
  const dungeonWinContinueBtn = document.getElementById('dungeonWinContinueBtn');
  if (dungeonWinContinueBtn)
    dungeonWinContinueBtn.onclick = () => {
      DUNGEON_WIN_POPUP = null;
      render(castleDungeonScreen());
    };
  const leaveCastleBtn = document.getElementById('leaveCastleBtn');
  if (leaveCastleBtn) leaveCastleBtn.onclick = () => render(mapScreen());
  const leaveMatchBtn = document.getElementById('leaveMatchBtn');
  if (leaveMatchBtn)
    leaveMatchBtn.onclick = () => {
      MATCH_OVERLAY_ACTIVE = false;
      if (!MATCH_RETURN_TO_MAP) {
        if (!RUN.castleState) RUN.castleState = {};
        RUN.castleState.matchPlayed = true;
      }
      render(MATCH_RETURN_TO_MAP ? mapScreen() : castleMenuScreen());
    };
  const jokerGlitchReRouteBtn = document.getElementById('jokerGlitchReRouteBtn');
  if (jokerGlitchReRouteBtn)
    jokerGlitchReRouteBtn.onclick = () => {
      const returnToMap = JOKER_GLITCH_POPUP?.returnToMap;
      JOKER_GLITCH_POPUP = null;
      MATCH_OVERLAY_ACTIVE = false;
      if (!returnToMap) {
        if (!RUN.castleState) RUN.castleState = {};
        RUN.castleState.matchPlayed = true;
      }
      if (returnToMap) {
        RUN.lastNotice =
          'Critical glitch! A Red Joker and a Black Joker were ' + 'flipped together. The board has reset.';
        render(mapScreen());
      } else
        render(
          castleMenuScreen(
            'Critical glitch! A Red Joker and a Black Joker were flipped ' + 'together. The board has reset.'
          )
        );
    };
  const matchPopupContinueBtn = document.getElementById('matchPopupContinueBtn');
  if (matchPopupContinueBtn)
    matchPopupContinueBtn.onclick = () => {
      const wasCleared = MATCH_POPUP && MATCH_POPUP.boardCleared;
      const wasOutOfAttempts = MATCH_POPUP && MATCH_POPUP.outOfAttempts;
      MATCH_POPUP = null;
      const st = getMatchState();
      if (wasOutOfAttempts) {
        // Attempts are spent for this visit - OK takes the player straight back to wherever they
        // came from (the map for a Grid Anomaly node, the Fleet Compound menu otherwise) instead of
        // leaving them sitting on the now-unplayable board.
        MATCH_OVERLAY_ACTIVE = false;
        if (!MATCH_RETURN_TO_MAP) {
          if (!RUN.castleState) RUN.castleState = {};
          RUN.castleState.matchPlayed = true;
        }
        render(MATCH_RETURN_TO_MAP ? mapScreen() : castleMenuScreen());
      } else if (wasCleared) {
        // Ending the visit here (same as running out of attempts) stops a player clearing board after board
        // from the Compound. A map Grid Anomaly node still deals a fresh board and continues, since each of
        // those is already a one-time stop.
        if (!MATCH_RETURN_TO_MAP) {
          MATCH_OVERLAY_ACTIVE = false;
          if (!RUN.castleState) RUN.castleState = {};
          RUN.castleState.matchPlayed = true;
          render(castleMenuScreen());
        } else {
          st.matchCards = null;
          st.matchGuesses = 4;
          st.matchPick = [];
          renderMatchOverlay();
        }
      } else {
        renderMatchOverlay();
      }
    };
  app.querySelectorAll('[data-match]').forEach((el) => {
    el.onclick = () => {
      const i = +el.dataset.match;
      const st = getMatchState();

      if (
        !st ||
        MATCH_POPUP ||
        st.matchGuesses <= 0 ||
        st.matchPick.includes(i) ||
        st.matchCards[i].flipped ||
        st.matchCards[i].matched ||
        st.matchLock
      )
        return;

      st.matchPick.push(i);
      st.matchCards[i].flipped = true;

      if (st.matchPick.length < 2) {
        renderMatchOverlay();
        return;
      }

      st.matchLock = true;
      renderMatchOverlay();

      setTimeout(() => {
        const [a, b] = st.matchPick;
        const ga = st.matchCards[a].group,
          gb = st.matchCards[b].group;
        const isJokerGlitch = (ga === 'RJ' && gb === 'BJ') || (ga === 'BJ' && gb === 'RJ');

        if (isJokerGlitch) {
          resetMatchState();
          playSfx('hurt');
          JOKER_GLITCH_POPUP = { returnToMap: MATCH_RETURN_TO_MAP };
          renderMatchOverlay();
          return;
        }

        if (ga === gb) {
          playSfx('matchHappy');
          st.matchCards[a].matched = true;
          st.matchCards[b].matched = true;
          st.matchPick = [];

          const reward = MATCH_SUIT_REWARDS[ga] || {};
          RUN.chips += reward.coins || 0;
          RUN.gems = Math.min(RUN.maxGems, RUN.gems + (reward.gems || 0));
          addFuel(reward.fuel || 0);
          RUN.health = Math.min(RUN.maxHealth, RUN.health + (reward.health || 0));
          RUN.energy = Math.min(RUN.maxEnergy, RUN.energy + (reward.energy || 0));
          if (reward.points) {
            earnPoints(reward.points);
            RUN.careerPointsFromMatchGame = (RUN.careerPointsFromMatchGame || 0) + reward.points;
          }
          st.visitTally = st.visitTally || {};
          st.visitTally.coins =
            (st.visitTally.coins || 0) +
            (reward.coins || 0) +
            (usesCoinTravel() ? (reward.fuel || 0) * FUEL_COIN_VALUE : 0);
          st.visitTally.gems = (st.visitTally.gems || 0) + (reward.gems || 0);
          st.visitTally.fuel = (st.visitTally.fuel || 0) + (usesCoinTravel() ? 0 : reward.fuel || 0);
          st.visitTally.health = (st.visitTally.health || 0) + (reward.health || 0);
          st.visitTally.energy = (st.visitTally.energy || 0) + (reward.energy || 0);
          st.visitTally.points = (st.visitTally.points || 0) + (reward.points || 0);
          saveRun();

          const boardCleared = st.matchCards.every((c) => c.matched);
          if (boardCleared) {
            const jackpotItem = ITEMS[st.matchJackpotItemId] || ITEMS['supply_bag'];
            RUN.hero.items.push(jackpotItem.id);
            const clearLabel = `${jackpotItem.name} added to your Fleet`;
            const clearCardHTML = renderStandardItemCard(jackpotItem, {});
            saveRun();
            MATCH_POPUP = {
              suitLabel: 'Board',
              rewardLabel: clearLabel,
              cardHTML: clearCardHTML,
              boardCleared: true,
              jackpot: true,
            };
          } else {
            MATCH_POPUP = {
              suitLabel: ga === 'RJ' ? 'Red Joker' : ga === 'BJ' ? 'Black Joker' : ga,
              rewardLabel: reward.label || '',
              rewardHTML: matchRewardChipsHTML(reward),
              boardCleared: false,
            };
          }
          st.matchLock = false;
          renderMatchOverlay();
        } else {
          playSfx('wahwah');
          st.matchGuesses--;
          renderMatchOverlay();

          setTimeout(() => {
            st.matchCards[a].flipped = false;
            st.matchCards[b].flipped = false;
            st.matchPick = [];
            st.matchLock = false;

            if (st.matchGuesses <= 0) {
              // Out of attempts for THIS visit only - matchCards (and every pair already found) stays
              // put, so coming back later picks up right where this session left off. Shown as a
              // popup (with what was won this visit) instead of leaving straight to the map/Compound,
              // so the player sees a clear stopping point instead of the screen just changing under them.
              MATCH_POPUP = { outOfAttempts: true };
              renderMatchOverlay();
            } else {
              renderMatchOverlay();
            }
          }, 1200);
        }
      }, 30);
    };
  });

  const leaveShopBtn = document.getElementById('leaveShopBtn');
  if (leaveShopBtn) leaveShopBtn.onclick = () => render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
  const leaveBlacksmithBtn = document.getElementById('leaveBlacksmithBtn');
  if (leaveBlacksmithBtn)
    leaveBlacksmithBtn.onclick = () => {
      BLACKSMITH_OPTIONS = null;
      BLACKSMITH_VISIT = null;
      render(RETURN_TO_CASTLE_MENU ? castleMenuScreen() : mapScreen());
    };
  const leaveTreasureBtn = document.getElementById('leaveTreasureBtn');
  if (leaveTreasureBtn)
    leaveTreasureBtn.onclick = () => {
      TREASURE_POPUP = null;
      render(mapScreen());
    };
  app.querySelectorAll('[data-cachechoice]').forEach(
    (el) =>
      (el.onclick = () => {
        const kind = el.dataset.cachechoice;
        if (kind === 'safe') {
          const safeKind = el.dataset.safekind;
          if (safeKind === 'fuel') RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + 4);
          else RUN.gems = Math.min(RUN.maxGems, RUN.gems + 2);
          RUN.lastNotice = `Supply Cache: ${safeKind === 'fuel' ? '+4 Fuel' : '+2 Gems'}.`;
        } else if (kind === 'siphon') {
          const siphonKind = el.dataset.siphonkind;
          if (siphonKind === 'fuel') RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel + 15);
          else if (siphonKind === 'gems') RUN.gems = Math.min(RUN.maxGems, RUN.gems + 6);
          else RUN.energy = Math.min(RUN.maxEnergy, RUN.energy + 12);
          RUN.suppressedHandGlitch = true;
          RUN.lastNotice =
            `Supply Cache: ${siphonKind === 'fuel' ? '+15 Fuel' : siphonKind === 'gems' ? '+6 Gems' : '+12 Energy'}. ` +
            `Your next battle's opening draw is 3 cards smaller.`;
        } else if (kind === 'overclock') {
          if (Math.random() < 0.7) {
            RUN.maxHealth += 20;
            RUN.health += 20;
            RUN.lastNotice = 'Supply Cache: +20 Max HP for the rest of this run.';
          } else {
            RUN.health = Math.max(0, RUN.health - 15);
            if (RUN.health <= 0) {
              saveRun();
              TREASURE_POPUP = null;
              RUN.lastNotice = 'The supply cache backfired and your fleet collapsed.';
              endRun(false);
              return;
            }
            RUN.lastNotice = 'Supply Cache: it backfired and you lost 15 health.';
          }
        }
        saveRun();
        TREASURE_POPUP = null;
        render(mapScreen());
      })
  );
  app.querySelectorAll('[data-forge]').forEach(
    (el) =>
      (el.onclick = () => {
        const i = +el.dataset.forge;
        const opt = BLACKSMITH_OPTIONS[i];
        const b = findBoost(opt);
        const count = b ? b.count || 0 : 0;
        if (count >= SCOPE_TUNE_MAX_STACKS) return;
        const isSecondary = BLACKSMITH_VISIT.primary !== null;
        if (isSecondary && BLACKSMITH_VISIT.secondary !== null) return;
        const cost = tuneCost(b ? b.bonus : 0, isSecondary, opt.scope);
        if (RUN.chips < cost) return;
        RUN.chips -= cost;
        boostCard(opt);
        if (!isSecondary) BLACKSMITH_VISIT.primary = i;
        else BLACKSMITH_VISIT.secondary = i;
        saveRun();
        render(blacksmithScreen());
      })
  );
  app.querySelectorAll('[data-sell]').forEach(
    (el) =>
      (el.onclick = () => {
        const i = +el.dataset.sell;
        const id = RUN.hero.items[i];
        const it = ITEMS[id];
        if (!it) return;
        const modCost =
          (itemLevel(id) > 0 ? itemTuneCost(it, Math.max(0, itemLevel(id) - 1)) : 0) +
          (itemUsesLevel(id) > 0 ? itemUsesTuneCost(itemUsesLevel(id) - 1) : 0) +
          (itemMaxCardsLevel(id) > 0 ? itemMaxCardsTuneCost(itemMaxCardsLevel(id) - 1) : 0) +
          (RUN.itemKindOverride[`${id}_${i}`] || RUN.itemKindOverride[id] ? itemKindConvertCost() : 0);
        const sellValue = Math.floor((it.cost + modCost) / 2);
        RUN.chips += sellValue;
        RUN.hero.items.splice(i, 1);
        playSfx('sell');
        saveRun();
        render(shopScreen());
      })
  );
  app.querySelectorAll('[data-buy]').forEach(
    (el) =>
      (el.onclick = () => {
        const cost = +el.dataset.cost;
        if (RUN.chips < cost || equippedItemCount(RUN.hero) >= RUN.itemCap || RUN.hero.items.includes(el.dataset.buy))
          return;
        RUN.chips -= cost;
        RUN.hero.items.push(el.dataset.buy);
        RUN.shopStock = RUN.shopStock.filter((id) => id !== el.dataset.buy);
        playSfx('buy');
        saveRun();
        render(shopScreen());
      })
  );

  const backToMetaBtn = document.getElementById('backToMetaBtn');
  if (backToMetaBtn) backToMetaBtn.onclick = () => render(metaScreen());
  const saveCodeBox = document.getElementById('saveCodeBox');
  if (saveCodeBox) {
    const msg = (t) => {
      const m = document.getElementById('saveCodeMsg');
      if (m) m.textContent = t;
    };
    let loadArmed = false;
    document.getElementById('saveCodeMakeBtn').onclick = () => {
      try {
        const pack = {
          v: 1,
          meta: localStorage.getItem(META_KEY),
          run: localStorage.getItem(RUN_KEY),
          battle: localStorage.getItem(BATTLE_KEY),
        };
        saveCodeBox.value = 'FD1:' + btoa(unescape(encodeURIComponent(JSON.stringify(pack))));
        saveCodeBox.focus();
        saveCodeBox.select();
        let copied = false;
        try {
          copied = !!(navigator.clipboard && navigator.clipboard.writeText);
          if (copied) navigator.clipboard.writeText(saveCodeBox.value).catch(() => {});
        } catch (e) {}
        msg(
          copied
            ? 'Code made and copied. Paste it on the other one.'
            : 'Code made. Press and hold the box, choose Select All, ' + 'then Copy.'
        );
      } catch (e) {
        msg('Could not make a code.');
      }
    };
    document.getElementById('saveCodePasteBtn').onclick = async () => {
      try {
        const t = await navigator.clipboard.readText();
        saveCodeBox.value = t;
        msg(
          t
            ? `Pasted ${t.length} characters.` +
                (t.includes('FD1:') ? ' Now tap Load code.' : ' That does not look like a save ' + 'code.')
            : 'Nothing on the clipboard.'
        );
      } catch (e) {
        msg('Your phone blocked the paste button. Press and hold in the box and choose Paste instead.');
      }
    };
    saveCodeBox.addEventListener('input', () => {
      if (saveCodeBox.value) msg(`${saveCodeBox.value.length} characters in the ` + `box.`);
    });
    const loadBtn = document.getElementById('saveCodeLoadBtn');
    loadBtn.onclick = () => {
      let raw = (saveCodeBox.value || '').replace(/\s+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
      const mm = /FD1[:\uFF1A;]/i.exec(raw);
      const at = mm ? mm.index : -1;
      if (at < 0) {
        msg(
          raw
            ? `The box has ${raw.length} characters, but I can't find FD1: in ` +
                `it. It starts with: ${raw.slice(0, 12)}`
            : 'The box is empty. Paste the code into it first, then ' + 'tap Load code.'
        );
        return;
      }
      raw = raw
        .slice(at + mm[0].length)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/[^A-Za-z0-9+/=]/g, '');
      while (raw.length % 4) raw += '=';
      let pack;
      try {
        pack = JSON.parse(decodeURIComponent(escape(atob(raw))));
        if (!pack || pack.v !== 1) throw 0;
      } catch (e) {
        msg('That code looks cut off or changed. Make a new one, ' + 'copy all of it, and try again.');
        return;
      }
      if (!loadArmed) {
        loadArmed = true;
        loadBtn.textContent = 'Tap to confirm';
        msg('Code is good. This replaces the save on this device. ' + 'Tap the button again to confirm.');
        return;
      }
      try {
        if (pack.meta) localStorage.setItem(META_KEY, pack.meta);
        if (pack.run) localStorage.setItem(RUN_KEY, pack.run);
        else localStorage.removeItem(RUN_KEY);
        if (pack.battle) localStorage.setItem(BATTLE_KEY, pack.battle);
        else localStorage.removeItem(BATTLE_KEY);
        msg('Loaded. Reloading...');
        setTimeout(() => location.reload(), 400);
      } catch (e) {
        msg('Could not load the code.');
      }
    };
    saveCodeBox.addEventListener('input', () => {
      loadArmed = false;
      loadBtn.textContent = 'Load code';
    });
  }
  const startRunBtn = document.getElementById('startRunBtn');
  if (startRunBtn)
    startRunBtn.onclick = () => {
      clearRunSave();
      render(starterSelectScreen());
    };
  const continueRunBtn = document.getElementById('continueRunBtn');
  if (continueRunBtn)
    continueRunBtn.onclick = () => {
      RUN = loadRunSave();
      RUN.maxGems = 10 + (META.levels.gemCap || 0) * 2;
      RUN.maxFuel = usesCoinTravel() ? 0 : 20 + (META.levels.fuelCap || 0) * 5;
      RUN.maxEnergy = 20 + (META.levels.energyCap || 0) * 5;
      RUN.handSize = 7 + (META.levels.handCap || 0) * 2;
      RUN.itemCap = Math.max(RUN.itemCap || 0, Math.min(MAX_ITEM_CAP, 3 + (META.levels.garage || 0)));
      RUN.runUpgrades = RUN.runUpgrades || { itemSlots: 0, drawPerTurn: 0, sightRange: 0, gemDraw: 0, health: 0 };
      RUN.drawPerTurn = 2 + (META.levels.draw || 0) + RUN.runUpgrades.drawPerTurn;
      RUN.gems = Math.min(RUN.maxGems, RUN.gems || 0);
      RUN.fuel = Math.min(RUN.maxFuel, RUN.fuel || 0);
      RUN.energy = Math.min(RUN.maxEnergy, RUN.energy || 0);
      RUN.itemLevels = RUN.itemLevels || {};
      RUN.itemUsesLevels = RUN.itemUsesLevels || {};
      RUN.itemKindOverride = RUN.itemKindOverride || {};
      Object.keys(RUN.itemKindOverride)
        .filter((k) => !k.includes('_'))
        .forEach((k) => {
          if (RUN.hero?.items?.includes(k) && !RUN.itemKindOverride[`${k}_0`])
            RUN.itemKindOverride[`${k}_0`] = RUN.itemKindOverride[k];
        });
      RUN.itemMaxCardsLevels = RUN.itemMaxCardsLevels || {};
      RUN.itemUnlockProgress = RUN.itemUnlockProgress || {};
      RUN.itemUnlocked = RUN.itemUnlocked || {};
      RUN.itemUnlockPending = RUN.itemUnlockPending || {};
      RUN.castleState = RUN.castleState || {};
      RUN.world = RUN.world || 1;
      RUN.bossRow = RUN.bossRow != null ? RUN.bossRow : RUN.map.nodes.length - 1;
      saveRun();
      const savedBattle = loadBattleSave();
      if (savedBattle) {
        BATTLE = savedBattle;
        IN_BATTLE = true;
        render(battleScreen());
      } else {
        render(mapScreen());
      }
    };
  app.querySelectorAll('[data-pick]').forEach((el) => (el.onclick = () => initRunWithStarter(el.dataset.pick)));
  document.body.classList.toggle('world-1', !!(RUN && RUN.world === 1));
  document.body.classList.toggle('world-2', !!(RUN && RUN.world === 2));
  document.body.classList.toggle('world-3', !!(RUN && RUN.world >= 3 && RUN.world <= 4));
  document.body.classList.toggle('world-5', !!(RUN && RUN.world === 5));
  document.body.classList.toggle('world-6', !!(RUN && RUN.world === 6));
  document.body.classList.toggle('world-7', !!(RUN && RUN.world === 7));
  document.body.classList.toggle('world-8', !!(RUN && RUN.world === 8));
  const battleLogEl = document.getElementById('battleLogEl');
  if (battleLogEl) battleLogEl.scrollTop = battleLogEl.scrollHeight;
  const devPanelBtn = document.getElementById('devPanelBtn');
  if (devPanelBtn)
    devPanelBtn.onclick = () => {
      app.insertAdjacentHTML('beforeend', devPanel());
      bindDev();
    };
  const openRunSummaryBtn = document.getElementById('openRunSummaryBtn');
  if (openRunSummaryBtn) openRunSummaryBtn.onclick = () => render(runSummaryScreen());
  const leaveRunSummaryBtn = document.getElementById('leaveRunSummaryBtn');
  if (leaveRunSummaryBtn)
    leaveRunSummaryBtn.onclick = () =>
      render(IN_BATTLE ? battleScreen() : RUN && LAST_SCREEN_HTML ? LAST_SCREEN_HTML : metaScreen());
  app.querySelectorAll('[data-targetkey]').forEach(
    (el) =>
      (el.onclick = () => {
        const k = el.dataset.targetkey;
        if (BATTLE.targeting) {
          BATTLE.targeting.targetKey = BATTLE.targeting.targetKey === k ? null : k;
          saveRun();
          render(battleScreen());
          return;
        }
        if (!BATTLE.pendingTarget) return;
        if (BATTLE.pendingTarget.type === 'burn') chooseBurnTarget(k);
        else if (BATTLE.pendingTarget.type === 'hex') chooseHexTarget(k);
        else if (BATTLE.pendingTarget.type === 'ice') chooseIceTarget(k);
        else chooseCurseTarget(k);
      })
  );
  const cancelTargetingBtn = document.getElementById('cancelTargetingBtn');
  if (cancelTargetingBtn)
    cancelTargetingBtn.onclick = () => {
      BATTLE.targeting = null;
      saveRun();
      render(battleScreen());
      scrollBattleToBoard();
    };
  const confirmTargetingBtn = document.getElementById('confirmTargetingBtn');
  if (confirmTargetingBtn)
    confirmTargetingBtn.onclick = () => {
      const T = BATTLE.targeting;
      if (!T || !T.targetKey) return;
      executePlayerAttack(T.itemId, T.index);
      scrollBattleToBoard();
    };
  const abilityInfoBtn = document.getElementById('abilityInfoBtn');
  if (abilityInfoBtn)
    abilityInfoBtn.onclick = (e) => {
      e.stopPropagation();
      BATTLE.abilityInfoOpen = !BATTLE.abilityInfoOpen;
      render(battleScreen());
    };
  const cancelTargetBtn = document.getElementById('cancelPendingTargetBtn');
  if (cancelTargetBtn) cancelTargetBtn.onclick = () => cancelPendingTarget();
  const claimVictoryBtn = document.getElementById('claimVictoryBtn');
  if (claimVictoryBtn) claimVictoryBtn.onclick = () => endRun(true);
  bindDev();
}
function itemIdFromKey(k) {
  return String(k).replace(/_\d+$/, '');
}
// Shared by the Run Dashboard (mid-run) and the Run Ended summary, so both show the same
// upgrade breakdown without duplicating the row-building logic.
function runUpgradeRows() {
  const r = RUN.runUpgrades || {};
  const rows = [];
  const addRow = (a, b, subs) =>
    rows.push(
      `<div class="shopcard"><div class="hdr"><span>` +
        `<b>${a}</b></span><span>${b}</span></div>${(subs || []).map((s) => `<div class="note">${s}</div>`).join('')}</div>`
    );
  rows.push(
    `<div class="shopcard"><div class="hdr"><span><b>Vehicle</b></span>` +
      `<span>${HEROES[RUN.hero?.heroId]?.name || ''}</span></div></div>`
  );
  addRow('Item Capacity', `${equippedItemCount(RUN.hero)}/${RUN.itemCap}`, [
    `Run Upgrades: ${r.itemSlots || 0}`,
    `Career Point Upgrades: ${META.levels.garage || 0}`,
  ]);
  addRow('Cards Drawn Per Turn', RUN.drawPerTurn, [
    `Run Upgrades: ${r.drawPerTurn || 0}`,
    `Career Point Upgrades: ${META.levels.draw || 0}`,
  ]);
  addRow('Maximum Hand Size', RUN.handSize, [`Career Point Upgrades: ${META.levels.handCap || 0}`]);
  addRow('Gem Draw', `${1 + (META.levels.gem || 0) + (r.gemDraw || 0)} cards/gem`, [
    `Run Upgrades: ${r.gemDraw || 0}`,
    `Career Point Upgrades: ${META.levels.gem || 0}`,
  ]);
  Object.entries(RUN.itemLevels || {}).forEach(([id, l]) => l && addRow(ITEMS[id]?.name || id, `Tune Lv ${l}`));
  Object.entries(RUN.itemUsesLevels || {}).forEach(
    ([id, l]) => l && addRow(ITEMS[id]?.name || id, `Uses Lv ${l}`, [`${itemUsesCap(ITEMS[id], l)} ` + `uses/turn`])
  );
  Object.entries(RUN.itemMaxCardsLevels || {}).forEach(
    ([id, l]) => l && addRow(ITEMS[id]?.name || id, `Capacity Lv ${l}`, [`${effectiveMaxCards(ITEMS[id])} ` + `cards`])
  );
  Object.entries(RUN.itemUtilityLevels || {}).forEach(
    ([id, l]) =>
      l &&
      addRow(ITEMS[id]?.name || id, `Utility Lv ${l}`, [
        id === 'drawstone' ? `Requirement ${Math.max(4, 7 - l)}` : `Threshold ${Math.max(35, 45 - l * 5)}`,
      ])
  );
  Object.entries(RUN.itemKindOverride || {}).forEach(([id, k]) => k && addRow(ITEMS[itemIdFromKey(id)]?.name || id, k));
  return rows;
}
// A single number for "how many upgrades did I pick up this run" - every Run Upgrade purchase
// and every point of item Tune/Uses/Capacity/Utility level counts as one, plus one per Item
// converted at the Chop Shop. Career Point (permanent, cross-run) upgrades aren't counted here
// since those aren't something this run "obtained."
function runUpgradeCount() {
  const r = RUN.runUpgrades || {};
  const sumLevels = (obj) => Object.values(obj || {}).reduce((a, l) => a + (l || 0), 0);
  return (
    (r.itemSlots || 0) +
    (r.drawPerTurn || 0) +
    (r.gemDraw || 0) +
    (r.sightRange || 0) +
    (r.health || 0) +
    sumLevels(RUN.itemLevels) +
    sumLevels(RUN.itemUsesLevels) +
    sumLevels(RUN.itemMaxCardsLevels) +
    sumLevels(RUN.itemUtilityLevels) +
    Object.values(RUN.itemKindOverride || {}).filter(Boolean).length
  );
}
// Read-only item card for the Run Dashboard - reuses the same standard item card visual as
// everywhere else in the game, with a small tag line underneath for any tuning/uses/capacity
// levels or a Chop Shop kind conversion, instead of a separate text-only summary row per item.
function runDashboardItemCardHTML(id, index) {
  const item = ITEMS[id];
  if (!item) return '';
  const tags = [];
  const tuneLv = itemLevel(id);
  if (tuneLv) tags.push(`Tune Lv ${tuneLv}`);
  const usesLv = itemUsesLevel(id);
  if (usesLv) tags.push(`Uses Lv ${usesLv}`);
  const capLv = itemMaxCardsLevel(id);
  if (capLv) tags.push(`Capacity Lv ${capLv}`);
  const utilLv = utilityLevel(id);
  if (utilLv) tags.push(`Utility Lv ${utilLv}`);
  const kindOverride = RUN.itemKindOverride && (RUN.itemKindOverride[`${id}_${index}`] || RUN.itemKindOverride[id]);
  if (kindOverride) tags.push(`Converted: ${kindOverride}`);
  return (
    `<div class="dealerCardPanel dashItemPanel panel" style="width:141px;min-width:141px;` +
    `max-width:141px;display:flex;flex-direction:column;align-items:center;padding:8px;box-sizing:border-box">
    ${renderStandardItemCard(item, {})}
    ${
      tags.length
        ? `<div class="note" style="margin-top:6px;font-size:10px;` + `text-align:center">${tags.join(' · ')}</div>`
        : ''
    }
  </div>`
  );
}
function runSummaryScreen() {
  if (!RUN) return metaScreen();
  const statRows = [
    ['Vehicle', HEROES[RUN.hero?.heroId]?.name || ''],
    ['Item Capacity', `${equippedItemCount(RUN.hero)}/${RUN.itemCap}`],
    ['Cards Drawn Per Turn', RUN.drawPerTurn],
    ['Maximum Hand Size', RUN.handSize],
    ['Gem Draw', `${1 + (META.levels.gem || 0) + (RUN.runUpgrades?.gemDraw || 0)} cards/gem`],
  ];
  // Compact stat bar plus an item card grid showing every equipped item.
  const statBarHTML =
    `<div class="panel" style="display:flex;flex-wrap:wrap;gap:14px;` +
    `justify-content:center;` +
    `padding:10px">${statRows
      .map(
        ([label, value]) =>
          `<div style="text-align:center"><div class="note" ` +
          `style="margin:0;font-size:10.5px">${label}</div><div style="font-weight:800;font-size:14px">${value}</div></div>`
      )
      .join('')}</div>`;
  const itemCardsHTML = RUN.hero.items.length
    ? `<div class="popupItemRow dashItemRow" style="justify-content:center;` +
      `margin-top:10px">${RUN.hero.items.map((id, i) => runDashboardItemCardHTML(id, i)).join('')}</div>`
    : `<div class="note" style="margin-top:10px">No Items equipped.</div>`;
  return (
    `<div class="wo"><div class="wo-stripe"></div><div class="wo-body"><h1>Run <em>` +
    `Dashboard</em></h1>${currencyBar()}
    ${statBarHTML}
    <div class="hdr" style="margin-top:14px;font-weight:800;font-size:14px"><span>Your ` +
    `Items</span><span>${equippedItemCount(RUN.hero)}/${RUN.itemCap}</span></div>
    ${itemCardsHTML}
    <button class="wo-btn teal" id="leaveRunSummaryBtn" style="width:100%;margin-top:14px">Back</button>
  </div></div>`
  );
}
function devPanel() {
  return (
    `<div class="devModal"><div class="wo"><div class="wo-stripe">` +
    `</div><div class="wo-body"><div class="wo-eyebrow">Diagnostic Tools</div><h1><em>Developer ` +
    `Mode</em></h1><div style="display:flex;gap:8px;margin:10px 0"><button class="wo-btn amber" ` +
    `id="devCoinsBtn">+500 Coins</button><button class="wo-btn purple" id="devMaxBtn">Max ` +
    `Resources</button></div><div ` +
    `class="devGrid">${Object.keys(ITEMS)
      .map(
        (id) =>
          `<button class="devItem" data-devitem="${id}">` +
          `<b>${ITEMS[id].name}</b><br><span class="note">${id}</span></button>`
      )
      .join('')}</div>` +
    `<button class="wo-btn gray" id="devCloseBtn" style="width:100%;margin-top:12px">Close</button></div></div></div>`
  );
}
function bindDev() {
  const close = document.getElementById('devCloseBtn');
  if (close) close.onclick = () => render(IN_BATTLE ? battleScreen() : RUN ? mapScreen() : metaScreen());
  const coins = document.getElementById('devCoinsBtn');
  if (coins)
    coins.onclick = () => {
      RUN.chips += 500;
      saveRun();
      render(`${IN_BATTLE ? battleScreen() : mapScreen()}${devPanel()}`);
    };
  const max = document.getElementById('devMaxBtn');
  if (max)
    max.onclick = () => {
      RUN.chips = 9999;
      RUN.gems = RUN.maxGems;
      RUN.fuel = RUN.maxFuel;
      RUN.energy = RUN.maxEnergy;
      RUN.health = RUN.maxHealth;
      saveRun();
      render(`${IN_BATTLE ? battleScreen() : mapScreen()}${devPanel()}`);
    };
  document.querySelectorAll('[data-devitem]').forEach(
    (e) =>
      (e.onclick = () => {
        if (RUN && equippedItemCount(RUN.hero) < RUN.itemCap) {
          RUN.hero.items.push(e.dataset.devitem);
          saveRun();
          render(`${IN_BATTLE ? battleScreen() : mapScreen()}${devPanel()}`);
        }
      })
  );
}
document.addEventListener(
  'click',
  (e) => {
    const b = e.target.closest('[data-utilityup]');
    if (!b || !RUN) return;
    const id = b.dataset.utilityup,
      l = utilityLevel(id),
      cap = id === 'drawstone' ? 3 : 2,
      cost = Math.round((id === 'drawstone' ? 60 : 75) * Math.pow(2, l));
    if (l >= cap || RUN.chips < cost) return;
    e.preventDefault();
    e.stopPropagation();
    RUN.chips -= cost;
    RUN.itemUtilityLevels[id] = l + 1;
    saveRun();
    render(chopShopScreen());
  },
  true
);
