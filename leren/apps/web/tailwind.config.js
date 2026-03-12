export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#3b82f6', dark: '#1d4ed8', light: '#93c5fd' },
        surface: { DEFAULT: '#0f172a', card: '#1e293b', border: '#334155' },
      },
      fontFamily: { sans: ['"Inter"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
