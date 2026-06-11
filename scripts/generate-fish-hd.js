const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZE = 1600;
const OUT_DIR = 'assets/product-imgs/fish';

const FISH = [
  { file: 'catla', source: 'assets/brochure-imgs/p9_img3.png', label: 'Catla' },
  { file: 'rohu', source: 'assets/brochure-imgs/p9_img0.png', label: 'Rohu' },
  { file: 'sea-bass', source: 'assets/brochure-imgs/p5_img3.png', label: 'Sea Bass' },
  { file: 'seer-fish', source: 'assets/brochure-imgs/p5_img1.png', label: 'Seer Fish' },
  { file: 'bangaaru-thiiga', source: 'assets/brochure-imgs/p5_img2.png', label: 'Grouper' },
  { file: 'white-pomfret', source: 'assets/brochure-imgs/p5_img0.png', label: 'White Pomfret' },
  { file: 'gaddi-chaapa', source: 'assets/brochure-imgs/p6_img0.png', label: 'Black Pomfret' },
  { file: 'mackerel', source: 'assets/brochure-imgs/p6_img1.png', label: 'Mackerel' },
  { file: 'bommidai', source: 'assets/brochure-imgs/p6_img2.png', label: 'Ribbon Fish' },
  { file: 'red-snapper', source: 'assets/brochure-imgs/p6_img3.png', label: 'Red Snapper' },
  { file: 'milk-shark', source: 'assets/brochure-imgs/p7_img0.png', label: 'Milk Shark' },
  { file: 'salmon', source: 'assets/brochure-imgs/p7_img3.png', label: 'Salmon' },
  { file: 'mullet', source: 'assets/brochure-imgs/p8_img0.png', label: 'Mullet' },
  { file: 'mrigal', source: 'assets/brochure-imgs/p9_img1.png', label: 'Mrigal' },
  { file: 'basa', source: 'assets/brochure-imgs/p9_img2.png', label: 'Grass Carp' },
  { file: 'murrel', source: 'assets/brochure-imgs/p10_img0.png', label: 'Murrel' },
  { file: 'chinese-pomfret', source: 'assets/brochure-imgs/p10_img2.png', label: 'Chinese Pomfret' },
];

function sandSvg(size) {
  const cx = size / 2;
  const cy = size / 2;
  const ripples = Array.from({ length: 10 }, (_, i) => {
    const r = 100 + i * 70;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#d9cdb8" stroke-width="1.5" opacity="0.45"/>`;
  }).join('');

  const shells = [
    [120, 1320, '#f5ebe0'],
    [1380, 1280, '#efe3d6'],
    [280, 220, '#f8f0e6'],
    [1320, 280, '#f0e4d8'],
    [200, 900, '#f6ede3'],
    [1200, 1100, '#ede1d4'],
  ]
    .map(
      ([x, y, c]) =>
        `<ellipse cx="${x}" cy="${y}" rx="18" ry="12" fill="${c}" stroke="#d4c4b0" stroke-width="1"/>`
    )
    .join('');

  const seaGlass = [
    [180, 1180, '#a8d8e8', 14],
    [1450, 350, '#b8e0c8', 12],
    [350, 1350, '#c8d8f0', 10],
    [1100, 200, '#d0e8d8', 11],
    [100, 600, '#b0d0e0', 9],
  ]
    .map(
      ([x, y, c, r]) =>
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="0.75"/>`
    )
    .join('');

  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="sand" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stop-color="#f3ead8"/>
        <stop offset="100%" stop-color="#e6d9c4"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#sand)"/>
    ${ripples}
    ${seaGlass}
    ${shells}
  </svg>`);
}

