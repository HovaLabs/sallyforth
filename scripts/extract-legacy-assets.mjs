// scripts/extract-legacy-assets.mjs
// One-time extraction of the assets bundled inside legacy/landing-page.html.
// Usage: node scripts/extract-legacy-assets.mjs
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

const SRC = new URL('../legacy/landing-page.html', import.meta.url);
const OUT_ART = new URL('../public/art/', import.meta.url);
const OUT_FONTS = new URL('../public/fonts/', import.meta.url);

// uuid prefix -> output file name
const NAMES = {
  // images (webp unless noted)
  'e849c085': 'tomato.webp',
  '427a0da3': 'carrot.webp',
  '6e8d89b5': 'peapod.webp',
  'cda00be9': 'beet.webp',
  'ff16941d': 'eggplant.webp',
  'a1fcdfbf': 'blueberries.webp',
  '8044f101': 'radish2.webp',
  'd4e1f91a': 'radish-a.webp',
  'dae5a574': 'radish-b.webp',
  '86f4be4b': 'radish-c.webp',
  'd9bb5fff': 'snail.webp',
  'dbe8a70e': 'carrot-big.webp',
  'f0b7e153': 'beet-big.webp',
  '3cd70baa': 'blog-art-left.webp',
  'b0dc3a00': 'blog-tile.webp',
  '23df04bb': 'wordmark-script.svg',
  '7141ed3b': 'wordmark-footer.svg',
  // fonts
  '260aff4a': 'abril-fatface-latin-ext.woff2',
  '7f5342e0': 'abril-fatface-latin.woff2',
  'e5bc1b24': 'libre-caslon-text-italic-latin-ext.woff2',
  'a5009f11': 'libre-caslon-text-italic-latin.woff2',
  '19786190': 'libre-caslon-text-regular-latin-ext.woff2',
  '5534a725': 'libre-caslon-text-regular-latin.woff2',
  '75d445c4': 'libre-caslon-text-bold-latin-ext.woff2',
  '52e7c1fd': 'libre-caslon-text-bold-latin.woff2',
};

const lines = readFileSync(SRC, 'utf8').split('\n');
const manifestLine = lines.findIndex((l) => l.includes('<script type="__bundler/manifest">')) + 1;
const manifest = JSON.parse(lines[manifestLine]);

mkdirSync(OUT_ART, {recursive: true});
mkdirSync(OUT_FONTS, {recursive: true});

let written = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  const name = NAMES[uuid.slice(0, 8)];
  if (!name) throw new Error(`No name for asset ${uuid} (${entry.mime})`);
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = gunzipSync(bytes);
  const dir = entry.mime.startsWith('font/') ? OUT_FONTS : OUT_ART;
  writeFileSync(new URL(name, dir), bytes);
  written++;
  console.log(`${name.padEnd(44)} ${String(bytes.length).padStart(8)} bytes  ${entry.mime}`);
}
if (written !== Object.keys(NAMES).length) throw new Error(`Expected ${Object.keys(NAMES).length} assets, wrote ${written}`);
console.log(`\nWrote ${written} assets.`);
