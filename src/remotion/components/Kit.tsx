import {sf} from '../sf';
import React from 'react';
import {AbsoluteFill, Img, delayRender, continueRender} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import {C, SANS, SERIF, W, SAFE, fontsReady} from '../theme';

export const Bg: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundImage: `url(${sf('assets/paper-bg2.jpg')})`, backgroundSize: '100% 100%', fontFamily: SANS, color: C.text}}>
    {children}
  </AbsoluteFill>
);

// Thin double copper frame with diamond corners: the "luxury" border used on every scene.
export const Frame: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <rect x={44} y={44} width={992} height={1832} fill="none" stroke={C.copper} strokeOpacity={0.55} strokeWidth={1.5} />
    <rect x={56} y={56} width={968} height={1808} fill="none" stroke={C.copper} strokeOpacity={0.25} strokeWidth={1} />
    {[[44, 44], [1036, 44], [44, 1876], [1036, 1876]].map(([x, y], i) => (
      <rect key={i} x={x - 9} y={y - 9} width={18} height={18} transform={`rotate(45 ${x} ${y})`} fill={C.copper} />
    ))}
  </svg>
);

// Engraved compass rose (vector), used as faint background ornament and outer dial in scene 1.
export const CompassRose: React.FC<{size: number; opacity?: number; style?: React.CSSProperties; labels?: boolean}> = ({size, opacity = 1, style, labels = true}) => {
  const r = 500;
  const ticks = Array.from({length: 120}, (_, i) => i * 3);
  return (
    <svg viewBox="-520 -520 1040 1040" width={size} height={size} style={{position: 'absolute', opacity, ...style}}>
      <circle r={r} fill="none" stroke={C.copper} strokeWidth={2} />
      <circle r={r - 34} fill="none" stroke={C.copper} strokeWidth={1} strokeOpacity={0.6} />
      <circle r={r - 120} fill="none" stroke={C.copper} strokeWidth={1} strokeOpacity={0.35} />
      {ticks.map((a) => {
        const long = a % 30 === 0, mid = a % 15 === 0;
        const l = long ? 30 : mid ? 20 : 12;
        return <line key={a} x1={0} y1={-r} x2={0} y2={-r + l} stroke={C.copper} strokeWidth={long ? 3 : 1.2} transform={`rotate(${a})`} />;
      })}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <polygon key={a} points={a % 90 === 0 ? '0,-360 22,0 0,40 -22,0' : '0,-250 14,0 0,26 -14,0'} fill="none" stroke={C.copper} strokeWidth={1.4} strokeOpacity={a % 90 === 0 ? 0.8 : 0.45} transform={`rotate(${a})`} />
      ))}
      {labels && ['N', 'E', 'S', 'W'].map((t, i) => (
        <text key={t} x={0} y={-r + 80} textAnchor="middle" fill={C.copper} fontFamily={SERIF} fontWeight={700} fontSize={44} transform={`rotate(${i * 90})`}>{t}</text>
      ))}
    </svg>
  );
};

export const Logo: React.FC<{width: number; white?: boolean; style?: React.CSSProperties}> = ({width, white = false, style}) => (
  // keep original aspect ratio: only width is set
  <Img src={sf(white ? 'brand/logo-dinhgia-white-tight.svg' : 'brand/logo-dinhgia-metal.svg')} style={{width, height: 'auto', display: 'block', ...style}} />
);

export const LogoBox: React.FC<{label: string; w: number; h: number; style?: React.CSSProperties}> = ({label, w, h, style}) => (
  <div style={{width: w, height: h, border: `2px dashed ${C.copper}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, letterSpacing: '0.14em', fontSize: 20, color: C.copper, ...style}}>{label}</div>
);

export const Center: React.FC<{top: number; children: React.ReactNode; style?: React.CSSProperties}> = ({top, children, style}) => (
  <div style={{position: 'absolute', top, left: SAFE, right: SAFE, textAlign: 'center', ...style}}>{children}</div>
);

export const Eyebrow: React.FC<{children: React.ReactNode; size?: number; color?: string}> = ({children, size = 28, color = C.copper}) => (
  <div style={{fontSize: size, fontWeight: 600, letterSpacing: '0.14em', color, textTransform: 'uppercase'}}>{children}</div>
);

export const Rule: React.FC<{w?: number}> = ({w = 360}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '0 auto'}}>
    <div style={{width: w / 2, height: 1.5, background: `linear-gradient(90deg, transparent, ${C.copper})`}} />
    <div style={{width: 12, height: 12, transform: 'rotate(45deg)', background: C.copper}} />
    <div style={{width: w / 2, height: 1.5, background: `linear-gradient(270deg, transparent, ${C.copper})`}} />
  </div>
);

// Guest name auto-fits inside the safe width so long names never touch the margins.
export const GuestName: React.FC<{text: string; max: number; width?: number}> = ({text, max, width = W - SAFE * 2 - 40}) => {
  // measure only after the web fonts are loaded, otherwise the fallback font's width is used
  const [ready, setReady] = React.useState(false);
  const [handle] = React.useState(() => delayRender('guest-name-font'));
  React.useEffect(() => { fontsReady.then(() => { setReady(true); continueRender(handle); }); }, [handle]);
  const {fontSize} = ready ? fitText({text, withinWidth: width, fontFamily: SERIF, fontWeight: 700}) : {fontSize: max};
  return <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: Math.min(max, fontSize * 0.97), lineHeight: 1.1, whiteSpace: 'nowrap', color: C.text}}>{text}</div>;
};

// Arch-topped window used for imagery (replaces the old round photos).
export const Arch: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; fade?: 'left' | 'right' | 'none'}> = ({x, y, w, h, children, fade = 'none'}) => {
  const mask = fade === 'left' ? 'linear-gradient(270deg,#000 45%,transparent)' : fade === 'right' ? 'linear-gradient(90deg,#000 45%,transparent)' : undefined;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: `${w / 2}px ${w / 2}px 0 0`, overflow: 'hidden', WebkitMaskImage: mask, maskImage: mask}}>
        {children}
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 55%, ${C.paper})`}} />
      </div>
      <div style={{position: 'absolute', inset: -14, borderRadius: `${w / 2 + 14}px ${w / 2 + 14}px 0 0`, border: `1.5px solid ${C.copper}`, borderBottom: 'none', opacity: 0.6, WebkitMaskImage: 'linear-gradient(180deg,#000 60%,transparent)'}} />
    </div>
  );
};

// Partner logos: sized by height only, so the original aspect ratio is always kept.
export const BrandLogo: React.FC<{name: 'vtv' | 'mxv' | 'moneyverse'; height: number; maxWidth?: number; style?: React.CSSProperties}> = ({name, height, maxWidth, style}) => (
  <Img src={sf(`brand/logo-${name}.png`)} style={{height, width: 'auto', maxWidth, objectFit: 'contain', display: 'block', ...style}} />
);
