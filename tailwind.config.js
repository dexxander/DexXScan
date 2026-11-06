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
        background: '#090B10',
        sidebar: '#0D1017',
        card: '#121722',
        elevated: '#171E2B',
        accent: {
          primary: '#22C55E',
          secondary: '#3B82F6',
        },
        border: {
          DEFAULT: '#252D3B',
          subtle: '#1C2331',
          hover: '#333D50',
        },
        text: {
          main: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        severity: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#EAB308',
          low: '#3B82F6',
          info: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.4)',
        'glow-green': '0 0 15px -3px rgba(34, 197, 94, 0.25)',
        'glow-blue': '0 0 15px -3px rgba(59, 130, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
