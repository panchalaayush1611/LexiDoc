export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#21FA901A',
          100: '#21FA9033',
          200: '#21FA904D',
          300: '#21FA9080',
          400: '#21FA90',
          500: '#21FA90', // User's requested neon accent
          600: '#21FA90',
          700: '#1BC974',
          800: '#159656',
          900: '#0F643A',
          950: '#093A22',
        },
        slate: {
          50: '#FFFFFF', // User's light mode background
          100: '#F8F9FA', 
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#6C757D',
          700: '#495057',
          800: '#4a4e5a', // Darker gray for cards
          900: '#424651', // User's requested dark bg
          950: '#383b45', // Even darker gray
        },
        surface: {
          light: '#FFFFFF',
          lightSub: '#F8FAFC',
          dark: '#424651',
          darkCard: '#383b45',
          darkBorder: '#4a4e5a',
        },
      },
      fontFamily: {
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.04)',
        card: '0 4px 12px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'scale(0.98)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        bounceDot: { '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: 0.4 }, '40%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        slideUp: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        slideDown: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        bounceDot: 'bounceDot 1.4s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}



