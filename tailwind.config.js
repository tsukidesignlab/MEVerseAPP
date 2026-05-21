/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        meverse: {
          primary: '#4F4FF5',
          accent: '#C8FF00',
          accent2: '#D4FF3D',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['VT323', 'monospace'],
        noto: ['"Noto Sans TC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
