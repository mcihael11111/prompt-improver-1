import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy manifest.json
fs.copyFileSync(
  path.resolve(__dirname, 'manifest.json'),
  path.resolve(distDir, 'manifest.json')
);

// Copy popup.html
fs.copyFileSync(
  path.resolve(__dirname, 'popup.html'),
  path.resolve(distDir, 'popup.html')
);

// Copy content.css
const cssPath = path.resolve(__dirname, 'src/content.css');
if (fs.existsSync(cssPath)) {
  fs.copyFileSync(cssPath, path.resolve(distDir, 'content.css'));
}

// Copy fonts
const fontsDir = path.resolve(__dirname, 'src/fonts');
if (fs.existsSync(fontsDir)) {
  const destFontsDir = path.resolve(distDir, 'fonts');
  if (!fs.existsSync(destFontsDir)) {
    fs.mkdirSync(destFontsDir, { recursive: true });
  }
  const fontFiles = fs.readdirSync(fontsDir).filter(file => 
    file.endsWith('.woff2') || file.endsWith('.woff') || file.endsWith('.ttf')
  );
  
  fontFiles.forEach(file => {
    fs.copyFileSync(
      path.resolve(fontsDir, file),
      path.resolve(destFontsDir, file)
    );
  });
}

// Copy images
const imagesDir = path.resolve(__dirname, 'src/images');
if (fs.existsSync(imagesDir)) {
  const destImagesDir = path.resolve(distDir, 'images');
  if (!fs.existsSync(destImagesDir)) {
    fs.mkdirSync(destImagesDir, { recursive: true });
  }
  const imageFiles = fs.readdirSync(imagesDir);
  
  imageFiles.forEach(file => {
    fs.copyFileSync(
      path.resolve(imagesDir, file),
      path.resolve(destImagesDir, file)
    );
  });
}

console.log('Static files copied successfully!');
