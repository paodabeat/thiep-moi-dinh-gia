import React, {useEffect, useMemo, useRef, useState} from 'react';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode';
import {sf} from './remotion/sf';
import {SLOTS} from './remotion/assets';
import {DEFAULT_CONFIG, TemplateConfig} from './remotion/config';
import type {Guest} from './remotion/scenes/data';
import {Work, cfgFor, guestLabel, saveLocal, exportSettings, importSettings, imageToDataUrl, downloadBlob} from './store';
import {VIDEO_COMP, JobState, runExport, Target, renderPreview, enqueue, videoSupport} from './exporter';
import {Icon} from './icons';
import {DialogHost, ask, confirmBox} from './dialog';

/* ---------- 6 cảnh của thiệp ---------- */
export const SCENES = [
  {n: 1, name: 'Mở đầu', from: 0, thumb: 26},
  {n: 2, name: 'La bàn', from: 48, thumb: 86},
  {n: 3, name: 'Logo', from: 110, thumb: 160},
  {n: 4, name: 'Kính mời', from: 200, thumb: 300},
  {n: 5, name: 'Chương trình', from: 342, thumb: 440},
  {n: 6, name: 'Thông tin', from: 482, thumb: 599},
];

type Tab = 'guest' | 'info' | 'timeline' | 'contact' | 'media';
const TABS: [Tab, string][] = [['guest', 'KHÁCH MỜI'], ['info', 'THÔNG TIN'], ['timeline', 'TIMELINE'], ['contact', 'LIÊN HỆ'], ['media', 'HÌNH ẢNH']];

const pickFile = (accept: string) => new Promise<File | null>((ok) => {
  const i = document.createElement('input'); i.type = 'file'; i.accept = accept;
  i.onchange = () => ok(i.files?.[0] ?? null); i.click();
});

