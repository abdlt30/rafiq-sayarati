/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a', // الخلفية الرئيسية
          800: '#1e293b', // لون الكروت
          700: '#334155', // الحدود
        },
        brand: {
          500: '#3b82f6', // الأزرق الأساسي
          600: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
