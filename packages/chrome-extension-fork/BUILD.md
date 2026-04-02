# Build Instructions

This project supports environment-specific builds to easily switch between development and production API endpoints.

## Build Commands

### Development Build
```bash
pnpm build:dev
```
This builds the extension with development environment URLs:
- Updates `manifest.json` with development API URL in `host_permissions`
- Builds with `VITE_ENV=development`
- All code is bundled without chunk files

### Production Build
```bash
pnpm build:prod
```
This builds the extension with production environment URLs:
- Updates `manifest.json` with production API URL in `host_permissions`
- Builds with `VITE_ENV=production`
- All code is bundled without chunk files
- Keeps the "key" field in manifest (for local development/testing)

### Store Build (for Chrome Web Store)
```bash
pnpm build:store
```
This builds the extension for Chrome Web Store submission:
- Uses production environment URLs
- **Removes the "key" field** from `dist/manifest.json`
- All code is bundled without chunk files

> **Note:** The source `manifest.json` always keeps the "key" field. Only the built version in `dist/` has it removed for store builds.

## Build Architecture

The build process uses separate Vite configurations for each entry point to prevent code splitting:
- `vite.background.config.ts` - Builds `background.js`
- `vite.contentScript.config.ts` - Builds `contentScript.js`
- `vite.popup.config.ts` - Builds `popup.js`

This ensures all dependencies (including `config.ts`) are inlined into each bundle, eliminating separate chunk files.

## Configuration

All URL constants are centralized in `src/config.ts`. This file contains environment-specific configurations for:

- `API_URL` - Backend API endpoint
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_MANAGE_SUBSCRIPTION_LINK` - Stripe subscription management link
- `STRIPE_STARTER_MONTHLY_LINK` - Stripe starter plan monthly payment link
- `STRIPE_PRO_MONTHLY_LINK` - Stripe pro plan monthly payment link
- `STRIPE_PRO_YEARLY_LINK` - Stripe pro plan yearly payment link
- `WEBSITE_URL` - Main website URL
- `FAQ_URL` - FAQ page URL

## How It Works

1. **Manifest Update** (`update-manifest.js`)
   - Reads `src/config.ts` to extract the API_URL for the specified environment
   - Updates `manifest.json` to include only the API_URL in `host_permissions`
   - Removes any old API URLs from previous builds

2. **Build Process**
   - Each entry point is built separately using its own Vite config
   - The `VITE_ENV` environment variable determines which config values are used
   - All imports (including `config.ts`) are inlined into the bundle

3. **Static Files** (`copy-static-files.js`)
   - Copies `manifest.json`, `popup.html`, `content.css`, fonts, and images to `dist/`

4. **Store Build** (`remove-manifest-key.js`)
   - Removes the "key" field from `dist/manifest.json` for Chrome Web Store submissions

## Updating URLs

To add or modify URLs:
1. Edit `src/config.ts`
2. Add the new constant to both `development` and `production` configurations
3. Export the constant in the export statement at the bottom
4. Import and use it in your components: `import { YOUR_CONSTANT } from './config'`
5. Run the appropriate build command