/* =================================================================== */
export const App: React.FC<{initial: Work}> = ({initial}) => {
  const [work, setWork] = useState<Work>(initial);
  const [tab, setTab] = useState<Tab>('guest');
  const [toast, setToast] = useState<{m: string; err?: boolean} | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [job, setJob] = useState<JobState | null>(null);

  // tự lưu trong trình duyệt
  useEffect(() => { const t = setTimeout(() => saveLocal(work), 400); return () => clearTimeout(t); }, [work]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3200); return () => clearTimeout(t); }, [toast]);
  const say = (m: string, err?: boolean) => setToast({m, err});

  const setCfg = (p: Partial<TemplateConfig>) => setWork((w) => ({...w, cfg: {...w.cfg, ...p}}));
  const guest = work.guests[work.sel];
  const previewCfg = useMemo(() => cfgFor(work.cfg, guest), [work.cfg, guest]);

  const save = () => { exportSettings(work); say('Đã lưu file cài đặt – mở lại bằng nút “Mở cài đặt”.'); };
  const open = async () => {
    const f = await pickFile('.json,application/json'); if (!f) return;
    try { setWork(await importSettings(f)); say('Đã nạp cài đặt từ ' + f.name); } catch (e: any) { say(e.message, true); }
  };

  return (
    <div className="app">
      <header>
        <img className="brand" src={sf('brand/logo-header.png')} alt="ĐỊNH GIÁ – THE PRICE" />
        <div className="ht"><b>Thiệp mời điện tử</b><span>Họp báo ra mắt chương trình ĐỊNH GIÁ – THE PRICE</span></div>
        <div className="sp" />
        <button className="hbtn ghost" onClick={() => setShowAbout(true)}><Icon.Info />THÔNG TIN HỖ TRỢ</button>
        <button className="hbtn ghost" onClick={open} title="Mở file cài đặt đã lưu"><Icon.Folder />MỞ CÀI ĐẶT</button>
        <button className="hbtn line" onClick={save} title="Tải về file cài đặt (.json) gồm toàn bộ nội dung, danh sách khách và hình ảnh"><Icon.Save />LƯU CÀI ĐẶT</button>
        <button className={'hbtn copper' + (job?.running ? ' busy' : '')} onClick={() => setShowExport(true)}><i className="dot" /><Icon.Download />XUẤT FILE</button>
      </header>

      <main>
        <section className="editor">
          <nav className="tabs">
            {TABS.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </nav>
          <div className="panel">
            {tab === 'guest' && <GuestTab work={work} setWork={setWork} say={say} />}
            {tab === 'info' && <InfoTab cfg={work.cfg} setCfg={setCfg} />}
            {tab === 'timeline' && <TimelineTab cfg={work.cfg} setCfg={setCfg} />}
            {tab === 'contact' && <ContactTab cfg={work.cfg} setCfg={setCfg} say={say} />}
            {tab === 'media' && <MediaTab cfg={work.cfg} setCfg={setCfg} say={say} />}
          </div>
        </section>
        <PreviewPanel cfg={previewCfg} />
      </main>

      {showExport && <ExportModal work={work} job={job} setJob={setJob} onClose={() => setShowExport(false)} say={say} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      <DialogHost />
      {toast && <div className={'toast' + (toast.err ? ' err' : '')}>{toast.m}</div>}
    </div>
  );
};

/* ---------- THÔNG TIN HỖ TRỢ ---------- */
const ABOUT: [string, React.ReactNode][] = [
  ['Tên sản phẩm', 'Trình chỉnh sửa thiệp mời điện tử'],
  ['Tên chương trình', 'Họp báo ra mắt chương trình “Định Giá”'],
  ['Version', '2.0'],
  ['Được tạo bởi', 'Phùng Trần Gia Bảo'],
  ['Ngày tạo', '26/11/2026'],
  ['Liên hệ và hỗ trợ', <a href="https://paodabeat-profile.vercel.app/" target="_blank" rel="noopener noreferrer">paodabeat-profile.vercel.app<Icon.Ext /></a>],
  ['Bản quyền thuộc', 'Công ty Cổ phần The Moneyverse Việt Nam'],
];
export const AboutModal: React.FC<{onClose: () => void}> = ({onClose}) => (
  <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal about">
      <div className="mh">THÔNG TIN HỖ TRỢ<button onClick={onClose} title="Đóng"><Icon.Close /></button></div>
      <div className="about-hero"><img src={sf('brand/logo-header.png')} alt="ĐỊNH GIÁ – THE PRICE" /></div>
      <dl>{ABOUT.map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
      <div className="about-foot">© 2026 Công ty Cổ phần The Moneyverse Việt Nam</div>
    </div>
  </div>
);

/* ---------- ô nhập ---------- */
const Field: React.FC<{label: string; value: string; onChange: (v: string) => void; area?: boolean; placeholder?: string; upper?: boolean; grow?: number}> = ({label, value, onChange, area, placeholder, upper, grow}) => (
  <label className="field" style={grow ? {flex: grow} : undefined}>
    <span>{label}</span>
    {area ? <textarea rows={2} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      : <input value={value} placeholder={placeholder} style={upper ? {textTransform: 'uppercase'} : undefined} onChange={(e) => onChange(e.target.value)} />}
  </label>
);
const Card: React.FC<{title: string; children: React.ReactNode; actions?: React.ReactNode; hint?: string}> = ({title, children, actions, hint}) => (
  <div className="card"><div className="ch"><h3>{title}</h3>{actions}</div>{hint && <p className="hint">{hint}</p>}{children}</div>
);

/* ---------- TAB KHÁCH MỜI ---------- */
const GuestTab: React.FC<{work: Work; setWork: React.Dispatch<React.SetStateAction<Work>>; say: (m: string, e?: boolean) => void}> = ({work, setWork, say}) => {
  const g = work.guests[work.sel];
  const setG = (p: Partial<Guest>) => setWork((w) => ({...w, guests: w.guests.map((x, i) => (i === w.sel ? {...x, ...p} : x))}));
  const add = () => setWork((w) => ({...w, guests: [...w.guests, {danhXung: 'Ông', hoTen: '', chucVuDonVi: ''}], sel: w.guests.length}));
  const del = (i: number) => setWork((w) => {
    if (w.guests.length === 1) return {...w, guests: [{danhXung: 'Ông', hoTen: '', chucVuDonVi: ''}], sel: 0};
    const guests = w.guests.filter((_, j) => j !== i); return {...w, guests, sel: Math.min(w.sel > i ? w.sel - 1 : w.sel, guests.length - 1)};
  });
  const template = () => {
    const ws = XLSX.utils.aoa_to_sheet([['Danh xưng', 'Họ tên', 'Chức vụ – Đơn vị'], ['Ông', 'Nguyễn Văn A', 'Giám đốc – Công ty ABC'], ['Bà', 'Trần Thị B', 'Trưởng phòng Truyền thông – Ngân hàng XYZ']]);
    ws['!cols'] = [{wch: 12}, {wch: 28}, {wch: 60}];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Khach moi');
    downloadBlob(new Blob([XLSX.write(wb, {type: 'array', bookType: 'xlsx'})]), 'Mau_danh_sach_khach_moi.xlsx');
  };
  const importX = async () => {
    const f = await pickFile('.xlsx,.xls,.csv'); if (!f) return;
    try {
      const wb = XLSX.read(await f.arrayBuffer());
      const rows: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1, defval: ''});
      const body = rows.filter((r) => r.some((c) => String(c).trim()));
      if (body.length && /danh|xưng|xung/i.test(String(body[0][0]))) body.shift();
      const list = body.map((r) => ({danhXung: String(r[0]).trim(), hoTen: String(r[1]).trim(), chucVuDonVi: String(r[2]).trim()})).filter((x) => x.hoTen);
      if (!list.length) throw new Error('Không tìm thấy khách mời nào trong file');
      const empty = work.guests.length <= 1 && !work.guests[0]?.hoTen;
      const mode = empty ? 'replace' : await ask<'replace' | 'append' | null>({
        title: `Đã đọc ${list.length} khách mời từ file`, tone: 'info', cancelValue: null,
        message: <>Danh sách hiện có <b>{work.guests.length}</b> khách. Bạn muốn thay toàn bộ danh sách hay thêm các khách mới vào cuối?</>,
        actions: [{label: 'Huỷ', value: null, kind: 'ghost'}, {label: 'Thêm vào cuối', value: 'append', kind: 'ghost', icon: <Icon.Plus />}, {label: 'Thay danh sách', value: 'replace', icon: <Icon.Reset />}],
      });
      if (!mode) return;
      const replace = mode === 'replace';
      setWork((w) => ({...w, guests: replace ? list : [...w.guests, ...list], sel: replace ? 0 : w.guests.length}));
      say(`Đã nhập ${list.length} khách mời`);
    } catch (e: any) { say(e.message, true); }
  };
  return (<>
    <Card title="Khách mời đang xem trước" hint="Chỉnh trực tiếp – thiệp bên phải cập nhật ngay. Họ tên tự viết hoa trên thiệp.">
      <div className="row">
        <Field label="Danh xưng" value={g.danhXung} onChange={(v) => setG({danhXung: v})} grow={1} />
        <Field label="Họ tên" value={g.hoTen} onChange={(v) => setG({hoTen: v})} upper grow={3} />
      </div>
      <Field label="Chức vụ – Đơn vị" value={g.chucVuDonVi} onChange={(v) => setG({chucVuDonVi: v})} />
    </Card>
    <Card title={`Danh sách khách mời (${work.guests.length})`} actions={<div className="acts">
      <button className="sbtn ghost" onClick={template}><Icon.Sheet />Tải file mẫu</button>
      <button className="sbtn navy" onClick={importX}><Icon.Upload />Nhập từ Excel</button>
    </div>} hint="File Excel gồm 3 cột: Danh xưng | Họ tên | Chức vụ – Đơn vị (dòng đầu là tiêu đề). Bấm một dòng để xem trước thiệp của khách đó.">
      <div className="glist">
        {work.guests.map((x, i) => (
          <div key={i} className={'grow' + (i === work.sel ? ' on' : '')} onClick={() => setWork((w) => ({...w, sel: i}))}>
            <span className="no">{i + 1}</span>
            <span className="nm">{x.hoTen ? guestLabel(x) : <em>(chưa nhập tên)</em>}</span>
            <span className="cv">{x.chucVuDonVi}</span>
            <button className="x" title="Xoá" onClick={(e) => { e.stopPropagation(); del(i); }}><Icon.Trash /></button>
          </div>
        ))}
      </div>
      <div className="acts" style={{marginTop: 10}}>
        <button className="sbtn ghost" onClick={add}><Icon.Plus />Thêm khách mời</button>
        <button className="sbtn ghost" onClick={async () => (await confirmBox('Xoá toàn bộ danh sách?', <>Toàn bộ <b>{work.guests.length}</b> khách mời sẽ bị xoá khỏi danh sách. Nên bấm <b>LƯU CÀI ĐẶT</b> trước nếu cần giữ lại.</>, 'Xoá danh sách', 'danger')) && setWork((w) => ({...w, guests: [{danhXung: 'Ông', hoTen: '', chucVuDonVi: ''}], sel: 0}))}><Icon.Trash />Xoá danh sách</button>
      </div>
    </Card>
  </>);
};

