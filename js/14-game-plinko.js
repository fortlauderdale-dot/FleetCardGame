// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Fleet Plinko                                                                  ██
// ██  Fleet Compound bonus game. Drop chips for coins, gems or fuel.                ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████
// Drop chips down a peg board for coins/gems/fuel, or wipe the board on a bad landing. Opened with
// openFleetPlinko({ onComplete(haul) }); reward weights live in FLEET_PLINKO_CONFIG below.

const FLEET_PLINKO_CONFIG = {
  // 8 board columns. None of these are "loss" by default any more - which columns are Game
  // Over is computed live from the current round (see activeLossCount/currentSlots below), so
  // the danger zone can move and grow instead of sitting fixed in one spot forever.
  rewardTemplates: [
    { id: 'coins_small', label: '+8 Coins', type: 'coins', amount: 8 },
    { id: 'fuel', label: '+1 Fuel', type: 'fuel', amount: 1 },
    { id: 'coins_medium', label: '+15 Coins', type: 'coins', amount: 15 },
    { id: 'gems', label: '+1 Gem', type: 'gems', amount: 1 },
    { id: 'coins_large', label: '+25 Coins', type: 'coins', amount: 25 },
    { id: 'fuel_big', label: '+2 Fuel', type: 'fuel', amount: 2 },
    { id: 'premium', label: '+2 Gems', type: 'gems', amount: 2 },
    { id: 'coins_small2', label: '+8 Coins', type: 'coins', amount: 8 },
  ],
  boardWidth: 720,
  boardHeight: 460,
  // Pegs are packed 3 per bucket (pegsPerRow = slotCount*3 + 1) so every bucket divider sits directly
  // under a peg column, and the rows are much closer together so a chip keeps bouncing the whole way
  // down instead of bouncing once or twice and then dropping straight through.
  pegRows: 13,
  pegsPerRow: 25,
  pegRadius: 4,
  pegRowSpacing: 24,
  // Left/right/center drops sit exactly over peg columns 5, 12 and 19 of 24 (a peg in the first row).
  dropSlotFractions: [5 / 24, 0.5, 19 / 24],
  // Slowed earlier for suspense; raised again now that the pegs are packed tighter and the chip bounces much more
  // on the way down. time over the pegs, which reads as more suspenseful than the chip just blipping straight down.
  gravity: 0.3,
  bounce: 0.62,
  horizontalFriction: 0.995,
  chipRadius: 7,
  dropStartY: 24,
  // wallInset tracks the peg field's own edge instead of a flat number, so a chip cannot get stuck
  // bouncing between the wall and the first peg column. wallBounce and wallNudge are stronger than the peg
  // bounce and nudge, so a wall hit throws the chip back toward the middle of the board.
  wallBounce: 0.85,
  wallNudge: 1.3,
};
function openFleetPlinko(options) {
  options = options || {};
  const onComplete = typeof options.onComplete === 'function' ? options.onComplete : function () {};
  const old = document.getElementById('fleetPlinkoOverlay');
  if (old) old.remove();

  const state = {
    drops: 0,
    round: 0,
    displayRound: 1,
    animating: false,
    finished: false,
    currentSlot: null,
    haul: { coins: 0, gems: 0, fuel: 0 },
    rewardHistory: [],
    chip: null,
    animationId: null,
  };

  const overlay = document.createElement('div');
  overlay.id = 'fleetPlinkoOverlay';
  overlay.className = 'map-popup-overlay';
  overlay.style.paddingTop = '20px';
  overlay.innerHTML =
    `
    <div class="wo wide" style="max-width:760px;width:100%">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1 style="margin:2px 0 0">Fleet <em>Plinko</em></h1>
        <div class="note" style="margin-top:2px">Pick a slot to drop from, or take your haul. ` +
    `Game Over spots move to new places on every drop, and more of the board turns Game Over the ` +
    `longer you keep pushing your luck.</div>
        <div id="fleetPlinkoStats">
          <div class="fleet-plinko-stat"><div class="fleet-plinko-stat-label">Current Haul</div>` +
    `<div class="fleet-plinko-stat-value" id="fleetPlinkoHaul">0</div></div>
          <div class="fleet-plinko-stat"><div class="fleet-plinko-stat-label">Drops</div><div ` +
    `class="fleet-plinko-stat-value" id="fleetPlinkoDrops">0</div></div>
        </div>
        <div id="fleetPlinkoCanvasWrap"><canvas id="fleetPlinkoCanvas" ` +
    `width="${FLEET_PLINKO_CONFIG.boardWidth}" height="${FLEET_PLINKO_CONFIG.boardHeight}"></canvas></div>
        <div id="fleetPlinkoMessage">Pick a drop slot to send a chip down the board.</div>
        <div id="fleetPlinkoRewardList"></div>
        <div id="fleetPlinkoDropSlots" style="display:flex;justify-content:center;gap:10px;` +
    `padding-top:10px;flex-wrap:wrap">
          <button class="wo-btn green" id="fleetPlinkoDropSlot0">Drop Left</button>
          <button class="wo-btn green" id="fleetPlinkoDropSlot1">Drop Center</button>
          <button class="wo-btn green" id="fleetPlinkoDropSlot2">Drop Right</button>
        </div>
        <div id="fleetPlinkoControls">
          <button class="wo-btn amber fleet-plinko-hidden" id="fleetPlinkoTakeBtn">Take Haul</button>
          <button class="wo-btn gray" id="fleetPlinkoExitBtn">Back to Compound</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const canvas = document.getElementById('fleetPlinkoCanvas');
  const ctx = canvas.getContext('2d');
  const dropSlotBtns = [
    document.getElementById('fleetPlinkoDropSlot0'),
    document.getElementById('fleetPlinkoDropSlot1'),
    document.getElementById('fleetPlinkoDropSlot2'),
  ];
  const takeBtn = document.getElementById('fleetPlinkoTakeBtn');
  const exitBtn = document.getElementById('fleetPlinkoExitBtn');
  const message = document.getElementById('fleetPlinkoMessage');
  const haulDisplay = document.getElementById('fleetPlinkoHaul');
  const dropsDisplay = document.getElementById('fleetPlinkoDrops');
  const rewardList = document.getElementById('fleetPlinkoRewardList');

  const W = FLEET_PLINKO_CONFIG.boardWidth;
  const H = FLEET_PLINKO_CONFIG.boardHeight;
  const slotCount = FLEET_PLINKO_CONFIG.rewardTemplates.length;
  const slotHeight = 78;
  const slotTop = H - slotHeight;
  const sidePadding = 22;
  const slotWidth = (W - sidePadding * 2) / slotCount;
  // Divider posts between the prize buckets stick up above the bucket tops and collide with the chip (see
  // collideDividers in runPhysics). The chip settles on the bucket floor and cannot drift across a bucket
  // boundary.
  const dividerThickness = 4;
  const dividerHeight = 14;
  const dividerXs = [];
  for (let i = 1; i < slotCount; i++) dividerXs.push(sidePadding + i * slotWidth);

  // Full-width peg field: every row spans the board edge to edge, with alternating rows offset by half a
  // gap. This avoids empty side margins where a chip could slide down with no peg contact.
  const pegs = [];
  const pegTop = 60;
  const pegRows = FLEET_PLINKO_CONFIG.pegRows;
  const pegsPerRow = FLEET_PLINKO_CONFIG.pegsPerRow;
  const pegR = FLEET_PLINKO_CONFIG.pegRadius;
  const rowSpacing = FLEET_PLINKO_CONFIG.pegRowSpacing;
  const colGap = (W - sidePadding * 2) / (pegsPerRow - 1);
  // Even rows have a peg at every column, including the two on the side walls. Odd rows sit half a
  // gap over, and their first and last pegs are left out so there is never a tight gap between a
  // wall and a peg (a chip could wedge there). The last row is an even row, so a peg sits right above
  // every bucket divider and the chip is always nudged to one side of a divider instead of resting on it.
  for (let row = 0; row < pegRows; row++) {
    const y = pegTop + row * rowSpacing;
    const staggered = row % 2 === 1;
    if (!staggered) {
      for (let col = 0; col < pegsPerRow; col++) pegs.push({ x: sidePadding + col * colGap, y, r: pegR });
    } else {
      for (let col = 1; col < pegsPerRow - 2; col++) pegs.push({ x: sidePadding + (col + 0.5) * colGap, y, r: pegR });
    }
  }
  // The 3 discrete drop slots at the top of the board the player picks from before releasing a chip.
  function dropSlotX(i) {
    const usableWidth = W - sidePadding * 2;
    return sidePadding + usableWidth * FLEET_PLINKO_CONFIG.dropSlotFractions[i];
  }

  // How many board columns are Game Over for a given round (rounds are 1-indexed: the very
  // first drop is round 1). Starts at 1, becomes 2 after the first drop, then adds one more
  // every 2 rounds after that until the whole board is Game Over.
  function activeLossCount(round) {
    if (round <= 1) return 1;
    if (round === 2) return 2;
    return Math.min(slotCount, 2 + Math.ceil((round - 2) / 2));
  }
  // Which columns are Game Over is picked at random for each round, then remembered so the
  // preview shown while deciding is exactly what the next drop plays against.
  const lossByRound = {};
  function lossSetForRound(round) {
    if (!lossByRound[round]) {
      const idx = [];
      for (let i = 0; i < slotCount; i++) idx.push(i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = idx[i];
        idx[i] = idx[j];
        idx[j] = t;
      }
      lossByRound[round] = new Set(idx.slice(0, activeLossCount(round)));
    }
    return lossByRound[round];
  }
  // The slot layout for a specific round. settleChip() resolves a drop against state.round, while
  // drawBoard() renders state.displayRound, which is bumped one round ahead right after a drop
  // settles so the board previews the next drop's Game Over columns while the player decides.
  function slotsForRound(round) {
    const lossIdx = lossSetForRound(round);
    return FLEET_PLINKO_CONFIG.rewardTemplates.map((tpl, i) =>
      lossIdx.has(i) ? { id: `loss_${i}`, label: 'Game Over', type: 'loss', amount: 0 } : coinifyReward(tpl)
    );
  }
  function formatHaul() {
    const parts = [];
    if (state.haul.coins > 0) parts.push(`${state.haul.coins} Coins`);
    if (state.haul.gems > 0) parts.push(`${state.haul.gems} Gem${state.haul.gems > 1 ? 's' : ''}`);
    if (state.haul.fuel > 0) parts.push(`${state.haul.fuel} Fuel`);
    return parts.length ? parts.join(' + ') : '0';
  }
  function numericHaulValue() {
    return state.haul.coins + state.haul.gems * 25 + state.haul.fuel * 10;
  }
  function updateUI() {
    haulDisplay.textContent = formatHaul();
    dropsDisplay.textContent = state.drops;
    rewardList.innerHTML = state.rewardHistory
      .map((entry) => `<div class="fleet-plinko-reward-pill">${entry}</div>`)
      .join('');
  }
  function setMessage(text, type) {
    message.textContent = text;
    message.className = '';
    if (type) message.classList.add(type);
  }
  function hideButtons() {
    dropSlotBtns.forEach((b) => b.classList.add('fleet-plinko-hidden'));
    takeBtn.classList.add('fleet-plinko-hidden');
    exitBtn.classList.add('fleet-plinko-hidden');
  }
  function showDecisionButtons() {
    dropSlotBtns.forEach((b) => b.classList.remove('fleet-plinko-hidden'));
    takeBtn.classList.remove('fleet-plinko-hidden');
    exitBtn.classList.remove('fleet-plinko-hidden');
  }
  function closeGame() {
    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }
    overlay.remove();
  }
  function finishWithHaul() {
    if (state.finished) return;
    state.finished = true;
    hideButtons();
    const finalHaul = { coins: state.haul.coins, gems: state.haul.gems, fuel: state.haul.fuel, drops: state.drops };
    setMessage(`Haul secured: ${formatHaul()}`, 'positive');
    setTimeout(() => {
      closeGame();
      onComplete(finalHaul);
    }, 550);
  }

  function drawBoard() {
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0e1726');
    bg.addColorStop(1, '#0b0f19');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(31,182,166,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (const peg of pegs) {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.r + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31,182,166,0.10)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
      ctx.fillStyle = '#4fb8ae';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(peg.x - 1.5, peg.y - 1.5, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = '#e7fbf8';
      ctx.fill();
    }
    const displaySlots = slotsForRound(state.displayRound || 1);
    for (let i = 0; i < slotCount; i++) {
      const slot = displaySlots[i];
      const x = sidePadding + i * slotWidth;
      const isLoss = slot.type === 'loss';
      ctx.fillStyle = isLoss ? 'rgba(229,72,77,0.22)' : 'rgba(31,182,166,0.14)';
      ctx.fillRect(x + 2, slotTop + 2, slotWidth - 4, slotHeight - 4);
      ctx.strokeStyle = isLoss ? 'rgba(229,72,77,0.4)' : 'rgba(31,182,166,0.30)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, slotTop + 1, slotWidth - 2, slotHeight - 2);
      ctx.fillStyle = isLoss ? '#ff9a9d' : '#bfeee8';
      ctx.font = 'bold 10px Aptos, Arial';
      ctx.textAlign = 'center';
      const words = slot.label.split(' ');
      if (words.length > 1) {
        ctx.fillText(words[0], x + slotWidth / 2, slotTop + 32);
        ctx.fillText(words.slice(1).join(' '), x + slotWidth / 2, slotTop + 47);
      } else ctx.fillText(slot.label, x + slotWidth / 2, slotTop + 40);
    }
    ctx.strokeStyle = 'rgba(191,238,232,0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sidePadding, pegTop - 10);
    ctx.lineTo(sidePadding, slotTop);
    ctx.moveTo(W - sidePadding, pegTop - 10);
    ctx.lineTo(W - sidePadding, slotTop);
    ctx.stroke();
    // Divider posts between buckets - drawn as small walls (matching the peg palette) that stick
    // up above the bucket tops so it's visually obvious the chip can't cross between buckets once
    // it's down in this zone. They double as real collision walls in runPhysics.
    for (const dx of dividerXs) {
      const postTop = slotTop - dividerHeight;
      ctx.fillStyle = 'rgba(191,238,232,0.9)';
      ctx.fillRect(dx - dividerThickness / 2, postTop, dividerThickness, dividerHeight + slotHeight - 4);
      ctx.beginPath();
      ctx.arc(dx, postTop, dividerThickness, 0, Math.PI * 2);
      ctx.fillStyle = '#e7fbf8';
      ctx.fill();
    }
    // Clearly flag the 3 drop lanes at the top of the board so it's obvious which button drops
    // from where, instead of leaving the player to guess at an unmarked gap above the pegs.
    const dropLabels = ['L', 'C', 'R'];
    for (let i = 0; i < FLEET_PLINKO_CONFIG.dropSlotFractions.length; i++) {
      const x = dropSlotX(i);
      ctx.beginPath();
      ctx.moveTo(x - 7, pegTop - 14);
      ctx.lineTo(x + 7, pegTop - 14);
      ctx.lineTo(x, pegTop - 4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,196,77,0.85)';
      ctx.fill();
      ctx.fillStyle = 'rgba(255,196,77,0.9)';
      ctx.font = 'bold 11px Aptos, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dropLabels[i], x, pegTop - 20);
      ctx.strokeStyle = 'rgba(255,196,77,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, pegTop - 4);
      ctx.lineTo(x, pegTop + 10);
      ctx.stroke();
    }
    if (state.chip) {
      const chip = state.chip;
      ctx.beginPath();
      ctx.arc(chip.x, chip.y, chip.r + 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31,182,166,0.20)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(chip.x, chip.y, chip.r, 0, Math.PI * 2);
      const chipGradient = ctx.createRadialGradient(chip.x - 2, chip.y - 2, 1, chip.x, chip.y, chip.r);
      chipGradient.addColorStop(0, '#eafffb');
      chipGradient.addColorStop(0.4, '#6fe8d9');
      chipGradient.addColorStop(1, '#0d8377');
      ctx.fillStyle = chipGradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(230,255,250,0.85)';
      ctx.stroke();
    }
  }

  function startDrop(slotIndex) {
    if (state.animating || state.finished) return;
    state.animating = true;
    state.drops++;
    state.round++;
    state.displayRound = state.round;
    state.currentSlot = null;
    state.physicsFrames = 0;
    const dropX = dropSlotX(slotIndex);
    state.chip = {
      x: dropX + (Math.random() - 0.5) * 14,
      y: FLEET_PLINKO_CONFIG.dropStartY,
      vx: (Math.random() - 0.5) * 1.4,
      vy: 0,
      r: FLEET_PLINKO_CONFIG.chipRadius,
    };
    hideButtons();
    setMessage('The chip is in motion...', '');
    updateUI();
    runPhysics();
  }
  // Walls sit at sidePadding - chipRadius + 2, just past the edge peg's center. A peg correction there
  // pushes the chip toward the middle instead of back into the wall, and the empty corridor beside the
  // wall in the staggered rows is mostly closed.
  const wallInset = sidePadding;
  function clampToWalls(chip) {
    if (chip.x - chip.r < wallInset) chip.x = wallInset + chip.r;
    if (chip.x + chip.r > W - wallInset) chip.x = W - wallInset - chip.r;
  }
  // Bucket-divider collision - only matters once the chip has dropped low enough to reach the
  // divider posts. Pushes the chip back to whichever side of the post it was already on and
  // kills its sideways speed, so once a chip has committed to a bucket it settles there instead
  // of bouncing back and forth across the boundary.
  const dividerZoneTop = slotTop - dividerHeight;
  function collideDividers(chip) {
    if (chip.y + chip.r < dividerZoneTop) return;
    const halfW = dividerThickness / 2 + chip.r;
    for (const dx0 of dividerXs) {
      const dx = chip.x - dx0;
      if (Math.abs(dx) < halfW) {
        chip.x = dx0 + (dx < 0 ? -halfW : halfW);
        chip.vx *= -0.3;
      }
    }
  }
  function runPhysics() {
    const chip = state.chip;
    chip.vy += FLEET_PLINKO_CONFIG.gravity;
    chip.vx *= FLEET_PLINKO_CONFIG.horizontalFriction;
    chip.x += chip.vx;
    chip.y += chip.vy;
    // A wall hit now kicks noticeably harder than a peg-to-peg bounce (wallBounce/wallNudge
    // instead of the weaker peg bounce/nudge) and always adds a little extra downward push, so
    // the chip can't stall out purely oscillating side to side against a wall - every wall touch
    // is guaranteed some real vertical progress on top of the stronger sideways kick.
    let hitWall = false;
    if (chip.x - chip.r < wallInset) {
      chip.x = wallInset + chip.r;
      chip.vx = Math.abs(chip.vx) * FLEET_PLINKO_CONFIG.wallBounce + Math.random() * FLEET_PLINKO_CONFIG.wallNudge;
      hitWall = true;
    }
    if (chip.x + chip.r > W - wallInset) {
      chip.x = W - wallInset - chip.r;
      chip.vx = -Math.abs(chip.vx) * FLEET_PLINKO_CONFIG.wallBounce - Math.random() * FLEET_PLINKO_CONFIG.wallNudge;
      hitWall = true;
    }
    if (hitWall) chip.vy += 0.15;
    for (const peg of pegs) {
      const dx = chip.x - peg.x,
        dy = chip.y - peg.y;
      const minDistance = chip.r + peg.r;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared < minDistance * minDistance) {
        const distance = Math.sqrt(distanceSquared) || 0.001;
        const nx = dx / distance,
          ny = dy / distance;
        const overlap = minDistance - distance;
        chip.x += nx * overlap;
        chip.y += ny * overlap;
        const dot = chip.vx * nx + chip.vy * ny;
        chip.vx = chip.vx - 2 * dot * nx;
        chip.vy = chip.vy - 2 * dot * ny;
        chip.vx += (Math.random() - 0.5) * 0.35;
        chip.vx *= FLEET_PLINKO_CONFIG.bounce;
        chip.vy *= FLEET_PLINKO_CONFIG.bounce;
      }
    }
    // Re-clamp after the peg pass so a peg correction can never shove the chip back out past a
    // wall it just bounced off in this same frame.
    clampToWalls(chip);
    collideDividers(chip);
    // The chip now actually falls into its bucket and rests on the floor there, instead of being
    // credited and vanishing the instant it reaches the top of the bucket row - the divider posts
    // (collideDividers above) keep it boxed inside whichever bucket it entered on the way down.
    // A frame-count safety valve forces a settle if a chip ever gets stuck oscillating between a
    // peg and a divider post right at the edge of the bucket zone for an unreasonably long time,
    // so a rare unlucky bounce pattern can never leave the board stuck forever.
    state.physicsFrames = (state.physicsFrames || 0) + 1;
    if (chip.y >= H - chip.r - 4 || state.physicsFrames > 900) {
      chip.y = H - chip.r - 4;
      drawBoard();
      settleChip();
      return;
    }
    drawBoard();
    state.animationId = requestAnimationFrame(runPhysics);
  }
  function settleChip() {
    state.animating = false;
    let index = Math.floor((state.chip.x - sidePadding) / slotWidth);
    index = Math.max(0, Math.min(slotCount - 1, index));
    const slot = slotsForRound(state.round)[index];
    state.currentSlot = slot;
    state.chip.x = sidePadding + index * slotWidth + slotWidth / 2;
    state.chip.y = slotTop + 20;
    drawBoard();
    if (slot.type === 'loss') {
      handleLoss();
      return;
    }
    handleReward(slot);
  }
  function handleReward(slot) {
    const amount = slot.amount || 0;
    if (slot.type === 'coins') {
      state.haul.coins += amount;
      state.rewardHistory.push(`+${amount} Coins`);
    } else if (slot.type === 'gems') {
      state.haul.gems += amount;
      state.rewardHistory.push(`+${amount} Gem${amount === 1 ? '' : 's'}`);
    } else if (slot.type === 'fuel') {
      state.haul.fuel += amount;
      state.rewardHistory.push(`+${amount} Fuel`);
    }
    updateUI();
    setMessage(`Landed on ${slot.label}.`, 'positive');
    playSfx('open');
    // Preview next round's Game Over columns now, while the player is deciding whether to drop
    // again - the escalation should be visible information to plan around, not a hidden trap
    // that only reveals itself once they've already committed to the next drop.
    state.displayRound = state.round + 1;
    drawBoard();
    showDecisionButtons();
  }
  function handleLoss() {
    const lostText = formatHaul();
    state.haul = { coins: 0, gems: 0, fuel: 0 };
    state.rewardHistory = [];
    updateUI();
    setMessage(`Total loss - ${lostText} was lost.`, 'danger');
    playSfx('lose');
    dropSlotBtns.forEach((b) => b.classList.add('fleet-plinko-hidden'));
    takeBtn.classList.add('fleet-plinko-hidden');
    setTimeout(finishAfterLoss, 1100);
  }
  function finishAfterLoss() {
    if (state.finished) return;
    state.finished = true;
    hideButtons();
    setTimeout(() => {
      closeGame();
      onComplete({ coins: 0, gems: 0, fuel: 0, drops: state.drops, lost: true });
    }, 250);
  }

  dropSlotBtns.forEach((btn, i) => btn.addEventListener('click', () => startDrop(i)));
  takeBtn.addEventListener('click', () => {
    if (!state.animating && !state.finished) finishWithHaul();
  });
  exitBtn.addEventListener('click', () => {
    if (state.animating || state.finished) return;
    if (numericHaulValue() > 0) finishWithHaul();
    else closeGame();
  });

  updateUI();
  drawBoard();
}
