import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ✅ المسار الصحيح ليتطابق مع الرابط abdlt30.github.io/raf
  base: '/raf/', 
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
