import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ⚠️ هام جداً: يجب أن يتطابق هذا الاسم مع اسم مستودعك على GitHub بالضبط
  // إذا كان اسم المستودع rafiq-sayarati فاتركه كما هو. 
  // إذا كان اسم المستودع raf فقط، فغيره إلى '/raf/'
  base: '/rafiq-sayarati/', 
  resolve: {
    // هذا السطر يمنع مشكلة تحميل نسختين من React (التي تسبب أخطاء غريبة)
    dedupe: ['react', 'react-dom'], 
  }
});
