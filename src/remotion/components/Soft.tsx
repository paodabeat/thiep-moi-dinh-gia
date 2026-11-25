import React from 'react';
import {Slot} from './Slot';
import {C} from '../theme';

// Image with feathered, organic edges so layers melt into each other (no hard rectangles).
export const SoftImg: React.FC<{id: string; x: number; y: number; w: number; h: number; feather?: number; opacity?: number; blend?: React.CSSProperties['mixBlendMode']; rotate?: number; shape?: 'ellipse' | 'left' | 'right' | 'top' | 'bottom'}> = ({id, x, y, w, h, feather = 45, opacity = 1, blend, rotate = 0, shape = 'ellipse'}) => {
  const masks: Record<string, string> = {
    ellipse: `radial-gradient(ellipse 50% 50% at 50% 50%, #000 ${100 - feather}%, transparent 100%)`,
    left: `radial-gradient(ellipse 100% 70% at 0% 50%, #000 ${100 - feather}%, transparent 100%)`,
    right: `radial-gradient(ellipse 100% 70% at 100% 50%, #000 ${100 - feather}%, transparent 100%)`,
    top: `radial-gradient(ellipse 80% 100% at 50% 0%, #000 ${100 - feather}%, transparent 100%)`,
    bottom: `radial-gradient(ellipse 80% 100% at 50% 100%, #000 ${100 - feather}%, transparent 100%)`,
  };
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity, mixBlendMode: blend, transform: `rotate(${rotate}deg)`, WebkitMaskImage: masks[shape], maskImage: masks[shape]}}>
      <Slot id={id} style={{inset: 0}} />
    </div>
  );
};

// Sweeping copper light arcs (elegant curves instead of straight cuts).
export const Arcs: React.FC<{variant?: 1 | 2 | 3; opacity?: number}> = ({variant = 1, opacity = 0.8}) => {
  const paths: Record<number, string[]> = {
    1: ['M -100 520 C 300 300, 780 360, 1180 120', 'M -100 1500 C 380 1700, 760 1640, 1180 1820'],
    2: ['M -120 300 C 260 620, 820 640, 1200 380', 'M -120 1650 C 300 1380, 800 1420, 1200 1700'],
    3: ['M 1200 200 C 820 420, 760 1100, 1200 1500'],
  };
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity}}>
      <defs>
        <linearGradient id={`arc${variant}`} x1="0" x2="1"><stop offset="0" stopColor={C.copper} stopOpacity="0" /><stop offset="0.5" stopColor={C.copperLight} /><stop offset="1" stopColor={C.copper} stopOpacity="0" /></linearGradient>
      </defs>
      {paths[variant].map((d, i) => <path key={i} d={d} fill="none" stroke={`url(#arc${variant})`} strokeWidth={3} />)}
      {paths[variant].map((d, i) => <path key={`b${i}`} d={d} fill="none" stroke={`url(#arc${variant})`} strokeWidth={1} transform="translate(0,26)" opacity={0.6} />)}
    </svg>
  );
};

// Vector stand-in for the hero compass (brass bezel, engraved dial, glass highlight). Replaced by I07 render.
export const BrassCompass: React.FC<{size: number; x: number; y: number; needle?: number}> = ({size, x, y, needle = 38}) => (
  <svg viewBox="-260 -260 520 520" width={size} height={size} style={{position: 'absolute', left: x, top: y, filter: 'drop-shadow(0 30px 60px rgba(19,40,74,0.45))'}}>
    <defs>
      <radialGradient id="bz" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#F6D9A8" /><stop offset="0.45" stopColor="#C88A5A" /><stop offset="0.8" stopColor="#7A4A26" /><stop offset="1" stopColor="#4A2C16" /></radialGradient>
      <radialGradient id="dial" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#FBF5EC" /><stop offset="1" stopColor="#E3D2B6" /></radialGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.4" stopColor="#fff" stopOpacity="0" /></linearGradient>
    </defs>
    <circle r={252} fill="url(#bz)" />
    <circle r={228} fill="#5A3518" opacity={0.5} />
    <circle r={222} fill="url(#dial)" />
    {Array.from({length: 72}, (_, i) => i * 5).map((a) => (
      <line key={a} x1={0} y1={-218} x2={0} y2={a % 45 === 0 ? -192 : a % 15 === 0 ? -200 : -208} stroke={C.navy} strokeWidth={a % 45 === 0 ? 3 : 1.2} transform={`rotate(${a})`} />
    ))}
    <circle r={176} fill="none" stroke={C.copper} strokeWidth={1.2} />
    {[0, 90, 180, 270].map((a) => <polygon key={a} points="0,-168 16,0 0,22 -16,0" fill={C.navy} opacity={0.85} transform={`rotate(${a})`} />)}
    {[45, 135, 225, 315].map((a) => <polygon key={a} points="0,-120 10,0 0,14 -10,0" fill={C.copper} opacity={0.8} transform={`rotate(${a})`} />)}
    {['N', 'E', 'S', 'W'].map((t, i) => <text key={t} y={-182 + 0} textAnchor="middle" fontFamily="Gelasio" fontWeight={700} fontSize={26} fill={C.navy} transform={`rotate(${i * 90}) translate(0,${-0})`} dy={36} x={0} style={{display: 'none'}}>{t}</text>)}
    <g transform={`rotate(${needle})`}>
      <polygon points="0,-200 18,0 0,14 -18,0" fill={C.green} />
      <polygon points="0,200 18,0 0,-14 -18,0" fill={C.navy} />
    </g>
    <circle r={16} fill="url(#bz)" /><circle r={6} fill={C.cream} />
    <circle r={222} fill="url(#glass)" />
  </svg>
);

// Vector needle placed on the AI compass pivot (centre measured on I07: x=540, y=956 in a 1080x1920 frame).
export const Needle: React.FC<{cx?: number; cy?: number; len?: number; angle?: number}> = ({cx = 544, cy = 958, len = 300, angle = 38}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(6px 14px 10px rgba(0,0,0,0.45))'}}>
    <defs><linearGradient id="ng" x1="0" x2="1"><stop offset="0" stopColor="#5BB800" /><stop offset="0.5" stopColor={C.green} /><stop offset="1" stopColor="#4C9A00" /></linearGradient>
    <radialGradient id="cap" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FBE3B5" /><stop offset="0.5" stopColor="#C9944F" /><stop offset="1" stopColor="#6B4320" /></radialGradient>
    <linearGradient id="nn" x1="0" x2="1"><stop offset="0" stopColor="#0B1630" /><stop offset="0.5" stopColor="#2A4470" /><stop offset="1" stopColor="#0B1630" /></linearGradient></defs>
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <polygon points={`0,${-len} 22,0 0,18 -22,0`} fill="url(#ng)" />
      <polygon points={`0,${len * 0.8} 22,0 0,-18 -22,0`} fill="url(#nn)" />
      <circle r={33} fill="url(#cap)" /><circle r={33} fill="none" stroke="#6B4320" strokeWidth={2} />
    </g>
  </svg>
);
