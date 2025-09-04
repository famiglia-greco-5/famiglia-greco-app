/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wood': {
          50: '#fdf8f3',
          100: '#f7e6d3',
          200: '#ecc89f',
          300: '#dea46b',
          400: '#d18441',
          500: '#c2692a',
          600: '#a85020',
          700: '#8b3d1e',
          800: '#70321f',
          900: '#5a2a1c',
        },
        'postit': {
          yellow: '#ffeb3b',
          pink: '#e91e63',
          blue: '#2196f3',
          green: '#4caf50',
          orange: '#ff9800',
          purple: '#9c27b0',
        }
      },
      fontFamily: {
        'handwriting': ['Kalam', 'cursive'],
      }
    },
  },
  plugins: [],
} 
