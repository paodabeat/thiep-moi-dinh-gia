import {sf} from '../sf';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {C, SERIF, SAFE} from '../theme';
import {Slot} from '../components/Slot';
import {Bg, Frame, CompassRose, Logo, BrandLogo, Center, Eyebrow, Rule, GuestName} from '../components/Kit';
import {SoftImg, Arcs, Needle} from '../components/Soft';
import {COPY, Guest} from './data';

const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 50%, transparent 40%, rgba(11,22,48,${strength}) 100%)`}} />
);
const Grade: React.FC = () => (
  // warm cinematic grade over placeholders / footage
  <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(200,138,90,0.10), rgba(19,40,74,0.18))', mixBlendMode: 'soft-light'}} />
);
const LightSweep: React.FC<{angle?: number; pos?: number}> = ({angle = -18, pos = 50}) => (
  <AbsoluteFill style={{background: `linear-gradient(${90 + angle}deg, transparent ${pos - 14}%, rgba(255,226,180,0.35) ${pos}%, transparent ${pos + 14}%)`, mixBlendMode: 'screen'}} />
);

/* ================= INTRO (0:00 – 0:10) ================= */
// I-a 0:00–0:02 : oil field, architecture ghosted in (double exposure)
export const S1aOil: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Slot id="I01" style={{inset: 0}} />
    <SoftImg id="I02" x={-120} y={-160} w={1320} h={1100} feather={55} opacity={0.6} blend="screen" shape="top" />
    <LightSweep pos={58} /><Grade /><Vignette />
  </AbsoluteFill>
);
// I-b 0:02–0:04 : cargo plane + stock board layered softly
export const S1bPlane: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Slot id="I03" style={{inset: 0}} />
    <SoftImg id="I04" x={-160} y={980} w={1400} h={1100} feather={60} opacity={0.75} blend="screen" shape="bottom" />
    <LightSweep angle={-30} pos={40} /><Grade /><Vignette />
  </AbsoluteFill>
);
// I-c 0:04–0:06 : light racing through the streets
export const S1cStreet: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Slot id="I05" style={{inset: 0}} />

    <Grade /><Vignette strength={0.7} />
  </AbsoluteFill>
);
// I-d 0:06–0:08 : camera rises above the city (Kling: start frame I05 -> end frame I07)
export const S1dRise: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Slot id="I06" style={{inset: 0}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 45%, rgba(255,240,215,0.35), transparent 70%)'}} />
    <Grade /><Vignette />
  </AbsoluteFill>
);
// I-e 0:08–0:10 : top-down reveal of the compass; needle settles, then dives into the logo
export const S1eCompass: React.FC = () => (
  <AbsoluteFill style={{background: C.ink}}>
    <Slot id="I07" style={{inset: 0}} />
    <Needle angle={38} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 45% at 50% 50%, transparent 55%, rgba(11,22,48,0.45) 100%)'}} />
  </AbsoluteFill>
);

/* ================= S2: logo (0:10 – 0:12.5) ================= */
export const S2Logo: React.FC = () => (
  <Bg>
    <CompassRose size={1500} opacity={0.16} style={{left: -210, top: 210}} labels={false} />
    <Arcs variant={1} opacity={0.7} />
    <AbsoluteFill style={{background: `radial-gradient(40% 18% at 50% 50%, rgba(226,177,132,0.28), transparent)`}} />
    <Center top={170}><BrandLogo name="vtv" height={90} style={{margin: '0 auto'}} /><div style={{height: 22}} /><Eyebrow size={26}>{COPY.host}</Eyebrow></Center>
    <Center top={800}><Logo width={700} style={{margin: '0 auto'}} /></Center>
    <Center top={1110}><Rule w={300} /></Center>
    <Center top={1170}><div style={{fontFamily: SERIF, fontSize: 46, color: C.copper, lineHeight: 1.35}}>Giải mã dòng chảy kinh tế<br />đằng sau mỗi con số</div></Center>
    <Frame />
  </Bg>
);

/* ================= S3: invitation (0:12.5 – 0:17) ================= */
export const S3Invite: React.FC<{guest: Guest}> = ({guest}) => (
  <Bg>
    <SoftImg id="A08" x={-480} y={200} w={860} h={1260} feather={65} opacity={0.5} />
    <SoftImg id="A10" x={640} y={640} w={860} h={1260} feather={65} opacity={0.6} />
    <Arcs variant={2} opacity={0.75} />
    <Center top={150}><BrandLogo name="vtv" height={80} style={{margin: '0 auto'}} /><div style={{height: 18}} /><Eyebrow size={24}>{COPY.host}</Eyebrow></Center>
    <Center top={600}><Eyebrow size={40} color={C.text}>{COPY.invite}</Eyebrow><div style={{height: 34}} /><Rule w={320} /></Center>
    <Center top={760}><div style={{fontFamily: SERIF, fontSize: 56, color: C.copper}}>{guest.danhXung}</div></Center>
    <Center top={850}><GuestName text={guest.hoTen} max={96} /></Center>
    <Center top={990}><div style={{fontSize: 34, fontWeight: 500, color: C.mute}}>{guest.chucVuDonVi}</div></Center>
    <Center top={1180}><Eyebrow size={34}>{COPY.lead}</Eyebrow></Center>
    <Frame />
  </Bg>
);

/* ================= S4: event (0:17 – 0:21.5) ================= */
export const S4Event: React.FC = () => (
  <Bg>
    <SoftImg id="A11" x={-120} y={-420} w={1320} h={1180} feather={50} opacity={0.5} shape="top" />
    <Arcs variant={1} opacity={0.6} />
    <Center top={200}><Eyebrow size={34} color={C.text}>{COPY.eventTitle}</Eyebrow></Center>
    <Center top={290}><Logo width={560} style={{margin: '0 auto'}} /></Center>
    <Center top={820}><Eyebrow size={28}>{COPY.talkLabel}</Eyebrow><div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 54, lineHeight: 1.25, marginTop: 18}}>“HÀNG HOÁ VIỆT TRÊN<br />BÀN CỜ ĐỊNH GIÁ”</div></Center>
    <div style={{position: 'absolute', left: SAFE + 20, right: SAFE + 20, top: 1090, background: C.navy, color: C.cream, padding: '36px 0 30px', display: 'flex', justifyContent: 'center'}}>
      {[[COPY.time, COPY.weekday], [COPY.date, COPY.welcome.toUpperCase()]].map(([a, b], i) => (
        <div key={i} style={{padding: '0 34px', textAlign: 'center', borderLeft: i ? `2px solid ${C.copper}` : 'none'}}>
          <div style={{fontSize: 70, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap'}}>{a}</div>
          <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '0.16em', color: C.copperLight, marginTop: 12}}>{b}</div>
        </div>
      ))}
    </div>
    <Center top={1400}>
      <div style={{fontSize: 38, fontWeight: 800}}>{COPY.venue1}</div>
      <div style={{fontSize: 32, fontWeight: 600, color: C.copper, marginTop: 12}}>{COPY.venue3}</div>
      <div style={{fontSize: 30, color: C.mute, marginTop: 10}}>{COPY.venue2}</div>
    </Center>
    <Frame />
  </Bg>
);

/* ================= S5: agenda (0:21.5 – 0:25.5) ================= */
const LEFT = SAFE; // logo, heading, rule and timeline share this left edge
export const S5Agenda: React.FC = () => (
  <Bg>
    <SoftImg id="A12" x={560} y={-200} w={1000} h={2300} feather={60} opacity={0.6} />
    <Arcs variant={3} opacity={0.7} />
    <div style={{position: 'absolute', left: LEFT, top: 300}}><Logo width={330} /></div>
    <div style={{position: 'absolute', left: LEFT, top: 470}}><Eyebrow size={40} color={C.text}>NỘI DUNG<br />CHƯƠNG TRÌNH</Eyebrow></div>
    <div style={{position: 'absolute', left: LEFT, top: 630, width: 300, height: 2, background: C.copper}} />
    <div style={{position: 'absolute', left: LEFT, top: 720, width: 720}}>
      <div style={{position: 'absolute', left: 151, top: 18, bottom: 40, width: 2, background: `linear-gradient(${C.copper}, rgba(200,138,90,0.2))`}} />
      {COPY.agenda.map(([t, x]) => (
        <div key={t} style={{display: 'flex', alignItems: 'flex-start', marginBottom: 62, position: 'relative'}}>
          <div style={{width: 120, fontSize: 40, fontWeight: 800, color: C.copper}}>{t}</div>
          <div style={{position: 'absolute', left: 144, top: 14, width: 16, height: 16, transform: 'rotate(45deg)', background: C.copper}} />
          <div style={{marginLeft: 70, fontSize: 34, fontWeight: 600, lineHeight: 1.35, flex: 1}}>{x}</div>
        </div>
      ))}
    </div>
    <Frame />
  </Bg>
);

/* ================= S6: closing (0:25.5 – 0:30) ================= */
const Partners: React.FC<{bottom: number; scale?: number}> = ({bottom, scale = 1}) => (
  <div style={{position: 'absolute', left: SAFE - 40, right: SAFE - 40, bottom, display: 'flex', justifyContent: 'space-between', borderTop: `1px solid rgba(200,138,90,0.5)`, paddingTop: 30 * scale}}>
    {COPY.partners.map(([k, v]) => (
      <div key={k} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale}}>
        <div style={{fontSize: 18 * scale, fontWeight: 700, letterSpacing: '0.12em', color: C.text}}>{k}</div>
        <div style={{height: 70 * scale, display: 'flex', alignItems: 'center'}}><BrandLogo name={v.toLowerCase() as 'vtv' | 'mxv' | 'moneyverse'} height={(v === 'VTV' ? 62 : v === 'MXV' ? 34 : 30) * scale} maxWidth={250 * scale} /></div>
      </div>
    ))}
  </div>
);
export const S6Closing: React.FC = () => (
  <Bg>
    <CompassRose size={1300} opacity={0.1} style={{left: -110, top: 120}} labels={false} />
    <Arcs variant={2} opacity={0.6} />
    <Center top={250}><Logo width={400} style={{margin: '0 auto'}} /></Center>
    <Center top={590}><div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 48, whiteSpace: 'nowrap'}}>{COPY.closing}</div><div style={{height: 36}} /><Rule w={320} /></Center>
    <Center top={760}>
      <Eyebrow size={24}>Xác nhận tham dự</Eyebrow>
      <div style={{fontSize: 32, lineHeight: 1.7, marginTop: 14}}>
        <div><b>Đầu mối BTC:</b> {COPY.contactBTC}</div>
        <div><b>Đầu mối MXV:</b> {COPY.contactMXV}</div>
      </div>
    </Center>
    <Center top={1000}>
      <div style={{display: 'inline-block', padding: 20, background: '#FFFDF8', outline: `1.5px solid ${C.copper}`, outlineOffset: 10}}>
        <Img src={sf('brand/qr-demo.png')} style={{width: 260, height: 260, display: 'block'}} />
      </div>
      <div style={{fontSize: 24, color: C.mute, marginTop: 30, letterSpacing: '0.06em'}}>Quét mã để xác nhận tham dự</div>
    </Center>
    <Partners bottom={150} />
    <Frame />
  </Bg>
);

/* ================= Static PNG / final hold ================= */
export const StaticCard: React.FC<{guest: Guest}> = ({guest}) => (
  <Bg>
    <SoftImg id="A08" x={-500} y={60} w={780} h={1100} feather={65} opacity={0.4} />
    <SoftImg id="A10" x={800} y={60} w={780} h={1100} feather={65} opacity={0.4} />
    <Arcs variant={1} opacity={0.55} />
    <Center top={110}><BrandLogo name="vtv" height={64} style={{margin: '0 auto'}} /><div style={{height: 12}} /><Eyebrow size={20}>{COPY.host}</Eyebrow></Center>
    <Center top={290}><Eyebrow size={32} color={C.text}>{COPY.invite}</Eyebrow></Center>
    <Center top={355}><div style={{fontFamily: SERIF, fontSize: 42, color: C.copper}}>{guest.danhXung}</div></Center>
    <Center top={415}><GuestName text={guest.hoTen} max={80} /></Center>
    <Center top={520}><div style={{fontSize: 28, color: C.mute}}>{guest.chucVuDonVi}</div></Center>
    <Center top={600}><Eyebrow size={24}>{COPY.lead} {COPY.eventTitle}</Eyebrow></Center>
    <Center top={680}><Logo width={430} style={{margin: '0 auto'}} /></Center>
    <Center top={920}><Eyebrow size={22}>{COPY.talkLabel}</Eyebrow><div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 34, marginTop: 10, whiteSpace: 'nowrap'}}>{COPY.talkTitle}</div></Center>
    <div style={{position: 'absolute', left: SAFE + 40, right: SAFE + 40, top: 1060, background: C.navy, color: C.cream, padding: '26px 0 22px', display: 'flex', justifyContent: 'center'}}>
      {[[COPY.time, COPY.weekday], [COPY.date, COPY.welcome.toUpperCase()]].map(([a, b], i) => (
        <div key={i} style={{padding: '0 36px', textAlign: 'center', borderLeft: i ? `2px solid ${C.copper}` : 'none'}}>
          <div style={{fontSize: 56, fontWeight: 800, lineHeight: 1, whiteSpace: 'nowrap'}}>{a}</div>
          <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.16em', color: C.copperLight, marginTop: 10}}>{b}</div>
        </div>
      ))}
    </div>
    <Center top={1265}>
      <div style={{fontSize: 30, fontWeight: 800}}>{COPY.venue1} | {COPY.venue3}</div>
      <div style={{fontSize: 26, color: C.mute, marginTop: 8}}>{COPY.venue2}</div>
    </Center>
    <Center top={1375}><div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: C.copper}}>{COPY.closing}</div></Center>
    <div style={{position: 'absolute', left: SAFE, right: SAFE, top: 1455, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40}}>
      <div style={{padding: 10, background: '#FFFDF8', outline: `1.5px solid ${C.copper}`, outlineOffset: 6, flex: 'none'}}><Img src={sf('brand/qr-demo.png')} style={{width: 150, height: 150, display: 'block'}} /></div>
      <div style={{width: 2, height: 160, background: `linear-gradient(180deg, transparent, ${C.copper}, transparent)`, flex: 'none'}} />
      <div style={{fontSize: 25, lineHeight: 1.6, flex: 'none'}}>
        <div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', color: C.copper}}>XÁC NHẬN THAM DỰ</div>
        <div><b>Đầu mối BTC:</b> {COPY.contactBTC}</div>
        <div><b>Đầu mối MXV:</b> {COPY.contactMXV}</div>
      </div>
    </div>
    <Partners bottom={90} scale={0.85} />
    <Frame />
  </Bg>
);
