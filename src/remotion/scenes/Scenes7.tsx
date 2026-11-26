import {sf} from '../sf';
import {measureText} from '@remotion/layout-utils';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C, SERIF, SAFE} from '../theme';
import {Logo, BrandLogo, Center, Eyebrow, Rule, GuestName, CompassRose} from '../components/Kit';
import {Rings, RingDefs, Seg, Spiral, SSeg} from '../components/Rings';
import {Needle} from '../components/Soft';
import {COPY, Guest} from './data';
import {SLOTS} from '../assets';
import {CFG, lines} from '../config';
import {ShinyLogo} from '../components/MetalLogo';

export const Paper: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundImage: `url(${sf('assets/paper-bg.jpg')})`, backgroundSize: '100% 100%', color: C.text, fontFamily: 'Google Sans Flex'}}>{children}</AbsoluteFill>
);

/* ============ The "commodity compass" world: one continuous scene ============ */
// world coordinates: 2400 x 2400, centre (1200,1200)
const W0 = 1200;
const ORDER = ['I01','C05','I03','C01','I04','C02','I02','C10','I05','A11','S01','B01','C06','B02','A08','C04','B03','B04','C03','B05','A10','C07','B06','B07','A12','C09','C02','B09','B10'];
// deterministic pseudo-random
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const GRADS: SSeg['kind'][] = ['copper', 'teal', 'sand', 'navy', 'sage', 'glass', 'slate', 'cream'];
// main spiral with irregular widths + stacked gradient layers, and an inner lead-in that hugs the compass
const SPIRAL: SSeg[] = [
  // inner lead-in (t < 0): small uneven chips filling the gap around the compass
  ...Array.from({length: 9}, (_, i): SSeg => {
    const t1 = -340 + i * 37 + rnd(i) * 6, t2 = t1 + 20 + rnd(i + 9) * 14;
    const k1 = 1.0 + rnd(i + 3) * 0.12, k2 = k1 + 0.28 + rnd(i + 5) * 0.3;
    return i % 3 === 1 ? {t1, t2, k1, k2, img: ['C03', 'C09', 'C07'][Math.floor(i / 3)]} : {t1, t2, k1, k2, kind: GRADS[i % GRADS.length]};
  }),
  ...ORDER.flatMap((id, i): SSeg[] => {
    const t1 = i * 33, t2 = t1 + 27 + rnd(i) * 5;
    const k1 = 1 + rnd(i + 20) * 0.06, k2 = 1.42 + rnd(i + 40) * 0.16;
    const z = Math.floor(rnd(i + 200) * 3);
    const out: SSeg[] = [id === '~' ? {t1, t2, k1, k2, kind: 'glass', z} : {t1, t2, k1, k2, img: id, z}];
    // stacked layer peeking out behind/above: offset in angle, gradient only
    if (rnd(i + 60) > 0.35) { const o = 6 + rnd(i + 70) * 10; out.unshift({t1: t1 + o, t2: t2 + o + 6, k1: k2 - 0.06, k2: k2 + 0.05 + rnd(i + 80) * 0.07, kind: GRADS[(i * 3) % GRADS.length], z: Math.max(0, z - 1)}); }
    // thin rail
    out.push({t1: t1 - 1.5, t2: t2 + 1.5, k1: 1.6 + rnd(i + 90) * 0.04, k2: 1.66 + rnd(i + 90) * 0.04, kind: i % 2 ? 'navy' : 'copper'});
    // occasional small floating chip in the gap
    if (rnd(i + 100) > 0.6) { const c = t1 + rnd(i + 110) * 20; out.push({t1: c, t2: c + 8 + rnd(i + 120) * 8, k1: 1.68, k2: 1.71, kind: GRADS[(i + 2) % GRADS.length]}); }
    return out;
  }),
];
const NL = 232, NS = NL / (1143 - 273);
const NImg: React.FC<{style?: React.CSSProperties}> = ({style}) => <image href={sf('assets/N01-cut.png')} x={-1027 * NS} y={-1143 * NS} width={2048 * NS} height={2048 * NS} style={style} />;
// needle floats ~40 units above the dial: soft cast shadow offset on the dial, dark underside for thickness, brass post
const WorldNeedle: React.FC<{angle: number}> = ({angle}) => (
  <g>
    <g transform={`translate(${W0 + 26} ${W0 + 34}) rotate(${angle})`} opacity={0.5}><NImg style={{filter: 'brightness(0) blur(6px)'}} /></g>
    <circle cx={W0 + 8} cy={W0 + 10} r={20} fill="rgba(40,24,10,0.35)" style={{filter: 'blur(4px)'}} />
    <circle cx={W0} cy={W0} r={13} fill="url(#copperFill)" />
    <g transform={`translate(${W0 + 2} ${W0 + 6}) rotate(${angle})`}><NImg style={{filter: 'brightness(0.35) saturate(0.6)'}} /></g>
    <g transform={`translate(${W0} ${W0}) rotate(${angle})`}><NImg /></g>
  </g>
);
export const World: React.FC<{compass?: boolean; needle?: boolean; needleAngle?: number}> = ({compass = true, needle = true, needleAngle = 38}) => (
  <svg viewBox="0 0 2400 2400" width={2400} height={2400} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <RingDefs />
    <Rings cx={W0} cy={W0} segs={[]} orbits={[278, 290]} prefix="w" />
    <Spiral cx={W0} cy={W0} r0={300} g={1.73} segs={SPIRAL} prefix="sp" guide={[-360, 970]} />
    {compass && <image href={sf('assets/compass-disc.png')} x={W0 - 270} y={W0 - 270} width={540} height={540} />}
    {needle && <WorldNeedle angle={needleAngle} />}
  </svg>
);
// camera: place the world in the 1080x1920 frame with a 3D tilt
export const Camera: React.FC<{scale: number; tilt: number; spin: number; fx: number; fy: number; children: React.ReactNode}> = ({scale, tilt, spin, fx, fy, children}) => (
  <div style={{position: 'absolute', left: 540 - 1200, top: fy - 1200, width: 2400, height: 2400, perspective: 2200, transformOrigin: '1200px 1200px', transform: `translateX(${fx - 540}px) perspective(2200px) rotateX(${tilt}deg) rotateZ(${spin}deg) scale(${scale})`}}>
    {children}
  </div>
);

