// Everything the editor app can change. The composition receives this as `cfg` and applies it before rendering.
import {COPY, Guest, defaultGuest} from './scenes/data';

export type TemplateConfig = {
  guest: Guest;
  talkLabel: string;
  talkLines: [string, string];
  time: string; weekday: string; date: string; welcome: string;
  venue1: string; venue3: string; venue2: string;
  agenda: [string, string][];
  contactTitle: string;
  contacts: string[];
  qrImage: string;          // path under public/ (e.g. brand/qr-demo.png or user/qr-xxx.png)
  qrCaption: string;        // "\n" = line break
  qrLink?: string;
  logo: string | null;      // null = built-in ĐỊNH GIÁ logo with the needle draw-on
  cornersTL: string[];      // 6 images (slot id like 'K01' or a public path)
  cornersBR: string[];
};

export const DEFAULT_CONFIG: TemplateConfig = {
  guest: defaultGuest,
  talkLabel: 'Tọa đàm chuyên sâu',
  talkLines: ['“HÀNG HOÁ VIỆT TRÊN', 'BÀN CỜ ĐỊNH GIÁ”'],
  time: '09:30', weekday: 'THỨ SÁU', date: '04.12.2026', welcome: 'Đón khách từ 08:30',
  venue1: 'Đài Truyền hình Việt Nam – VTV',
  venue3: 'Phòng Đa năng – Tầng 1',
  venue2: 'Số 43 Nguyễn Chí Thanh, P. Giảng Võ, TP. Hà Nội',
  agenda: [
    ['08:30', 'Đón khách & check-in'],
    ['09:30', 'Khai mạc – Lễ ra mắt chương trình ĐỊNH GIÁ'],
    ['10:15', 'Trình chiếu teaser chương trình'],
    ['10:25', 'Tọa đàm “Hàng hoá Việt trên bàn cờ định giá”\n& Hỏi – Đáp'],
    ['11:25', 'Chụp ảnh lưu niệm'],
  ],
  contactTitle: 'ĐẦU MỐI LIÊN HỆ BTC',
  contacts: ['Đào Thị Mai – 0355.794.012', 'Vũ Phương Anh – 0922.225.266'],
  qrImage: 'brand/qr-demo.png',
  qrCaption: 'Quét mã để nhận\nthông cáo báo chí',
  logo: null,
  cornersTL: ['B01', 'C07', 'K02', 'C01', 'K01', 'K03'],
  cornersBR: ['K03', 'B10', 'K01', 'C07', 'K02', 'S01'],
};

// live config read by the scenes (set once per render from the input props)
export const CFG: TemplateConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
export const applyConfig = (c?: Partial<TemplateConfig>) => {
  const m = {...DEFAULT_CONFIG, ...(c ?? {})} as TemplateConfig;
  // sao chép nông (ảnh tải lên là data URL rất dài, không nên JSON hoá mỗi khung hình)
  Object.assign(CFG, {...m, guest: {...m.guest}, talkLines: [...m.talkLines], agenda: m.agenda.map((a) => [...a]), contacts: [...m.contacts], cornersTL: [...m.cornersTL], cornersBR: [...m.cornersBR]});
  Object.assign(COPY, {
    talkLabel: m.talkLabel, time: m.time, weekday: m.weekday, date: m.date, welcome: m.welcome,
    venue1: m.venue1, venue2: m.venue2, venue3: m.venue3, agenda: m.agenda,
  });
};
export const lines = (s: string) => s.split('\n');
