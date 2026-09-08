export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        emeraldAcc: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        surface: {
          light: '#FFFFFF',
          lightSub: '#F8FAFC',
          dark: '#0B0F19',
          darkCard: '#1E293B',
          darkBorder: '#334155',
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



