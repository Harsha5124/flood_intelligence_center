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
        fic: {
          bg: '#070d18',
          card: '#0c1930',
          'card-hover': '#112242',
          surface: '#0f1f3d',
          border: '#1a365d',
          'border-glow': '#0284c7',
          blue: '#0284c7',
          'blue-light': '#38bdf8',
          cyan: '#06b6d4',
          'cyan-bright': '#22d3ee',
          navy: '#030816',
          muted: '#94a3b8'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-blue': '0 0 25px -4px rgba(2, 132, 199, 0.4)',
        'glow-red': '0 0 25px -4px rgba(239, 68, 68, 0.45)',
        'inner-glow': 'inset 0 1px 1px 0 rgba(56, 189, 248, 0.15)',
      },
      backgroundImage: {
        'tech-grid': "radial-gradient(rgba(14, 165, 233, 0.12) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
