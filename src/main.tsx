import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';
import {App} from './App';
import {preload} from './remotion/sf';
import {ASSET_LIST} from './remotion/manifest';
import {fontsReady} from './remotion/theme';
import {loadLocal, normalize, Work} from './store';

// Nạp sẵn toàn bộ hình ảnh + phông chữ trước khi hiển thị, để xem trước và xuất file khớp nhau.
const Boot: React.FC = () => {
  const [work, setWork] = useState<Work | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([preload(ASSET_LIST), fontsReady, loadLocal()])
      .then(([, , w]) => setWork(normalize(w)))
      .catch((e) => setErr(String(e?.message ?? e)));
  }, []);
  if (work) return <App initial={work} />;
  return (
    <div className="boot">
      <div className="spin" />
      <p>{err ? 'Không tải được tài nguyên: ' + err : 'Đang tải thiệp mời ĐỊNH GIÁ…'}</p>
    </div>
  );
};
createRoot(document.getElementById('root')!).render(<Boot />);
