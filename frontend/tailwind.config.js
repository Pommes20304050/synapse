/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Claude-inspired warm dark palette
        claude: {
          bg:       '#1a1713',
          sidebar:  '#1f1b17',
          surface:  '#252118',
          border:   '#2d2620',
          hover:    '#2e2820',
          orange:   '#d97041',
          'orange-light': '#e8885f',
          'orange-dim':   '#d9704120',
          text:     '#e8ddd6',
          muted:    '#8a7a70',
          subtle:   '#4a3f38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
