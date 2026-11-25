import {sf} from '../sf';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C} from '../theme';

const NeedleShape: React.FC<{cx: number; cy: number; len: number; angle: number; size: number}> = ({cx, cy, len, angle, size}) => (
  <svg width={size} height={size} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(5px 12px 9px rgba(0,0,0,0.4))'}}>
    <defs><linearGradient id="ng" x1="0" x2="1"><stop offset="0" stopColor="#5BB800" /><stop offset="0.5" stopColor={C.green} /><stop offset="1" stopColor="#4C9A00" /></linearGradient>
    <radialGradient id="cap" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="#FBE3B5" /><stop offset="0.5" stopColor="#C9944F" /><stop offset="1" stopColor="#6B4320" /></radialGradient>
    <linearGradient id="nn" x1="0" x2="1"><stop offset="0" stopColor="#0B1630" /><stop offset="0.5" stopColor="#2A4470" /><stop offset="1" stopColor="#0B1630" /></linearGradient></defs>
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <polygon points={`0,${-len} ${len * 0.075},0 0,${len * 0.06} ${-len * 0.075},0`} fill="url(#ng)" />
      <polygon points={`0,${len * 0.8} ${len * 0.075},0 0,${-len * 0.06} ${-len * 0.075},0`} fill="url(#nn)" />
      <circle r={len * 0.11} fill="url(#cap)" /><circle r={len * 0.11} fill="none" stroke="#6B4320" strokeWidth={2} />
    </g>
  </svg>
);
// 1) vị trí kim trên mặt la bàn (góc 38°) – để AI hiểu tỷ lệ & bối cảnh
export const NeedleOnCompass: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <Img src={sf('assets/compass-disc.png')} style={{position: 'absolute', left: 12, top: 12, width: 1000, height: 1000}} />
    <NeedleShape cx={512} cy={512} len={430} angle={38} size={1024} />
  </AbsoluteFill>
);
// 2) kim thẳng đứng trên nền trơn – ảnh tham chiếu chính để generate & tách nền
export const NeedleUpright: React.FC = () => (
  <AbsoluteFill style={{background: '#EDEDED'}}>
    <NeedleShape cx={512} cy={560} len={430} angle={0} size={1024} />
  </AbsoluteFill>
);
