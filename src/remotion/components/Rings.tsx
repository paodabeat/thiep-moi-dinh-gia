import {sf} from '../sf';
import React from 'react';
import {C} from '../theme';
import {SLOTS} from '../assets';

// ---- geometry: 0deg = up, clockwise ----
const pt = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)];
export const sector = (cx: number, cy: number, r1: number, r2: number, a1: number, a2: number) => {
  const large = a2 - a1 > 180 ? 1 : 0;
  const [x1, y1] = pt(cx, cy, r2, a1), [x2, y2] = pt(cx, cy, r2, a2), [x3, y3] = pt(cx, cy, r1, a2), [x4, y4] = pt(cx, cy, r1, a1);
  return `M${x1},${y1} A${r2},${r2} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 0 ${x4},${y4} Z`;
};
const arc = (cx: number, cy: number, r: number, a1: number, a2: number) => {
  const [x1, y1] = pt(cx, cy, r, a1), [x2, y2] = pt(cx, cy, r, a2);
  return `M${x1},${y1} A${r},${r} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2},${y2}`;
};
const bbox = (cx: number, cy: number, r1: number, r2: number, a1: number, a2: number) => {
  const xs: number[] = [], ys: number[] = [];
  for (let a = a1; a <= a2; a += 2) for (const r of [r1, r2]) { const [x, y] = pt(cx, cy, r, a); xs.push(x); ys.push(y); }
  const x = Math.min(...xs), y = Math.min(...ys);
  return {x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y};
};

export type Seg = {r1: number; r2: number; a1: number; a2: number; img?: string; kind?: 'photo' | 'glass' | 'copper' | 'navy' | 'cream' | 'teal' | 'sage' | 'slate' | 'sand'; z?: number; view?: {x: number; y: number; w: number; h: number}; blur?: number; op?: number; focusY?: number};

