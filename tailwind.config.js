/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bedc',
          400: '#5f9ecb',
          500: '#3880b5',
          600: '#276697',
          700: '#20527b',
          800: '#1c4566',
          900: '#0f2942', // Deep AICTE Navy
          950: '#091929',
        },
        navy: {
          850: '#112233',
          900: '#0B192C',
          950: '#060E1A',
        },
        slate: {
          750: '#293548',
          850: '#172033',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px 0 rgba(15, 41, 66, 0.06), 0 1px 2px 0 rgba(15, 41, 66, 0.04)',
        elevation: '0 4px 6px -1px rgba(15, 41, 66, 0.08), 0 2px 4px -1px rgba(15, 41, 66, 0.04)',
      }
    },
  },
  plugins: [],
}
