import {staticFile} from 'remotion';
// Ảnh dùng trong SVG phải là data URL thì trình kết xuất trên trình duyệt mới vẽ được,
// nên mọi tài nguyên được nạp sẵn vào bộ nhớ trước khi xem trước / xuất file.
const cache: Record<string, string> = {};
export const sf = (p: string) => (/^(data:|blob:|https?:)/.test(p) ? p : cache[p] ?? staticFile(p));
const toDataUrl = (b: Blob) => new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.readAsDataURL(b); });
export const preload = async (paths: string[]) => {
  await Promise.all(paths.filter((p) => !cache[p] && !/^(data:|blob:|https?:)/.test(p)).map(async (p) => {
    const r = await fetch(staticFile(p)); if (r.ok) cache[p] = await toDataUrl(await r.blob());
  }));
};
