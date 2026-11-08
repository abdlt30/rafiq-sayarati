import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ✅ المسار يجب أن يطابق اسم المستودع الحقيقي في GitHub
  base: '/rafiq-sayarati/', 
  resolve: {
    dedupe: ['react', 'react-dom'], 
  }
});