/* ---------- TAB THÔNG TIN ---------- */
const InfoTab: React.FC<{cfg: TemplateConfig; setCfg: (p: Partial<TemplateConfig>) => void}> = ({cfg, setCfg}) => {
  return (<>
    <Card title="Tọa đàm">
      <Field label="Nhãn" value={cfg.talkLabel} onChange={(v) => setCfg({talkLabel: v})} />
      <div className="row">
        <Field label="Tên tọa đàm – dòng 1" value={cfg.talkLines[0]} onChange={(v) => setCfg({talkLines: [v, cfg.talkLines[1]]})} />
        <Field label="Tên tọa đàm – dòng 2" value={cfg.talkLines[1]} onChange={(v) => setCfg({talkLines: [cfg.talkLines[0], v]})} />
      </div>
    </Card>
    <Card title="Thời gian">
      <div className="row">
        <Field label="Giờ" value={cfg.time} onChange={(v) => setCfg({time: v})} />
        <Field label="Thứ" value={cfg.weekday} onChange={(v) => setCfg({weekday: v})} upper />
        <Field label="Ngày" value={cfg.date} onChange={(v) => setCfg({date: v})} />
        <Field label="Đón khách" value={cfg.welcome} onChange={(v) => setCfg({welcome: v})} grow={1.6} />
      </div>
    </Card>
    <Card title="Địa điểm">
      <div className="row">
        <Field label="Nơi tổ chức" value={cfg.venue1} onChange={(v) => setCfg({venue1: v})} grow={1.4} />
        <Field label="Phòng / tầng" value={cfg.venue3} onChange={(v) => setCfg({venue3: v})} />
      </div>
      <Field label="Địa chỉ" value={cfg.venue2} onChange={(v) => setCfg({venue2: v})} />
    </Card>
  </>);
};

