import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactDir = 'C:\\Users\\anwes\\.gemini\\antigravity-ide\\brain\\c13e52aa-3a9f-4dc4-83d4-ffcedc4a0fc1';
const targetDir = path.join(__dirname, '..', 'public', 'assets', 'images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const mapping = [
  { src: 'anime_slide_1_1791540766284.jpg', base: 'slide1' },
  { src: 'anime_slide_2_1791540785386.jpg', base: 'slide2' },
  { src: 'anime_slide_3_1791540808405.jpg', base: 'slide3' },
  { src: 'anime_slide_4_1791540829997.jpg', base: 'slide4' },
  { src: 'anime_slide_5_1791540853276.jpg', base: 'slide5' },
  { src: 'anime_slide_6_1791540878104.jpg', base: 'slide6' },
  { src: 'anime_slide_5_1791540853276.jpg', base: 'slide7' },
  { src: 'anime_slide_2_1791540785386.jpg', base: 'slide8' },
];

for (const item of mapping) {
  const srcPath = path.join(artifactDir, item.src);
  if (fs.existsSync(srcPath)) {
    const destJpg = path.join(targetDir, `${item.base}.jpg`);
    const destPng = path.join(targetDir, `${item.base}.png`);
    fs.copyFileSync(srcPath, destJpg);
    fs.copyFileSync(srcPath, destPng);
    console.log(`Copied ${item.src} -> ${item.base}.jpg & ${item.base}.png`);
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
}
