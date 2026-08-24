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
          bg: '#030708',
          surface: '#061014',
          card: '#08171d',
          cardHover: '#0d222b',
          border: 'rgba(45, 212, 191, 0.15)',
          borderGlow: 'rgba(45, 212, 191, 0.4)',
        },
        mint: {
          400: '#2dd4bf',
          500: '#14b8a6',
          DEFAULT: '#2dd4bf',
          glow: '#2dd4bf',
        },
        forest: {
          50: '#041612',
          100: '#07241e',
          200: '#0b362d',
          300: '#125446',
          400: '#1a7562',
          500: '#229b82',
          600: '#2dd4bf',
          700: '#14b8a6',
          800: '#0f766e',
          900: '#115e59',
          950: '#042f2e',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.6)',
        'glow-teal': '0 0 30px rgba(45, 212, 191, 0.55)',
        'glow-teal-lg': '0 0 60px rgba(45, 212, 191, 0.75)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'ripple': 'ripple 6s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '50%': { transform: 'scale(1.15)', opacity: '0.2' },
          '100%': { transform: 'scale(0.8)', opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
