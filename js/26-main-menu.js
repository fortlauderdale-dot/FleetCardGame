function updateLogHTML() {
  return `
    <div class="wo" style="margin-top:14px">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <details open>
          <summary class="hdr" style="cursor:pointer;list-style:none"><span>Update Log</span><span></span></summary>
          ${UPDATE_LOG.slice()
            .reverse()
            .map(
              (entry, i) => `
            <details ${i === 0 ? 'open' : ''} style="margin-top:10px">
              <summary class="note" style="font-weight:800;color:var(--ink);cursor:pointer">${entry.date}</summary>
              ${[
                ...UPDATE_LOG_CATEGORY_ORDER,
                ...Object.keys(entry.categories).filter((c) => !UPDATE_LOG_CATEGORY_ORDER.includes(c)),
              ]
                .filter((cat) => entry.categories[cat] && entry.categories[cat].length)
                .map(
                  (cat) =>
                    `
                <div style="margin-top:8px">
                  <div class="note" style="font-weight:700;color:var(--amber);font-size:12px;` +
                    `letter-spacing:0.03em">${cat}</div>
                  <ul style="margin:3px 0 0 18px;padding:0">
                    ${entry.categories[cat].map((n) => `<li class="note" style="margin:2px 0">${n}</li>`).join('')}
                  </ul>
                </div>
              `
                )
                .join('')}
            </details>
          `
            )
            .join('')}
        </details>
      </div>
    </div>
  `;
}
// Shown on the home screen and the vehicle pick screen so it is clear what a loss costs.
function runRulesPanelHTML() {
  return (
    `<div class="wo-sub" style="margin:0 0 12px;line-height:1.5">Lose a run and you lose ` +
    `everything except your Career Points.<br>Career Points carry over, so spend them on upgrades ` +
    `before your next run.</div>`
  );
}
// Home screen stats: how far you got and your best score. Career Points are on the upgrades button.
function homeStatsHTML() {
  let furthest = 'Not yet';
  if (META.bestStopWorld) {
    furthest = `World ${META.bestStopWorld} - ${WORLD_NAMES[META.bestStopWorld] || ''}, stop ${META.bestStop}/21`;
  } else if (META.bestRun) {
    // Older saves only know the best stop count, not which world it was in.
    const w = META.bestWorld || 1;
    furthest =
      w === 1 ? `World 1 - ${WORLD_NAMES[1]}, stop ${META.bestRun}/21` : `World ${w} - ${WORLD_NAMES[w] || ''}`;
  }
  const row = (label, value) =>
    `<div class="homeStat"><span class="homeStatLabel">${label}</span><span class="homeStatValue">${value}</span></div>`;
  return `<div class="homeStats">${row('Furthest', furthest)}${row('High score', META.highScore)}</div>`;
}

