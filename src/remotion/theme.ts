import {sf} from './sf';
import {loadFont} from '@remotion/fonts';

// Brand palette (Brand Guideline ĐỊNH GIÁ)
export const C = {
  ink: '#0B1630',      // deepest navy (background base)
  navy: '#13284A',
  indigo: '#1E1B4B',
  cream: '#FBF5EC',
  copper: '#C88A5A',
  copperLight: '#E2B184',
  green: '#83F100',    // accent only: arrows / needle (<=10%)
  mute: '#55516E',
  paper: '#F7EFE2',    // light beige base
  paperDeep: '#EADBC4',
  text: '#13284A',
};

export const W = 1080;
export const H = 1920;
export const SAFE = 120; // side safe margin (px)

export const SANS = 'Google Sans Flex';
export const SERIF = 'Gelasio';

const fontJobs = [
  loadFont({family: SANS, url: sf('fonts/GoogleSansFlex.ttf'), weight: '100 1000'}),
  ...(['400', '700'] as const).flatMap((w) =>
    ['vietnamese', 'latin-ext', 'latin'].map((sub) =>
      loadFont({family: SERIF, url: sf(`fonts/gelasio-${sub}-${w}-normal.woff2`), weight: w}),
    ),
  ),
];
export const fontsReady = Promise.all(fontJobs);
