import React from 'react';
import {Invitation} from './Video';
import {LayoutCtx, CardFinal} from './scenes/Scenes7';
import {applyConfig, TemplateConfig} from './config';

// production entry points used by the editor app
export const TemplateVideo: React.FC<{cfg: TemplateConfig}> = ({cfg}) => {
  applyConfig(cfg);
  return <Invitation guest={cfg.guest} layout="v1" />;
};
export const TemplateStill: React.FC<{cfg: TemplateConfig}> = ({cfg}) => {
  applyConfig(cfg);
  return <LayoutCtx.Provider value="v1"><CardFinal guest={cfg.guest} /></LayoutCtx.Provider>;
};
