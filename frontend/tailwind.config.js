/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f5',
          100: '#b3e9e3',
          200: '#80dbd1',
          300: '#4dcdbf',
          400: '#1abfad',
          500: '#10a693',
          600: '#0c8273',
          700: '#095d53',
          800: '#053933',
          900: '#021413',
        },
        secondary: {
          50: '#e6f0ff',
          100: '#b3d4ff',
          200: '#80b8ff',
          300: '#4d9cff',
          400: '#1a80ff',
          500: '#0066e6',
          600: '#0050b3',
          700: '#003a80',
          800: '#00244d',
          900: '#000e1a',
        },
      },
    },
  },
  plugins: [],
}
