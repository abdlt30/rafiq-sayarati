/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // تفعيل الوضع الداكن
  theme: {
    extend: {
      colors: {
        // ألوان DriveLife
        dl: {
          bg: '#070b14',
          surface: '#0e1526',
          surface2: '#141d33',
          surface3: '#1a2540',
          text: '#e9eefc',
          muted: '#7f8dae',
          border: '#1e2a44',
          primary: '#2f6bff',
          primary2: '#5b8dff',
          success: '#22c55e',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'dl': '18px',
        'dl-sm': '12px',
        'dl-lg': '26px',
      }
    },
  },
  plugins: [],
}
