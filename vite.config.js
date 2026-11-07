import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ✅ التصحيح الجذري: يجب أن يتطابق هذا المسار مع اسم مجلدك في GitHub
  base: '/raf/', 
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
