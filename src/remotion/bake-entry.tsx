// Chỉ dùng để dựng lại video nền cảnh 1–2 (public/assets/intro-world.mp4) bằng Remotion CLI:
//   npx remotion render src/remotion/bake-entry.tsx IntroWorld public/assets/intro-world.mp4 --frames=0-134
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {IntroWorld, FPS, DURATION} from './Video';
import {W, H} from './theme';
const Root: React.FC = () => <Composition id="IntroWorld" component={IntroWorld} durationInFrames={DURATION} fps={FPS} width={W} height={H} />;
registerRoot(Root);
