/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#040814',
        surface: '#0f172a',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#10b981',
      }
    },
  },
  plugins: [],
}
