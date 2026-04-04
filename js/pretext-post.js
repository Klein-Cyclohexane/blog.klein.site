/**
 * Pre-text: French copy in image/04/text.txt, CDN figures, @chenglou/pretext.
 * Draggable images reflow the following paragraph via layoutNextLine (per-line width).
 */
import { prepareWithSegments, layoutNextLine, setLocale } from "./vendor/pretext/layout.js";

setLocale("fr");

const BASE = "/blog.klein.site";
const TEXT_URL = `${BASE}/image/04/text.txt`;
const GAP = 10;

const IMAGE_CDN = {
  1: "https://cdn.rthe.cn/cached-3cb1dfa63d61b00a7934056922dd83f8-avif/rayklein/image1.jpg",
  2: "https://cdn.rthe.cn/cached-dfaa8680f8a0f678875acacae99911b5-avif/rayklein/image2.jpg",
  3: "https://cdn.rthe.cn/cached-7160953849433c506be582b6316f8f91-avif/rayklein/image3.jpg",
};

const IMAGE_EXTS = [".svg", ".webp", ".jpg", ".jpeg", ".png"];

const FONT_DESKTOP = '400 17px Montserrat, Helvetica, Arial, sans-serif';
const LINE_HEIGHT_DESKTOP = 28;
const FONT_MOBILE = '400 15px Montserrat, Helvetica, Arial, sans-serif';
const LINE_HEIGHT_MOBILE = 26;

/** @type {Map<string, { l: number, t: number }>} */
const floatPositions = new Map();

function imageUrlList(index) {
  const key = String(index);
  const cdn = IMAGE_CDN[key];
  const local = IMAGE_EXTS.map((ext) => `${BASE}/image/04/image${key}${ext}`);
  if (cdn) return [cdn, ...local];
  return local;
}

function parseText(raw) {
  const re = /\[\[\s*IMAGE\s+(\d+)\s*\]\]/gi;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) {
      const text = raw.slice(last, m.index).trim();
      if (text) parts.push({ type: "text", body: text });
    }
    parts.push({ type: "image", index: m[1] });
    last = m.index + m[0].length;
  }
  if (last < raw.length) {
    const text = raw.slice(last).trim();
    if (text) parts.push({ type: "text", body: text });
  }
  return parts;
}

function currentFontAndLineHeight() {
  if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
    return { font: FONT_MOBILE, lineHeight: LINE_HEIGHT_MOBILE };
  }
  return { font: FONT_DESKTOP, lineHeight: LINE_HEIGHT_DESKTOP };
}

function contentMaxWidth(el) {
  const rect = el.getBoundingClientRect();
  return Math.max(280, Math.min(672, rect.width || 672));
}

function layoutParagraph(container, text, maxWidth) {
  const { font, lineHeight } = currentFontAndLineHeight();
  const prepared = prepareWithSegments(text, font);
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  const block = document.createElement("div");
  block.className = "pretext-block";
  let y = 0;
  for (let n = 0; n < 8000; n++) {
    const line = layoutNextLine(prepared, cursor, maxWidth);
    if (line === null) break;
    const lineEl = document.createElement("div");
    lineEl.className = "pretext-line";
    lineEl.textContent = line.text;
    block.appendChild(lineEl);
    cursor = line.end;
    y += lineHeight;
  }
  block.style.minHeight = y + "px";
  container.appendChild(block);
}

function linesOverlapFloat(lineY, lineH, f) {
  if (!f || f.w <= 0 || f.h <= 0) return false;
  return lineY + lineH > f.y && lineY < f.y + f.h;
}

/** @returns {{ x: number, maxW: number }} */
function lineLayout(lineY, lh, W, f) {
  if (!f || f.w <= 0) return { x: 0, maxW: W };
  if (!linesOverlapFloat(lineY, lh, f)) return { x: 0, maxW: W };
  const center = f.x + f.w / 2;
  if (center < W / 2) {
    const x = f.x + f.w + GAP;
    return { x, maxW: Math.max(72, W - x) };
  }
  return { x: 0, maxW: Math.max(72, f.x - GAP) };
}

function floatRectFromImg(section, img) {
  const sx = section.getBoundingClientRect().left;
  const sy = section.getBoundingClientRect().top;
  const ir = img.getBoundingClientRect();
  return {
    x: ir.left - sx,
    y: ir.top - sy,
    w: ir.width,
    h: ir.height,
  };
}

function layoutFlowLines(linesArea, prepared, lineHeight, sectionWidth, img, section) {
  linesArea.innerHTML = "";
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = 0;
  const f = () => floatRectFromImg(section, img);

  for (let iter = 0; iter < 8000; iter++) {
    const rect = f();
    const { x, maxW } = lineLayout(y, lineHeight, sectionWidth, rect);
    const line = layoutNextLine(prepared, cursor, maxW);
    if (line === null) break;
    const el = document.createElement("div");
    el.className = "pretext-line";
    el.style.position = "absolute";
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.textContent = line.text;
    linesArea.appendChild(el);
    cursor = line.end;
    y += lineHeight;
  }

  linesArea.style.height = Math.max(y, 1) + "px";
  const fr = f();
  const bottom = fr.y + fr.h;
  section.style.minHeight = Math.max(y, bottom + 12) + "px";
}

