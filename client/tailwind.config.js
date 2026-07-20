/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#05070f',
          900: '#0a1128',
          800: '#101a3d',
          700: '#182352',
          600: '#212f6b',
        },
        remax: {
          blue: '#003DA5',
          red: '#DC1C2E',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'remax-gradient': 'linear-gradient(135deg, #003DA5 0%, #DC1C2E 100%)',
      },
      boxShadow: {
        block: '3px 3px 0 rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
