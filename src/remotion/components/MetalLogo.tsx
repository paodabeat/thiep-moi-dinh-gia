import {sf} from '../sf';
import React from 'react';
import {interpolate, Easing, useCurrentFrame} from 'remotion';
import {LOGO_ITEMS} from './LogoPaths';
import {CFG} from '../config';

export const VB = {x: 136, y: 71, w: 643, h: 227};
export const ARROW_TIP = {x: 730.6, y: 73.4};
// visible area of the built-in logo inside FINAL_IMG – custom logos are fitted (meet) into this box
export const LOGO_BOX = {x: 121.2, y: 73.1, w: 671.8, h: 228.8};
export const customLogo = () => !!CFG.logo;
export const logoImg = () => (CFG.logo ? {src: CFG.logo, ...LOGO_BOX} : {src: 'brand/logo-dinhgia-final.png', x: FINAL_IMG.x, y: FINAL_IMG.y, w: FINAL_IMG.w, h: FINAL_IMG.h});
export const flareAt = () => (CFG.logo ? {x: LOGO_BOX.x + LOGO_BOX.w * 0.9, y: LOGO_BOX.y + LOGO_BOX.h * 0.12} : ARROW_TIP);
export const LogoImage: React.FC<{opacity?: number; clipW?: number}> = ({opacity = 1, clipW}) => {
  const L = logoImg();
  return (
    <g opacity={opacity}>
      {clipW !== undefined && <clipPath id="logoWipe"><rect x={L.x - 20} y={L.y - 40} width={(L.w + 40) * clipW} height={L.h + 80} /></clipPath>}
      <image href={sf(L.src)} x={L.x} y={L.y} width={L.w} height={L.h} preserveAspectRatio="xMidYMid meet" clipPath={clipW !== undefined ? 'url(#logoWipe)' : undefined} />
    </g>
  );
};
export const FINAL_IMG = {x: -16.86, y: 6.03, w: 928.65, h: 389.51};
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const MetalDefs: React.FC<{id: string}> = ({id}) => (
  <defs>
    <linearGradient id={`gold${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="90" x2="0" y2="238"><stop offset="0" stopColor="#E9BD86" /><stop offset="0.35" stopColor="#C99257" /><stop offset="0.7" stopColor="#A86F3C" /><stop offset="1" stopColor="#7E4F27" /></linearGradient>
    <linearGradient id={`sub${id}`} gradientUnits="userSpaceOnUse" x1="0" y1="261" x2="0" y2="296"><stop offset="0" stopColor="#C2A574" /><stop offset="1" stopColor="#8C7449" /></linearGradient>
    <linearGradient id={`arrow${id}`} gradientUnits="userSpaceOnUse" x1="625" y1="132" x2="745" y2="72"><stop offset="0" stopColor="#4C9A23" /><stop offset="0.6" stopColor="#7DC13A" /><stop offset="1" stopColor="#B9E35E" /></linearGradient>
    <linearGradient id={`gem${id}`} gradientUnits="userSpaceOnUse" x1="140" y1="188" x2="205" y2="150"><stop offset="0" stopColor="#D2E86A" /><stop offset="0.5" stopColor="#8DB52A" /><stop offset="1" stopColor="#4F7A12" /></linearGradient>
    <linearGradient id={`sweep${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFE7BF" stopOpacity="0" /><stop offset="0.5" stopColor="#FFF3DC" stopOpacity="0.85" /><stop offset="1" stopColor="#FFE7BF" stopOpacity="0" /></linearGradient>
    <linearGradient id={`sweepCore${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
    <radialGradient id={`flareCore${id}`}><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.25" stopColor="#FFF1C9" stopOpacity="0.9" /><stop offset="0.6" stopColor="#F5B860" stopOpacity="0.35" /><stop offset="1" stopColor="#F5B860" stopOpacity="0" /></radialGradient>
    <linearGradient id={`ray${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E9A94E" stopOpacity="0" /><stop offset="0.5" stopColor="#FFFBF0" /><stop offset="1" stopColor="#E9A94E" stopOpacity="0" /></linearGradient>
    <mask id={`logoMask${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="400" style={{maskType: 'alpha'}}>
      {(() => { const L = logoImg(); return <image href={sf(L.src)} x={L.x} y={L.y} width={L.w} height={L.h} preserveAspectRatio="xMidYMid meet" />; })()}
    </mask>
  </defs>
);
export const fillFor = (it: (typeof LOGO_ITEMS)[number], id: string) =>
  it.tag === 'polygon' ? `url(#gem${id})` : it.tag === 'circle' ? '#B4EAA2' : it.class === 'cls-2' ? `url(#arrow${id})` : it.small ? `url(#sub${id})` : `url(#gold${id})`;

// light sweep across the letters (Đ -> A) + star flare from the arrow tip
export const Shine: React.FC<{id: string; sweep: number; flare: number}> = ({id, sweep, flare}) => {
  const x = interpolate(sweep, [0, 1], [VB.x - 160, VB.x + VB.w + 60]);
  const so = sweep > 0 && sweep < 1 ? 1 : 0;
  const f = Math.sin(Math.PI * Math.min(1, Math.max(0, flare)));
  return (
    <g>
      {so > 0 && (
        // vệt sáng kim loại: lớp overlay làm sáng mà vẫn giữ vân xước của chữ, thêm lõi sáng mảnh (screen) – không làm chữ bị bạc màu
        <>
          <g mask={`url(#logoMask${id})`} style={{mixBlendMode: 'overlay'}}>
            <rect x={x} y={VB.y - 40} width={150} height={VB.h + 80} fill={`url(#sweep${id})`} transform={`skewX(-22)`} style={{transformOrigin: `${x}px ${VB.y}px`}} />
          </g>
          <g mask={`url(#logoMask${id})`} style={{mixBlendMode: 'screen'}}>
            <rect x={x + 55} y={VB.y - 40} width={40} height={VB.h + 80} fill={`url(#sweepCore${id})`} transform={`skewX(-22)`} style={{transformOrigin: `${x}px ${VB.y}px`}} />
          </g>
        </>
      )}
      {f > 0.01 && (
        <g transform={`translate(${flareAt().x} ${flareAt().y}) scale(${0.4 + 0.6 * f}) rotate(${flare * 25})`} opacity={f}>
          <circle r={90} fill={`url(#flareCore${id})`} />
          <ellipse rx={340} ry={3.2} fill={`url(#ray${id})`} />
          <ellipse rx={2.6} ry={150} fill={`url(#ray${id})`} transform="rotate(90) rotate(-90)" style={{}} />
          <rect x={-2} y={-150} width={4} height={300} fill={`url(#ray${id})`} transform="rotate(90)" />
          <rect x={-1.2} y={-70} width={2.4} height={140} fill={`url(#ray${id})`} transform="rotate(45)" opacity={0.6} />
          <rect x={-1.2} y={-70} width={2.4} height={140} fill={`url(#ray${id})`} transform="rotate(-45)" opacity={0.6} />
          <circle r={9} fill="#fff" />
        </g>
      )}
    </g>
  );
};

// static metallic logo (keeps original aspect), with optional timed shine starting at `start` frame
export const USE_COPPER = true; // brushed-copper raster logo (client preview)
export const ShinyLogo: React.FC<{width: number; start?: number; style?: React.CSSProperties}> = ({width, start, style}) => {
  const frame = useCurrentFrame();
  const id = `s${width}${start ?? 'x'}`;
  const PAD = 200, k = width / VB.w;
  const t = start === undefined ? -1 : frame - start;
  const sweep = interpolate(t, [0, 34], [0, 1], {...cl, easing: Easing.inOut(Easing.quad)});
  const flare = interpolate(t, [26, 52], [0, 1], cl);
  return (
    // khung SVG nới rộng PAD để chữ ® và vệt loé sáng không bị cắt khi xuất trên trình duyệt
    <div style={{width, height: (width * VB.h) / VB.w, position: 'relative', ...style}}>
    <svg viewBox={`${VB.x - PAD} ${VB.y - PAD} ${VB.w + 2 * PAD} ${VB.h + 2 * PAD}`} width={width + 2 * PAD * k} height={((VB.h + 2 * PAD) * k)} style={{position: 'absolute', left: -PAD * k, top: -PAD * k, display: 'block', overflow: 'visible', filter: 'drop-shadow(0 0 18px rgba(233,189,134,0.45))'}}>
      <MetalDefs id={id} />
      {USE_COPPER ? <LogoImage />
        : LOGO_ITEMS.map((it, i) => it.tag === 'polygon' ? <polygon key={i} points={it.points} fill={fillFor(it, id)} /> : it.tag === 'circle' ? <circle key={i} cx={it.cx} cy={it.cy} r={it.r} fill={fillFor(it, id)} /> : <path key={i} d={it.d} fill={fillFor(it, id)} />)}
      <Shine id={id} sweep={t < 0 ? 0 : sweep} flare={t < 0 ? 0 : flare} />
    </svg>
    </div>
  );
};
