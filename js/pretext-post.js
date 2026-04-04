/**
 * Loads image/04/text.txt, splits on [[IMAGE n]] markers, lays out paragraphs
 * with @chenglou/pretext (layoutWithLines). Figures 1–3 use CDN; other indices use image/04/.
 */
import { prepareWithSegments, layoutWithLines } from "./vendor/pretext/layout.js";

const BASE = "/blog.klein.site";
const TEXT_URL = `${BASE}/image/04/text.txt`;

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

function layoutParagraph(container, text, maxWidth) {
  const { font, lineHeight } = currentFontAndLineHeight();
  const prepared = prepareWithSegments(text, font);
  const { lines } = layoutWithLines(prepared, maxWidth, lineHeight);
  const block = document.createElement("div");
  block.className = "pretext-block";
  for (const line of lines) {
    const lineEl = document.createElement("div");
    lineEl.className = "pretext-line";
    lineEl.textContent = line.text;
    block.appendChild(lineEl);
  }
  container.appendChild(block);
}

function addFigure(container, index) {
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
    if (u < urls.length) {
      img.src = urls[u];
    } else {
      img.onerror = null;
      img.alt = `Image ${index} could not be loaded`;
    }
  };
  fig.appendChild(img);
  const cap = document.createElement("figcaption");
  cap.className = "image-caption pretext-caption";
  cap.textContent = `Figure ${index}`;
  fig.appendChild(cap);
  container.appendChild(fig);
}

function contentMaxWidth(el) {
  const rect = el.getBoundingClientRect();
  return Math.max(280, Math.min(672, rect.width || 672));
}

async function render(container) {
  container.innerHTML = '<p class="pretext-loading">Loading…</p>';
  let raw;
  try {
    const res = await fetch(TEXT_URL);
    if (!res.ok) throw new Error(String(res.status));
    raw = await res.text();
  } catch (e) {
    container.innerHTML =
      '<p class="pretext-error">Could not load text.txt. Serve the site from /blog.klein.site/ (e.g. python scripts/dev-server.py).</p>';
    return;
  }

  const parts = parseText(raw);
  container.innerHTML = "";
  if (parts.length === 0) {
    container.innerHTML = '<p class="pretext-error">text.txt is empty or has no segments.</p>';
    return;
  }

  const runLayout = () => {
    container.innerHTML = "";
    const w = contentMaxWidth(container);
    for (const part of parts) {
      if (part.type === "image") {
        addFigure(container, part.index);
      } else {
        layoutParagraph(container, part.body, w);
      }
    }
    document.dispatchEvent(new CustomEvent("markdown-rendered"));
  };

  runLayout();
  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(runLayout, 120);
    },
    { passive: true }
  );
}

const root = document.getElementById("pretext-root");
if (root) {
  render(root);
}
