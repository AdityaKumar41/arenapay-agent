/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ton-blue": "#0088CC",
        "ton-dark": "#1A1A2E",
        "arena-purple": "#6C5CE7",
        "arena-green": "#00D2A0",
        "arena-red": "#FF4757",
        "arena-orange": "#FFA502",
        "arena-yellow": "#FECA57",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
