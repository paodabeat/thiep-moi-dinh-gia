// Xuất thiệp ngay trên trình duyệt (không cần máy chủ): MP4 bằng WebCodecs, PNG bằng canvas.
import {renderMediaOnWeb, renderStillOnWeb} from '@remotion/web-renderer';
import {TemplateVideo, TemplateStill} from './remotion/Template';
import {fontsReady, W, H} from './remotion/theme';
import {FPS, DURATION} from './remotion/Video';
import type {TemplateConfig} from './remotion/config';
import type {Guest} from './remotion/scenes/data';
import {cfgFor, downloadBlob, guestLabel} from './store';

export const VIDEO_COMP = {id: 'ThiepMoi', component: TemplateVideo as React.FC<any>, width: W, height: H, fps: FPS, durationInFrames: DURATION, defaultProps: {}};
export const STILL_COMP = {id: 'ThiepMoiPNG', component: TemplateStill as React.FC<any>, width: W, height: H, fps: FPS, durationInFrames: 1, defaultProps: {}};
// Remotion miễn phí cho cá nhân và tổ chức tối đa 3 người — xem https://remotion.dev/license
const LICENSE = 'free-license';

/* Mọi lần dựng (xem trước + xuất) chạy lần lượt trong một hàng đợi: trình dựng gắn thiệp vào trang,
   chạy song song sẽ trùng mã định danh SVG và làm sai hình. */
let chain: Promise<unknown> = Promise.resolve();
export const enqueue = <T,>(fn: () => Promise<T>): Promise<T> => { const p = chain.then(fn, fn); chain = p.catch(() => undefined); return p; };

/** ảnh xem trước của một khung hình (dựng bằng chính trình dựng dùng khi xuất file) */
export const renderPreview = (cfg: TemplateConfig, frame: number, isStale: () => boolean = () => false, scale = 0.5) =>
  enqueue(async () => {
    if (isStale()) return null;
    await fontsReady;
    const r = await renderStillOnWeb({composition: VIDEO_COMP, frame, inputProps: {cfg}, scale, licenseKey: LICENSE} as any);
    return URL.createObjectURL(await r.blob({format: 'jpeg', quality: 0.9} as any));
  });

export type Target = {kind: 'folder'; dir: FileSystemDirectoryHandle} | {kind: 'download'};
export type JobState = {
  running: boolean; total: number; done: number; current: string; stage: string; progress: number;
  frame: number; guestIndex: number; log: string[]; error?: string;
};

const safe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
export const fileBase = (no: number, n: number, g: Guest) => `${String(no).padStart(Math.max(2, String(n).length), '0')} - ${safe(guestLabel(g))}`;

const write = async (t: Target, name: string, b: Blob) => {
  if (t.kind === 'download') return downloadBlob(b, name);
  const fh = await t.dir.getFileHandle(name, {create: true});
  const w = await fh.createWritable(); await w.write(b); await w.close();
};

export const runExport = async (o: {
  cfg: TemplateConfig; guests: Guest[]; nums: number[]; total: number; mp4: boolean; png: boolean; target: Target; signal: AbortSignal;
  onState: (s: Partial<JobState>) => void; log: (m: string) => void;
  onFile?: (kind: 'mp4' | 'png', blob: Blob, guest: Guest) => void;
  onFrame?: (f: VideoFrame, index: number) => void;
}) => {
  await fontsReady;
  const n = o.guests.length;
  for (let i = 0; i < n; i++) {
    if (o.signal.aborted) throw new DOMException('Đã dừng', 'AbortError');
    const g = o.guests[i], cfg = cfgFor(o.cfg, g), base = fileBase(o.nums[i], o.total, g);
    o.onState({current: guestLabel(g), guestIndex: i, progress: 0, frame: 0});
    const t0 = performance.now();
    if (o.png) {
      o.onState({stage: 'Đang xuất ảnh PNG', frame: DURATION - 1});
      const r = await renderStillOnWeb({composition: STILL_COMP, frame: 0, inputProps: {cfg}, licenseKey: LICENSE, signal: o.signal} as any);
      const b = await r.blob({format: 'png'});
      await write(o.target, `${base}.png`, b); o.onFile?.('png', b, g);
      o.onState({progress: o.mp4 ? 0.04 : 1});
    }
    if (o.mp4) {
      o.onState({stage: 'Đang dựng video MP4'});
      let idx = 0;
      const r = await renderMediaOnWeb({
        composition: VIDEO_COMP, inputProps: {cfg}, licenseKey: LICENSE, signal: o.signal,
        container: 'mp4', videoCodec: 'h264', videoBitrate: 'very-high',
        onFrame: (vf: VideoFrame) => { o.onFrame?.(vf, idx++); return vf; },
        // cập nhật khung xem trước thưa thôi (mỗi ~12 khung) để không làm chậm việc dựng
        onProgress: (p: {progress: number; renderedFrames: number}) => o.onState({progress: (o.png ? 0.04 : 0) + p.progress * (o.png ? 0.96 : 1), frame: Math.min(DURATION - 1, Math.floor(p.renderedFrames / 12) * 12)}),
      } as any);
      const b = await r.getBlob();
      await write(o.target, `${base}.mp4`, b); o.onFile?.('mp4', b, g);
    }
    o.log(`✓ ${base}${o.mp4 ? '.mp4' : ''}${o.mp4 && o.png ? ' + ' : ''}${o.png ? '.png' : ''}  (${Math.round((performance.now() - t0) / 1000)} giây)`);
    o.onState({done: i + 1, progress: 0});
  }
};