// One curved, bevelled 3D panel: photo (or material) clipped to an annular sector, gold rim, gloss and shadow.
const Panel: React.FC<{cx: number; cy: number; s: Seg; id: string}> = ({cx, cy, s, id}) => {
  const d = sector(cx, cy, s.r1, s.r2, s.a1, s.a2);
  let b = bbox(cx, cy, s.r1, s.r2, s.a1, s.a2);
  if (s.view) { // fit the photo to the part of the slab that is actually on screen
    const x0 = Math.max(b.x, s.view.x), y0 = Math.max(b.y, s.view.y);
    const x1 = Math.min(b.x + b.w, s.view.x + s.view.w), y1 = Math.min(b.y + b.h, s.view.y + s.view.h);
    if (x1 > x0 && y1 > y0) b = {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
  }
  const src = s.img ? SLOTS[s.img]?.src ?? s.img : undefined;
  const kind = s.kind ?? (s.img ? 'photo' : 'glass');
  const fills: Record<string, string> = {glass: 'url(#glassFill)', copper: 'url(#copperFill)', navy: 'url(#navyFill)', cream: 'url(#creamFill)', teal: 'url(#tealFill)', sage: 'url(#sageFill)', slate: 'url(#slateFill)', sand: 'url(#sandFill)'};
  return (
    <g opacity={s.op ?? 1} style={s.blur ? {filter: `blur(${s.blur}px)`} : undefined}>
    <g filter="url(#panelShadow)">
      <clipPath id={`c${id}`}><path d={d} /></clipPath>
      {kind === 'photo' && src ? (
        <image href={sf(src)} x={b.x} y={b.y} width={b.w} height={b.h} preserveAspectRatio={`xMidY${s.focusY === 0 ? 'Min' : s.focusY === 2 ? 'Max' : 'Mid'} slice`} clipPath={`url(#c${id})`} />
      ) : kind === 'photo' ? (
        <path d={d} fill={SLOTS[s.img!]?.color ?? '#888'} />
      ) : (
        <path d={d} fill={fills[kind]} />
      )}
      {/* gloss: light falls on the outer edge, inner edge in shade -> curved 3D surface */}
      <path d={d} fill="url(#gloss)" style={{mixBlendMode: 'soft-light'}} />
      <path d={arc(cx, cy, s.r2 - 2, s.a1, s.a2)} stroke="url(#goldRim)" strokeWidth={4} fill="none" />
      <path d={arc(cx, cy, s.r1 + 1.5, s.a1, s.a2)} stroke="rgba(40,24,10,0.45)" strokeWidth={3} fill="none" />
      <path d={d} stroke={C.copperLight} strokeOpacity={0.9} strokeWidth={1.5} fill="none" />
    </g></g>
  );
};

export const RingDefs: React.FC = () => (
  <defs>
 <filter id="panelShadowLow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#13284A" floodOpacity="0.2" /></filter>
    <filter id="panelShadowHigh" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="6" dy="34" stdDeviation="24" floodColor="#13284A" floodOpacity="0.42" /></filter>
    <filter id="panelShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#13284A" floodOpacity="0.32" /></filter>
    <linearGradient id="goldRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FBE3B5" /><stop offset="0.45" stopColor="#C88A5A" /><stop offset="0.7" stopColor="#F6D9A8" /><stop offset="1" stopColor="#8A5A30" /></linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.7" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></linearGradient>
    <linearGradient id="glassFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" /><stop offset="0.5" stopColor="#EADBC4" stopOpacity="0.55" /><stop offset="1" stopColor="#B9A58A" stopOpacity="0.7" /></linearGradient>
    <linearGradient id="copperFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F2C998" /><stop offset="0.5" stopColor="#C88A5A" /><stop offset="1" stopColor="#7A4A26" /></linearGradient>
    <linearGradient id="navyFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2A4470" /><stop offset="1" stopColor="#0B1630" /></linearGradient>
    <linearGradient id="tealFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7FC3BC" /><stop offset="1" stopColor="#1F5E63" /></linearGradient>
    <linearGradient id="sageFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C9DDA2" /><stop offset="1" stopColor="#4F7A3A" /></linearGradient>
    <linearGradient id="slateFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8E9AAB" /><stop offset="1" stopColor="#1E2633" /></linearGradient>
    <linearGradient id="sandFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF4E2" /><stop offset="0.6" stopColor="#E8CFA8" /><stop offset="1" stopColor="#B98E5C" /></linearGradient>
    <linearGradient id="creamFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFDF8" /><stop offset="1" stopColor="#E9DBC5" /></linearGradient>
  </defs>
);

// A set of concentric curved panels + fine gold orbit lines around (cx, cy).
export const Rings: React.FC<{cx: number; cy: number; segs: Seg[]; orbits?: number[]; prefix: string; ticks?: number}> = ({cx, cy, segs, orbits = [], prefix, ticks}) => (
  <g>
    {orbits.map((r, i) => <circle key={`o${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={C.copper} strokeOpacity={0.55} strokeWidth={i % 2 ? 1 : 2} />)}
    {ticks && Array.from({length: 72}, (_, i) => i * 5).map((a) => {
      const [x1, y1] = pt(cx, cy, ticks, a), [x2, y2] = pt(cx, cy, ticks + (a % 45 === 0 ? 26 : 12), a);
      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.copper} strokeWidth={a % 45 === 0 ? 3 : 1.2} />;
    })}
    {[...segs].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).map((s, i) => <Panel key={i} cx={cx} cy={cy} s={s} id={`${prefix}${i}`} />)}
  </g>
);

// ---------- Spiral (nautilus) layout ----------
// r(t) = r0 * g^(t/360), t in degrees (cumulative, can exceed 360). Each panel spans [t1,t2] and occupies
// the band between r(t)*k1 and r(t)*k2, so panels grow as they wind outward.
export type SSeg = {t1: number; t2: number; k1: number; k2: number; img?: string; kind?: Seg['kind']; z?: number};
const rad = (r0: number, g: number, t: number) => r0 * Math.pow(g, t / 360);
const edge = (cx: number, cy: number, r0: number, g: number, k: number, t1: number, t2: number) => {
  const n = Math.max(6, Math.ceil((t2 - t1) / 2)); const out: number[][] = [];
  for (let i = 0; i <= n; i++) { const t = t1 + ((t2 - t1) * i) / n; out.push(pt(cx, cy, rad(r0, g, t) * k, t)); }
  return out;
};
const poly = (ps: number[][]) => ps.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
const SpiralPanel: React.FC<{cx: number; cy: number; r0: number; g: number; s: SSeg; id: string}> = ({cx, cy, r0, g, s, id}) => {
  const o = edge(cx, cy, r0, g, s.k2, s.t1, s.t2), inn = edge(cx, cy, r0, g, s.k1, s.t1, s.t2);
  const d = poly([...o, ...inn.reverse()]) + ' Z';
  const all = [...o, ...inn]; const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const b = {x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys)};
  const src = s.img ? SLOTS[s.img]?.src ?? s.img : undefined;
  const kind = s.kind ?? (s.img ? 'photo' : 'glass');
  const fills: Record<string, string> = {glass: 'url(#glassFill)', copper: 'url(#copperFill)', navy: 'url(#navyFill)', cream: 'url(#creamFill)', teal: 'url(#tealFill)', sage: 'url(#sageFill)', slate: 'url(#slateFill)', sand: 'url(#sandFill)'};
  const rimW = Math.max(2.5, rad(r0, g, s.t1) * 0.008);
  const z = s.z ?? 1; const sc = [0.985, 1, 1.025][z];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${sc}) translate(${-cx} ${-cy})`}>
    <g filter={`url(#panelShadow${['Low', '', 'High'][z]})`}>
      <clipPath id={`c${id}`}><path d={d} /></clipPath>
      {kind === 'photo' && src ? <image href={sf(src)} x={b.x} y={b.y} width={b.w} height={b.h} preserveAspectRatio={`xMidY${s.focusY === 0 ? 'Min' : s.focusY === 2 ? 'Max' : 'Mid'} slice`} clipPath={`url(#c${id})`} />
        : <path d={d} fill={kind === 'photo' ? SLOTS[s.img!]?.color ?? '#888' : fills[kind]} />}
      <path d={d} fill="url(#gloss)" style={{mixBlendMode: 'soft-light'}} />
      <path d={poly(o)} stroke="url(#goldRim)" strokeWidth={rimW} fill="none" />
      <path d={poly(edge(cx, cy, r0, g, s.k1 * 1.004, s.t1, s.t2))} stroke="rgba(40,24,10,0.45)" strokeWidth={rimW * 0.7} fill="none" />
      <path d={d} stroke={C.copperLight} strokeOpacity={0.9} strokeWidth={1.5} fill="none" />
    </g></g>
  );
};
export const Spiral: React.FC<{cx: number; cy: number; r0: number; g: number; segs: SSeg[]; prefix: string; guide?: [number, number]}> = ({cx, cy, r0, g, segs, prefix, guide}) => (
  <g>
    {guide && [1, 1.02].map((k, j) => <path key={j} d={poly(edge(cx, cy, r0, g, k * 0.97, guide[0], guide[1]))} stroke={C.copper} strokeOpacity={0.6} strokeWidth={j ? 1 : 2} fill="none" />)}
    {[...segs].map((s, i) => ({s, i})).sort((a, b) => (a.s.z ?? 1) - (b.s.z ?? 1)).map(({s, i}) => <SpiralPanel key={i} cx={cx} cy={cy} r0={r0} g={g} s={s} id={`${prefix}${i}`} />)}
  </g>
);
