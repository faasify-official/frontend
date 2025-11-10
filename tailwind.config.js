/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF7A18',
          dark: '#E35F00',
          light: '#FFB347',
        },
        charcoal: '#2D2A32',
      },
    },
  },
  plugins: [],
}
