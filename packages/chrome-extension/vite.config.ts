import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Determine which entry we're building via ENTRY env var.
// Build script runs vite 3 times: once per entry point.
// This is required because content scripts can't use ES module imports.
const entry = process.env.ENTRY || 'contentScript';

const entries: Record<string, { input: string; format: 'iife' | 'es' }> = {
  contentScript: {
    input: resolve(__dirname, 'src/content/index.tsx'),
    format: 'iife',
  },
  background: {
    input: resolve(__dirname, 'src/background/index.ts'),
    format: 'es',
  },
  popup: {
    input: resolve(__dirname, 'src/popup/index.tsx'),
    format: 'iife',
  },
};

const current = entries[entry];

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: entry === 'contentScript', // Only clean on first build
    rollupOptions: {
      input: current.input,
      output: {
        format: current.format,
        entryFileNames: `${entry}.js`,
        assetFileNames: 'assets/[name][extname]',
        inlineDynamicImports: true,
      },
    },
    target: 'esnext',
    minify: 'terser',
    copyPublicDir: entry === 'contentScript', // Only copy public/ once
  },
  publicDir: 'public',
});
