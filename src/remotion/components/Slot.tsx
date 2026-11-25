import {sf} from '../sf';
import React from 'react';
import {Img, OffthreadVideo} from 'remotion';
import {SLOTS} from '../assets';
import {SANS} from '../theme';

// Renders the asset for a slot, or a coloured placeholder labelled with its id.
export const Slot: React.FC<{id: string; style?: React.CSSProperties; showLabel?: boolean}> = ({id, style, showLabel = true}) => {
  const s = SLOTS[id];
  const base: React.CSSProperties = {position: 'absolute', overflow: 'hidden', ...style};
  if (s.video) return <div style={base}><OffthreadVideo src={sf(s.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>;
  if (s.src) return <div style={base}><Img src={sf(s.src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></div>;
  return (
    <div style={{...base, background: `repeating-linear-gradient(135deg, ${s.color} 0 26px, rgba(255,255,255,0.06) 26px 30px), ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {showLabel && (
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 1.3, padding: 12}}>
          {s.id}<br /><span style={{fontWeight: 500, fontSize: 22}}>{s.label}</span>
        </div>
      )}
    </div>
  );
};