/* ---------- TAB TIMELINE ---------- */
const TimelineTab: React.FC<{cfg: TemplateConfig; setCfg: (p: Partial<TemplateConfig>) => void}> = ({cfg, setCfg}) => {
  const setA = (i: number, j: 0 | 1, v: string) => setCfg({agenda: cfg.agenda.map((a, k) => (k === i ? (j ? [a[0], v] : [v, a[1]]) : a)) as [string, string][]});
  const move = (i: number, d: number) => { const a = [...cfg.agenda]; const [x] = a.splice(i, 1); a.splice(i + d, 0, x); setCfg({agenda: a}); };
  return (<>
    <Card title="Nội dung chương trình" hint="Xuống dòng trong ô nội dung để ngắt dòng trên thiệp.">
      {cfg.agenda.map((a, i) => (
        <div className="agenda" key={i}>
          <input className="t" value={a[0]} onChange={(e) => setA(i, 0, e.target.value)} />
          <textarea rows={a[1].split('\n').length} value={a[1]} onChange={(e) => setA(i, 1, e.target.value)} />
          <div className="ord">
            <button disabled={!i} onClick={() => move(i, -1)} title="Lên"><Icon.Up /></button>
            <button disabled={i === cfg.agenda.length - 1} onClick={() => move(i, 1)} title="Xuống"><Icon.Down /></button>
            <button onClick={() => setCfg({agenda: cfg.agenda.filter((_, k) => k !== i)})} title="Xoá"><Icon.Trash /></button>
          </div>
        </div>
      ))}
      <button className="sbtn ghost" onClick={() => setCfg({agenda: [...cfg.agenda, ['', '']]})}><Icon.Plus />Thêm mục</button>
    </Card>
  </>);
};

/* ---------- TAB LIÊN HỆ ---------- */
const ContactTab: React.FC<{cfg: TemplateConfig; setCfg: (p: Partial<TemplateConfig>) => void; say: (m: string, e?: boolean) => void}> = ({cfg, setCfg, say}) => {
  const [link, setLink] = useState(cfg.qrLink ?? '');
  const makeQR = async () => {
    if (!link.trim()) return say('Nhập đường link trước', true);
    const url = await QRCode.toDataURL(link.trim(), {margin: 1, width: 600, color: {dark: '#13284A', light: '#FFFFFF'}, errorCorrectionLevel: 'M'});
    setCfg({qrImage: url, qrLink: link.trim()}); say('Đã tạo mã QR mới');
  };
  return (<>
    <Card title="Đầu mối liên hệ">
      <Field label="Tiêu đề" value={cfg.contactTitle} onChange={(v) => setCfg({contactTitle: v})} upper />
      {cfg.contacts.map((c, i) => (
        <div className="row tight" key={i}>
          <Field label={`Người liên hệ ${i + 1} (Tên – Số điện thoại)`} value={c} onChange={(v) => setCfg({contacts: cfg.contacts.map((x, j) => (j === i ? v : x))})} />
          <button className="ibtn" title="Xoá" onClick={() => setCfg({contacts: cfg.contacts.filter((_, j) => j !== i)})}><Icon.Trash /></button>
        </div>
      ))}
      {cfg.contacts.length < 3 && <button className="sbtn ghost" onClick={() => setCfg({contacts: [...cfg.contacts, '']})}><Icon.Plus />Thêm người liên hệ</button>}
    </Card>
    <Card title="Mã QR">
      <div className="qr">
        <img src={sf(cfg.qrImage)} alt="QR" />
        <div style={{flex: 1}}>
          <Field label="Đường link của mã QR" value={link} onChange={setLink} placeholder="https://…" />
          <div className="acts">
            <button className="sbtn navy" onClick={makeQR}><Icon.Qr />Tạo mã QR từ link</button>
            <button className="sbtn ghost" onClick={async () => { const f = await pickFile('image/*'); if (f) setCfg({qrImage: await imageToDataUrl(f, 800, true)}); }}><Icon.Upload />Dùng ảnh QR có sẵn</button>
          </div>
          <Field label="Chú thích dưới mã QR (xuống dòng để ngắt dòng)" area value={cfg.qrCaption} onChange={(v) => setCfg({qrCaption: v})} />
        </div>
      </div>
    </Card>
  </>);
};

