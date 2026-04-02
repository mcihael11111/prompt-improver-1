import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input: {
          contentScript: path.resolve(__dirname, "src/contentScript.tsx")
        },
        output: {
          entryFileNames: '[name].js',
          format: 'es',
        },
      },
    },
    define: {
      'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || 'production'),
      'process.env': {},
    },
    esbuild: {
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
      },
    },
  };
});
