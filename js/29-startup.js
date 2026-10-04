// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Startup                                                                       ██
// ██  Hover tips, the first screen and boot.                                        ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

document.addEventListener('mouseover', (e) => {
  const el = e.target.closest('[data-title], .effectTip');
  if (!el) return;
  el.classList.remove('tipLeft', 'tipRight');
  const r = el.getBoundingClientRect();
  const halfTip = 120;
  if (r.left - halfTip < 8) el.classList.add('tipLeft');
  else if (r.right + halfTip > window.innerWidth - 8) el.classList.add('tipRight');
});

META.devModeActive = META.playerName?.toLowerCase() === 'devmode';
// The Admin Vehicle Pair Bonus upgrade was removed (Career Points must not make item cards hit harder). Refund
// anything spent on it.
if (META.levels && META.levels.adminTune) {
  let back = 0;
  for (let i = 0; i < META.levels.adminTune; i++)
    back += Math.round(UPGRADE_TIERS.low.baseCost * Math.pow(UPGRADE_TIERS.low.growth, i));
  META.points += back;
  delete META.levels.adminTune;
  saveMeta();
}
(function () {
  const tip = document.createElement('div');
  tip.className = 'jsFloatTip';
  document.body.appendChild(tip);
  document.body.classList.add('jsTooltipActive');
  const INTERACTIVE_SEL =
    '.attackChip[data-title],.attackChip[data-tip],' + '#vehicleSpecialBtn[data-title],#vehicleSpecialBtn[data-tip]';
  const STATIC_SEL = '.effectTip[data-tip],.hoverTip[data-title],[data-title]';
  let activeEl = null;
  function place(el) {
    const r = el.getBoundingClientRect();
    tip.style.display = 'block';
    const tw = tip.offsetWidth || 230,
      th = tip.offsetHeight || 40;
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(6, Math.min(left, window.innerWidth - tw - 6));
    let top = r.bottom + 6;
    if (top + th > window.innerHeight - 6) top = r.top - th - 6;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }
  function showTip(el) {
    const text = el.getAttribute('data-tip') || el.getAttribute('data-title');
    if (!text) return;
    tip.textContent = text;
    place(el);
  }
  function hideTip() {
    tip.style.display = 'none';
    activeEl = null;
  }
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(INTERACTIVE_SEL);
    if (!el) return;
    showTip(el);
  });
  document.addEventListener('mouseout', (e) => {
    const el = e.target.closest(INTERACTIVE_SEL);
    if (!el) return;
    hideTip();
  });
  document.addEventListener('click', (e) => {
    if (e.target.closest(INTERACTIVE_SEL)) return;
    const el = e.target.closest(STATIC_SEL);
    // A button's own click handler often re-renders the screen (replacing #app's contents)
    // before this bubbles up here, which leaves `el` detached from the document. A detached
    // element's getBoundingClientRect() is all zeros, which is what was throwing this tooltip
    // into the top-left corner - bail out instead of positioning against a stale node.
    if (!el || !el.isConnected) {
      hideTip();
      return;
    }
    if (activeEl === el) {
      hideTip();
      return;
    }
    activeEl = el;
    showTip(el);
    e.stopPropagation();
  });
  document.addEventListener(
    'scroll',
    () => {
      hideTip();
    },
    true
  );
})();
(function () {
  const unlockAudio = () => {
    primeAudioChannel();
    document.removeEventListener('click', unlockAudio, true);
    document.removeEventListener('touchend', unlockAudio, true);
  };
  document.addEventListener('click', unlockAudio, true);
  document.addEventListener('touchend', unlockAudio, true);
})();
// Combat Training makes the player do each step. window.__combatTrainingStep tracks the live step so real
// game actions (assigning a card, firing an item, ending the turn) advance the walkthrough.
window.__combatTrainingStep = null;
window.renderCombatTrainingStep = function (step) {
  const targetBox = document.getElementById('combat-training-flow-card');
  if (targetBox) targetBox.remove();
  document.querySelectorAll('.combat-spotlight-focus').forEach((el) => el.classList.remove('combat-spotlight-focus'));
  if (typeof IN_BATTLE === 'undefined' || !IN_BATTLE) {
    window.__combatTrainingStep = null;
    return;
  }
  // The walkthrough follows what is actually on the table, so it stays correct if the player changes their mind:
  // step 1 = pick the two 9s, step 2 = drop them into Fender Bender, step 3 = press Attack, step 4 = put the 2
  // into Guard Rail for armor, step 5 = End Turn.
  const nineIdx = BATTLE.hand.map((c, i) => (c.rank === 9 ? i : -1)).filter((i) => i >= 0);
  const ninesSelected = nineIdx.length >= 2 && nineIdx.every((i) => selectedIdx.includes(i));
  const slotHasCards = Object.entries(BATTLE.slots || {}).some(([k, a]) => k.startsWith('fender_bender') && a && a.length);
  if (step === 1 && (ninesSelected || slotHasCards)) step = slotHasCards ? 3 : 2;
  else if (step === 2 && slotHasCards) step = 3;
  else if (step === 2 && !ninesSelected) step = 1;
  else if (step === 3 && !slotHasCards) step = ninesSelected ? 2 : 1;
  // Armor step: skip it when there is no Guard Rail to use, no 2 left to play, or armor is already up.
  const guardKey = Object.keys(BATTLE.slots || {}).find((k) => k.startsWith('guard_rail'));
  const guardHasCards = !!(guardKey && BATTLE.slots[guardKey].length);
  const twoIdx = BATTLE.hand.findIndex((c) => c.rank === 2);
  if (step === 4 && (BATTLE.playerArmor > 0 || !RUN.hero.items.includes('guard_rail') || (twoIdx < 0 && !guardHasCards)))
    step = 5;
  window.__combatTrainingStep = step;
  const tutorialBox = document.createElement('div');
  tutorialBox.id = 'combat-training-flow-card';
  tutorialBox.className = 'combat-training-box';
  const fenderCard =
    document.querySelector('.itemCard[data-assign^="fender_bender"]') ||
    document.querySelector('.playerSide .itemGrid');
  if (step === 1) {
    const targetHand = document.querySelector('.handWorkspace');
    if (targetHand) {
      targetHand.classList.add('combat-spotlight-focus');
      const rect = targetHand.getBoundingClientRect();
      tutorialBox.style.left = Math.max(8, rect.left + rect.width / 2 - 140) + 'px';
      tutorialBox.style.top = rect.bottom + 20 + 'px';
      tutorialBox.innerHTML =
        `<div class="wo-eyebrow">Step 1 of 5</div><h3>Using Your ` +
        `Cards</h3><p>Tap cards in your hand, then click any matching item slot to load them in. Start ` +
        `by tapping the two 9s.</p>`;
      document.body.appendChild(tutorialBox);
    } else {
      window.renderCombatTrainingStep(2);
    }
  } else if (step === 2) {
    if (fenderCard) {
      fenderCard.classList.add('combat-spotlight-focus');
      const rect = fenderCard.getBoundingClientRect();
      tutorialBox.style.left = Math.max(8, rect.left + rect.width / 2 - 140) + 'px';
      tutorialBox.style.top = rect.top - 190 + 'px';
      if (rect.top - 190 < 60) tutorialBox.style.top = rect.bottom + 16 + 'px';
      tutorialBox.innerHTML =
        `<div class="wo-eyebrow">Step 2 of 5</div><h3>Your Item Cards</h3>` +
        `<p>These dashed panels are your equipped item cards. Each one shows the exact hand you need to ` +
        `fire it. Fender Bender likes a Pair, so click it to drop your two 9s into place.</p>`;
      document.body.appendChild(tutorialBox);
    } else {
      window.renderCombatTrainingStep(3);
    }
  } else if (step === 3) {
    const firstAttackChip = document.querySelector('.attackChip');
    const targetPanel = (firstAttackChip && firstAttackChip.closest('.itemCard')) || fenderCard;
    if (targetPanel) {
      targetPanel.classList.add('combat-spotlight-focus');
      const rect = targetPanel.getBoundingClientRect();
      tutorialBox.style.left = rect.right + 24 + 'px';
      tutorialBox.style.top = rect.top - 10 + 'px';
      if (rect.right + 300 > window.innerWidth) tutorialBox.style.left = Math.max(8, rect.left - 304) + 'px';
      tutorialBox.innerHTML =
        `<div class="wo-eyebrow">Step 3 of 5</div><h3>Firing an Item</h3>` +
        `<p>Once the cards you've loaded satisfy an item's requirement, its Attack button lights up. ` +
        `Click it to fire that item.</p>`;
      document.body.appendChild(tutorialBox);
    } else {
      window.renderCombatTrainingStep(4);
    }
  } else if (step === 4) {
    const guardCard = document.querySelector('.itemCard[data-assign^="guard_rail"]');
    const defendChip = document.querySelector('.itemCard .defendChip');
    const twoSelected = twoIdx >= 0 && selectedIdx.includes(twoIdx);
    let target = null;
    let text = '';
    if (guardHasCards && defendChip) {
      target = defendChip.closest('.itemCard');
      text =
        'Your 2 is loaded. Click the Defend button on Guard Rail to turn it into armor. Armor soaks up the ' +
        "opponent's next hit before it reaches your health.";
    } else if (twoSelected && guardCard) {
      target = guardCard;
      text = 'Guard Rail takes any card and turns it into armor. Click it to load your 2.';
    } else {
      target = document.querySelector('.handWorkspace');
      text =
        'Some item cards protect you instead of attacking. Guard Rail turns one card into armor that blocks ' +
        'damage equal to its value. Tap your 2 to select it.';
    }
    if (target) {
      target.classList.add('combat-spotlight-focus');
      const rect = target.getBoundingClientRect();
      tutorialBox.style.left = Math.max(8, rect.left + rect.width / 2 - 140) + 'px';
      tutorialBox.style.top = rect.bottom + 20 + 'px';
      if (target.classList.contains('itemCard')) {
        tutorialBox.style.top = rect.top - 190 + 'px';
        if (rect.top - 190 < 60) tutorialBox.style.top = rect.bottom + 16 + 'px';
      }
      tutorialBox.innerHTML = `<div class="wo-eyebrow">Step 4 of 5</div><h3>Armor</h3><p>${text}</p>`;
      document.body.appendChild(tutorialBox);
    } else {
      window.renderCombatTrainingStep(5);
    }
  } else if (step === 5) {
    const endTurnBtn = document.getElementById('endTurnBtn');
    if (endTurnBtn) {
      endTurnBtn.classList.add('combat-spotlight-focus');
      const rect = endTurnBtn.getBoundingClientRect();
      tutorialBox.style.left = Math.max(8, rect.left + rect.width / 2 - 140) + 'px';
      tutorialBox.style.top = rect.bottom + 24 + 'px';
      tutorialBox.innerHTML =
        `<div class="wo-eyebrow">Step 5 of 5</div><h3>Ending Your ` +
        `Turn</h3><p>When you can't fire any more of your item cards, or just want to save what's left ` +
        `for next turn, click End Turn.</p>`;
      document.body.appendChild(tutorialBox);
    } else {
      window.__combatTrainingStep = null;
    }
  }
};
window.finishCombatTraining = function () {
  const box = document.getElementById('combat-training-flow-card');
  if (box) box.remove();
  document.querySelectorAll('.combat-spotlight-focus').forEach((el) => el.classList.remove('combat-spotlight-focus'));
  window.__combatTrainingStep = null;
};
(function boot() {
  const savedBattle = loadBattleSave();
  const savedRun = loadRunSave();
  if (savedBattle && savedRun) {
    RUN = savedRun;
    BATTLE = savedBattle;
    IN_BATTLE = true;
    render(battleScreen());
    return;
  }
  render(metaScreen());
})();
