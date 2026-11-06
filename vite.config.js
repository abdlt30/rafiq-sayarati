import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // ⚠️ هام جداً: يجب أن يتطابق هذا الاسم مع اسم مستودعك على GitHub بالضبط
  // إذا كان اسم المستودع rafq-sayarati (كما في الصورة)، فاجعله '/rafq-sayarati/'
  base: '/rafiq-sayarati/', 
});
