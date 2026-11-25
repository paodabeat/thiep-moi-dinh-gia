// Hộp thoại riêng của trang (thay cho alert / confirm mặc định của trình duyệt)
import React, {useEffect, useState} from 'react';
import {Icon} from './icons';

type Action<T> = {label: string; value: T; kind?: 'primary' | 'ghost' | 'danger'; icon?: React.ReactNode};
type Opts<T> = {title: string; message: React.ReactNode; tone?: 'info' | 'warn' | 'danger'; actions: Action<T>[]; cancelValue?: T};
type Pending = Opts<any> & {resolve: (v: any) => void};

let push: ((p: Pending) => void) | null = null;

/** mở hộp thoại, trả về giá trị của nút được bấm */
export const ask = <T,>(o: Opts<T>) => new Promise<T>((resolve) => {
  if (!push) return resolve(o.cancelValue as T);
  push({...o, resolve});
});
/** hỏi Có / Không */
export const confirmBox = (title: string, message: React.ReactNode, ok = 'Đồng ý', tone: Opts<boolean>['tone'] = 'warn') =>
  ask<boolean>({title, message, tone, cancelValue: false, actions: [{label: 'Huỷ', value: false, kind: 'ghost'}, {label: ok, value: true, kind: tone === 'danger' ? 'danger' : 'primary'}]});

const TONE_ICON = {info: <Icon.Info />, warn: <Icon.Alert />, danger: <Icon.Trash />};

export const DialogHost: React.FC = () => {
  const [q, setQ] = useState<Pending[]>([]);
  useEffect(() => { push = (p) => setQ((x) => [...x, p]); return () => { push = null; }; }, []);
  const cur = q[0];
  const done = (v: any) => { cur.resolve(v); setQ((x) => x.slice(1)); };
  useEffect(() => {
    if (!cur) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') done(cur.cancelValue); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [cur]);
  if (!cur) return null;
  const tone = cur.tone ?? 'info';
  return (
    <div className="modal-bg dlg-bg" onMouseDown={(e) => e.target === e.currentTarget && done(cur.cancelValue)}>
      <div className={'dlg ' + tone} role="dialog" aria-modal="true">
        <div className="dlg-ic">{TONE_ICON[tone]}</div>
        <h3>{cur.title}</h3>
        <div className="dlg-msg">{cur.message}</div>
        <div className="dlg-acts">
          {cur.actions.map((a, i) => (
            <button key={i} autoFocus={i === cur.actions.length - 1} className={'sbtn big ' + (a.kind === 'ghost' ? 'ghost' : a.kind === 'danger' ? 'danger' : 'copper')} onClick={() => done(a.value)}>{a.icon}{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};
