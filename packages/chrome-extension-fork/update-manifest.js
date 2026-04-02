import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get environment from command line args
const env = process.argv[2] || 'production';

// Read the config file to get API_URL
const configContent = fs.readFileSync(path.resolve(__dirname, 'src/config.ts'), 'utf-8');

// Extract API_URL based on environment
let apiUrl;
if (env === 'development') {
  const devMatch = configContent.match(/development:\s*{[^}]*API_URL:\s*['"]([^'"]+)['"]/s);
  apiUrl = devMatch ? devMatch[1] : null;
} else {
  const prodMatch = configContent.match(/production:\s*{[^}]*API_URL:\s*['"]([^'"]+)['"]/s);
  apiUrl = prodMatch ? prodMatch[1] : null;
}

if (!apiUrl) {
  console.error('Could not extract API_URL from config.ts');
  process.exit(1);
}

// Read manifest.json
const manifestPath = path.resolve(__dirname, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Update host_permissions to include API_URL
const apiPermission = `${apiUrl}/*`;

// Remove any existing prompt-improver/onrender.com URLs from host_permissions
manifest.host_permissions = manifest.host_permissions.filter(
  perm => !perm.includes('prompt-improver') && !perm.includes('onrender.com')
);

// Add the current environment's API URL
manifest.host_permissions.push(apiPermission);

// Write the updated manifest to source
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n', 'utf-8');

console.log(`Manifest updated with API_URL: ${apiUrl}`);
