import React from 'react';
import {Invitation} from './Video';
import {LayoutCtx, CardFinal} from './scenes/Scenes7';
import {applyConfig, TemplateConfig} from './config';

// production entry points used by the editor app
// silent: bỏ nhạc khi dựng trên trình duyệt – nhạc nền được ghép sau (xem exporter.ts)
export const TemplateVideo: React.FC<{cfg: TemplateConfig; silent?: boolean}> = ({cfg, silent}) => {
  applyConfig(cfg);
  return <Invitation guest={cfg.guest} layout="v1" silent={silent} />;
};
export const TemplateStill: React.FC<{cfg: TemplateConfig}> = ({cfg}) => {
  applyConfig(cfg);
  return <LayoutCtx.Provider value="v1"><CardFinal guest={cfg.guest} /></LayoutCtx.Provider>;
};
