import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the root directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [
    react(),
    {
      name: "copy-static-files",
      async buildStart() {
        if (mode === 'production') {
          const fs = await import("fs");
          const { default: fsp } = await import("fs/promises");
          
          const distDir = path.resolve(__dirname, "dist");
          
          try {
            // Ensure dist directory exists
            if (!fs.existsSync(distDir)) {
              fs.mkdirSync(distDir, { recursive: true });
            }

            // Copy manifest.json
            await fsp.copyFile(
              path.resolve(__dirname, "manifest.json"),
              path.resolve(distDir, "manifest.json")
            );

            // Copy popup.html
            await fsp.copyFile(
              path.resolve(__dirname, "popup.html"),
              path.resolve(distDir, "popup.html")
            );

            // Copy index.css if it exists
            const cssPath = path.resolve(__dirname, "src/content.css");
            if (fs.existsSync(cssPath)) {
              await fsp.copyFile(cssPath, path.resolve(distDir, "content.css"));
            }

            // Handle font files if they exist
            const fontsDir = path.resolve(__dirname, "src/fonts");
            if (fs.existsSync(fontsDir)) {
              const destFontsDir = path.resolve(distDir, "fonts");
              if (!fs.existsSync(destFontsDir)) {
                fs.mkdirSync(destFontsDir, { recursive: true });
              }
              const fontFiles = fs.readdirSync(fontsDir).filter(file => 
                file.endsWith('.woff2') || file.endsWith('.woff') || file.endsWith('.ttf')
              );
              
              await Promise.all(
                fontFiles.map(file => 
                  fsp.copyFile(
                    path.resolve(fontsDir, file),
                    path.resolve(destFontsDir, file)
                  )
                )
              );
            }

            // Copy images directory if it exists
            const imagesDir = path.resolve(__dirname, "src/images");
            if (fs.existsSync(imagesDir)) {
              const destImagesDir = path.resolve(distDir, "images");
              if (!fs.existsSync(destImagesDir)) {
                fs.mkdirSync(destImagesDir, { recursive: true });
              }
              const imageFiles = fs.readdirSync(imagesDir);
              
              await Promise.all(
                imageFiles.map(file => 
                  fsp.copyFile(
                    path.resolve(imagesDir, file),
                    path.resolve(destImagesDir, file)
                  )
                )
              );
            }
          } catch (err) {
            console.error("Error in copy-static-files plugin:", err);
          }
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  define: {
    'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || 'production'),
    'process.env': {},
  },
  esbuild: {
    // This will remove all process.env.* references in the production build
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
  },
}});
