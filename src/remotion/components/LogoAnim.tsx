import {sf} from '../sf';
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {Shine, LogoImage, customLogo, FINAL_IMG} from './MetalLogo';

// The animated logo is the SAME final artwork used on the card (no vector stand-in), so the hand-off into scene 4 is exact.
// Needle of the Đ measured on logo-dinhgia-final.png (4096 px wide): pivot = white dot (751,754), tip (905,663).
const SC = FINAL_IMG.w / 4096;
const px = (x: number) => FINAL_IMG.x + x * SC, py = (y: number) => FINAL_IMG.y + y * SC;
// vùng đệm để kim không bị cắt khi trình duyệt vẽ SVG thành ảnh (SVG ảnh không có overflow)
const PAD = 160;
export const LOGO_VB = {x: 136, y: 71, w: 643, h: 227};
export const LOGO_PIVOT = {x: px(751), y: py(754)};
const TIP = {x: px(905), y: py(663)};
export const LOGO_NEEDLE_ANGLE = (Math.atan2(TIP.x - LOGO_PIVOT.x, LOGO_PIVOT.y - TIP.y) * 180) / Math.PI; // clockwise from up
export const LOGO_NEEDLE_TIP = Math.hypot(TIP.x - LOGO_PIVOT.x, TIP.y - LOGO_PIVOT.y);

const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
// s = px per logo unit; (px,py) = screen position of the needle pivot; draw 0..1 reveals the rest of the logo left→right
export const LogoAnim: React.FC<{s: number; px: number; py: number; draw: number; needleOp?: number; opacity?: number; sweep?: number; flare?: number}> = ({s, px: X, py: Y, draw, needleOp = 1, opacity = 1, sweep = 0, flare = 0}) => {
  const left = X - (LOGO_PIVOT.x - LOGO_VB.x) * s, top = Y - (LOGO_PIVOT.y - LOGO_VB.y) * s;
  const feather = 60;
  const wipeX = interpolate(draw, [0, 1], [LOGO_VB.x - feather, LOGO_VB.x + LOGO_VB.w + feather], {...cl, easing: Easing.inOut(Easing.cubic)});
  return (
    <svg viewBox={`${LOGO_VB.x - PAD} ${LOGO_VB.y - PAD} ${LOGO_VB.w + 2 * PAD} ${LOGO_VB.h + 2 * PAD}`} width={(LOGO_VB.w + 2 * PAD) * s} height={(LOGO_VB.h + 2 * PAD) * s} style={{position: 'absolute', left: left - PAD * s, top: top - PAD * s, overflow: 'visible', opacity, filter: `drop-shadow(0 0 ${18 * Math.min(1, draw)}px rgba(233,189,134,0.45))`}}>
      {customLogo() ? (
        <LogoImage opacity={interpolate(draw, [0, 0.25], [0, 1], cl)} clipW={interpolate(draw, [0, 0.9], [0, 1], {...cl, easing: Easing.inOut(Easing.cubic)})} />
      ) : (
        <>
          <defs>
            <linearGradient id="laWipe" gradientUnits="userSpaceOnUse" x1={wipeX - feather} y1="0" x2={wipeX} y2="0">
              <stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id="laMask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1300" height="700">
              <rect x="-200" y="-200" width="1300" height="700" fill="url(#laWipe)" />
              <polygon points={`${px(910.6)},${py(660.4)} ${px(780.3)},${py(804.0)} ${px(602.6)},${py(841.0)} ${px(721.7)},${py(704.0)}`} fill="#fff" opacity={needleOp} />
            </mask>
          </defs>
          <image href={sf('brand/logo-dinhgia-final.png')} x={FINAL_IMG.x} y={FINAL_IMG.y} width={FINAL_IMG.w} height={FINAL_IMG.h} mask="url(#laMask)" />
        </>
      )}
      <Shine id="la" sweep={sweep} flare={flare} />
    </svg>
  );
};
