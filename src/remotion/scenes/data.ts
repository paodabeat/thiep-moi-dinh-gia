// Fixed copy from the client brief (section 3) - do not edit wording.
/** tinh chỉnh khối tên: name/sub = hệ số cỡ chữ (1 = tự động), dy = dịch lên(−)/xuống(+) theo px */
export type Fit = {name?: number; sub?: number; dy?: number};
export type Guest = {danhXung: string; hoTen: string; chucVuDonVi: string; fit?: Fit};
export const defaultGuest: Guest = {danhXung: 'Ông', hoTen: 'NGUYỄN ĐỨC DŨNG', chucVuDonVi: 'Phó TGĐ Sở Giao dịch hàng hoá Việt Nam'};

export const COPY = {
  host: 'Đài Truyền hình Việt Nam',
  invite: 'TRÂN TRỌNG KÍNH MỜI',
  lead: 'Tới dự',
  eventTitle: 'LỄ RA MẮT CHƯƠNG TRÌNH',
  talkLabel: 'Tọa đàm chuyên sâu',
  talkTitle: '“HÀNG HOÁ VIỆT TRÊN BÀN CỜ ĐỊNH GIÁ”',
  time: '09:30', weekday: 'THỨ SÁU', date: '04.12.2026', welcome: 'Đón khách từ 08:30',
  venue1: 'Đài Truyền hình Việt Nam – VTV',
  venue2: 'Số 43 Nguyễn Chí Thanh, P. Giảng Võ, TP. Hà Nội',
  venue3: 'Phòng Đa năng – Tầng 1',
  closing: 'HÂN HẠNH ĐƯỢC ĐÓN TIẾP!',
  contactBTC: 'Đào Thị Mai – 0355.794.012',
  contactMXV: '[Họ tên – SĐT]',
  agenda: [
    ['08:30', 'Đón khách & check-in'],
    ['09:30', 'Khai mạc – Lễ ra mắt chương trình ĐỊNH GIÁ'],
    ['10:15', 'Trình chiếu teaser chương trình'],
    ['10:25', 'Tọa đàm “Hàng hoá Việt trên bàn cờ định giá” & Hỏi – Đáp'],
    ['11:25', 'Chụp ảnh lưu niệm'],
  ] as [string, string][],
  partners: [['ĐỒNG HÀNH CHUYÊN MÔN', 'MXV'], ['ĐƠN VỊ THỰC HIỆN', 'VTV'], ['PHỐI HỢP TỔ CHỨC', 'MONEYVERSE']],
  vtvUnit: ['BAN CHUYÊN ĐỀ – KHOA GIÁO', 'ĐÀI TRUYỀN HÌNH VIỆT NAM'],
};
