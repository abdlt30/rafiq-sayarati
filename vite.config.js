import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ✅ المسار يطابق اسم المستودع الحقيقي
  base: '/rafiq-sayarati/', 
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