// AI needle N01 (cut-out): pivot (1027,1143), tip y=273 in the 2048 source
export const RealNeedle: React.FC<{cx: number; cy: number; len: number; angle: number}> = ({cx, cy, len, angle}) => {
  const sc = len / (1143 - 273);
  return <Img src={sf('assets/N01-cut.png')} style={{position: 'absolute', width: 2048 * sc, height: 2048 * sc, left: cx - 1027 * sc, top: cy - 1143 * sc, transformOrigin: `${1027 * sc}px ${1143 * sc}px`, transform: `rotate(${angle}deg)`, filter: 'drop-shadow(5px 12px 8px rgba(0,0,0,0.45))'}} />;
};
export const IntroA: React.FC = () => ( // 0:00 – close on the oil-rig panel, tilted
  <Paper><Camera scale={2.3} tilt={38} spin={-20} fx={420} fy={1350}><World needleAngle={-60} /></Camera>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(247,239,226,0.9), transparent 22%)'}} /></Paper>
);
export const IntroB: React.FC = () => ( // 0:03 – pulling back, rings rotate, the panels read as one connected world
  <Paper><Camera scale={1.25} tilt={40} spin={-60} fx={540} fy={1150}><World needleAngle={110} /></Camera>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(247,239,226,0.85), transparent 20%, transparent 85%, rgba(234,219,196,0.8))'}} /></Paper>
);
export const IntroC: React.FC = () => ( // 0:06 – top-down: the commodity rings form a compass dial
  <Paper><Camera scale={0.82} tilt={0} spin={-90} fx={540} fy={900}><World needleAngle={128} /></Camera>
  </Paper>
);

