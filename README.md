# Thiệp mời ĐỊNH GIÁ – THE PRICE

Trang web chỉnh sửa và xuất thiệp mời điện tử (video MP4 + ảnh PNG) cho họp báo ra mắt chương trình ĐỊNH GIÁ – THE PRICE (VTV1).
Chạy hoàn toàn trên trình duyệt, không cần máy chủ: đăng lên GitHub Pages rồi gửi đường link là dùng được.

## Dùng thử trên máy

Cần cài [Node.js](https://nodejs.org) bản 20 trở lên.

```bash
npm install
npm run dev
```

Mở địa chỉ hiện ra (thường là http://localhost:5173). Sửa code xong, trang tự cập nhật, không phải chạy lại.

## Đăng lên GitHub Pages

1. Tạo repository mới trên GitHub, đẩy toàn bộ thư mục này lên nhánh `main`
   (không cần đẩy `node_modules` và `dist`, file `.gitignore` đã loại sẵn).
2. Trên GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Mỗi lần đẩy code lên `main`, workflow `.github/workflows/deploy.yml` tự build và đăng.
   Đường link có dạng `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

## Cách dùng

- **4 tab bên trái**: KHÁCH MỜI (thông tin + danh sách, nhập từ Excel) · THÔNG TIN (tọa đàm, thời gian, địa điểm, chương trình) · LIÊN HỆ (đầu mối, mã QR) · HÌNH ẢNH (logo, 12 ảnh vòng tròn).
- **Xem trước bên phải**: video đầy đủ và 6 cảnh, bấm vào cảnh để xem nhanh.
- **LƯU CÀI ĐẶT**: tải về một file `.json` chứa toàn bộ nội dung, danh sách khách và hình ảnh đã tải lên.
  Lần sau bấm **MỞ CÀI ĐẶT** để nạp lại. Trình duyệt cũng tự lưu bản đang làm, nhưng chỉ trên máy và trình duyệt đó.
- **XUẤT FILE**: chọn MP4 / PNG, chọn một khách hoặc “Chọn tất cả”, chọn thư mục lưu rồi bấm *Bắt đầu xuất*.
  Video được dựng ngay trên máy người dùng (mỗi video mất vài phút). Nên dùng Google Chrome hoặc Microsoft Edge bản mới.

## Cấu trúc

```
public/            hình ảnh, logo, phông chữ, nhạc nền
src/remotion/      bản dựng thiệp (Remotion) – các cảnh, logo, vòng ảnh
src/App.tsx        giao diện chỉnh sửa, xem trước, popup xuất file
src/exporter.ts    xuất MP4 / PNG trên trình duyệt (@remotion/web-renderer)
src/store.ts       tự lưu, file cài đặt, xử lý ảnh tải lên
```

## Bản quyền Remotion

Thiệp được dựng bằng [Remotion](https://remotion.dev). Remotion miễn phí cho cá nhân và tổ chức có tối đa 3 người;
tổ chức lớn hơn cần mua giấy phép công ty (xem https://remotion.dev/license) và thay `LICENSE` trong `src/exporter.ts` bằng mã giấy phép.
