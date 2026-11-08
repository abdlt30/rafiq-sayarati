import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/raf/', // ✅ المسار الصحيح
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
