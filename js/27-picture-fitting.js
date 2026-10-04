// ████████████████████████████████████████████████████████████████████████████████████
// ██                                                                                ██
// ██  Picture Fitting                                                               ██
// ██  Scales every picture so its subject fills its box.                            ██
// ██                                                                                ██
// ████████████████████████████████████████████████████████████████████████████████████

// Auto-fit art: every opponent, vehicle and node picture is a transparent PNG with its own amount of empty margin
// (and a few are portrait instead of landscape). Instead of cropping with "cover", each picture is shown whole
// ("contain"), then its visible subject is measured once from the alpha channel and scaled up and centered so it
// fills its box without any part of it leaving the box. Round map badges use a circle instead of a rectangle. If
// the browser blocks reading pixels (opening the file straight from disk), pictures just stay fully visible at the
// plain contain size. Hand-tuned vehicle picker portraits are left alone.
const ART_BOUNDS_CACHE = new Map();
function artSubjectBounds(img) {
  const key = img.currentSrc || img.src;
  if (ART_BOUNDS_CACHE.has(key)) return ART_BOUNDS_CACHE.get(key);
  let b = null;
  try {
    const iw = img.naturalWidth,
      ih = img.naturalHeight;
    if (iw && ih) {
      const sc = 96 / Math.max(iw, ih);
      const cw = Math.max(1, Math.round(iw * sc)),
        ch = Math.max(1, Math.round(ih * sc));
      const cv = document.createElement('canvas');
      cv.width = cw;
      cv.height = ch;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0, cw, ch);
      const d = cx.getImageData(0, 0, cw, ch).data;
      let x0 = cw,
        y0 = ch,
        x1 = -1,
        y1 = -1;
      for (let y = 0; y < ch; y++)
        for (let x = 0; x < cw; x++) {
          if (d[(y * cw + x) * 4 + 3] > 24) {
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
          }
        }
      if (x1 >= x0 && y1 >= y0)
        b = {
          l: Math.max(0, x0 - 1) / cw,
          t: Math.max(0, y0 - 1) / ch,
          r: Math.min(cw, x1 + 2) / cw,
          b: Math.min(ch, y1 + 2) / ch,
        };
    }
  } catch (e) {
    b = null;
  }
  ART_BOUNDS_CACHE.set(key, b);
  return b;
}
function fitArtImg(img) {
  if (!img || !img.naturalWidth || img.closest('.pickPortrait')) return;
  const W = img.clientWidth,
    H = img.clientHeight;
  if (W < 36 || H < 36) return;
  const b = artSubjectBounds(img);
  if (!b) return;
  const iw = img.naturalWidth,
    ih = img.naturalHeight;
  const sc = Math.min(W / iw, H / ih);
  const offX = (W - iw * sc) / 2,
    offY = (H - ih * sc) / 2;
  const sx0 = offX + b.l * iw * sc,
    sx1 = offX + b.r * iw * sc,
    sy0 = offY + b.t * ih * sc,
    sy1 = offY + b.b * ih * sc;
  const sw = sx1 - sx0,
    sh = sy1 - sy0;
  if (sw < 2 || sh < 2) return;
  const node = img.closest('.mapnode');
  let k;
  if (node) {
    const R = Math.min(node.clientWidth, node.clientHeight) / 2 - 3;
    const kHyp = (R * 0.96) / (0.5 * Math.hypot(sw, sh));
    const kSide = (R * 2 * 0.98) / Math.max(sw, sh);
    // fill the circle edge to edge; only the empty corners of the subject's box get clipped
    k = Math.min(3.2, Math.max(0.5, Math.min(kSide, kHyp * 1.28)));
  } else {
    k = Math.min(2.4, Math.max(1, Math.min((0.97 * W) / sw, (0.97 * H) / sh)));
  }
  const tx = -k * ((sx0 + sx1) / 2 - W / 2),
    ty = -k * ((sy0 + sy1) / 2 - H / 2);
  img.style.transformOrigin = '50% 50%';
  img.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${k.toFixed(3)})`;
}
function fitAllArt(root) {
  (root || document).querySelectorAll('.vart > img').forEach((img) => {
    if (img.complete && img.naturalWidth) fitArtImg(img);
    else if (!img.__fitHooked) {
      img.__fitHooked = true;
      img.addEventListener('load', () => fitArtImg(img), { once: true });
    }
  });
}
let __artResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(__artResizeTimer);
  __artResizeTimer = setTimeout(() => fitAllArt(document.getElementById('app')), 120);
});