function plateSvg(size) {
  const cx = size / 2;
  const cy = size / 2 - 40;
  const r = 340;
  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="#b87333" stroke-width="10"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#1a1a1a"/>
    <ellipse cx="${cx}" cy="${cy + 80}" rx="${r - 40}" ry="30" fill="#000" opacity="0.25"/>
  </svg>`);
}

function garnishSvg(size) {
  const cx = size / 2;
  const cy = size / 2 - 40;
  return Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${cx - 200}, ${cy - 180})">
      <ellipse cx="0" cy="0" rx="28" ry="14" fill="#f5c842" stroke="#e0a820" stroke-width="1"/>
      <ellipse cx="36" cy="8" rx="24" ry="12" fill="#f8d060" stroke="#e0a820" stroke-width="1"/>
      <ellipse cx="-32" cy="10" rx="22" ry="11" fill="#f5c842" stroke="#e0a820" stroke-width="1"/>
    </g>
    <g transform="translate(${cx + 120}, ${cy + 100})">
      <circle cx="0" cy="0" r="16" fill="#2d5016" opacity="0.9"/>
      <circle cx="20" cy="-8" r="14" fill="#3a6b1e" opacity="0.85"/>
      <circle cx="-18" cy="6" r="12" fill="#2d5016" opacity="0.8"/>
    </g>
    <polygon points="${cx - 160},${cy + 140} ${cx - 145},${cy + 110} ${cx - 130},${cy + 140}" fill="#8B4513"/>
    <polygon points="${cx - 150},${cy + 130} ${cx - 135},${cy + 100} ${cx - 120},${cy + 130}" fill="#A0522D"/>
    <circle cx="${cx - 140}" cy="${cy + 160}" r="5" fill="#1a1a1a"/>
    <circle cx="${cx - 125}" cy="${cy + 168}" r="4" fill="#1a1a1a"/>
    <circle cx="${cx - 110}" cy="${cy + 155}" r="4" fill="#1a1a1a"/>
    <rect x="${cx + 100}" y="${cy - 160}" width="8" height="50" rx="3" fill="#C4A574" transform="rotate(25 ${cx + 104} ${cy - 135})"/>
    <polygon points="${cx + 130},${cy - 120} ${cx + 138},${cy - 95} ${cx + 146},${cy - 120}" fill="#C4A574"/>
  </svg>`);
}

function badgeSvg() {
  return Buffer.from(`<svg width="200" height="56" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="56" rx="28" fill="#0B36B8"/>
    <text x="100" y="37" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="22" fill="#ffffff" letter-spacing="2">PREMIUM</text>
  </svg>`);
}

async function removeLightBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 228;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0;
    } else if (r >= 200 && g >= 200 && b >= 200) {
      const avg = (r + g + b) / 3;
      data[i + 3] = Math.round(Math.max(0, Math.min(255, (228 - avg) * 6)));
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function prepareFishLayer(source, size) {
  const fishSize = Math.round(size * 0.5);
  const resized = await sharp(source)
    .resize(fishSize, fishSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return removeLightBackground(resized);
}

async function buildFlatLay(fish) {
  const [sand, plate, garnish, badge, fishLayer] = await Promise.all([
    sharp(sandSvg(SIZE)).png().toBuffer(),
    sharp(plateSvg(SIZE)).png().toBuffer(),
    sharp(garnishSvg(SIZE)).png().toBuffer(),
    sharp(badgeSvg()).png().toBuffer(),
    prepareFishLayer(fish.source, SIZE),
  ]);

  const fishMeta = await sharp(fishLayer).metadata();
  const fishLeft = Math.round((SIZE - fishMeta.width) / 2);
  const fishTop = Math.round((SIZE - fishMeta.height) / 2 - 50);

  return sharp(sand)
    .composite([
      { input: plate, top: 0, left: 0 },
      { input: fishLayer, top: fishTop, left: fishLeft },
      { input: garnish, top: 0, left: 0 },
      { input: badge, top: 48, left: 48 },
    ])
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 0.35 })
    .png({ compressionLevel: 5, quality: 98 })
    .toFile(path.join(OUT_DIR, `${fish.file}.png`));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const fish of FISH) {
    if (!fs.existsSync(fish.source)) {
      console.warn(`Skip ${fish.file}: missing ${fish.source}`);
      continue;
    }
    await buildFlatLay(fish);
    const stat = fs.statSync(path.join(OUT_DIR, `${fish.file}.png`));
    console.log(`✓ ${fish.file}.png (${Math.round(stat.size / 1024)} KB)`);
  }
  console.log(`\nGenerated ${FISH.length} HD coastal flat-lay images at ${SIZE}px`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
