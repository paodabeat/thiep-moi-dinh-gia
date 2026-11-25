import {sf} from './sf';
import React from 'react';
import {Audio, Video} from '@remotion/media';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {C} from './theme';
import {Logo} from './components/Kit';
import {LogoAnim, LOGO_NEEDLE_ANGLE, LOGO_NEEDLE_TIP, LOGO_PIVOT, LOGO_VB} from './components/LogoAnim';
import {Paper, World, Camera, CardFrame, CardInvite, CardEvent, CardFinal, FRAME_GEO, LayoutCtx} from './scenes/Scenes7';
import {Guest, defaultGuest} from './scenes/data';

export const FPS = 30, DURATION = 600; // 20s
const io = Easing.inOut(Easing.cubic), out = Easing.out(Easing.cubic), inn = Easing.in(Easing.cubic);
const lerp = (f: number, a: number[], b: number[], e = io) => interpolate(f, a, b, {easing: e, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
// cảnh 1–2 (khung 0 → WORLD_END): thế giới la bàn 3D. Không phụ thuộc nội dung thiệp nên được dựng sẵn thành video.
export const WORLD_END = 135;
export const BAKED_INTRO: string | null = 'assets/intro-world.mp4';
export const WorldLayer: React.FC = () => {
  const f = useCurrentFrame();
  /* ---------- 0 – 8s : one continuous camera move over the compass world ---------- */
  const t = lerp(f, [0, 95], [0, 1], Easing.inOut(Easing.sin));
  const key = (vals: number[]) => interpolate(t, [0, 0.5, 1], vals);
  let scale = key([2.6, 1.25, 0.82]);
  const tilt = key([40, 40, 0]);
  const spin = key([-10, -60, -90]);
  const fx = key([420, 540, 540]);
  let fy = key([1400, 1150, 900]);
  // push in on the needle (pivot moves to screen centre)
  const z = lerp(f, [92, 122], [0, 1], Easing.inOut(Easing.quad));
  scale = scale * (1 + z * 1.6);
  fy = fy + z * 60;
  // needle: big swings, damped settle, then turns to the angle of the needle inside the Đ
  const target = LOGO_NEEDLE_ANGLE + 90; // world angle (world is spun -90)
  let needle = interpolate(f, [0, 24, 50, 78, 94, 118], [-70, 150, 70, 128, 128, target], {easing: io, extrapolateRight: 'clamp'});
  if (f > 78 && f < 94) needle += 7 * Math.sin((f - 78) * 0.6) * Math.exp(-(f - 78) / 7);
  const worldOp = lerp(f, [118, 134], [1, 0]);
  const introIn = lerp(f, [0, 8], [0.3, 1]);

  if (worldOp <= 0) return null;
  return (
        <AbsoluteFill style={{opacity: worldOp * introIn}}>
          <Camera scale={scale} tilt={tilt} spin={spin} fx={fx} fy={fy}><World needleAngle={needle} /></Camera>
          {/* moving gold light sweeping across the panels */}
          <AbsoluteFill style={{background: `conic-gradient(from ${f * 2.2}deg at 50% ${fy / 19.2}%, transparent 0deg, rgba(255,226,170,0.55) 18deg, transparent 40deg, transparent 360deg)`, mixBlendMode: 'soft-light'}} />
          <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(247,239,226,${0.85 * (1 - t)}), transparent 22%)`}} />
        </AbsoluteFill>
      
  );
};
// bản dùng để dựng video intro-world.mp4 (render bằng Remotion CLI)
export const IntroWorld: React.FC = () => <Paper><WorldLayer /></Paper>;


// top-to-bottom reveal: a soft mask line sweeps down while lines rise into place
const Reveal: React.FC<{f: number; start: number; dur: number; end?: number; children: React.ReactNode}> = ({f, start, dur, end, children}) => {
  const p = lerp(f, [start, start + dur], [0, 1], Easing.out(Easing.quad));
  const o = end ? lerp(f, [end, end + 28], [1, 0]) : 1;
  const y = end ? lerp(f, [end, end + 28], [0, -40], inn) : 0;
  if (p <= 0 || o <= 0) return null;
  const line = p * 2300 - 200;
  const mask = `linear-gradient(180deg, #000 ${line - 220}px, transparent ${line}px)`;
  return (
    <AbsoluteFill style={{opacity: o, transform: `translateY(${y + (1 - p) * 24}px)`, WebkitMaskImage: p >= 1 ? undefined : mask, maskImage: p >= 1 ? undefined : mask}}>{children}</AbsoluteFill>
  );
};

export const Invitation: React.FC<{guest?: Guest; layout?: 'v1' | 'v2'}> = ({guest = defaultGuest, layout = 'v2'}) => <LayoutCtx.Provider value={layout}><InvitationInner guest={guest} layout={layout} /></LayoutCtx.Provider>;
const InvitationInner: React.FC<{guest: Guest; layout: 'v1' | 'v2'}> = ({guest, layout}) => {
  const f = useCurrentFrame();

  /* ---------- match cut: compass needle = needle of the Đ, then the logo writes itself and settles ---------- */
  const NL = 232; // world needle tip length
  const sMatch = (NL * 0.82 * 2.6) / LOGO_NEEDLE_TIP; // logo scale that makes both needles identical at f=222
  const sEnd = 600 / LOGO_VB.w;
  const endP = {x: 240 + (LOGO_PIVOT.x - LOGO_VB.x) * sEnd, y: 1155 + (LOGO_PIVOT.y - LOGO_VB.y) * sEnd};
  const m = lerp(f, [122, 182], [0, 1], Easing.inOut(Easing.cubic));
  const sNow = Math.exp(Math.log(sMatch) + (Math.log(sEnd) - Math.log(sMatch)) * m);
  const pNow = {x: 540 + (endP.x - 540) * m, y: 960 + (endP.y - 960) * m};
  const logoOn = f >= 110;
  const needleOp = lerp(f, [110, 122], [0, 1]);
  const draw = lerp(f, [125, 182], [0, 1], Easing.linear);
  const logoOutOp = lerp(f, [320, 348], [1, 0]);

  /* ---------- frame & card states ---------- */
  const fr = lerp(f, [150, 200], [0, 1], out);
  const toFinal = lerp(f, [462, 492], [0, 1]);
  const drift = Math.max(0, f - 200) * 0.012;

  return (
    <Paper>
      <Audio src={sf('audio/mix.wav')} />
      {/* cảnh 1–2: la bàn 3D dùng video dựng sẵn (không phụ thuộc khách mời) – xuất trên trình duyệt không cần WebGL */}
      {f < WORLD_END && (BAKED_INTRO ? <Sequence durationInFrames={WORLD_END}><Video src={sf(BAKED_INTRO)} muted /></Sequence> : <WorldLayer />)}
      {fr > 0 && (
        <CardFrame t={f} {...(() => {
          const e = lerp(f, [320, 350], [0, 1]), q = toFinal, G = FRAME_GEO;
          const mix = (k: 'tl' | 'br') => [0, 1].map((j) => G.invite[k][j] + (G.event[k][j] - G.invite[k][j]) * e + (G.final[k][j] - G.event[k][j]) * q);
          return {tlOff: mix('tl'), brOff: mix('br'), globeR: G.invite.globeR + (G.event.globeR - G.invite.globeR) * e + (G.final.globeR - G.event.globeR) * q};
        })()} draw={fr} grow={0.25 + 0.75 * fr} build={lerp(f, [150, 215], [0, 1], Easing.linear)} turn={layout === 'v1' ? (1 - fr) * -110 : 0} rose={fr}
          k={0.33 - 0.04 * lerp(f, [320, 350], [0, 1]) - 0.02 * toFinal} R={490 - 80 * toFinal} roseY={920 - 40 * toFinal} />
      )}
      {logoOn && logoOutOp > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: logoOutOp, transform: `translateY(${(1 - logoOutOp) * -40}px)`}}>
          <LogoAnim s={sNow} px={pNow.x} py={pNow.y} draw={draw} needleOp={needleOp} sweep={lerp(f, [190, 226], [0, 1], Easing.inOut(Easing.quad))} flare={lerp(f, [216, 244], [0, 1], Easing.linear)} />
        </div>
      )}
      <Reveal f={f} start={165} dur={50} end={320}><CardInvite guest={guest} bare noLogo /></Reveal>
      <Reveal f={f} start={342} dur={50} end={462}><CardEvent bare /></Reveal>
      <Reveal f={f} start={482} dur={45}><CardFinal guest={guest} bare /></Reveal>
    </Paper>
  );
};
