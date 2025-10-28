import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [192, 512];
const inputSvg = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Generating PWA icons from icon.svg...');

  if (!fs.existsSync(inputSvg)) {
    console.error('❌ Error: icon.svg not found in public folder');
    process.exit(1);
  }

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `pwa-${size}x${size}.png`);

    try {
      await sharp(inputSvg)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 15, b: 30, alpha: 1 }, // #0f0f1e
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size} icon:`, error);
    }
  }

  console.log('✨ PWA icons generated successfully!');
}

generateIcons().catch(console.error);