/* ============ Card frame: the same curved panels now sit in two corners ============ */
const cornerSegs = (base: number, ids: string[]): SSeg[] => ids.flatMap((id, i): SSeg[] => {
  const turn = Math.floor(i / 2), t1 = base + turn * 360 + (i % 2) * 44, t2 = t1 + 40;
  const p: SSeg = id === '~' ? {t1, t2, k1: 1, k2: 1.55, kind: 'glass'} : {t1, t2, k1: 1, k2: 1.55, img: id};
  return [p, {t1: t1 - 1.5, t2: t2 + 1.5, k1: 1.6, k2: 1.665, kind: i % 2 ? 'navy' : 'copper'}];
});
const TLS = () => cornerSegs(92, CFG.cornersTL);
const BRS = () => cornerSegs(272, CFG.cornersBR);
// trail of panels flowing out of a corner spiral: small -> large, strong -> faint
type TrailP = {img: string; a: number; span: number; r1: number; r2: number; op: number; blur: number};
// panels hug the card edge: centre of each panel sits ~off px from the side, so text stays clear
const trail = (ids: string[], side: 1 | -1, off: number): TrailP[] => ids.map((img, i) => {
  const r1 = 380 + i * 215 + i * i * 8, r2 = r1 + 130 + i * 40, rm = (r1 + r2) / 2;
  const d = (Math.asin(Math.min(0.95, off / rm)) * 180) / Math.PI;
  return {img, a: side === 1 ? 180 - d : 360 - d + 0, span: ((150 + i * 26) / r1) * 57.3, r1, r2, op: 1 - i * 0.14, blur: i * 1.1};
});
const Trail: React.FC<{cx: number; cy: number; items: TrailP[]; prefix: string}> = ({cx, cy, items, prefix}) => (
  <g>{items.map((t, i) => (
    <g key={i} opacity={t.op} style={{filter: t.blur ? `blur(${t.blur}px)` : undefined}}>
      <Rings cx={cx} cy={cy} segs={[{r1: t.r1, r2: t.r2, a1: t.a - t.span / 2, a2: t.a + t.span / 2, img: t.img}, {r1: t.r2 + 10, r2: t.r2 + 22, a1: t.a - t.span / 2 + 1, a2: t.a + t.span / 2 + 3, kind: i % 2 ? 'navy' : 'copper'}]} prefix={`${prefix}${i}`} />
    </g>
  ))}</g>
);
// big glossy crescents sweeping up around the centre (like the reference card)
const Sweep: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="swA" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" /><stop offset="0.6" stopColor="#F3E6D2" stopOpacity="0.7" /><stop offset="1" stopColor="#E2CCAA" stopOpacity="0.2" /></linearGradient>
      <linearGradient id="swB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E9D6B8" stopOpacity="0.0" /><stop offset="0.5" stopColor="#D9BE97" stopOpacity="0.55" /><stop offset="1" stopColor="#C88A5A" stopOpacity="0.0" /></linearGradient>
    </defs>
    <path d="M -80 1560 C 120 1180, 420 980, 760 860 C 900 810, 1020 790, 1160 800 L 1160 870 C 980 880, 820 930, 660 1020 C 420 1150, 220 1350, 60 1640 Z" fill="url(#swA)" filter="url(#panelShadowLow)" />
    <path d="M -80 1560 C 120 1180, 420 980, 760 860 C 900 810, 1020 790, 1160 800" stroke="url(#goldRim)" strokeWidth={3} fill="none" />
    <path d="M -80 420 C 160 300, 520 360, 760 560 C 900 680, 1000 820, 1160 920" stroke="url(#goldRim)" strokeWidth={1.6} fill="none" opacity={0.7} />
    <path d="M -80 380 C 200 230, 560 290, 800 520 C 940 650, 1040 780, 1160 850 L 1160 920 C 1000 820, 900 680, 760 560 C 520 360, 160 300, -80 420 Z" fill="url(#swB)" />
  </g>
);
// double gold frame that curves around the two corner spirals.
// Đoạn cong ở góc bám theo mép ngoài của vòng xoắn ảnh (cách đều GAP px) nên luôn song song với vòng ảnh ở mọi cảnh.
const FRAME_GAP = 30; // khoảng cách mép ngoài vòng ảnh → đường viền vàng đậm
const SPG = {r0: 210, g: 1.73, rim: 1.665};
const spiralOuter = (a: number, k: number) => SPG.r0 * Math.pow(SPG.g, (a + 720) / 360) * SPG.rim * k;
const cornerCurve = (c: {x: number; y: number}, a0: number, a1: number, k: number, off: number, inside: (p: number[]) => boolean, edgeHit: (p: number[], q: number[]) => number[] | null) => {
  const pts: number[][] = [];
  for (let i = 0; i <= 360; i++) {
    const a = a0 + ((a1 - a0) * i) / 360, r = spiralOuter(a, k) + off, rad = (a * Math.PI) / 180;
    pts.push([c.x + r * Math.sin(rad), c.y - r * Math.cos(rad)]);
  }
  // giữ đoạn nằm trong khung, cắt chính xác tại hai cạnh thẳng
  const out: number[][] = [];
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i], ip = inside(p), iq = inside(q);
    if (ip && iq) { if (!out.length) out.push(p); out.push(q); }
    else if (ip !== iq) { const h = edgeHit(p, q); if (h) { if (ip) { if (!out.length) out.push(p); out.push(h); } else out.push(h); } }
  }
  return out;
};
const lerpHit = (p: number[], q: number[], axis: 0 | 1, v: number) => { const t = (v - p[axis]) / (q[axis] - p[axis]); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; };
const FrameLine: React.FC<{inset: number; off: number; k: number; w: number; op: number; draw?: number}> = ({inset: i, off, k, w, op, draw = 1}) => {
  const x0 = i, y0 = i, x1 = 1080 - i, y1 = 1920 - i;
  // góc trên trái: tâm (-50,-50), quét từ hướng xuống (cạnh trái) về hướng phải (cạnh trên)
  const tl = cornerCurve({x: -50, y: -50}, 230, 40, k, off, (p) => p[0] >= x0 && p[1] >= y0,
    (p, q) => ((p[0] < x0) !== (q[0] < x0) ? lerpHit(p, q, 0, x0) : lerpHit(p, q, 1, y0)));
  // góc dưới phải: tâm (1130,1970), quét từ hướng lên (cạnh phải) về hướng trái (cạnh dưới)
  const br = cornerCurve({x: 1130, y: 1970}, 410, 220, k, off, (p) => p[0] <= x1 && p[1] <= y1,
    (p, q) => ((p[0] > x1) !== (q[0] > x1) ? lerpHit(p, q, 0, x1) : lerpHit(p, q, 1, y1)));
  const L = (ps: number[][]) => ps.map((p) => `L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const s = tl[tl.length - 1], e = tl[0];
  const d = `M ${s[0].toFixed(1)} ${y0} L ${x1} ${y0} L ${x1} ${br[0][1].toFixed(1)} ${L(br)} L ${x0} ${y1} L ${x0} ${e[1].toFixed(1)} ${L(tl)} Z`;
  return <path d={d} fill="none" stroke="url(#goldRim)" strokeWidth={w} strokeLinejoin="round" opacity={op} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />;
};
// concave corner rings (like the reference card): a broad band of radial slabs on a big circle whose centre sits
// inside the card, so the inner edge curves toward the middle and leaves a large open centre
const C1 = {x: 830, y: 880}, C2 = {x: 332, y: 824}, GLOBE = {x: 30, y: 1890};
type Slab = string; // image id, or '~glass' / '~slate' / '~sand' for material slabs
// slabs grow from narrow (low end) to wide (high end); the low end is softly blurred and faded
const VIEW = {x: 0, y: 0, w: 1080, h: 1920};
const band = (aLow: number, aHigh: number, r: number, slabs: Slab[]): Seg[] => {
  const n = slabs.length, dir = Math.sign(aHigh - aLow);
  const weights = slabs.map((_, i) => 1 + i * 0.45); // narrow -> wide
  const total = weights.reduce((x, y) => x + y, 0), span = Math.abs(aHigh - aLow);
  const out: Seg[] = [];
  let acc = 0;
  slabs.forEach((sl, i) => {
    const w = (weights[i] / total) * span;
    const t1 = aLow + dir * (acc + 0.6), t2 = aLow + dir * (acc + w - 0.6);
    acc += w;
    const a1 = Math.min(t1, t2), a2 = Math.max(t1, t2);
    const r1 = r + [36, 10, 28, 0, 18, 6, 22][i % 7];
    const z = [0, 1, 0, 2, 1, 2, 1][i % 7];
    const blur = i === 0 ? 3 : i === 1 ? 1.2 : 0, op = i === 0 ? 0.6 : i === 1 ? 0.85 : 1;
    const base = {r1, r2: r + 520, a1, a2, z, blur, op, view: VIEW};
    out.push(sl.startsWith('~') ? {...base, r1: r1 + 12, kind: sl.slice(1) as Seg['kind']} : {...base, img: sl});
  });
  const lo = Math.min(aLow, aHigh), hi = Math.max(aLow, aHigh);
  out.push({r1: r - 34, r2: r - 6, a1: lo + 1, a2: hi + 1, kind: 'cream', z: 3});
  return out;
};
const TL_SLABS: Slab[] = ['B04', 'C01', 'C02', 'I03', 'C10', 'B01'];
const BR_SLABS: Slab[] = ['S01', 'C05', 'C06', 'B03', 'B02', 'I01'];
const GoldArc: React.FC<{c: {x: number; y: number}; r: number; a1: number; a2: number; w: number; op: number; draw: number}> = ({c, r, a1, a2, w, op, draw}) => {
  const p = (a: number) => [c.x + r * Math.sin((a * Math.PI) / 180), c.y - r * Math.cos((a * Math.PI) / 180)];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2} ${y2}`} stroke="url(#goldRim)" strokeWidth={w} fill="none" opacity={op} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />;
};
// ---- corner tiles, laid out after the reference card: straight-edged photo blocks stepped along a large curve. The curve
// (one big circle, centre inside the card) trims the blocks that reach it; the others stop short with straight edges, so the
// contour steps in and out. The low end of each band dissolves into the paper. ----
type Tile = {x: number; y: number; w: number; h: number; img?: string; kind?: 'slate' | 'navy'; ri: number; ro: number};
type Band = {cx: number; cy: number; r: number; fade: [number, number, number, number]; tiles: Tile[]; lines: number[]; taper?: [number, number, number]};
// each tile is cut by its own ring (inner/outer radius); ring width grows from the narrow tip to the wide end
const TL_BAND: Band = {cx: 737, cy: 833, r: 710, fade: [0, 770, 0, 420], lines: [-14, 34], tiles: [
  {x: 0, y: 522, w: 90, h: 300, kind: 'navy', ri: 716, ro: 805},
  {x: 0, y: 300, w: 158, h: 225, kind: 'slate', ri: 708, ro: 880},
  {x: 20, y: 30, w: 345, h: 400, img: 'B01', ri: 700, ro: 980},
  {x: 365, y: 25, w: 138, h: 330, img: 'C10', ri: 688, ro: 975},
  {x: 503, y: -40, w: 182, h: 240, kind: 'slate', ri: 735, ro: 890},
]};
const BR_BAND: Band = {cx: -199, cy: 382, r: 1448, fade: [720, 1760, 940, 1440], lines: [14, -34], tiles: [
  {x: 600, y: 1452, w: 245, h: 480, kind: 'slate', ri: 1462, ro: 1585},
  {x: 760, y: 1524, w: 321, h: 420, img: 'B03', ri: 1446, ro: 1725},
  {x: 845, y: 1118, w: 236, h: 404, img: 'I01', ri: 1432, ro: 1820},
]};
const outsideCircle = (b: Band) => `M -400 -400 H 1500 V 2400 H -400 Z M ${b.cx - b.r} ${b.cy} a ${b.r} ${b.r} 0 1 0 ${2 * b.r} 0 a ${b.r} ${b.r} 0 1 0 ${-2 * b.r} 0 Z`;
const arcD = (cx: number, cy: number, r: number, a1: number, a2: number) => {
  const p = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
  const [x1, y1] = p(a1), [x2, y2] = p(a2);
  return `M ${x1} ${y1} A ${r} ${r} 0 0 ${a2 > a1 ? 1 : 0} ${x2} ${y2}`;
};
// a bright highlight that runs along a gold line
const Glint: React.FC<{d: string; phase: number; w?: number}> = ({d, phase, w = 3}) => (
  <g>
    <path d={d} fill="none" stroke="#FFFFFF" strokeWidth={w * 4} strokeLinecap="round" pathLength={1} strokeDasharray="0.12 1.88" strokeDashoffset={-phase} style={{filter: 'blur(6px)'}} opacity={0.75} />
    <path d={d} fill="none" stroke="#FFF7E4" strokeWidth={w * 1.3} strokeLinecap="round" pathLength={1} strokeDasharray="0.07 1.93" strokeDashoffset={-phase - 0.025} opacity={0.95} />
  </g>
);
const Collage: React.FC<{band: Band; id: string; draw: number; area: number[]; glint: [number, number]; t: number; build?: number; dir: number}> = ({band, id, draw, area, glint, t, build = 1, dir}) => (
  <g>
    <defs>
      <linearGradient id={`fade${id}`} gradientUnits="userSpaceOnUse" x1={band.fade[0]} y1={band.fade[1]} x2={band.fade[2]} y2={band.fade[3]}>
        <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.25" stopColor="#fff" stopOpacity="0.08" /><stop offset="0.7" stopColor="#fff" stopOpacity="0.75" /><stop offset="1" stopColor="#fff" stopOpacity="1" />
      </linearGradient>
      <linearGradient id={`vfade${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="1620" x2="0" y2="1900"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" /></linearGradient>
      <mask id={`vm${id}`} maskUnits="userSpaceOnUse" x="-400" y="-400" width="1900" height="2800"><rect x="-400" y="-400" width="1900" height="2800" fill={`url(#vfade${id})`} /></mask>
      <mask id={`mask${id}`} maskUnits="userSpaceOnUse" x="-400" y="-400" width="1900" height="2800"><g mask={`url(#vm${id})`}><rect x="-400" y="-400" width="1900" height="2800" fill={`url(#fade${id})`} /></g></mask>
      <linearGradient id="goldLine" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1080" y2="1920"><stop offset="0" stopColor="#F7E2B8" /><stop offset="0.35" stopColor="#DDB77C" /><stop offset="0.6" stopColor="#F9EACB" /><stop offset="1" stopColor="#D2A86C" /></linearGradient>
      <clipPath id={`cut${id}`}><path d={outsideCircle(band)} clipRule="evenodd" /></clipPath>
      <clipPath id={`taper${id}`}><path d={band.taper ? `M -400 -400 H 1500 V 2400 H -400 Z M ${band.taper[0] - band.taper[2]} ${band.taper[1]} a ${band.taper[2]} ${band.taper[2]} 0 1 0 ${2 * band.taper[2]} 0 a ${band.taper[2]} ${band.taper[2]} 0 1 0 ${-2 * band.taper[2]} 0 Z` : 'M -400 -400 H 1500 V 2400 H -400 Z'} clipRule="evenodd" /></clipPath>
      <clipPath id={`area${id}`}><rect x={area[0]} y={area[1]} width={area[2]} height={area[3]} /></clipPath>
    </defs>
    <g mask={`url(#mask${id})`}>
      <g><g>
        {band.tiles.map((t, i) => (
          <g key={i} {...(() => {
            // brick-by-brick build: each tile slides in from outside the card and settles, staggered
            const n = band.tiles.length, st = i / Math.max(1, n - 1); // bottom tile first, rising to the top
            const raw = Math.min(1, Math.max(0, (build - st * 0.55) / 0.45));
            const e = 1 - Math.pow(1 - raw, 3);
            const d = (1 - e) * 90 * dir;
            return {opacity: e, transform: `translate(${d} ${d})`};
          })()}><g filter="url(#panelShadow)"><g clipPath={`url(#ring${id}${i})`}>
            <clipPath id={`ring${id}${i}`}><path clipRule="evenodd" d={`M ${band.cx - t.ro} ${band.cy} a ${t.ro} ${t.ro} 0 1 0 ${2 * t.ro} 0 a ${t.ro} ${t.ro} 0 1 0 ${-2 * t.ro} 0 Z M ${band.cx - t.ri} ${band.cy} a ${t.ri} ${t.ri} 0 1 0 ${2 * t.ri} 0 a ${t.ri} ${t.ri} 0 1 0 ${-2 * t.ri} 0 Z`} /></clipPath>
            <clipPath id={`tile${id}${i}`}><rect x={t.x} y={t.y} width={t.w} height={t.h} /></clipPath>
            {t.img ? <image href={sf(SLOTS[t.img]?.src ?? '')} x={t.x} y={t.y} width={t.w} height={t.h} preserveAspectRatio="xMidYMid slice" />
              : <rect x={t.x} y={t.y} width={t.w} height={t.h} fill={t.kind === 'navy' ? 'url(#navyFill)' : 'url(#slateFill)'} />}
            {!t.img && (
              <g clipPath={`url(#tile${id}${i})`}>
                <circle cx={band.cx} cy={band.cy} r={(t.ri + t.ro) / 2} fill="none" stroke="#FFFFFF" strokeWidth={26} opacity={0.13} style={{filter: 'blur(5px)'}} />
                <circle cx={band.cx} cy={band.cy} r={(t.ri + t.ro) / 2} fill="none" stroke="#FFF6E6" strokeWidth={2.2} opacity={0.75} />
              </g>
            )}
            <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#gloss)" style={{mixBlendMode: 'soft-light'}} />
            <g clipPath={`url(#tile${id}${i})`}>
              <circle cx={band.cx} cy={band.cy} r={t.ro - 1.5} fill="none" stroke="#FFF8EE" strokeOpacity={0.8} strokeWidth={2.5} />
              <circle cx={band.cx} cy={band.cy} r={t.ri + 1.5} fill="none" stroke="#FFF8EE" strokeOpacity={0.8} strokeWidth={2.5} />
            </g>
          </g></g></g>
        ))}
      </g></g>
      <g clipPath={`url(#area${id})`}>
        {band.lines.map((d, i) => <circle key={i} cx={band.cx} cy={band.cy} r={band.r + d} fill="none" stroke="url(#goldLine)" strokeWidth={i ? 1.3 : 2.2} opacity={i ? 0.7 : 1} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />)}
        {draw > 0.95 && band.lines.map((d, i) => <Glint key={`g${i}`} d={arcD(band.cx, band.cy, band.r + d, glint[0], glint[1])} phase={((t * (i ? 0.006 : 0.008) + (i ? 0.45 : 0.12)) % 1.4) - 0.2} w={i ? 2 : 3} />)}
      </g>
    </g>
  </g>
);
export const FRAME_GEO = {
  invite: {tl: [0, 0], br: [30, 170], globeR: 400},
  event: {tl: [0, 0], br: [40, 190], globeR: 240},
  final: {tl: [-30, -40], br: [150, 120], globeR: 280},
};
// scattered twinkles and soft gold bokeh over the paper
const SPARKS = [[150, 640, 16], [905, 330, 12], [960, 760, 18], [120, 1180, 11], [700, 1700, 14], [470, 120, 9], [1000, 980, 10], [300, 1560, 12], [860, 1380, 9], [60, 900, 13], [620, 470, 7], [420, 1820, 10]];
const BOKEH = [[980, 520, 26], [90, 1010, 34], [840, 1560, 22], [260, 700, 18], [1020, 1250, 30], [560, 1650, 20], [180, 1700, 26]];
const Star: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={s * 1.3} fill="#E9B46C" opacity={0.45} style={{filter: 'blur(6px)'}} />
    <path d={`M 0 ${-s} Q ${s * 0.12} ${-s * 0.12} ${s} 0 Q ${s * 0.12} ${s * 0.12} 0 ${s} Q ${-s * 0.12} ${s * 0.12} ${-s} 0 Q ${-s * 0.12} ${-s * 0.12} 0 ${-s} Z`} fill="#F3C57E" />
    <circle r={s * 0.18} fill="#FFFFFF" />
  </g>
);
const Sparkles: React.FC<{t: number; o: number}> = ({t, o}) => (
  <g>
    {BOKEH.map(([x, y, r], i) => <circle key={`b${i}`} cx={x + Math.sin(t * 0.02 + i) * 8} cy={y - (t * 0.15 + i * 40) % 60} r={r} fill={C.copperLight} opacity={o * (0.18 + 0.1 * Math.sin(t * 0.05 + i * 1.7))} style={{filter: 'blur(8px)'}} />)}
    {SPARKS.map(([x, y, sz], i) => <Star key={i} x={x} y={y} s={sz} o={o * (0.35 + 0.65 * Math.abs(Math.sin(t * 0.07 + i * 1.3)))} />)}
  </g>
);
// ---- layout switch: 'v1' = spiral corners + curved double frame (ver01), 'v2' = image bands (ver02) ----
export const LayoutCtx = React.createContext<'v1' | 'v2'>('v2');
const FrameV1: React.FC<{small?: boolean; event?: boolean; k?: number; R?: number; draw?: number; grow?: number; turn?: number; rose?: number; roseY?: number}> = ({small, event, k: kO, R: RO, draw = 1, grow = 1, turn = 0, rose = 1, roseY}) => {
  const kF = kO ?? (small ? 0.27 : event ? 0.29 : 0.33); // cỡ vòng ảnh khi đã dựng xong – khung bám theo cỡ này
  const k = kF * grow;
  void RO;
  const ry = roseY ?? (small ? 880 : 920);
  return (
    <>
    <div style={{position: 'absolute', left: 540 - 430, top: ry - 430, width: 860, height: 860, transform: `rotate(${(1 - rose) * -40}deg) scale(${0.9 + 0.1 * rose})`}}><CompassRose size={860} opacity={0.13 * rose} labels={false} /></div>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <RingDefs />
      <FrameLine inset={44} off={FRAME_GAP} k={kF} w={3} op={0.9} draw={draw} />
      <FrameLine inset={58} off={FRAME_GAP + 14} k={kF} w={1.2} op={0.6} draw={draw} />
      <g transform={`translate(-50 -50) rotate(${turn}) scale(${k})`}><Spiral cx={0} cy={0} r0={210} g={1.73} segs={TLS()} prefix="tl1" guide={[80, 1000]} /></g>
      <g transform={`translate(1130 1970) rotate(${turn}) scale(${k})`}><Spiral cx={0} cy={0} r0={210} g={1.73} segs={BRS()} prefix="br1" guide={[260, 1180]} /></g>
    </svg>
    </>
  );
};
export const CardFrame: React.FC<{t?: number; small?: boolean; event?: boolean; variant?: 'A' | 'B'; globeR?: number; tlOff?: number[]; brOff?: number[]; draw?: number; grow?: number; build?: number; turn?: number; rose?: number; roseY?: number; k?: number; R?: number}> = (p) => {
  const layout = React.useContext(LayoutCtx);
  if (layout === 'v1') return <FrameV1 small={p.small} event={p.event} k={p.k} R={p.R} draw={p.draw} grow={p.grow} turn={p.turn} rose={p.rose} roseY={p.roseY} />;
  const {small, event, draw = 1, grow = 1, turn = 0, rose = 1, roseY, t = 40, build = 1} = p;
  const g = small ? FRAME_GEO.final : event ? FRAME_GEO.event : FRAME_GEO.invite;
  const tlOff = p.tlOff ?? g.tl, brOff = p.brOff ?? g.br, globeR = p.globeR ?? g.globeR;
  const ry = roseY ?? (small ? 880 : 920);
  const slide = (1 - grow) * 320;
  const o = Math.min(1, grow * 1.4);
  return (
    <>
    <div style={{position: 'absolute', left: 540 - 430, top: ry - 430, width: 860, height: 860, transform: `rotate(${(1 - rose) * -40}deg) scale(${0.9 + 0.1 * rose})`}}><CompassRose size={860} opacity={0.12 * rose} labels={false} /></div>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <RingDefs />
      <defs>
        <clipPath id="globeClip"><circle cx={GLOBE.x} cy={GLOBE.y} r={globeR} /></clipPath>
        <radialGradient id="globeVeil" cx="65%" cy="30%" r="80%"><stop offset="0" stopColor="#FFF8EC" stopOpacity="0.15" /><stop offset="1" stopColor="#F3E6D2" stopOpacity="0.55" /></radialGradient>
      </defs>
      <g opacity={o * 0.9} transform={`translate(${-slide * 0.6} ${slide * 0.6}) rotate(${turn * 0.5} ${GLOBE.x} ${GLOBE.y})`} filter="url(#panelShadowHigh)">
        <image href={sf('assets/compass-disc.png')} x={GLOBE.x - globeR} y={GLOBE.y - globeR} width={globeR * 2} height={globeR * 2} clipPath="url(#globeClip)" style={{filter: 'saturate(0.55) brightness(1.08)'}} />
        <circle cx={GLOBE.x} cy={GLOBE.y} r={globeR} fill="url(#globeVeil)" />
        <circle cx={GLOBE.x} cy={GLOBE.y} r={globeR} fill="none" stroke="url(#goldRim)" strokeWidth={3} />
      </g>
      {/* compass needle (same AI needle as the intro), settles at 38deg */}
      {(() => {
        const L = globeR * 0.78, sc = L / (1143 - 273);
        const ang = 38 + (1 - Math.min(1, grow)) * 160;
        return (
          <g opacity={o} transform={`translate(${GLOBE.x - slide * 0.6} ${GLOBE.y + slide * 0.6}) rotate(${ang})`}>
            <image href={sf('assets/N01-cut.png')} x={-1027 * sc + 10} y={-1143 * sc + 14} width={2048 * sc} height={2048 * sc} style={{filter: 'brightness(0) blur(5px)'}} opacity={0.35} />
            <image href={sf('assets/N01-cut.png')} x={-1027 * sc} y={-1143 * sc} width={2048 * sc} height={2048 * sc} />
          </g>
        );
      })()}
      <g transform={`translate(${tlOff[0]} ${tlOff[1]})`}><Collage band={TL_BAND} id="tl" draw={draw} area={[-200, -200, 900, 1000]} glint={[248, 372]} t={t} build={build} dir={-1} /></g>
      <g transform={`translate(${brOff[0]} ${brOff[1]})`}><Collage band={BR_BAND} id="br" draw={draw} area={[460, 960, 800, 1000]} glint={[163, 112]} t={t} build={build} dir={1} /></g>
    </svg>
    </>
  );
};

const Halo: React.FC<{x?: number; y: number; w: number; h: number}> = ({x = 540, y, w, h}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, borderRadius: '50%', background: `radial-gradient(closest-side, ${C.paper} 0%, rgba(247,239,226,0.92) 45%, rgba(247,239,226,0.6) 70%, rgba(247,239,226,0) 100%)`, backdropFilter: 'blur(6px)', WebkitMaskImage: 'radial-gradient(closest-side, #000 60%, transparent 100%)'}} />
);
const Glow: React.FC<{y: number; w: number; h: number}> = ({y, w, h}) => (
  <div style={{position: 'absolute', left: 540 - w / 2, top: y - h / 2, width: w, height: h, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(250,244,234,0.55) 0%, rgba(250,244,234,0.35) 45%, rgba(250,244,234,0) 100%)', filter: 'blur(14px)'}} />
);
// danh xưng / họ tên / chức vụ as one centred group, so short or long names never overlap
// Khối khách mời: đặt từ trên xuống (luôn cách dòng "TRÂN TRỌNG KÍNH MỜI" một khoảng cố định), nội dung dài thì
// chiếm thêm chỗ phía dưới; nếu vẫn vượt quá vùng [top, bottom] thì thu nhỏ đều cả khối cho vừa.
const GuestBlock: React.FC<{guest: Guest; top: number; bottom: number; sizes: [number, number, number]; gaps: [number, number]}> = ({guest, top, bottom, sizes, gaps}) => {
  const maxW = 1080 - (SAFE - 40) * 2;
  const est = (k: number) => {
    const [s0, s1, s2] = sizes.map((x) => x * k);
    let h = s1 * 1.1;
    if (guest.danhXung) h += s0 * 1.1 + gaps[0] + s1 * 0.3;
    if (guest.chucVuDonVi) {
      const w = measureText({text: guest.chucVuDonVi, fontFamily: 'Google Sans Flex', fontSize: s2, fontWeight: '500'}).width;
      h += gaps[1] + Math.max(1, Math.ceil((w * 1.04) / maxW)) * s2 * 1.25;
    }
    return h;
  };
  let k = 1;
  while (k > 0.7 && est(k) > bottom - top) k -= 0.02;
  const [s0, s1, s2] = sizes.map((x) => x * k);
  return (
    <div style={{position: 'absolute', left: SAFE - 40, right: SAFE - 40, top, height: bottom - top, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center'}}>
      {guest.danhXung ? <div style={{fontSize: s0, fontWeight: 500, color: C.mute, lineHeight: 1.1, marginBottom: gaps[0] + s1 * 0.3}}>{guest.danhXung}</div> : null}
      <GuestName text={guest.hoTen} max={s1} width={maxW - 20} />
      {guest.chucVuDonVi ? <div style={{fontSize: s2, fontWeight: 500, color: C.mute, lineHeight: 1.25, marginTop: gaps[1], maxWidth: maxW, textWrap: 'balance'} as React.CSSProperties}>{guest.chucVuDonVi}</div> : null}
    </div>
  );
};
const Shell: React.FC<{bare?: boolean; frame: React.ReactNode; children: React.ReactNode}> = ({bare, frame, children}) =>
  bare ? <AbsoluteFill style={{color: C.text, fontFamily: 'Google Sans Flex'}}>{children}</AbsoluteFill> : <Paper>{frame}{children}</Paper>;

export const CardInvite: React.FC<{guest: Guest; variant?: 'A' | 'B'; bare?: boolean; noLogo?: boolean}> = ({guest, variant, bare, noLogo}) => (
  <Shell bare={bare} frame={<CardFrame variant={variant} />}>
    <Glow y={300} w={640} h={300} />
    <Center style={{filter: 'drop-shadow(0 0 10px #F7EFE2) drop-shadow(0 0 22px #F7EFE2) drop-shadow(0 0 40px rgba(247,239,226,0.9))'}} top={250}><BrandLogo name="vtv" height={96} style={{margin: '0 auto'}} /><div style={{height: 18}} /><Eyebrow size={25} color="#3A3B45">{COPY.vtvUnit[0]}<br />{COPY.vtvUnit[1]}</Eyebrow></Center>
    <Center top={610}><Eyebrow size={30} color={C.mute}>{COPY.invite}</Eyebrow><div style={{height: 24}} /><Rule w={260} /></Center>
    <GuestBlock guest={guest} top={714} bottom={1066} sizes={[34, 96, 32]} gaps={[4, 8]} />
    <Center top={1090}><Eyebrow size={26}>{COPY.lead} {COPY.eventTitle}</Eyebrow></Center>
    {!noLogo && <Center top={1155}><ShinyLogo width={600} style={{margin: '0 auto'}} /></Center>}
  </Shell>
);

const AGENDA_LINES: Record<string, React.ReactNode> = {
  '10:25': <>Tọa đàm “Hàng hoá Việt trên bàn cờ định giá”<br />& Hỏi – Đáp</>,
};
export const CardEvent: React.FC<{variant?: 'A' | 'B'; bare?: boolean}> = ({variant, bare}) => (
  <Shell bare={bare} frame={<CardFrame event variant={variant} />}>
    <Glow y={335} w={620} h={260} />
    <Center style={{filter: 'drop-shadow(0 0 10px #F7EFE2) drop-shadow(0 0 22px #F7EFE2) drop-shadow(0 0 40px rgba(247,239,226,0.9))'}} top={290}><ShinyLogo width={390} start={375} style={{margin: '0 auto'}} /></Center>
    <Center top={490}><Eyebrow size={24}>{COPY.talkLabel}</Eyebrow><div style={{fontWeight: 700, fontSize: 54, lineHeight: 1.2, marginTop: 14, color: C.navy, whiteSpace: 'nowrap'}}>{CFG.talkLines[0]}<br />{CFG.talkLines[1]}</div></Center>
    <div style={{position: 'absolute', left: 0, right: 0, top: 765, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div style={{background: C.navy, color: C.cream, padding: '20px 40px 18px', display: 'flex', alignItems: 'center', boxShadow: '0 14px 30px rgba(19,40,74,0.22)'}}>
        <div style={{textAlign: 'center', paddingRight: 32}}>
          <div style={{fontSize: 58, fontWeight: 800, lineHeight: 1}}>{COPY.time}</div>
          <div style={{fontSize: 19, fontWeight: 700, letterSpacing: '0.14em', color: C.copperLight, marginTop: 9}}>{COPY.weekday}</div>
        </div>
        <div style={{width: 2, alignSelf: 'stretch', background: C.copper}} />
        <div style={{textAlign: 'center', paddingLeft: 32}}>
          <div style={{fontSize: 58, fontWeight: 800, lineHeight: 1}}>{COPY.date}</div>
          <div style={{fontSize: 19, fontWeight: 700, letterSpacing: '0.12em', color: C.copperLight, marginTop: 9}}>{COPY.welcome.toUpperCase()}</div>
        </div>
      </div>
      <div style={{textAlign: 'center', lineHeight: 1.4}}>
        <div style={{fontSize: 30, fontWeight: 800, whiteSpace: 'nowrap'}}>{COPY.venue1} | <span style={{color: C.copper}}>{COPY.venue3}</span></div>
        <div style={{fontSize: 26, color: C.mute}}>{COPY.venue2}</div>
      </div>
    </div>
    <Center top={1065}><div style={{fontSize: 24, fontWeight: 600, letterSpacing: '0.14em', color: C.copper}}>NỘI DUNG CHƯƠNG TRÌNH</div><div style={{height: 18}} /><Rule w={260} /></Center>
    <div style={{position: 'absolute', left: 80, right: 50, top: 1180}}>
      <div style={{position: 'absolute', left: 188, top: 20, bottom: 54, width: 2, background: `linear-gradient(180deg, ${C.copper}, ${C.copperLight})`}} />
      {COPY.agenda.map(([t, x]) => (
        <div key={t} style={{position: 'relative', display: 'flex', alignItems: 'flex-start', marginBottom: 40}}>
          <div style={{width: 150, textAlign: 'right', fontSize: 31, fontWeight: 700, color: C.copper, lineHeight: 1.15, flex: 'none'}}>{t}</div>
          <div style={{width: 80, flex: 'none', display: 'flex', justifyContent: 'center', paddingTop: 6}}>
            <div style={{width: 30, height: 30, borderRadius: 15, background: C.paper, border: `3px solid ${C.copper}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><div style={{width: 12, height: 12, borderRadius: 6, background: C.navy}} /></div>
          </div>
          <div style={{fontSize: 28, fontWeight: 500, lineHeight: 1.35, paddingTop: 2, whiteSpace: x.includes('\n') ? 'nowrap' : 'normal'}}>{lines(x).map((l, j) => <React.Fragment key={j}>{j ? <br /> : null}{l}</React.Fragment>)}</div>
        </div>
      ))}
    </div>
  </Shell>
);

const Partners: React.FC<{bottom: number; scale?: number}> = ({bottom, scale = 1}) => (
  <div style={{position: 'absolute', left: SAFE - 40, right: SAFE - 40, bottom, display: 'flex', justifyContent: 'space-between', borderTop: `1px solid rgba(200,138,90,0.55)`, paddingTop: 26 * scale}}>
    {COPY.partners.map(([k, v]) => (
      <div key={k} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale}}>
        <div style={{fontSize: 18 * scale, fontWeight: 700, letterSpacing: '0.12em'}}>{k}</div>
        <div style={{height: 64 * scale, display: 'flex', alignItems: 'center'}}><BrandLogo name={v.toLowerCase() as 'vtv' | 'mxv' | 'moneyverse'} height={(v === 'VTV' ? 58 : v === 'MXV' ? 32 : 28) * scale} maxWidth={240 * scale} /></div>
      </div>
    ))}
  </div>
);

const BottomBand: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 232, background: 'linear-gradient(180deg, #FFFDF8, #F6EDDF)', borderTop: `3px solid ${C.copper}`, boxShadow: '0 -16px 40px rgba(19,40,74,0.12)'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 8, height: 1, background: C.copperLight}} />
    <div style={{position: 'absolute', left: SAFE - 70, right: SAFE - 70, top: 9, bottom: 0, paddingTop: 40, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start'}}>
      {COPY.partners.map(([k, v], i) => (
        <div key={k} style={{flex: v === 'VTV' ? 1.35 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, borderLeft: i ? `1px solid rgba(200,138,90,0.5)` : 'none'}}>
          <div style={{fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', color: C.copper, textAlign: 'center'}}>{k}</div>
          <div style={{height: v === 'VTV' ? 66 : 96, display: 'flex', alignItems: 'center'}}><BrandLogo name={v.toLowerCase() as 'vtv' | 'mxv' | 'moneyverse'} height={v === 'VTV' ? 64 : v === 'MXV' ? 46 : 36} maxWidth={250} /></div>
          {v === 'VTV' && <div style={{fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', color: '#3A3B45', textAlign: 'center', lineHeight: 1.3, marginTop: -4}}>{COPY.vtvUnit[0]}<br />{COPY.vtvUnit[1]}</div>}
        </div>
      ))}
    </div>
  </div>
);

export const CardFinal: React.FC<{guest: Guest; variant?: 'A' | 'B'; bare?: boolean}> = ({guest, variant, bare}) => (
  <Shell bare={bare} frame={<CardFrame small variant={variant} />}>
    <Glow y={211} w={600} h={250} />
    <Center style={{filter: 'drop-shadow(0 0 10px #F7EFE2) drop-shadow(0 0 22px #F7EFE2) drop-shadow(0 0 40px rgba(247,239,226,0.9))'}} top={165}><BrandLogo name="vtv" height={72} style={{margin: '0 auto'}} /><div style={{height: 12}} /><Eyebrow size={22}>{COPY.vtvUnit[1]}</Eyebrow></Center>
    <Center top={316}><Eyebrow size={24} color={C.mute}>{COPY.invite}</Eyebrow></Center>
    <GuestBlock guest={guest} top={370} bottom={616} sizes={[28, 84, 27]} gaps={[2, 6]} />
    <Center top={631}><Eyebrow size={21}>{COPY.lead} {COPY.eventTitle}</Eyebrow></Center>
    <Center top={663}><ShinyLogo width={485} start={515} style={{margin: '0 auto'}} /></Center>
    <Center top={893}><Eyebrow size={20}>{COPY.talkLabel}</Eyebrow><div style={{fontWeight: 700, fontSize: 47, lineHeight: 1.2, marginTop: 8, color: C.navy, whiteSpace: 'nowrap'}}>{CFG.talkLines[0]}<br />{CFG.talkLines[1]}</div></Center>
    <div style={{position: 'absolute', left: SAFE + 20, right: SAFE + 20, top: 1073, background: C.navy, color: C.cream, padding: '24px 0 20px', display: 'flex', justifyContent: 'center', boxShadow: '0 14px 30px rgba(19,40,74,0.22)'}}>
      {[[COPY.time, COPY.weekday], [COPY.date, COPY.welcome.toUpperCase()]].map(([a, b], i) => (
        <div key={i} style={{padding: '0 32px', textAlign: 'center', borderLeft: i ? `2px solid ${C.copper}` : 'none'}}>
          <div style={{fontSize: 60, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap'}}>{a}</div>
          <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', color: C.copperLight, marginTop: 9}}>{b}</div>
        </div>
      ))}
    </div>
    <Center top={1239}>
      <div style={{fontSize: 28, fontWeight: 700, whiteSpace: 'nowrap'}}>{COPY.venue1} | {COPY.venue3}</div>
      <div style={{fontSize: 25, color: C.mute, marginTop: 6}}>{COPY.venue2}</div>
    </Center>
    <Center top={1338}><div style={{fontWeight: 700, fontSize: 25, letterSpacing: '0.14em', color: C.copper}}>{COPY.closing}</div></Center>
    {/* lệch sang trái 70px và nhích lên để cách đều viền cong của vòng ảnh góc dưới phải */}
    <div style={{position: 'absolute', left: SAFE - 30, right: SAFE - 30, top: 1398, paddingRight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 38}}>
      <div style={{flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        <div style={{padding: 10, background: '#FFFDF8', outline: `1.5px solid ${C.copper}`, outlineOffset: 6}}><Img src={sf(CFG.qrImage)} style={{width: 150, height: 150, display: 'block'}} /></div>
        <div style={{fontSize: 17, lineHeight: 1.3, color: C.mute, textAlign: 'center'}}>{lines(CFG.qrCaption).map((l, j) => <React.Fragment key={j}>{j ? <br /> : null}{l}</React.Fragment>)}</div>
      </div>
      <div style={{width: 2, height: 170, background: `linear-gradient(180deg, transparent, ${C.copper}, transparent)`, flex: 'none'}} />
      <div style={{fontSize: 28, lineHeight: 1.55, flex: 'none'}}>
        <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: C.copper}}>{CFG.contactTitle}</div>
        {CFG.contacts.filter(Boolean).map((c, j) => <div key={j} style={{fontSize: 28, fontWeight: 400, color: C.navy, marginTop: j ? 0 : 8, whiteSpace: 'nowrap'}}>{c}</div>)}
      </div>
    </div>
    <BottomBand />
  </Shell>
);
