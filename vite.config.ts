// vite.config.ts or vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, '/src/app/client'), // ← change this to whatever you want
  },
});
