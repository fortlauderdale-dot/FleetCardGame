// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Music                                                                         ██
// ██  Looping background music per world, crossfades, volume and on/off controls.   ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// One track per world (keys 1 to 8) plus 'home' for the Home Screen. A world with no entry stays quiet.
// To add a track: put the MP3 in music/, add a line here, and add the file to sw.js (then bump CACHE_VERSION).
// credit is shown on the Home Screen and in the music panel.
const MUSIC_TRACKS = {
  2: {
    src: 'music/world-2-backwoods-louisiana.mp3',
    title: 'Backwoods Louisiana',
    artist: 'lokenwarrior',
    credit: 'Backwoods Louisiana by lokenwarrior (Pixabay)',
  },
};
const MUSIC_FADE_SECONDS = 1.6;
const MUSIC_PREF_KEY = 'fleetDuelMusic';

let MUSIC_PREFS = { on: true, vol: 0.6 };
try {
  const saved = JSON.parse(localStorage.getItem(MUSIC_PREF_KEY) || 'null');
  if (saved && typeof saved === 'object') {
    MUSIC_PREFS.on = saved.on !== false;
    if (typeof saved.vol === 'number') MUSIC_PREFS.vol = Math.min(1, Math.max(0, saved.vol));
  }
} catch (e) {}
function saveMusicPrefs() {
  try {
    localStorage.setItem(MUSIC_PREF_KEY, JSON.stringify(MUSIC_PREFS));
  } catch (e) {}
}

let MUSIC_MASTER = null; // gain node every track runs through (volume lives here)
let MUSIC_NOW = null; // { key, src, gain } for the track that is playing or fading in
let MUSIC_WANT = null; // the track key the screen wants right now ('home', 1 to 8, or null)
const MUSIC_BUFFERS = {}; // decoded tracks by key
const MUSIC_LOADING = {}; // in-flight loads by key

function musicMaster() {
  const ctx = getAudioCtx();
  if (!ctx) return null;
  if (!MUSIC_MASTER) {
    MUSIC_MASTER = ctx.createGain();
    MUSIC_MASTER.connect(ctx.destination);
  }
  // Squared so the slider feels even to the ear.
  MUSIC_MASTER.gain.value = MUSIC_PREFS.vol * MUSIC_PREFS.vol;
  return MUSIC_MASTER;
}

function musicLoad(key) {
  if (MUSIC_BUFFERS[key]) return Promise.resolve(MUSIC_BUFFERS[key]);
  if (MUSIC_LOADING[key]) return MUSIC_LOADING[key];
  const ctx = getAudioCtx();
  const track = MUSIC_TRACKS[key];
  if (!ctx || !track) return Promise.resolve(null);
  MUSIC_LOADING[key] = fetch(track.src)
    .then((r) => {
      if (!r.ok) throw new Error('music fetch failed');
      return r.arrayBuffer();
    })
    // Older Safari only supports the callback form of decodeAudioData.
    .then((data) => new Promise((ok, fail) => ctx.decodeAudioData(data, ok, fail)))
    .then((buf) => (MUSIC_BUFFERS[key] = buf))
    .catch(() => null)
    .then((buf) => {
      delete MUSIC_LOADING[key];
      return buf;
    });
  return MUSIC_LOADING[key];
}

function musicStopTrack(t, fade) {
  const ctx = getAudioCtx();
  if (!t || !ctx) return;
  try {
    const now = ctx.currentTime;
    t.gain.gain.cancelScheduledValues(now);
    t.gain.gain.setValueAtTime(t.gain.gain.value, now);
    t.gain.gain.linearRampToValueAtTime(0, now + fade);
    t.src.stop(now + fade + 0.05);
  } catch (e) {}
}

// Plays the track for `key` (crossfading from whatever is playing) or fades to silence when there is none.
function musicPlay(key) {
  MUSIC_WANT = key;
  if (!MUSIC_PREFS.on || !key || !MUSIC_TRACKS[key]) {
    if (MUSIC_NOW) {
      musicStopTrack(MUSIC_NOW, MUSIC_FADE_SECONDS);
      MUSIC_NOW = null;
    }
    return;
  }
  if (MUSIC_NOW && MUSIC_NOW.key === key) return;
  const ctx = getAudioCtx();
  const master = musicMaster();
  if (!ctx || !master) return;
  musicLoad(key).then((buf) => {
    // The screen may have changed while the file was loading.
    if (!buf || MUSIC_WANT !== key || !MUSIC_PREFS.on || (MUSIC_NOW && MUSIC_NOW.key === key)) return;
    const start = () => {
      if (MUSIC_WANT !== key || !MUSIC_PREFS.on || (MUSIC_NOW && MUSIC_NOW.key === key)) return;
      try {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + MUSIC_FADE_SECONDS);
        src.connect(gain);
        gain.connect(musicMaster());
        src.start(now);
        if (MUSIC_NOW) musicStopTrack(MUSIC_NOW, MUSIC_FADE_SECONDS);
        MUSIC_NOW = { key, src, gain };
      } catch (e) {}
    };
    if (ctx.state === 'running') start();
    else ctx.resume().then(start).catch(() => {});
  });
}

// Called after every screen draw. Home Screen plays 'home', anything during a run plays that world's track.
function musicSync() {
  const app = document.getElementById('app');
  const onHome = !!(app && app.querySelector('#startRunBtn, #continueRunBtn'));
  if (onHome) {
    musicShowCredits();
    musicPlay('home');
  } else if (typeof RUN !== 'undefined' && RUN && RUN.world) musicPlay(RUN.world);
}

