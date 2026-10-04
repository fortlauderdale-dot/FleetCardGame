// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Matching Game                                                                 ██
// ██  The Fleet Compound matching game board.                                       ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

function castleMatchScreen() {
  const st = getMatchState();
  if (JOKER_GLITCH_POPUP) {
    return (
      `<div class="map-popup-overlay"><div class="wo" style="max-width:440px;border-color:#7a0000">
      <div class="wo-stripe" style="background:#7a0000"></div>
      <div class="wo-body" style="text-align:center;background:#1a0000;color:#ffbdbd;border-radius:0 0 8px 8px">
        <div class="wo-eyebrow" style="color:#ff5c5c">⚠️ Critical System Glitch Detected!</div>
        <div class="note" style="color:#ffbdbd;margin-top:8px">You flipped a Red Joker and a ` +
      `Black Joker together. The Carnival Board's data core scrambled and every card reset - any pairs ` +
      `you'd found are gone, but the board's ready for a fresh run at it.</div>
        <button class="wo-btn red" id="jokerGlitchReRouteBtn" style="width:100%;` +
      `margin-top:14px">[ Re-Route Systems ]</button>
      </div>
    </div></div>`
    );
  }
  if (!st.matchCards) {
    const groups = ['♦', '♣', '♥', '♠', 'RJ', 'BJ'];
    st.matchCards = shuffle(
      groups.flatMap((g, gi) =>
        Array.from({ length: 4 }, (_, k) => ({
          id: gi * 4 + k,
          group: g,
          color: g === '♥' || g === '♦' || g === 'RJ' ? 'red' : 'blk',
          flipped: false,
          matched: false,
        }))
      )
    );
    st.matchGuesses = 4;
    st.matchPick = [];
    const ownedIds = new Set(RUN.hero?.items || []);
    const jackpotPool = Object.values(ITEMS).filter((it) => it.cost > 0 && !ownedIds.has(it.id));
    st.matchJackpotItemId = jackpotPool.length ? shuffle([...jackpotPool])[0].id : 'supply_bag';
  }
  // Joker tiles each render their own dedicated image (Hazards/joker-red.png, Hazards/joker-black.png)
  // with an onerror fallback to the 🃏 emoji, matching the art() pattern used for hero/opponent art.
  const groupSymbol = {
    '♦': '♦',
    '♣': '♣',
    '♥': '♥',
    '♠': '♠',
    // Bumped from 38px to 68px (was smaller than a plain suit symbol's 46px font, so the "special"
    // joker tile actually read as less prominent than a regular card) - now fills most of the
    // 75px-wide tile instead of leaving a lot of empty card around a small icon.
    RJ:
      `<span class="vart" style="width:68px;height:68px;font-size:68px"><img ` +
      `src="Hazards/joker-red.png" alt="" onerror="this.style.display='none';` +
      `this.nextElementSibling.style.display='inline-flex';"><span style="display:none;width:100%;` +
      `height:100%;align-items:center;justify-content:center;line-height:1;font-size:68px">🃏</span></span>`,
    BJ:
      `<span class="vart" style="width:68px;height:68px;font-size:68px"><img ` +
      `src="Hazards/joker-black.png" alt="" onerror="this.style.display='none';` +
      `this.nextElementSibling.style.display='inline-flex';"><span style="display:none;width:100%;` +
      `height:100%;align-items:center;justify-content:center;line-height:1;font-size:68px">🃏</span></span>`,
  };
  const cards = st.matchCards
    .map((c, i) => {
      const isRed = c.color === 'red' ? 'red' : '';
      const isClub = c.group === '♣' && (c.flipped || c.matched) ? 'club-card' : '';
      const jokerOutline =
        (c.flipped || c.matched) && c.group === 'RJ'
          ? 'joker-outline-red'
          : (c.flipped || c.matched) && c.group === 'BJ'
            ? 'joker-outline-black'
            : '';
      const displayState = c.flipped || c.matched ? '' : 'back';
      const isDisabled = c.flipped || c.matched || st.matchLock ? 'disabled' : '';
      return (
        `<button class="card mini ` +
        `matchTile ${isRed} ${isClub} ${displayState} ${jokerOutline}" data-match="${i}" ${isDisabled}>
              <div>${c.flipped || c.matched ? '' : '?'}</div>
              <div>${c.flipped || c.matched ? groupSymbol[c.group] : ''}</div>
            </button>`
      );
    })
    .join('');
  const board =
    `
    <div class="map-popup-overlay">
    <div class="wo wide matchBoardWrap"${MATCH_POPUP ? ' style="pointer-events:none"' : ''}>
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <h1>Matching Game</h1>
        <div class="wo-sub" style="color:#f5c451">Attempts Left: ${st.matchGuesses}</div>
        <div class="matchGrid" style="display:grid; grid-template-columns:repeat(6, minmax(0,` +
    `1fr)); gap:8px; max-width:490px; margin:0 auto">
          ${cards}
        </div>
        <div class="matchBottomGrid" style="display:grid; grid-template-columns:1fr 1fr; ` +
    `gap:14px; margin-top:16px; align-items:start">
          <div class="panel" style="margin:0">
            <div class="hdr" style="margin-bottom:6px;justify-content:center">[ Pair Rewards ]</div>
            <div class="pairRewardsGrid" style="display:grid; grid-template-columns:1fr 1fr; ` +
    `grid-template-rows:repeat(3,auto); gap:8px 4px;font-size:11px">
              ${[
                ['♦', '20 coins', 'r'],
                ['♣', '1 gem', 'b'],
                ['♥', '20 health', 'r'],
                ['♠', '4 energy', 'b'],
                ['RJ', '3 gems', 'rj'],
                ['BJ', '25 Career Points', 'bj'],
              ]
                .map(([g, t, k]) => {
                  const face =
                    k === 'rj'
                      ? '<img src="Hazards/joker-red.png" alt="" ' +
                        'style="width:100%;height:100%;object-fit:contain" onerror="this.outerHTML=\'🃏\'">'
                      : k === 'bj'
                        ? '<img src="Hazards/joker-black.png" alt="" ' +
                          'style="width:100%;height:100%;object-fit:contain" onerror="this.outerHTML=\'🃏\'">'
                        : g;
                  const bg =
                    k === 'rj'
                      ? 'background:#c62828;border:2px solid #ff8a80'
                      : k === 'bj'
                        ? 'background:#26262e;border:2px solid ' + '#e8e8ee'
                        : 'background:#fff;border:2px solid ' + '#0b0f19';
                  const col = k === 'r' ? '#c62828' : '#1a1a2e';
                  return (
                    `<div style="display:flex;align-items:center;gap:5px;min-width:0"><span ` +
                    `style="flex:none;width:26px;height:35px;border-radius:4px;box-sizing:border-box;display:flex;` +
                    `align-items:center;justify-content:center;font-size:20px;font-weight:800;line-height:1;` +
                    `color:${col};${bg}">${face}</span><span style="min-width:0">${t}</span></div>`
                  );
                })
                .join('')}
            </div>
          </div>
          <div class="panel" style="margin:0;text-align:center">
            <div class="hdr" style="justify-content:center">Jackpot Preview</div>
            ${jackpotPreviewCardHTML(st)}
            <div class="glitchWarningBanner">⚠️ Glitch Warning: Flipping a Red Joker and a ` +
    `Black Joker together resets the board.</div>
          </div>
        </div>
        <button class="wo-btn gray" id="leaveMatchBtn" style="width:100%;margin-top:14px">Back ` +
    `to Compound Menu</button>
      </div>
    </div>
    </div>`;
  if (MATCH_POPUP && MATCH_POPUP.outOfAttempts) {
    return (
      `${board}<div class="match-modal"><div class="wo" style="max-width:360px"><div ` +
      `class="wo-stripe"></div><div class="wo-body" style="text-align:center"><div class="wo-eyebrow">` +
      `Out of Attempts</div><h1>Thanks for <em>Playing!</em></h1><div class="note" ` +
      `style="margin-top:4px">Here's what you won this visit.</div>` +
      `<div>${matchVisitTallyLabel(st)}</div><div class="note" style="margin-top:8px">Any pairs you ` +
      `found are saved - come back another time to keep going.</div><button class="wo-btn amber" ` +
      `id="matchPopupContinueBtn" style="width:100%;margin-top:10px;pointer-events:auto">OK</button></div></div></div>`
    );
  }
  if (MATCH_POPUP) {
    return (
      `${board}<div class="match-modal"><div class="wo" style="max-width:360px"><div ` +
      `class="wo-stripe"></div><div class="wo-body" style="text-align:center"><div ` +
      `class="wo-eyebrow">${MATCH_POPUP.jackpot ? 'Board Cleared' : 'Pair Matched'}</div>` +
      `<h1>${MATCH_POPUP.suitLabel} <em>${MATCH_POPUP.jackpot ? 'Jackpot!' : 'Pair!'}</em>` +
      `</h1>${
        MATCH_POPUP.cardHTML
          ? `<div style="display:flex;justify-content:center;` + `margin:8px 0">${MATCH_POPUP.cardHTML}</div>`
          : ''
      }<div ` +
      `class="${MATCH_POPUP.rewardHTML ? 'matchPrizeRow' : 'treasure-prize'}">${
        MATCH_POPUP.rewardHTML || MATCH_POPUP.rewardLabel
      }</div>${
        MATCH_POPUP.boardCleared
          ? '<div class="note">Board cleared! The matching game is ' + 'done for this run.</div>'
          : ''
      }<button ` +
      `class="wo-btn amber" id="matchPopupContinueBtn" style="width:100%;margin-top:10px;` +
      `pointer-events:auto">Nice!</button></div></div></div>`
    );
  }
  return board;
}
