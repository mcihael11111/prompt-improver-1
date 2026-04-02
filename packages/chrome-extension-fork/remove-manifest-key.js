import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distManifestPath = path.resolve(__dirname, 'dist/manifest.json');

// Read the manifest from dist
const manifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf-8'));

// Remove the key field
delete manifest.key;

// Write back to dist
fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, '\t') + '\n', 'utf-8');

console.log('Removed "key" field from dist/manifest.json for store build');
