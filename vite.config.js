// vite.config.js
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  base: '/yela-room/',
  publicDir: 'public', // needed so vite copies your /draco/ folder
  build: {
    outDir: 'dist',
    target: 'esnext',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          vendor: ['gsap'],
        },
      },
    },
  },
  plugins: [
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
  ],
});
