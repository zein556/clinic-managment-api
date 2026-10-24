/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          dark: '#0B132B',      // أزرق كحلي داكن فاخر
          primary: '#1C2541',   // أزرق داكن ملكي
          accent: '#06B6D4',    // تركواز مضيء
          light: '#F8FAFC',     // أبيض عاجي فاتح
        }
      }
    },
  },
  plugins: [],
}