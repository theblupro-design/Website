/**
 * Builds a dark, landscape full-page background from brochure-strip.png.
 * Output: assets/brochure-stripe-bg.webp
 */
const sharp = require('sharp');
const path = require('path');

const W = 2560;
const H = 1440;
const OUT = path.join('assets', 'brochure-stripe-bg.webp');
const SRC = path.join('assets', 'brochure-strip.png');

function gradientSvg(width, height) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="g" cx="50%" cy="42%" r="75%">
        <stop offset="0%" stop-color="#122a52"/>
        <stop offset="55%" stop-color="#0a1628"/>
        <stop offset="100%" stop-color="#050a14"/>
      </radialGradient>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#081428" stop-opacity="0.35"/>
        <stop offset="50%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#030810" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`);
}

function vignetteSvg(width, height) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="v" cx="50%" cy="50%" r="68%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.45"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
  </svg>`);
}

function processStripPixels(data, channels) {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const isWhite = r > 235 && g > 235 && b > 235;
    const isNearWhite = r > 210 && g > 210 && b > 210 && max - min < 25;

    if (isWhite) {
      data[i + 3] = 0;
      continue;
    }

    if (isNearWhite) {
      data[i + 3] = Math.round(((255 - max) / 45) * 180);
      continue;
    }

    const isOrange = r > 180 && g > 70 && g < 190 && b < 120 && r > g;
    const isBlueLine = b > r + 15 && b > g + 5;

    if (isOrange) {
      data[i] = Math.min(255, Math.round(r * 0.72 + 20));
      data[i + 1] = Math.min(255, Math.round(g * 0.58 + 8));
      data[i + 2] = Math.min(255, Math.round(b * 0.45));
      data[i + 3] = 235;
    } else if (isBlueLine) {
      data[i] = Math.min(255, Math.round(r * 0.55 + 40));
      data[i + 1] = Math.min(255, Math.round(g * 0.65 + 55));
      data[i + 2] = Math.min(255, Math.round(b * 0.85 + 35));
      data[i + 3] = 210;
    } else {
      data[i] = Math.round(r * 0.75);
      data[i + 1] = Math.round(g * 0.75);
      data[i + 2] = Math.round(b * 0.82);
      data[i + 3] = 190;
    }
  }
}

async function buildStripLayer() {
  const { data, info } = await sharp(SRC)
    .rotate(90)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  processStripPixels(data, info.channels);

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer();
}

async function main() {
  const [base, stripLayer, vignette] = await Promise.all([
    sharp(gradientSvg(W, H)).resize(W, H).png().toBuffer(),
    buildStripLayer(),
    sharp(vignetteSvg(W, H)).resize(W, H).png().toBuffer(),
  ]);

  await sharp(base)
    .composite([
      { input: stripLayer, blend: 'over' },
      { input: vignette, blend: 'multiply' },
    ])
    .webp({ quality: 86, effort: 6 })
    .toFile(OUT);

  const stats = await sharp(OUT).metadata();
  console.log(`Wrote ${OUT} (${stats.width}x${stats.height}, ${Math.round((await sharp(OUT).toBuffer()).length / 1024)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
