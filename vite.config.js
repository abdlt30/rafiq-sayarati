import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ✅ التصحيح: يجب أن يطابق اسم الرابط في المتصفح بالضبط
  base: '/raf/', 
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
