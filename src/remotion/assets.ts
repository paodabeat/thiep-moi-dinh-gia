// Asset registry: each AI image / video slot is a coloured placeholder until the real file is dropped in.
// To replace: put the file in public/assets/ and set `src` (image) or `video` (mp4) for that id.
export type Slot = {id: string; label: string; color: string; src?: string; video?: string};

export const SLOTS: Record<string, Slot> = {
  I01: {id: 'I01', src: 'assets/I01.jpg', label: 'Mỏ dầu / giàn khoan', color: '#7A4A2A'},
  I02: {id: 'I02', src: 'assets/I02.jpg', label: 'Kiến trúc – tòa nhà tài chính', color: '#3F5A78'},
  I03: {id: 'I03', src: 'assets/I03.jpg', label: 'Máy bay hàng hoá', color: '#8A6A3E'},
  I04: {id: 'I04', src: 'assets/I04.jpg', label: 'Bảng giá chứng khoán', color: '#24466B'},
  I05: {id: 'I05', src: 'assets/I05.jpg', label: 'Ánh sáng qua phố (video)', color: '#5B3E5E'},
  I06: {id: 'I06', label: 'Bay lên cao (video Kling)', color: '#2F5D6E'},
  I07: {id: 'I07', src: 'assets/I07.jpg', label: 'La bàn nhìn từ trên cao (hero)', color: '#8C6A47'},
  A08: {id: 'A08', src: 'assets/A08.jpg', label: 'Bảng giá dữ liệu', color: '#355C7D'},
  A10: {id: 'A10', src: 'assets/A10.jpg', label: 'Nông sản / kho hàng', color: '#9A7B45'},
  A11: {id: 'A11', src: 'assets/A11.jpg', label: 'Toàn cảnh cảng – thành phố', color: '#2E6B66'},
  A12: {id: 'A12', src: 'assets/A12.jpg', label: 'Tuyến thương mại toàn cầu', color: '#4E6A4E'},
  // v7 – vòng ngoài: hoạt động sản xuất (đa dạng màu)
  B01: {id: 'B01', src: 'assets/B01.jpg', label: 'Ruộng lúa non xanh', color: '#5E9E3A'},
  B02: {id: 'B02', src: 'assets/B02.jpg', label: 'Mỏ than lộ thiên', color: '#1E1E22'},
  B03: {id: 'B03', src: 'assets/B03.jpg', label: 'Container cảng nhiều màu', color: '#2F6FB0'},
  B04: {id: 'B04', src: 'assets/B04.jpg', label: 'Đồi chè', color: '#3E7A3A'},
  B05: {id: 'B05', src: 'assets/B05.jpg', label: 'Bồn chứa xăng dầu', color: '#55606B'},
  B06: {id: 'B06', src: 'assets/B06.jpg', label: 'Điện gió ven biển', color: '#6FA8C8'},
  B07: {id: 'B07', src: 'assets/B07.jpg', label: 'Cà phê Tây Nguyên', color: '#7A2E24'},
  B08: {id: 'B08', src: 'assets/B08.jpg', label: 'Nuôi trồng thuỷ sản', color: '#2E8C86'},
  B09: {id: 'B09', src: 'assets/B09.jpg', label: 'Nhà máy dệt may', color: '#C9CED6'},
  B10: {id: 'B10', src: 'assets/B10.jpg', label: 'Rừng cao su', color: '#2F4A2C'},
  // v9 – cận cảnh sản vật
  C01: {id: 'C01', src: 'assets/C01.jpg', label: 'Hạt gạo', color: '#888'},
  C02: {id: 'C02', src: 'assets/C02.jpg', label: 'Cà phê', color: '#888'},
  C03: {id: 'C03', src: 'assets/C03.jpg', label: 'Hồ tiêu', color: '#888'},
  C04: {id: 'C04', src: 'assets/C04.jpg', label: 'Hạt điều', color: '#888'},
  C05: {id: 'C05', src: 'assets/C05.jpg', label: 'Dầu thô', color: '#888'},
  C06: {id: 'C06', src: 'assets/C06.jpg', label: 'Than đá', color: '#888'},
  C07: {id: 'C07', src: 'assets/C07.jpg', label: 'Mủ cao su', color: '#888'},
  C08: {id: 'C08', src: 'assets/C08.jpg', label: 'Tôm', color: '#888'},
  C09: {id: 'C09', src: 'assets/C09.jpg', label: 'Cuộn vải', color: '#888'},
  C10: {id: 'C10', src: 'assets/C10.jpg', label: 'Thép', color: '#888'},
  S01: {id: 'S01', src: 'assets/S01.jpg', label: 'Bạc', color: '#B8BEC6'},
  K01: {id: 'K01', src: 'assets/K01.jpg', label: 'Ngô', color: '#E0B040'},
  K02: {id: 'K02', src: 'assets/K02.jpg', label: 'Lúa mì', color: '#D8B060'},
  K03: {id: 'K03', src: 'assets/K03.jpg', label: 'Bông', color: '#EEE8DC'},
};
