/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-bright": "#282b3a",
        "outline": "#737580",
        "secondary": "#fc7c7f",
        "surface-container-high": "#1c1f2b",
        "secondary-dim": "#f5777a",
        "surface-container-low": "#11131d",
        "surface-container-lowest": "#000000",
        "surface-container-highest": "#222532",
        "outline-variant": "#464752",
        "background": "#0c0e17",
        "on-surface": "#f0f0fd",
        "surface-container": "#171924",
        "primary-container": "#ff7856",
        "surface": "#0c0e17",
        "on-surface-variant": "#aaaab7",
        "primary": "#ff8f73",
        "on-primary": "#5e1000",
        "error": "#ff6e84",
        "secondary-container": "#84222a",
        "on-secondary-container": "#ffc1c0"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      }
    },
  },
  plugins: [],
}