/* ---------- TAB HÌNH ẢNH ---------- */
const GALLERY = Object.values(SLOTS).filter((s) => s.src && /\.(jpe?g|png)$/i.test(s.src));
const cornerSrc = (v: string) => SLOTS[v]?.src ?? v;
const MediaTab: React.FC<{cfg: TemplateConfig; setCfg: (p: Partial<TemplateConfig>) => void; say: (m: string, e?: boolean) => void}> = ({cfg, setCfg, say}) => {
  const [pick, setPick] = useState<null | ['cornersTL' | 'cornersBR', number]>(null);
  const setCorner = (v: string) => { if (!pick) return; const [k, i] = pick; setCfg({[k]: cfg[k].map((x, j) => (j === i ? v : x))} as any); setPick(null); };
  const ring = (k: 'cornersTL' | 'cornersBR', title: string) => (
    <div className="ring"><h4>{title}</h4>
      <div className="thumbs">{cfg[k].map((v, i) => (
        <button key={i} className="th" onClick={() => setPick([k, i])} title="Đổi ảnh"><img src={sf(cornerSrc(v))} /><span>{i + 1}</span></button>
      ))}</div>
    </div>
  );
  return (<>
    <Card title="Logo chương trình" hint="Logo giữ nguyên tỉ lệ gốc. Nên dùng PNG nền trong suốt. Với logo tải lên, cảnh 3 dùng hiệu ứng hiện dần thay cho hiệu ứng kim la bàn.">
      <div className="logo-row">
        <div className="logo-box"><img src={sf(cfg.logo ?? 'brand/logo-dinhgia-final.png')} /></div>
        <div className="acts col">
          <button className="sbtn navy" onClick={async () => { const f = await pickFile('image/png,image/svg+xml,image/*'); if (f) { setCfg({logo: await imageToDataUrl(f, 2400, true)}); say('Đã thay logo'); } }}><Icon.Upload />Tải logo mới</button>
          <button className="sbtn ghost" disabled={!cfg.logo} onClick={() => setCfg({logo: null})}><Icon.Reset />Dùng logo gốc</button>
        </div>
      </div>
    </Card>
    <Card title="Hình ảnh trong vòng tròn" hint="6 ảnh góc trên bên trái và 6 ảnh góc dưới bên phải của thiệp (cảnh 4 – 6). Bấm vào ảnh để đổi."
      actions={<button className="sbtn ghost" onClick={() => setCfg({cornersTL: [...DEFAULT_CONFIG.cornersTL], cornersBR: [...DEFAULT_CONFIG.cornersBR]})}><Icon.Reset />Khôi phục mặc định</button>}>
      <div className="rings">{ring('cornersTL', 'Góc trên – trái')}{ring('cornersBR', 'Góc dưới – phải')}</div>
    </Card>
    {pick && (
      <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && setPick(null)}>
        <div className="modal picker">
          <div className="mh">CHỌN ẢNH – {pick[0] === 'cornersTL' ? 'GÓC TRÊN TRÁI' : 'GÓC DƯỚI PHẢI'} #{pick[1] + 1}<button onClick={() => setPick(null)}><Icon.Close /></button></div>
          <div className="mb">
            <div className="pick-top">
              <button className="sbtn navy" onClick={async () => { const f = await pickFile('image/*'); if (f) setCorner(await imageToDataUrl(f, 1400)); }}><Icon.Upload />Tải ảnh từ máy tính</button>
              <span>hoặc chọn trong thư viện ảnh của chương trình bên dưới</span>
            </div>
            <div className="gallery">{GALLERY.map((s) => (
              <button key={s.id} className={cfg[pick[0]][pick[1]] === s.id ? 'on' : ''} onClick={() => setCorner(s.id)} title={s.label}><img src={sf(s.src!)} loading="lazy" /></button>
            ))}</div>
          </div>
        </div>
      </div>
    )}
  </>);
};