function musicCreditText() {
  return Object.values(MUSIC_TRACKS)
    .map((t) => t.credit)
    .filter(Boolean)
    .join(' | ');
}
function musicShowCredits() {
  const text = musicCreditText();
  const footer = document.querySelector('#app .homeFooter');
  if (!text || !footer || document.getElementById('musicCredit')) return;
  const line = document.createElement('div');
  line.id = 'musicCredit';
  line.className = 'musicCredit';
  line.textContent = 'Music: ' + text;
  footer.insertAdjacentElement('afterend', line);
}

// ---- Controls: a small round button that opens a panel with on/off, volume and a sound test ----
function musicAudioStatus() {
  const ctx = getAudioCtx();
  const session = navigator.audioSession ? navigator.audioSession.type : 'not supported';
  return `Audio: ${ctx ? ctx.state : 'unavailable'}. Session: ${session}.`;
}
function musicRefreshPanel() {
  const btn = document.getElementById('musicBtn');
  if (btn) btn.textContent = MUSIC_PREFS.on && MUSIC_PREFS.vol > 0 ? '♫' : '♫̸';
  const tog = document.getElementById('musicToggle');
  if (tog) tog.textContent = MUSIC_PREFS.on ? 'Music: On' : 'Music: Off';
  const status = document.getElementById('musicStatus');
  if (status) status.textContent = musicAudioStatus();
  const credit = document.getElementById('musicPanelCredit');
  if (credit) credit.textContent = musicCreditText();
}
function musicApplyPrefs() {
  saveMusicPrefs();
  if (MUSIC_MASTER) MUSIC_MASTER.gain.value = MUSIC_PREFS.vol * MUSIC_PREFS.vol;
  if (MUSIC_PREFS.on) {
    const want = MUSIC_WANT;
    MUSIC_WANT = null;
    if (want) musicPlay(want);
    else musicSync();
  } else musicPlay(null);
  musicRefreshPanel();
}

// Old iPhones keep Web Audio silent while the ring/silent switch is on unless a real media element is playing.
// A silent looping clip started from a tap fixes that. Newer iPhones are handled by navigator.audioSession.
let MUSIC_KEEPALIVE = null;
function musicKeepAlive() {
  if (MUSIC_KEEPALIVE || !/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) || !('ontouchend' in document)) return;
  try {
    const rate = 8000,
      samples = 800;
    const bytes = new Uint8Array(44 + samples * 2);
    const dv = new DataView(bytes.buffer);
    const txt = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
    txt(0, 'RIFF');
    dv.setUint32(4, 36 + samples * 2, true);
    txt(8, 'WAVEfmt ');
    dv.setUint32(16, 16, true);
    dv.setUint16(20, 1, true);
    dv.setUint16(22, 1, true);
    dv.setUint32(24, rate, true);
    dv.setUint32(28, rate * 2, true);
    dv.setUint16(32, 2, true);
    dv.setUint16(34, 16, true);
    txt(36, 'data');
    dv.setUint32(40, samples * 2, true);
    const audio = new Audio(URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' })));
    audio.loop = true;
    audio.volume = 0.01;
    audio.setAttribute('playsinline', '');
    audio.play().catch(() => {});
    MUSIC_KEEPALIVE = audio;
  } catch (e) {}
}

function musicBuildControls() {
  if (document.getElementById('musicBtn')) return;
  const wrap = document.createElement('div');
  wrap.id = 'musicWrap';
  wrap.innerHTML =
    `<div id="musicPanel" hidden>` +
    `<button id="musicToggle" class="musicPanelBtn" type="button"></button>` +
    `<label class="musicVolRow">Volume<input id="musicVol" type="range" min="0" max="100" step="1"></label>` +
    `<button id="musicTest" class="musicPanelBtn" type="button">Test sound effect</button>` +
    `<div id="musicStatus" class="musicSmall"></div>` +
    `<div id="musicPanelCredit" class="musicSmall"></div></div>` +
    `<button id="musicBtn" type="button" aria-label="Music and sound"></button>`;
  document.body.appendChild(wrap);
  const panel = document.getElementById('musicPanel');
  document.getElementById('musicVol').value = Math.round(MUSIC_PREFS.vol * 100);
  document.getElementById('musicBtn').addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    musicRefreshPanel();
  });
  document.getElementById('musicToggle').addEventListener('click', () => {
    MUSIC_PREFS.on = !MUSIC_PREFS.on;
    musicApplyPrefs();
  });
  document.getElementById('musicVol').addEventListener('input', (e) => {
    MUSIC_PREFS.vol = Number(e.target.value) / 100;
    musicApplyPrefs();
  });
  document.getElementById('musicTest').addEventListener('click', () => {
    unlockAudioCtx();
    playSfx('win');
    setTimeout(musicRefreshPanel, 400);
  });
  musicRefreshPanel();
}

// Browsers only allow sound after a tap, so the first tap starts the audio and the music.
function musicUnlock() {
  unlockAudioCtx();
  musicKeepAlive();
  const ctx = getAudioCtx();
  if (ctx && ctx.state !== 'running') ctx.resume().catch(() => {});
  if (MUSIC_NOW === null && MUSIC_PREFS.on) {
    const want = MUSIC_WANT;
    MUSIC_WANT = null;
    if (want) musicPlay(want);
    else musicSync();
  }
}
document.addEventListener('click', musicUnlock, true);
document.addEventListener('touchend', musicUnlock, true);

// Silence the music when the app is in the background, resume when it comes back.
document.addEventListener('visibilitychange', () => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (document.hidden) ctx.suspend().catch(() => {});
  else ctx.resume().catch(() => {});
});

musicBuildControls();
musicSync();
