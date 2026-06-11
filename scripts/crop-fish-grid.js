const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const src = 'assets/product-imgs/fish-grid-v2-source.png';
const outDir = 'assets/product-imgs/fish';
const cols = 5;
const rows = 5;
const pad = 4;
const imageHeightRatio = 1;
const targetWidth = 1200;

const names = {
  1: 'catla',
  2: 'rohu',
  3: 'sea-bass',
  4: 'seer-fish',
  5: 'mackerel',
  6: 'murrel',
  7: 'mullet',
  8: 'red-snapper',
  9: 'tilapia',
  10: 'white-pomfret',
  11: 'murrel-board',
  12: 'mullet-2',
  13: 'tilapia-2',
  14: 'white-fish',
  15: 'white-pomfret-2',
  16: 'gaddi-chaapa',
  17: 'bangaaru-thiiga',
  18: 'bommidai',
  19: 'basa',
  20: 'white-pomfret-3',
  21: 'chinese-pomfret',
  22: 'salmon',
  23: 'mrigal',
  24: 'anchovies',
  25: 'milk-shark',
};

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const { width, height } = await sharp(src).metadata();
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  const tileH = Math.floor(cellH * imageHeightRatio);

  let i = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      i++;
      const left = c * cellW + pad;
      const top = r * cellH + pad;
      const w = cellW - pad * 2;
      const h = tileH - pad * 2;

      const name = names[i] || `fish-${String(i).padStart(2, '0')}`;
      const outPath = path.join(outDir, `${name}.png`);

      await sharp(src)
        .extract({ left, top, width: w, height: h })
        .resize(targetWidth, null, {
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: false,
        })
        .sharpen({ sigma: 0.6, m1: 0.5, m2: 0.3 })
        .png({ compressionLevel: 6, quality: 95 })
        .toFile(outPath);
    }
  }

  console.log(`Cropped and upscaled ${i} fish images to ${targetWidth}px wide`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