/* ---------- XEM TRƯỚC: 6 khung hình tiêu biểu, dựng bằng đúng trình dựng khi xuất file ---------- */
const PreviewPanel: React.FC<{cfg: TemplateConfig}> = ({cfg}) => {
  const [cur, setCur] = useState(6);
  const [imgs, setImgs] = useState<(string | null)[]>(() => SCENES.map(() => null));
  const [busy, setBusy] = useState(false);
  const gen = useRef(0);
  useEffect(() => {
    const my = ++gen.current, stale = () => gen.current !== my;
    const t = setTimeout(async () => {
      setBusy(true);
      // cảnh đang xem dựng trước, các cảnh còn lại sau
      const order = [cur - 1, ...SCENES.map((_, i) => i).filter((i) => i !== cur - 1)];
      for (const i of order) {
        const url = await renderPreview(cfg, SCENES[i].thumb, stale).catch(() => null);
        if (stale()) { if (url) URL.revokeObjectURL(url); return; }
        if (url) setImgs((old) => { const n = [...old]; if (n[i]) URL.revokeObjectURL(n[i]!); n[i] = url; return n; });
      }
      setBusy(false);
    }, 450);
    return () => clearTimeout(t);
  }, [cfg]);
  return (
    <aside className="preview">
      <div className="pv-head"><h3>XEM TRƯỚC</h3><span>{busy && <i className="mini-spin" />}Cảnh {cur} / 6 – {SCENES[cur - 1].name}</span></div>
      <div className="player">{imgs[cur - 1] ? <img src={imgs[cur - 1]!} alt={`Cảnh ${cur}`} /> : <div className="ph"><div className="spin" /></div>}</div>
      <div className="scenes">
        {SCENES.map((s, i) => (
          <button key={s.n} className={cur === s.n ? 'on' : ''} onClick={() => setCur(s.n)} title={`Cảnh ${s.n} – ${s.name}`}>
            {imgs[i] ? <img src={imgs[i]!} alt="" /> : <div className="ph" />}
            <span>{s.n}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};

/* ---------- ô tick theo concept ---------- */
const Check: React.FC<{on: boolean; onChange: (v: boolean) => void; title: string; sub: string; icon: React.ReactNode}> = ({on, onChange, title, sub, icon}) => (
  <button type="button" className={'check' + (on ? ' on' : '')} onClick={() => onChange(!on)} role="checkbox" aria-checked={on}>
    <i className="box">{on && <Icon.Tick />}</i>
    <span className="ci">{icon}</span>
    <span><b>{title}</b><small>{sub}</small></span>
  </button>
);

/* ---------- ô chọn khách mời có tìm kiếm ---------- */
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
type Choice = {all: true} | {all: false; index: number};
const GuestCombo: React.FC<{guests: Guest[]; value: Choice; onChange: (c: Choice) => void; disabled?: boolean}> = ({guests, value, onChange, disabled}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hl, setHl] = useState(0);
  // danh sách thả xuống đặt cố định theo vị trí ô nhập, để không bị khung popup cắt mất
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<React.CSSProperties>({});
  useEffect(() => {
    if (!open) return;
    const place = () => { const r = box.current!.getBoundingClientRect(); setPos({position: 'fixed', left: r.left, top: r.bottom + 6, width: r.width, maxHeight: Math.max(220, Math.min(560, window.innerHeight - r.bottom - 22))}); };
    place(); window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open]);
  const valid = guests.map((g, i) => ({g, i})).filter(({g}) => g.hoTen.trim());
  const items = valid.filter(({g}) => !q || norm(`${g.danhXung} ${g.hoTen} ${g.chucVuDonVi}`).includes(norm(q)));
  const opts: Choice[] = [{all: true}, ...items.map(({i}) => ({all: false as const, index: i}))];
  const label = value.all ? `Chọn tất cả (${valid.length} khách mời)` : guestLabel(guests[value.index]);
  const choose = (c: Choice) => { onChange(c); setOpen(false); setQ(''); };
  return (
    <div className={'combo' + (open ? ' open' : '')}>
      <div className="cin" ref={box}>
        <Icon.Search />
        <input disabled={disabled} value={open ? q : label} placeholder="Nhập tên khách mời để tìm…" onFocus={() => { setOpen(true); setHl(0); }}
          onBlur={() => setTimeout(() => setOpen(false), 120)} onChange={(e) => { setQ(e.target.value); setHl(e.target.value ? 1 : 0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setHl((h) => Math.min(h + 1, opts.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setHl((h) => Math.max(h - 1, 0)); }
            if (e.key === 'Enter' && opts[hl]) { choose(opts[hl]); (e.target as HTMLInputElement).blur(); }
            if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
          }} />
        <Icon.Caret />
      </div>
      {open && (
        <ul style={pos} onMouseDown={(e) => e.preventDefault()}>
          <li className={'all' + (hl === 0 ? ' hl' : '')} onMouseEnter={() => setHl(0)} onClick={() => choose({all: true})}><span>Chọn tất cả</span><small>{valid.length} khách mời</small></li>
          {items.map(({g, i}, k) => (
            <li key={i} className={hl === k + 1 ? 'hl' : ''} onMouseEnter={() => setHl(k + 1)} onClick={() => choose({all: false, index: i})}>
              <span><em>{String(i + 1).padStart(2, '0')}</em>{guestLabel(g)}</span><small>{g.chucVuDonVi}</small>
            </li>
          ))}
          {!items.length && <li className="none">Không tìm thấy khách mời phù hợp</li>}
        </ul>
      )}
    </div>
  );
};

/* ---------- POPUP XUẤT FILE ---------- */
const canPickFolder = typeof (window as any).showDirectoryPicker === 'function';
const ExportModal: React.FC<{work: Work; job: JobState | null; setJob: React.Dispatch<React.SetStateAction<JobState | null>>; onClose: () => void; say: (m: string, e?: boolean) => void}> = ({work, job, setJob, onClose, say}) => {
  const [mp4, setMp4] = useState(true);
  const [png, setPng] = useState(true);
  const [choice, setChoice] = useState<Choice>({all: true});
  const [dir, setDir] = useState<FileSystemDirectoryHandle | null>(null);
  const abort = useRef<AbortController | null>(null);
  const [result, setResult] = useState<{kind: 'mp4' | 'png'; url: string; guest: Guest} | null>(null);
  const setRes = (r: typeof result) => setResult((old) => { if (old) URL.revokeObjectURL(old.url); return r; });
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, []);
  const running = !!job?.running;
  const valid = work.guests.filter((g) => g.hoTen.trim());
  const list = choice.all ? valid : [work.guests[choice.index]];
  const shown = running && job ? list[job.guestIndex] ?? list[0] : (choice.all ? valid[0] : work.guests[choice.index]);
  const pcfg = useMemo(() => cfgFor(work.cfg, shown), [work.cfg, shown]);
  const [idle, setIdle] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (running) return; let dead = false;
    renderPreview(pcfg, SCENES[3].thumb, () => dead).then((u) => { if (dead) { if (u) URL.revokeObjectURL(u); return; } setIdle((o) => { if (o) URL.revokeObjectURL(o); return u; }); });
    return () => { dead = true; };
  }, [pcfg, running]);

  const pickDir = async () => {
    // giải thích trước, vì sau đó trình duyệt bắt buộc hiện hộp hỏi quyền của chính nó (không thể thay thế)
    const go = await ask<boolean>({
      title: 'Lưu thiệp thẳng vào một thư mục', tone: 'info', cancelValue: false,
      message: <>
        <p>Sau khi bấm <b>Chọn thư mục</b>, bạn sẽ thấy hai cửa sổ của trình duyệt:</p>
        <ol><li>Cửa sổ chọn thư mục trên máy – chọn nơi muốn lưu thiệp.</li><li>Câu hỏi <i>“Cho phép trang web này chỉnh sửa tệp?”</i> – bấm <b>Cho phép</b>.</li></ol>
        <p className="dim">Trang chỉ ghi thêm các file thiệp mới vào thư mục đó, không đọc, sửa hay xoá file nào khác.</p>
      </>,
      actions: [{label: 'Huỷ', value: false, kind: 'ghost'}, {label: 'Chọn thư mục', value: true, icon: <Icon.Folder />}],
    });
    if (!go) return;
    try {
      const h = await (window as any).showDirectoryPicker({mode: 'readwrite', id: 'thiep-moi'});
      const perm = await h.queryPermission?.({mode: 'readwrite'});
      if (perm && perm !== 'granted' && (await h.requestPermission?.({mode: 'readwrite'})) !== 'granted') throw new Error('denied');
      setDir(h);
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // người dùng đóng cửa sổ chọn thư mục
      await ask({title: 'Chưa được cấp quyền lưu', tone: 'warn', cancelValue: true,
        message: <>Trình duyệt chưa cho phép trang lưu vào thư mục này. Thiệp sẽ được lưu vào <b>thư mục Tải xuống</b> như mặc định. Bạn có thể bấm <b>Chọn thư mục…</b> để thử lại và chọn <b>Cho phép</b>.</>,
        actions: [{label: 'Đã hiểu', value: true}]});
    }
  };
  const start = async () => {
    if (!mp4 && !png) return say('Chọn ít nhất một định dạng', true);
    if (!list.length) return say('Danh sách khách mời đang trống', true);
    let useMp4 = mp4;
    if (mp4) {
      const why = await videoSupport();
      if (why) {
        const r = await ask<'png' | null>({
          title: 'Trình duyệt này chưa xuất được video', tone: 'warn', cancelValue: null,
          message: <>
            <p>{why}</p>
            <p>Hãy mở trang bằng <b>Google Chrome</b> hoặc <b>Microsoft Edge</b> bản mới trên máy tính để xuất video MP4.</p>
            {png && <p className="dim">Bạn vẫn có thể xuất ảnh PNG ngay trên trình duyệt này.</p>}
          </>,
          actions: png ? [{label: 'Đóng', value: null, kind: 'ghost'}, {label: 'Chỉ xuất ảnh PNG', value: 'png', icon: <Icon.Image />}] : [{label: 'Đã hiểu', value: null}],
        });
        if (r !== 'png') return;
        useMp4 = false;
      }
    }
    if (!dir && list.length * per > 1) {
      const go = await ask<'go' | 'dir' | null>({
        title: `Tải ${list.length * per} file về thư mục Tải xuống`, tone: 'info', cancelValue: null,
        message: <>
          <p>Trình duyệt có thể hỏi <i>“Cho phép tải xuống nhiều tệp?”</i> – hãy bấm <b>Cho phép</b> để nhận đủ các file.</p>
          {canPickFolder && <p className="dim">Mẹo: chọn một thư mục riêng để thiệp được lưu gọn vào đó, không lẫn với file tải xuống khác.</p>}
        </>,
        actions: [{label: 'Huỷ', value: null, kind: 'ghost'}, ...(canPickFolder ? [{label: 'Chọn thư mục', value: 'dir' as const, kind: 'ghost' as const, icon: <Icon.Folder />}] : []), {label: 'Bắt đầu xuất', value: 'go', icon: <Icon.Download />}],
      });
      if (!go) return;
      if (go === 'dir') return pickDir();
    }
    const target: Target = dir ? {kind: 'folder', dir} : {kind: 'download'};
    const ac = new AbortController(); abort.current = ac;
    setRes(null);
    const log: string[] = [`Bắt đầu xuất ${list.length} thiệp${dir ? ` vào thư mục “${dir.name}”` : ' (lưu vào thư mục Tải xuống)'}…`];
    setJob({running: true, total: list.length, done: 0, current: '', stage: 'Đang chuẩn bị', progress: 0, frame: 0, guestIndex: 0, log});
    try {
      await enqueue(() => runExport({cfg: work.cfg, guests: list, nums: list.map((g) => work.guests.indexOf(g) + 1), total: work.guests.length, mp4: useMp4, png, target, signal: ac.signal,
        onState: (s) => setJob((j) => (j ? {...j, ...s} : j)), log: (m) => setJob((j) => (j ? {...j, log: [...j.log, m]} : j)),
        // giữ lại file vừa xuất (ưu tiên video) để xem lại sau khi xong
        onFile: (kind, blob, g) => setResult((old) => {
          if (old && old.kind === 'mp4' && kind === 'png' && old.guest === g) return old;
          if (old) URL.revokeObjectURL(old.url);
          return {kind, url: URL.createObjectURL(blob), guest: g};
        }),
        // vẽ khung hình vừa dựng lên ô xem trước (thưa, mỗi 5 khung)
        onFrame: (vf, i) => { if (i % 5) return; const c = canvas.current; if (!c) return; c.width = 540; c.height = 960; c.getContext('2d')!.drawImage(vf, 0, 0, 540, 960); }}));
      setJob((j) => (j ? {...j, running: false, stage: 'Hoàn tất', log: [...j.log, 'Hoàn tất.']} : j));
      say(`Đã xuất xong ${list.length} thiệp`);
    } catch (e: any) {
      const stopped = e?.name === 'AbortError' || abort.current?.signal.aborted;
      setJob((j) => (j ? {...j, running: false, error: stopped ? undefined : String(e?.message ?? e), log: [...j.log, stopped ? 'Đã dừng.' : 'Lỗi: ' + (e?.message ?? e)]} : j));
    }
  };
  const pct = job && job.total ? ((job.done + (job.running ? job.progress : 0)) / job.total) * 100 : 0;
  const per = (mp4 ? 1 : 0) + (png ? 1 : 0);

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && !running && onClose()}>
      <div className="modal export">
        <div className="mh">CÀI ĐẶT XUẤT FILE<button onClick={onClose} title={running ? 'Ẩn (vẫn tiếp tục xuất)' : 'Đóng'}><Icon.Close /></button></div>
        <div className="xbody">
          <div className="xprev">
            <div className="xshot">
              {!running && result ? (
                result.kind === 'mp4'
                  ? <video key={result.url} src={result.url} controls autoPlay loop playsInline />
                  : <img src={result.url} alt="Ảnh đã xuất" />
              ) : running ? <canvas ref={canvas} width={540} height={960} />
                : idle ? <img src={idle} alt="Xem trước" /> : <div className="ph"><div className="spin" /></div>}
              {running && <div className="rec"><i />Đang dựng khung {job?.frame ?? 0} / {VIDEO_COMP.durationInFrames}</div>}
            </div>
            <div className="cap">{running ? <>Đang xuất: <b>{job?.current}</b></> : result ? <>File vừa xuất: <b>{guestLabel(result.guest)}</b></> : <>Xem trước: <b>{shown ? guestLabel(shown) : '—'}</b></>}</div>
          </div>
          <div className="xset"><div className="xscroll">
            <h4>ĐỊNH DẠNG</h4>
            <div className="checks">
              <Check on={mp4} onChange={setMp4} title="Video MP4" sub="1080 × 1920 – 20 giây, có nhạc" icon={<Icon.Film />} />
              <Check on={png} onChange={setPng} title="Ảnh PNG" sub="1080 × 1920 – thiệp tĩnh" icon={<Icon.Image />} />
            </div>
            <h4>THIỆP CẦN XUẤT</h4>
            <GuestCombo guests={work.guests} value={choice} onChange={(c) => { setChoice(c); setRes(null); }} disabled={running} />
            <p className="note">{list.length} thiệp × {per} định dạng = <b>{list.length * per} file</b></p>
            <h4>NƠI LƯU FILE</h4>
            {canPickFolder ? (
              <div className="dir">
                {dir ? <Icon.FolderOk /> : <Icon.Folder />}<span>{dir ? dir.name : 'Thư mục Tải xuống (Downloads)'}</span>
                <button className="sbtn ghost" disabled={running} onClick={pickDir}>Chọn thư mục…</button>
              </div>
            ) : <p className="note">File sẽ được tải về thư mục Tải xuống của trình duyệt.</p>}
            {job && (
              <div className="prog">
                <div className="bar"><i style={{width: pct.toFixed(1) + '%'}} /></div>
                <div className="st">{job.running ? `${job.stage} – ${job.current} (${job.done + 1}/${job.total}) – ${Math.round(job.progress * 100)}%` : job.error ? 'Có lỗi, xem nhật ký bên dưới.' : `Đã xong ${job.done}/${job.total} thiệp.`}</div>
                <pre className="log">{job.log.join('\n')}</pre>
              </div>
            )}
            <p className="hint">Mỗi video dựng ngay trên máy của bạn, mất khoảng vài phút tuỳ cấu hình. Giữ tab này mở trong lúc xuất. Nên dùng Google Chrome hoặc Microsoft Edge bản mới.</p>
            </div>
            <div className="mf">
              {running ? <button className="sbtn ghost big" onClick={() => abort.current?.abort()}><Icon.Stop />Dừng</button> : <button className="sbtn ghost big" onClick={onClose}><Icon.Close />Đóng</button>}
              <button className="sbtn copper big" disabled={running} onClick={start}><Icon.Download />Bắt đầu xuất</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