function wireDrag(wrap, img, section, relayout) {
  let drag = null;

  function clampPos(left, top) {
    const pad = 4;
    const W = section.clientWidth;
    const H = Math.max(section.clientHeight, 200);
    const iw = wrap.offsetWidth;
    const ih = wrap.offsetHeight;
    const maxL = Math.max(pad, W - iw - pad);
    const maxT = Math.max(pad, H - ih - pad);
    return {
      l: Math.min(maxL, Math.max(pad, left)),
      t: Math.min(maxT, Math.max(pad, top)),
    };
  }

  wrap.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const r = section.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      ox: e.clientX - r.left - wrap.offsetLeft,
      oy: e.clientY - r.top - wrap.offsetTop,
    };
    try {
      wrap.setPointerCapture(e.pointerId);
    } catch (_) {}
  });

  wrap.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const r = section.getBoundingClientRect();
    let left = e.clientX - r.left - drag.ox;
    let top = e.clientY - r.top - drag.oy;
    const c = clampPos(left, top);
    wrap.style.left = c.l + "px";
    wrap.style.top = c.t + "px";
    relayout();
  });

  function endDrag(e) {
    if (drag && e.pointerId === drag.id) {
      drag = null;
      try {
        wrap.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  }
  wrap.addEventListener("pointerup", endDrag);
  wrap.addEventListener("pointercancel", endDrag);
}

function createFlowSection(container, imageIndex, body, sectionWidth, key) {
  const { font, lineHeight } = currentFontAndLineHeight();
  const prepared = prepareWithSegments(body, font);

  const section = document.createElement("div");
  section.className = "pretext-flow-section";

  const wrap = document.createElement("figure");
  wrap.className = "pretext-float-figure";

  const img = document.createElement("img");
  img.className = "pretext-draggable post-image";
  img.alt = `Illustration ${imageIndex}`;
  img.decoding = "async";
  const urls = imageUrlList(imageIndex);
  let u = 0;
  img.src = urls[u];
  img.onerror = () => {
    u += 1;
    if (u < urls.length) img.src = urls[u];
    else img.onerror = null;
  };

  const hint = document.createElement("figcaption");
  hint.className = "pretext-drag-hint";
  hint.textContent = "Glissez l'image — le texte se refond.";

  const linesArea = document.createElement("div");
  linesArea.className = "pretext-lines-area";

  wrap.appendChild(img);
  wrap.appendChild(hint);
  section.appendChild(wrap);
  section.appendChild(linesArea);
  container.appendChild(section);

  const pos = floatPositions.get(key) || { l: 8, t: 8 };
  wrap.style.left = pos.l + "px";
  wrap.style.top = pos.t + "px";

  function relayout() {
    layoutFlowLines(linesArea, prepared, lineHeight, sectionWidth, img, section);
    floatPositions.set(key, {
      l: parseFloat(wrap.style.left) || 8,
      t: parseFloat(wrap.style.top) || 8,
    });
  }

  wireDrag(wrap, img, section, () => requestAnimationFrame(relayout));

  if (img.complete) {
    requestAnimationFrame(relayout);
  } else {
    img.addEventListener("load", () => requestAnimationFrame(relayout), { once: true });
  }
}

function addStaticFigure(container, index) {
  const fig = document.createElement("figure");
  fig.className = "post-image-wrapper pretext-figure";
  const img = document.createElement("img");
  img.alt = `Figure ${index}`;
  img.loading = "lazy";
  img.decoding = "async";
  img.className = "post-image";
  const urls = imageUrlList(index);
  let u = 0;
  img.src = urls[u];
  img.onerror = () => {
    u += 1;
    if (u < urls.length) img.src = urls[u];
    else img.onerror = null;
  };
  fig.appendChild(img);
  const cap = document.createElement("figcaption");
  cap.className = "image-caption pretext-caption";
  cap.textContent = `Figure ${index}`;
  fig.appendChild(cap);
  container.appendChild(fig);
}

function buildArticle(container, parts, w) {
  container.innerHTML = "";
  let i = 0;
  while (i < parts.length) {
    const p = parts[i];
    if (p.type === "image") {
      const textAfter = parts[i + 1]?.type === "text" ? parts[i + 1] : null;
      if (textAfter) {
        createFlowSection(container, p.index, textAfter.body, w, `img-${p.index}-${i}`);
        i += 2;
      } else {
        addStaticFigure(container, p.index);
        i += 1;
      }
    } else {
      const nextImg = parts[i + 1]?.type === "image" ? parts[i + 1] : null;
      const nextText = parts[i + 2]?.type === "text" ? parts[i + 2] : null;
      if (nextImg && nextText) {
        layoutParagraph(container, p.body, w);
        createFlowSection(container, nextImg.index, nextText.body, w, `img-${nextImg.index}-${i + 1}`);
        i += 3;
      } else {
        layoutParagraph(container, p.body, w);
        i += 1;
      }
    }
  }
  document.dispatchEvent(new CustomEvent("markdown-rendered"));
}

let cachedRaw = "";
let cachedParts = [];

async function render(container) {
  container.innerHTML = '<p class="pretext-loading">Chargement…</p>';
  let raw;
  try {
    const res = await fetch(TEXT_URL);
    if (!res.ok) throw new Error(String(res.status));
    raw = await res.text();
  } catch (e) {
    container.innerHTML =
      '<p class="pretext-error">Impossible de charger text.txt. Utilisez le serveur local (ex. python scripts/dev-server.py) avec le préfixe /blog.klein.site/</p>';
    return;
  }

  cachedRaw = raw;
  cachedParts = parseText(raw);
  if (cachedParts.length === 0) {
    container.innerHTML = '<p class="pretext-error">text.txt est vide.</p>';
    return;
  }

  const runLayout = () => {
    const w = contentMaxWidth(container);
    buildArticle(container, cachedParts, w);
  };

  runLayout();
  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(runLayout, 140);
    },
    { passive: true }
  );
}

const root = document.getElementById("pretext-root");
if (root) {
  render(root);
}
