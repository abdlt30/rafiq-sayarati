import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // ✅ المسار الصحيح والمطابق لاسم المستودع في GitHub
  base: '/rafiq-sayarati/', 
  
  resolve: {
    // ✅ يمنع تحميل نسختين من React (يمنع خطأ Invalid Hook Call)
    dedupe: ['react', 'react-dom'], 
  },

  // ✅ تحسينات البناء للإنتاج (Enterprise-Grade)
  build: {
    outDir: 'dist',
    sourcemap: false, // إخفاء الكود المصدري في النسخة النهائية (أمان + حجم أقل)
    chunkSizeWarningLimit: 1000, // رفع حد التحذير لأن مكتبة الخرائط كبيرة
    rollupOptions: {
      output: {
        // ✅ تقسيم الحزم لتسريع التحميل (Code Splitting)
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts-vendor': ['recharts'],
          'maps-vendor': ['leaflet', 'react-leaflet'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
});
