import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/rafiq-sayarati/', // تأكد أن هذا هو اسم مستودعك بالضبط
})
