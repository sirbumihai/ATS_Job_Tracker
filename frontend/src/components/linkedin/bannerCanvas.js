// Generator de banner LinkedIn: tot ce se vede se deseneaza direct pe un canvas
// la rezolutia finala (1584x396), nu se captureaza din DOM. Acelasi cod
// deseneaza previzualizarea si fisierul PNG exportat.

export const BANNER_SIZE = { width: 1584, height: 396 };
export const BANNER_PADDING = 96;
export const BANNER_TEMPLATES = [
  { id: 'gradient', label: 'Gradient' },
  { id: 'grid', label: 'Grilă' },
  { id: 'minimal', label: 'Minimal' },
];
export const DEFAULT_BANNER_TEMPLATE = 'gradient';

const HEADLINE_FONT = '"Lora", Georgia, serif';
const BODY_FONT = 'Inter, ui-sans-serif, system-ui, sans-serif';
const MAX_HEADLINE_LINES = 2;
const MAX_STACK_ITEMS = 6;

const THEMES = {
  gradient: { headline: '#ffffff', chipText: '#ffffff', chipFill: 'rgba(255,255,255,0.16)', chipStroke: 'rgba(255,255,255,0.35)' },
  grid: { headline: '#0a0a0a', chipText: '#1d4ed8', chipFill: '#ffffff', chipStroke: '#bfdbfe' },
  minimal: { headline: '#0a0a0a', chipText: '#404040', chipFill: '#f5f5f5', chipStroke: '#e5e5e5' },
};

const headlineFont = (size) => `600 ${size}px ${HEADLINE_FONT}`;

/** Imparte `text` in randuri care incap in `maxWidth`; cuvintele prea lungi se rup pe litere. */
function wrapWords(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  const pushWord = (word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      return;
    }
    if (line) lines.push(line);
    line = '';
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      return;
    }
    for (const char of word) {
      if (line && ctx.measureText(line + char).width > maxWidth) {
        lines.push(line);
        line = '';
      }
      line += char;
    }
  };
  text.split(/\s+/).filter(Boolean).forEach(pushWord);
  if (line) lines.push(line);
  return lines;
}

/** Taie `text` la lungimea maxima care, cu "…" la capat, incape in `maxWidth`. */
function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end).trimEnd()}…`).width > maxWidth) end -= 1;
  return `${text.slice(0, end).trimEnd()}…`;
}

/**
 * Alege marimea fontului si randurile headline-ului: cel mult 2 randuri, fiecare
 * in `maxWidth`. Un headline prea lung se micsoreaza pana la 34px, apoi se taie cu "…".
 * Intoarce si `font`, ca apelantul sa masoare cu exact acelasi font.
 */
export function layoutHeadline(ctx, text, maxWidth) {
  const content = (text || '').trim();
  for (let size = 64; size >= 34; size -= 2) {
    ctx.font = headlineFont(size);
    const lines = wrapWords(ctx, content, maxWidth);
    if (lines.length <= MAX_HEADLINE_LINES) return { lines, fontSize: size, font: headlineFont(size) };
  }
  const size = 34;
  ctx.font = headlineFont(size);
  const lines = wrapWords(ctx, content, maxWidth);
  const kept = lines.slice(0, MAX_HEADLINE_LINES);
  // Ultimul rand pastrat se completeaza cu restul textului, apoi se taie cu "…".
  kept[MAX_HEADLINE_LINES - 1] = truncateToWidth(ctx, lines.slice(MAX_HEADLINE_LINES - 1).join(' '), maxWidth);
  return { lines: kept, fontSize: size, font: headlineFont(size) };
}

function paintBackground(ctx, template) {
  const { width, height } = BANNER_SIZE;
  if (template === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.55, '#2563eb');
    gradient.addColorStop(1, '#60a5fa');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.beginPath();
    ctx.arc(width - 120, -40, 320, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width - 420, height + 80, 220, 0, Math.PI * 2);
    ctx.fill();
  } else if (template === 'grid') {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#eff6ff');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 1;
    const step = 44;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, 0, 12, height);
    ctx.fillRect(BANNER_PADDING, 64, 72, 4);
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintStack(ctx, items, theme, top, maxWidth) {
  ctx.font = `500 24px ${BODY_FONT}`;
  ctx.textBaseline = 'middle';
  const chipHeight = 48;
  const gap = 14;
  let x = BANNER_PADDING;
  for (const item of items.slice(0, MAX_STACK_ITEMS)) {
    const label = truncateToWidth(ctx, item, 260);
    const chipWidth = ctx.measureText(label).width + 40;
    if (x + chipWidth > BANNER_PADDING + maxWidth) break;
    roundedRect(ctx, x, top, chipWidth, chipHeight, chipHeight / 2);
    ctx.fillStyle = theme.chipFill;
    ctx.fill();
    ctx.strokeStyle = theme.chipStroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = theme.chipText;
    ctx.fillText(label, x + 20, top + chipHeight / 2 + 1);
    x += chipWidth + gap;
  }
}

/**
 * Deseneaza bannerul pe `canvas` (il redimensioneaza la 1584x396).
 * `headline` si `stack` vin din profilul afisat; nimic nu e fix in banner.
 */
export function drawBanner(canvas, { template = DEFAULT_BANNER_TEMPLATE, headline, stack = [] }) {
  canvas.width = BANNER_SIZE.width;
  canvas.height = BANNER_SIZE.height;
  const ctx = canvas.getContext('2d');
  const theme = THEMES[template] || THEMES[DEFAULT_BANNER_TEMPLATE];
  const maxWidth = BANNER_SIZE.width - BANNER_PADDING * 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackground(ctx, THEMES[template] ? template : DEFAULT_BANNER_TEMPLATE);

  const { lines, fontSize, font } = layoutHeadline(ctx, headline, maxWidth);
  const lineHeight = Math.round(fontSize * 1.18);
  ctx.font = font;
  ctx.fillStyle = theme.headline;
  ctx.textBaseline = 'alphabetic';
  lines.forEach((line, i) => ctx.fillText(line, BANNER_PADDING, 104 + fontSize + i * lineHeight));

  const items = (stack || []).filter(Boolean);
  if (items.length > 0) paintStack(ctx, items, theme, BANNER_SIZE.height - 56 - 48, maxWidth);
}

/** Exporta bannerul ca PNG de exact 1584x396, desenat pe un canvas separat de previzualizare. */
export function renderBannerBlob(options) {
  const canvas = document.createElement('canvas');
  drawBanner(canvas, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Nu s-a putut genera imaginea.'))), 'image/png');
  });
}

/** Incarca fonturile folosite de banner, ca desenul sa nu cada pe un font de rezerva. Esueaza in tacere. */
export async function loadBannerFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([document.fonts.load(headlineFont(40)), document.fonts.load(`500 24px ${BODY_FONT}`)]);
  } catch {
    // Fara fonturile web, canvas-ul foloseste fonturile de rezerva.
  }
}
