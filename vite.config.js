import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ✅ المسار الصحيح والمطابق لاسم المستودع على GitHub
  base: '/rafiq-sayarati/', 
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
