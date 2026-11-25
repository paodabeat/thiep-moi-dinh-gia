// Dữ liệu làm việc: cấu hình thiệp + danh sách khách mời.
// Tự lưu trong trình duyệt (IndexedDB) và có thể xuất / nhập file cài đặt .json.
import {DEFAULT_CONFIG, TemplateConfig} from './remotion/config';
import type {Guest} from './remotion/scenes/data';

export type Work = {cfg: TemplateConfig; guests: Guest[]; sel: number};

export const FILE_TAG = 'thiep-moi-dinh-gia';

export const blankWork = (): Work => ({
  cfg: {...structuredClone(DEFAULT_CONFIG), qrLink: 'https://drive.google.com/drive/folders/11zB4V77TAJMyD3jHTLLnvuAe5o_vQUfX?usp=sharing'},
  guests: [{...DEFAULT_CONFIG.guest, hoTen: 'Nguyễn Đức Dũng', chucVuDonVi: 'Phó TGĐ Sở Giao dịch hàng hoá Việt Nam'}],
  sel: 0,
});

/** cấu hình dùng để dựng thiệp cho một khách cụ thể (họ tên luôn viết hoa) */
export const cfgFor = (cfg: TemplateConfig, g: Guest | undefined): TemplateConfig => ({
  ...cfg,
  guest: g ? {danhXung: g.danhXung.trim(), hoTen: g.hoTen.trim().toLocaleUpperCase('vi'), chucVuDonVi: g.chucVuDonVi.trim()} : {danhXung: '', hoTen: '', chucVuDonVi: ''},
});

export const guestLabel = (g: Guest) => `${g.danhXung} ${g.hoTen.toLocaleUpperCase('vi')}`.trim();

export const normalize = (w: Partial<Work> | null | undefined): Work => {
  const b = blankWork();
  if (!w || !w.cfg) return b;
  const guests = Array.isArray(w.guests) && w.guests.length ? w.guests : b.guests;
  return {cfg: {...b.cfg, ...w.cfg}, guests, sel: Math.min(Math.max(0, w.sel ?? 0), guests.length - 1)};
};

/* ---------- IndexedDB: tự lưu ---------- */
const db = () => new Promise<IDBDatabase>((ok, no) => {
  const r = indexedDB.open('thiep-moi-dinh-gia', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
});
export const loadLocal = async (): Promise<Work | null> => {
  try {
    const d = await db();
    return await new Promise((ok) => { const q = d.transaction('kv').objectStore('kv').get('work'); q.onsuccess = () => ok(q.result ?? null); q.onerror = () => ok(null); });
  } catch { return null; }
};
export const saveLocal = async (w: Work) => {
  try { const d = await db(); d.transaction('kv', 'readwrite').objectStore('kv').put(w, 'work'); } catch { /* bỏ qua */ }
};

/* ---------- file cài đặt ---------- */
const stamp = () => { const d = new Date(), p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`; };
export const downloadBlob = (b: Blob, name: string) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
};
export const exportSettings = (w: Work) => {
  const data = {app: FILE_TAG, version: 1, savedAt: new Date().toISOString(), ...w};
  downloadBlob(new Blob([JSON.stringify(data, null, 1)], {type: 'application/json'}), `CaiDat_ThiepMoi_DINHGIA_${stamp()}.json`);
};
export const importSettings = async (f: File): Promise<Work> => {
  const j = JSON.parse(await f.text());
  if (j.app !== FILE_TAG || !j.cfg) throw new Error('File không phải file cài đặt Thiệp mời ĐỊNH GIÁ');
  return normalize(j);
};

/* ---------- ảnh tải lên → data URL (thu nhỏ nếu quá lớn) ---------- */
export const imageToDataUrl = (f: File, max = 1600, keepPng = false) => new Promise<string>((ok, no) => {
  const url = URL.createObjectURL(f), im = new Image();
  im.onload = () => {
    const k = Math.min(1, max / Math.max(im.width, im.height));
    const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
    c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    ok(keepPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.88));
  };
  im.onerror = () => no(new Error('Không đọc được ảnh'));
  im.src = url;
});
