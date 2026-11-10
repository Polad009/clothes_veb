// Vector mockups for the design studio. Every product shape is drawn here in a 400×400
// box and filled with the chosen colour, so each product looks right in every colour.
// Pure string functions: usable on the page (inline) and as a data-URL preview image.

import type { ExtraSpot, Shape, StudioSide } from "@/lib/studio/catalog";

// ── colour helpers ───────────────────────────────────────────────────────────
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(hex: string, target: number, amount: number): string {
  const [r, g, b] = rgb(hex);
  const m = (c: number) => Math.round(c + (target - c) * amount);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}
const darker = (hex: string, a: number) => mix(hex, 0, a);
const lighter = (hex: string, a: number) => mix(hex, 255, a);
function isLight(hex: string) {
  const [r, g, b] = rgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

interface Paint {
  fill: string;
  rib: string; // collars, cuffs, waistbands
  inside: string; // inside of a hood / mug
  line: string; // outline
  seam: string; // stitching
}
function paint(hex: string): Paint {
  const light = isLight(hex);
  return {
    fill: hex,
    rib: darker(hex, light ? 0.07 : 0.18),
    inside: darker(hex, light ? 0.28 : 0.45),
    line: light ? darker(hex, 0.32) : lighter(hex, 0.18),
    seam: light ? darker(hex, 0.2) : lighter(hex, 0.12),
  };
}

// ── drawing helpers ──────────────────────────────────────────────────────────
const shapeEl = (d: string, p: Paint, fill = p.fill) =>
  `<path d="${d}" fill="${fill}" stroke="${p.line}" stroke-width="2" stroke-linejoin="round"/>`;
const shade = (d: string, id: string) => `<path d="${d}" fill="url(#${id}s)" style="mix-blend-mode:multiply"/>`;
const seam = (d: string, p: Paint, w = 1.4) =>
  `<path d="${d}" fill="none" stroke="${p.seam}" stroke-width="${w}" stroke-dasharray="4 3" stroke-linecap="round"/>`;
const line = (d: string, color: string, w = 2) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function defs(id: string) {
  return `<defs>
<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".22" stop-color="#000" stop-opacity=".02"/>
<stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".04"/>
<stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3DB9A"/><stop offset=".45" stop-color="#C9A04E"/><stop offset=".7" stop-color="#E8C877"/><stop offset="1" stop-color="#9A7430"/></linearGradient>
<linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>`;
}

// ── garments ────────────────────────────────────────────────────────────────
const TEE = (back: boolean) =>
  `M163 60 Q200 ${back ? 70 : 86} 237 60 L264 68 L334 110 L310 154 L277 136 L275 344 Q200 350 125 344 L123 136 L90 154 L66 110 L136 68 Z`;
const OVER = (back: boolean) =>
  `M168 58 Q200 ${back ? 68 : 82} 232 58 L282 70 L350 124 L322 178 L292 162 L294 352 Q200 358 106 352 L108 162 L78 178 L50 124 L118 70 Z`;
const LONG = (back: boolean, neck = 86) =>
  `M163 60 Q200 ${back ? 70 : neck} 237 60 L264 68 Q304 92 320 166 L340 300 L310 308 L286 186 L282 344 Q200 350 118 344 L114 186 L90 308 L60 300 L80 166 Q96 92 136 68 Z`;

function tee(p: Paint, id: string, back: boolean) {
  const d = TEE(back);
  return (
    shapeEl(d, p) +
    shade(d, id) +
    line(`M163 60 Q200 ${back ? 70 : 86} 237 60`, p.rib, 7) +
    seam("M72 117 L95 147", p) +
    seam("M328 117 L305 147", p) +
    seam("M128 336 Q200 342 272 336", p) +
    seam("M136 68 Q130 100 123 136", p, 1) +
    seam("M264 68 Q270 100 277 136", p, 1)
  );
}
function oversize(p: Paint, id: string, back: boolean) {
  const d = OVER(back);
  return (
    shapeEl(d, p) +
    shade(d, id) +
    line(`M168 58 Q200 ${back ? 68 : 82} 232 58`, p.rib, 7) +
    seam("M118 70 Q113 118 108 162", p) +
    seam("M282 70 Q287 118 292 162", p) +
    seam("M57 128 L84 172", p) +
    seam("M343 128 L316 172", p) +
    seam("M110 344 Q200 350 290 344", p)
  );
}
function polo(p: Paint, id: string, back: boolean, long: boolean) {
  const d = long ? LONG(back) : TEE(back);
  let s = shapeEl(d, p) + shade(d, id);
  if (long) s += seam("M64 288 L93 296", p) + seam("M336 288 L307 296", p);
  else s += seam("M72 117 L95 147", p) + seam("M328 117 L305 147", p);
  s += seam("M124 336 Q200 342 276 336", p);
  if (back) {
    s += shapeEl("M160 58 Q200 48 240 58 L242 72 Q200 62 158 72 Z", p, p.rib);
  } else {
    s +=
      `<rect x="191" y="84" width="18" height="74" fill="${p.rib}" stroke="${p.line}" stroke-width="1.5"/>` +
      [102, 122, 142].map((y) => `<circle cx="200" cy="${y}" r="3.4" fill="${p.line}"/>`).join("") +
      shapeEl("M163 58 L200 86 L183 108 L148 72 Z", p, p.rib) +
      shapeEl("M237 58 L200 86 L217 108 L252 72 Z", p, p.rib);
  }
  return s;
}
function sweatshirt(p: Paint, id: string, back: boolean) {
  const d = LONG(back, 82);
  return (
    shapeEl(d, p) +
    shade(d, id) +
    line(`M163 60 Q200 ${back ? 70 : 82} 237 60`, p.rib, 9) +
    shapeEl("M118 326 Q200 332 282 326 L282 344 Q200 350 118 344 Z", p, p.rib) +
    shapeEl("M62 286 L93 293 L90 308 L60 300 Z", p, p.rib) +
    shapeEl("M338 286 L307 293 L310 308 L340 300 Z", p, p.rib) +
    seam("M136 68 Q118 110 114 186", p, 1) +
    seam("M264 68 Q282 110 286 186", p, 1)
  );
}
function hoodie(p: Paint, id: string, back: boolean) {
  const body = LONG(back, 82);
  let s = "";
  if (back) {
    s += shapeEl(body, p) + shade(body, id);
    s += shapeEl("M144 82 C128 16 272 16 256 82 Q200 98 144 82 Z", p, p.rib) + seam("M200 24 L200 90", p);
  } else {
    s += shapeEl("M146 82 C130 30 168 14 200 14 C232 14 270 30 254 82 Z", p, p.rib);
    s += shapeEl(body, p) + shade(body, id);
    s += shapeEl("M164 76 C162 36 238 36 236 76 Q200 98 164 76 Z", p, p.inside);
    s += line("M186 88 L183 142", p.line, 2.4) + line("M214 88 L217 142", p.line, 2.4);
    s += `<circle cx="183" cy="145" r="3" fill="${p.line}"/><circle cx="217" cy="145" r="3" fill="${p.line}"/>`;
    s += shapeEl("M140 246 L260 246 L276 314 L124 314 Z", p, p.fill) + line("M140 246 L128 300", p.seam, 1.5) + line("M260 246 L272 300", p.seam, 1.5);
  }
  s += shapeEl("M118 326 Q200 332 282 326 L282 344 Q200 350 118 344 Z", p, p.rib);
  s += shapeEl("M62 286 L93 293 L90 308 L60 300 Z", p, p.rib) + shapeEl("M338 286 L307 293 L310 308 L340 300 Z", p, p.rib);
  return s;
}
function halfzip(p: Paint, id: string, back: boolean, full: boolean) {
  const d = LONG(back, 72);
  let s = shapeEl(d, p) + shade(d, id);
  s += shapeEl(back ? "M160 50 L240 50 L238 70 Q200 66 162 70 Z" : "M160 46 L240 46 L238 70 Q200 80 162 70 Z", p, p.rib);
  if (!back) {
    const end = full ? 344 : 152;
    s += line(`M200 50 L200 ${end}`, p.inside, 3.2) + seam(`M194 52 L194 ${end}`, p, 1) + seam(`M206 52 L206 ${end}`, p, 1);
    s += `<rect x="196" y="72" width="8" height="16" rx="2" fill="${p.line}"/>`;
    if (full) s += line("M138 250 L148 296", p.seam, 2) + line("M262 250 L252 296", p.seam, 2);
  }
  if (!full) s += shapeEl("M118 326 Q200 332 282 326 L282 344 Q200 350 118 344 Z", p, p.rib);
  else s += shapeEl("M118 330 Q200 336 282 330 L282 344 Q200 350 118 344 Z", p, p.rib);
  s += shapeEl("M62 286 L93 293 L90 308 L60 300 Z", p, p.rib) + shapeEl("M338 286 L307 293 L310 308 L340 300 Z", p, p.rib);
  return s;
}
function pants(p: Paint, id: string, back: boolean) {
  const legs = "M126 64 L274 64 L292 344 L218 350 L201 150 L182 350 L108 344 Z";
  let s = shapeEl(legs, p) + shade(legs, id);
  s += shapeEl("M128 40 L272 40 L274 64 L126 64 Z", p, p.rib);
  s += shapeEl("M110 328 L182 334 L182 350 L108 344 Z", p, p.rib) + shapeEl("M290 328 L218 334 L218 350 L292 344 Z", p, p.rib);
  s += seam("M201 150 L201 64", p, 1.2);
  if (back) {
    s += shapeEl("M140 82 L186 82 L184 118 L142 118 Z", p, p.fill) + shapeEl("M214 82 L260 82 L258 118 L216 118 Z", p, p.fill);
  } else {
    s += line("M192 58 L188 96", p.line, 2) + line("M208 58 L212 96", p.line, 2);
    s += line("M134 70 Q150 104 128 118", p.seam, 1.6) + line("M266 70 Q250 104 272 118", p.seam, 1.6);
  }
  return s;
}
function cap(p: Paint, id: string, back: boolean) {
  const crown = "M104 238 C104 118 296 118 296 238 Z";
  let s = shapeEl(crown, p) + shade(crown, id);
  s += seam("M200 150 L200 238", p, 1) + seam("M152 158 Q168 196 160 238", p, 1) + seam("M248 158 Q232 196 240 238", p, 1);
  s += `<circle cx="200" cy="150" r="6" fill="${p.rib}" stroke="${p.line}" stroke-width="1.5"/>`;
  if (back) {
    s += shapeEl("M166 238 Q200 192 234 238 Z", p, p.inside);
    s += shapeEl("M160 214 L240 214 L240 226 L160 226 Z", p, p.rib);
    s += `<rect x="226" y="210" width="12" height="20" rx="2" fill="#B8925A" stroke="#7C5F32"/>`;
    s += line("M100 238 L300 238", p.line, 3);
  } else {
    s += shapeEl("M92 228 Q200 254 308 228 Q322 250 302 266 Q200 312 98 266 Q78 250 92 228 Z", p, p.rib);
    s += seam("M104 250 Q200 290 296 250", p, 1);
  }
  return s;
}
function apron(p: Paint, id: string, long: boolean) {
  let s = "";
  if (long) {
    s += line("M162 96 C156 26 244 26 238 96", p.rib, 7);
    const d = "M150 90 L250 90 L256 176 Q290 180 300 192 L304 360 Q200 372 96 360 L100 192 Q110 180 144 176 Z";
    s += line("M100 198 L44 226", p.rib, 6) + line("M300 198 L356 226", p.rib, 6);
    s += shapeEl(d, p) + shade(d, id);
    s += shapeEl("M140 266 L260 266 L260 320 L140 320 Z", p, p.fill) + seam("M200 266 L200 320", p);
    s += seam("M104 350 Q200 362 296 350", p);
  } else {
    s += line("M40 150 L112 150", p.rib, 6) + line("M288 150 L360 150", p.rib, 6);
    s += shapeEl("M108 140 L292 140 L292 162 L108 162 Z", p, p.rib);
    const d = "M112 162 L288 162 L298 304 Q200 318 102 304 Z";
    s += shapeEl(d, p) + shade(d, id);
    s += shapeEl("M150 212 L250 212 L250 262 L150 262 Z", p, p.fill) + seam("M200 212 L200 262", p);
    s += seam("M108 294 Q200 308 292 294", p);
  }
  return s;
}
function tote(p: Paint, id: string) {
  let s = line("M150 156 C150 56 250 56 250 156", p.rib, 12) + line("M150 156 C150 56 250 56 250 156", p.line, 1);
  const d = "M108 150 L292 150 L302 362 L98 362 Z";
  s += shapeEl(d, p) + shade(d, id) + seam("M109 166 L291 166", p);
  return s;
}
function mug(p: Paint, id: string, back: boolean, kind: "plain" | "gold" | "heart" | "round" | "magic") {
  const body = kind === "gold" ? `url(#${id}g)` : p.fill;
  let handle = "";
  if (kind === "heart") handle = line("M272 172 C292 140 338 160 322 204 C312 230 288 244 272 258", p.line, 16) + line("M272 172 C292 140 338 160 322 204 C312 230 288 244 272 258", kind === "heart" ? p.fill : body, 11);
  else if (kind === "round")
    handle = line("M270 160 C334 160 334 272 270 272", p.line, 18) + line("M270 160 C334 160 334 272 270 272", p.fill, 12) + `<circle cx="300" cy="162" r="12" fill="${p.fill}" stroke="${p.line}" stroke-width="2"/>`;
  else {
    const hc = kind === "gold" ? "#B58C3F" : p.fill;
    handle = line("M270 160 C334 160 334 272 270 272", p.line, 20) + line("M270 160 C334 160 334 272 270 272", hc, 14);
  }
  const d = "M110 110 L270 110 L270 322 Q190 338 110 322 Z";
  let s = handle + `<path d="${d}" fill="${body}" stroke="${p.line}" stroke-width="2"/>` + shade(d, id);
  if (kind === "magic" || kind === "gold") s += `<path d="${d}" fill="url(#${id}m)"/>`;
  s += `<ellipse cx="190" cy="110" rx="80" ry="14" fill="${kind === "gold" ? "#E8C877" : p.rib}" stroke="${p.line}" stroke-width="2"/>`;
  s += `<ellipse cx="190" cy="111" rx="70" ry="9" fill="${p.inside}"/>`;
  return back ? `<g transform="translate(400 0) scale(-1 1)">${s}</g>` : s;
}
function puzzleGrid(x0: number, y0: number, x1: number, y1: number, cols: number, rows: number) {
  const cw = (x1 - x0) / cols;
  const rh = (y1 - y0) / rows;
  let d = "";
  for (let c = 1; c < cols; c++) {
    const x = x0 + c * cw;
    d += `M${x} ${y0}`;
    for (let r = 0; r < rows; r++) {
      const ya = y0 + r * rh;
      const dir = (r + c) % 2 ? 1 : -1;
      d += ` L${x} ${ya + rh * 0.38} C${x + dir * 14} ${ya + rh * 0.3} ${x + dir * 14} ${ya + rh * 0.7} ${x} ${ya + rh * 0.62} L${x} ${ya + rh}`;
    }
  }
  for (let r = 1; r < rows; r++) {
    const y = y0 + r * rh;
    d += ` M${x0} ${y}`;
    for (let c = 0; c < cols; c++) {
      const xa = x0 + c * cw;
      const dir = (r + c) % 2 ? -1 : 1;
      d += ` L${xa + cw * 0.38} ${y} C${xa + cw * 0.3} ${y + dir * 14} ${xa + cw * 0.7} ${y + dir * 14} ${xa + cw * 0.62} ${y} L${xa + cw} ${y}`;
    }
  }
  return d;
}
function puzzle(p: Paint, id: string, heart: boolean) {
  if (heart) {
    const d = "M200 334 C120 274 66 222 66 160 C66 114 102 82 144 82 C172 82 190 98 200 118 C210 98 228 82 256 82 C298 82 334 114 334 160 C334 222 280 274 200 334 Z";
    return (
      `<clipPath id="${id}h"><path d="${d}"/></clipPath>` +
      shapeEl(d, p) +
      `<g clip-path="url(#${id}h)">${line(puzzleGrid(66, 82, 334, 334, 4, 4), p.seam, 1.6)}</g>`
    );
  }
  const d = "M118 66 L282 66 L282 334 L118 334 Z";
  return shapeEl(d, p) + line(puzzleGrid(118, 66, 282, 334, 3, 4), p.seam, 1.6);
}
function briefs(p: Paint, id: string, back: boolean) {
  const d = "M108 138 L292 138 L300 282 L222 298 L200 238 L178 298 L100 282 Z";
  let s = shapeEl(d, p) + shade(d, id);
  s += shapeEl("M106 108 L294 108 L292 138 L108 138 Z", p, p.rib);
  s += seam("M102 272 L178 288", p) + seam("M298 272 L222 288", p);
  s += back ? seam("M200 140 L200 236", p) : line("M184 146 Q200 226 216 146", p.seam, 1.8);
  return s;
}

const DRAW: Record<Shape, (p: Paint, id: string, back: boolean) => string> = {
  tee: (p, id, b) => tee(p, id, b),
  oversize: (p, id, b) => oversize(p, id, b),
  polo: (p, id, b) => polo(p, id, b, false),
  poloLong: (p, id, b) => polo(p, id, b, true),
  sweatshirt: (p, id, b) => sweatshirt(p, id, b),
  hoodie: (p, id, b) => hoodie(p, id, b),
  halfzip: (p, id, b) => halfzip(p, id, b, false),
  trackJacket: (p, id, b) => halfzip(p, id, b, true),
  pants: (p, id, b) => pants(p, id, b),
  cap: (p, id, b) => cap(p, id, b),
  apronShort: (p, id) => apron(p, id, false),
  apronLong: (p, id) => apron(p, id, true),
  tote: (p, id) => tote(p, id),
  mug: (p, id, b) => mug(p, id, b, "plain"),
  mugGold: (p, id, b) => mug(p, id, b, "gold"),
  mugHeart: (p, id, b) => mug(p, id, b, "heart"),
  mugRound: (p, id, b) => mug(p, id, b, "round"),
  mugMagic: (p, id, b) => mug(p, id, b, "magic"),
  puzzle: (p, id) => puzzle(p, id, false),
  puzzleHeart: (p, id) => puzzle(p, id, true),
  briefs: (p, id, b) => briefs(p, id, b),
};

/** SVG markup (400×400) of a product in a colour, seen from the front or back. */
export function mockupSvg(shape: Shape, hex: string, side: StudioSide, uid = "m"): string {
  const id = `hw${uid}${shape}${side}`.replace(/[^a-zA-Z0-9]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">${defs(id)}${DRAW[shape](paint(hex), id, side === "back")}</svg>`;
}

/** Same drawing as a data URL, for cart thumbnails and the admin's job card. */
export function mockupDataUrl(shape: Shape, hex: string, side: StudioSide): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mockupSvg(shape, hex, side, "u"))}`;
}

// ── print areas (centre x/y, width/height in the 400 box) ───────────────────
export interface Area {
  cx: number;
  cy: number;
  w: number;
  h: number;
}
interface AreaSet {
  front: { large?: Area; small?: Area };
  back: { large?: Area; small?: Area };
  extras: Partial<Record<ExtraSpot, { side: StudioSide; area: Area }>>;
}
const TOP_EXTRAS = (sleeveY: number, leftX: number, rightX: number, neckY: number): AreaSet["extras"] => ({
  sleeveLeft: { side: "front", area: { cx: rightX, cy: sleeveY, w: 30, h: 30 } },
  sleeveRight: { side: "front", area: { cx: leftX, cy: sleeveY, w: 30, h: 30 } },
  neck: { side: "back", area: { cx: 200, cy: neckY, w: 40, h: 22 } },
});

export const PRINT_AREAS: Record<Shape, AreaSet> = {
  tee: { front: { large: { cx: 200, cy: 190, w: 120, h: 140 }, small: { cx: 238, cy: 118, w: 40, h: 40 } }, back: { large: { cx: 200, cy: 185, w: 130, h: 160 }, small: { cx: 200, cy: 94, w: 44, h: 30 } }, extras: TOP_EXTRAS(118, 86, 314, 88) },
  oversize: { front: { large: { cx: 200, cy: 195, w: 140, h: 160 }, small: { cx: 244, cy: 118, w: 42, h: 42 } }, back: { large: { cx: 200, cy: 190, w: 150, h: 170 }, small: { cx: 200, cy: 92, w: 46, h: 30 } }, extras: TOP_EXTRAS(140, 76, 324, 86) },
  polo: { front: { large: { cx: 200, cy: 230, w: 110, h: 110 }, small: { cx: 238, cy: 130, w: 38, h: 38 } }, back: { large: { cx: 200, cy: 185, w: 130, h: 160 }, small: { cx: 200, cy: 96, w: 44, h: 28 } }, extras: TOP_EXTRAS(118, 86, 314, 90) },
  poloLong: { front: { large: { cx: 200, cy: 230, w: 110, h: 110 }, small: { cx: 238, cy: 130, w: 38, h: 38 } }, back: { large: { cx: 200, cy: 185, w: 130, h: 160 }, small: { cx: 200, cy: 96, w: 44, h: 28 } }, extras: TOP_EXTRAS(200, 92, 308, 90) },
  sweatshirt: { front: { large: { cx: 200, cy: 182, w: 120, h: 130 }, small: { cx: 238, cy: 118, w: 40, h: 40 } }, back: { large: { cx: 200, cy: 185, w: 130, h: 160 }, small: { cx: 200, cy: 92, w: 44, h: 28 } }, extras: TOP_EXTRAS(200, 92, 308, 86) },
  hoodie: { front: { large: { cx: 200, cy: 190, w: 110, h: 90 }, small: { cx: 236, cy: 120, w: 36, h: 36 } }, back: { large: { cx: 200, cy: 200, w: 130, h: 150 }, small: { cx: 200, cy: 108, w: 44, h: 24 } }, extras: TOP_EXTRAS(200, 92, 308, 104) },
  halfzip: { front: { large: { cx: 200, cy: 230, w: 110, h: 100 }, small: { cx: 240, cy: 118, w: 36, h: 36 } }, back: { large: { cx: 200, cy: 185, w: 130, h: 160 }, small: { cx: 200, cy: 92, w: 44, h: 26 } }, extras: TOP_EXTRAS(200, 92, 308, 88) },
  trackJacket: { front: { large: { cx: 244, cy: 170, w: 70, h: 90 }, small: { cx: 240, cy: 118, w: 36, h: 36 } }, back: { large: { cx: 200, cy: 185, w: 130, h: 160 }, small: { cx: 200, cy: 92, w: 44, h: 26 } }, extras: TOP_EXTRAS(200, 92, 308, 88) },
  pants: { front: { large: { cx: 246, cy: 205, w: 58, h: 110 }, small: { cx: 244, cy: 110, w: 34, h: 34 } }, back: { large: { cx: 246, cy: 210, w: 58, h: 110 }, small: { cx: 163, cy: 100, w: 36, h: 28 } }, extras: { leg: { side: "front", area: { cx: 250, cy: 300, w: 34, h: 34 } } } },
  cap: { front: { large: { cx: 200, cy: 192, w: 120, h: 58 }, small: { cx: 200, cy: 192, w: 64, h: 36 } }, back: { large: { cx: 200, cy: 178, w: 96, h: 36 }, small: { cx: 200, cy: 180, w: 56, h: 24 } }, extras: { side: { side: "front", area: { cx: 136, cy: 208, w: 40, h: 26 } } } },
  apronShort: { front: { large: { cx: 200, cy: 200, w: 150, h: 70 }, small: { cx: 244, cy: 186, w: 40, h: 30 } }, back: {}, extras: { pocket: { side: "front", area: { cx: 200, cy: 237, w: 84, h: 40 } } } },
  apronLong: { front: { large: { cx: 200, cy: 190, w: 140, h: 130 }, small: { cx: 200, cy: 130, w: 50, h: 50 } }, back: {}, extras: { pocket: { side: "front", area: { cx: 200, cy: 293, w: 100, h: 42 } } } },
  tote: { front: { large: { cx: 200, cy: 262, w: 160, h: 170 }, small: { cx: 200, cy: 250, w: 64, h: 64 } }, back: { large: { cx: 200, cy: 262, w: 160, h: 170 }, small: { cx: 200, cy: 250, w: 64, h: 64 } }, extras: {} },
  mug: { front: { large: { cx: 190, cy: 220, w: 130, h: 150 }, small: { cx: 190, cy: 220, w: 66, h: 66 } }, back: { large: { cx: 210, cy: 220, w: 130, h: 150 }, small: { cx: 210, cy: 220, w: 66, h: 66 } }, extras: {} },
  mugGold: { front: { large: { cx: 190, cy: 220, w: 130, h: 150 }, small: { cx: 190, cy: 220, w: 66, h: 66 } }, back: { large: { cx: 210, cy: 220, w: 130, h: 150 }, small: { cx: 210, cy: 220, w: 66, h: 66 } }, extras: {} },
  mugHeart: { front: { large: { cx: 190, cy: 220, w: 130, h: 150 }, small: { cx: 190, cy: 220, w: 66, h: 66 } }, back: { large: { cx: 210, cy: 220, w: 130, h: 150 }, small: { cx: 210, cy: 220, w: 66, h: 66 } }, extras: {} },
  mugRound: { front: { large: { cx: 190, cy: 220, w: 130, h: 150 }, small: { cx: 190, cy: 220, w: 66, h: 66 } }, back: { large: { cx: 210, cy: 220, w: 130, h: 150 }, small: { cx: 210, cy: 220, w: 66, h: 66 } }, extras: {} },
  mugMagic: { front: { large: { cx: 190, cy: 220, w: 130, h: 150 }, small: { cx: 190, cy: 220, w: 66, h: 66 } }, back: { large: { cx: 210, cy: 220, w: 130, h: 150 }, small: { cx: 210, cy: 220, w: 66, h: 66 } }, extras: {} },
  puzzle: { front: { large: { cx: 200, cy: 200, w: 164, h: 268 } }, back: {}, extras: {} },
  puzzleHeart: { front: { large: { cx: 200, cy: 196, w: 250, h: 230 } }, back: {}, extras: {} },
  briefs: { front: { large: { cx: 200, cy: 190, w: 120, h: 70 } }, back: { large: { cx: 200, cy: 205, w: 150, h: 90 } }, extras: { side: { side: "front", area: { cx: 118, cy: 200, w: 26, h: 40 } } } },
};