// Add to Home Screen tip. Only shown on phones and tablets that are not already running the game from the
// Home Screen, and it can be hidden for good.
function homeScreenPlatform() {
  const ua = navigator.userAgent || '';
  const standalone =
    navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  if (standalone) return null;
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return null;
}
let HOME_TIP_POPUP = false;
function homeTipBannerHTML() {
  if (META.hideHomeTip || !homeScreenPlatform()) return '';
  return (
    `<div class="homeTipBanner"><span class="homeTipText">Plays better on your phone when added to your ` +
    `Home Screen.</span><button class="wo-btn teal homeTipBtn" id="homeTipShowBtn">Show me how</button>` +
    `<button class="homeTipClose" id="homeTipHideBtn" aria-label="Hide this tip">&times;</button></div>`
  );
}
function homeTipPopupHTML() {
  const platform = homeScreenPlatform() || 'ios';
  const steps =
    platform === 'android'
      ? [
          'Open this page in Chrome.',
          'Tap the menu button (three dots) at the top right.',
          'Tap Add to Home screen (or Install app).',
          'Tap Add or Install.',
        ]
      : [
          'Open this page in Safari.',
          'Tap the Share button (the square with an arrow) at the bottom of the screen.',
          'Scroll down and tap Add to Home Screen.',
          'Tap Add at the top right.',
        ];
  return (
    `<div class="map-popup-overlay"><div class="wo" style="max-width:380px"><div class="wo-stripe"></div>` +
    `<div class="wo-body"><div class="wo-eyebrow">Better on your phone</div><h1>Add to <em>Home Screen</em></h1>` +
    `<div class="note" style="margin:6px 0 8px">It opens full screen with no browser bars, loads faster, and ` +
    `keeps working without WiFi once it has loaded one time.</div>` +
    `<ol class="homeTipSteps">${steps.map((t) => `<li>${t}</li>`).join('')}</ol>` +
    `<button class="wo-btn teal" id="homeTipOkBtn" style="width:100%;margin-top:10px">Got it</button>` +
    `<button class="wo-btn gray" id="homeTipNeverBtn" style="width:100%;margin-top:8px">Do not show this again</button>` +
    `</div></div></div>`
  );
}
// Shown once, after the first battle you win.
let RULES_NOTE_POPUP = false;
function rulesNotePopupHTML() {
  return (
    `<div class="map-popup-overlay"><div class="wo" style="max-width:380px"><div class="wo-stripe"></div>` +
    `<div class="wo-body" style="text-align:center"><div class="wo-eyebrow">Good to know</div>` +
    `<h1>Career <em>Points</em></h1>` + runRulesPanelHTML() +
    `<button class="wo-btn teal" id="rulesNoteOkBtn" style="width:100%">Got it</button></div></div></div>`
  );
}
function metaScreen() {
  const hasSave = !!loadRunSave();
  return (
    `
    <div class="wo">
      <div class="wo-stripe"></div>
      <div class="wo-body">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <h1 style="margin:0">Fleet <em>Duel</em></h1>
          <div style="text-align:right">
            <div class="note" style="margin:0;font-size:13px;opacity:0.9">🏆 JJ was first to beat World 1!</div>
            <div class="note" style="margin:0;font-size:13px;opacity:0.9">🏆 Haley was first to beat World 2!</div>
          </div>
        </div>
        ${homeStatsHTML()}
        ${homeTipBannerHTML()}
        <div class="panel" style="margin-bottom:10px">
          <input id="playerNameInput" type="text" maxlength="18" placeholder="Your name" ` +
    `value="${(META.playerName || '').replace(/"/g, '&quot;')}" style="width:100%;padding:9px 10px;` +
    `border:2px solid #1fb6a6;border-radius:6px;font-family:var(--disp);font-size:15px;color:#ffffff;background:#1a2038">
        </div>
        ${
          hasSave
            ? `<button class="wo-btn" id="continueRunBtn" style="margin-bottom:10px;` +
              `width:100%">Continue Run</button>`
            : `<button class="wo-btn" id="startRunBtn" ` + `style="margin-bottom:10px;width:100%">New Run</button>`
        }
        ${
          hasSave
            ? `<button class="wo-btn gray" id="startRunBtn" style="width:100%;` +
              `margin-bottom:10px">New Run (overwrites save)</button>`
            : ''
        }
        <button class="wo-btn amber" id="viewUpgradesBtn" style="width:100%">Career Point Upgrades (${META.points})</button>
        ${
          META.devModeActive
            ? `<button class="wo-btn gray" style="width:100%;margin-top:10px;` +
              `padding:6px 10px;font-size:12px" onclick="render(diffScreen())">Difficulty Tuning</button>`
            : ''
        }
        <details class="panel" style="margin-top:12px">
          <summary class="note" style="margin:0;cursor:pointer;font-weight:700">Move my save to ` +
    `another browser or Home Screen</summary>
          <div class="note" style="margin:8px 0 6px">On the one that has your progress, tap ` +
    `Make code, then copy the code. On the new one, paste it in the box and tap Load code.</div>
          <textarea id="saveCodeBox" rows="3" placeholder="Save code" style="width:100%;` +
    `box-sizing:border-box;padding:8px;border:2px solid #1fb6a6;border-radius:6px;background:#0b0f19;` +
    `color:#fff;font-size:12px"></textarea>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button class="wo-btn teal" id="saveCodeMakeBtn" style="flex:1;padding:8px 6px;` +
    `font-size:12px">Make code</button>
            <button class="wo-btn gray" id="saveCodePasteBtn" style="flex:1;padding:8px 6px;` +
    `font-size:12px">Paste</button>
            <button class="wo-btn amber" id="saveCodeLoadBtn" style="flex:1;padding:8px 6px;` +
    `font-size:12px">Load code</button>
          </div>
          <div class="note" id="saveCodeMsg" style="margin:6px 0 0"></div>
        </details>
        <div style="display:flex;align-items:center;gap:10px;opacity:0.7;margin-top:12px;` +
    `padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
          <div class="note" style="margin:0;font-size:11px;white-space:nowrap">Made by Drew</div>
          <div class="note" style="margin:0;flex:1;text-align:right;font-size:11px">Feedback ` +
    `and bug reports welcome, send them to Drew.</div>
        </div>
      </div>
    </div>
    ${updateLogHTML()}
    ${HOME_TIP_POPUP ? homeTipPopupHTML() : ''}
  `
  );
}

let MAP_SCROLL_X = 0;
