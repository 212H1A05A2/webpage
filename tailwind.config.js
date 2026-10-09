/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d'
        },
        ox: {
          x: '#ef4444',
          o: '#3b82f6',
          bg: '#1e293b'
        },
        sos: {
          s: '#8b5cf6',
          o: '#ec4899',
          line: '#eab308'
        }
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        }
      },
      animation: {
        'pop-in': 'pop-in 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
