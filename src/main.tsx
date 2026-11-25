import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import {App, AboutModal} from './App';
import {preload} from './remotion/sf';
import {ASSET_LIST} from './remotion/manifest';
import {fontsReady} from './remotion/theme';
import {loadLocal, normalize, Work} from './store';
import {Laptop, Copy, Check, Maximize2, Info} from 'lucide-react';
import {sf} from './remotion/sf';

// Điện thoại / máy tính bảng: chặn hẳn, không tải giao diện và tài nguyên
const isHandheld = (() => {
  const ua = navigator.userAgent;
  const uaMobile = (navigator as any).userAgentData?.mobile === true;
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return uaMobile || iPadOS || /Android|iPhone|iPad|iPod|Mobile|Windows Phone|Opera Mini|IEMobile/i.test(ua);
})();
const MIN_W = 1000; // cửa sổ máy tính quá hẹp → nhắc phóng to (tự ẩn khi đủ rộng)

const Notice: React.FC<{kind: 'device' | 'narrow'}> = ({kind}) => {
  const [copied, setCopied] = useState(false);
  const [about, setAbout] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch { /* bỏ qua */ } };
  return (
    <div className="gate">
      <div className="gate-card">
        <img className="gate-logo" src={sf('brand/logo-header.png')} alt="ĐỊNH GIÁ – THE PRICE" />
        <div className="gate-ic">{kind === 'device' ? <Laptop strokeWidth={1.8} /> : <Maximize2 strokeWidth={1.8} />}</div>
        {kind === 'device' ? (<>
          <h1>Vui lòng mở trên máy tính</h1>
          <p>Trình chỉnh sửa thiệp mời điện tử chỉ hỗ trợ <b>máy tính hoặc laptop</b>. Hãy mở đường link này bằng Google Chrome hoặc Microsoft Edge trên máy tính để chỉnh sửa và xuất thiệp.</p>
          <div className="gate-acts">
            <button className="gate-btn" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? 'Đã sao chép đường link' : 'Sao chép đường link'}</button>
            <button className="gate-btn line" onClick={() => setAbout(true)}><Info />THÔNG TIN HỖ TRỢ</button>
          </div>
        </>) : (<>
          <h1>Cửa sổ trình duyệt đang quá hẹp</h1>
          <p>Hãy phóng to cửa sổ (rộng tối thiểu {MIN_W}px) hoặc giảm mức thu phóng của trình duyệt (<b>Ctrl</b> + <b>−</b>) để hiển thị đầy đủ trình chỉnh sửa.</p>
          <div className="gate-acts"><button className="gate-btn line" onClick={() => setAbout(true)}><Info />THÔNG TIN HỖ TRỢ</button></div>
        </>)}
        {about && <div className="gate-about"><AboutModal onClose={() => setAbout(false)} /></div>}
        <div className="gate-foot">Trình chỉnh sửa thiệp mời điện tử · Họp báo ra mắt chương trình “Định Giá”</div>
      </div>
    </div>
  );
};

// Nạp sẵn toàn bộ hình ảnh + phông chữ trước khi hiển thị, để xem trước và xuất file khớp nhau.
const Boot: React.FC = () => (isHandheld ? <Notice kind="device" /> : <Desktop />);
const Desktop: React.FC = () => {
  const [work, setWork] = useState<Work | null>(null);
  const [err, setErr] = useState('');
  const [narrow, setNarrow] = useState(() => window.innerWidth < MIN_W);
  useEffect(() => { const f = () => setNarrow(window.innerWidth < MIN_W); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  useEffect(() => {
    Promise.all([preload(ASSET_LIST), fontsReady, loadLocal()])
      .then(([, , w]) => setWork(normalize(w)))
      .catch((e) => setErr(String(e?.message ?? e)));
  }, []);
  // cửa sổ hẹp: che giao diện nhưng vẫn giữ nguyên dữ liệu đang làm, phóng to là dùng tiếp
  if (work) return <>{narrow && <Notice kind="narrow" />}<div style={narrow ? {display: 'none'} : undefined}><App initial={work} /></div></>;
  return (
    <div className="boot">
      <div className="spin" />
      <p>{err ? 'Không tải được tài nguyên: ' + err : 'Đang tải thiệp mời ĐỊNH GIÁ…'}</p>
    </div>
  );
};
createRoot(document.getElementById('root')!).render(<Boot />);
