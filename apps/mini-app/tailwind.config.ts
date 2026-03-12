/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "ton-blue": "#0088CC",
        "ton-dark": "#0F0F1A",
        "arena-purple": "#6C5CE7",
        "arena-purple-light": "#A29BFE",
        "arena-green": "#00D2A0",
        "arena-red": "#FF4757",
        "arena-orange": "#FFA502",
        "arena-yellow": "#FECA57",
        "surface": "#16162A",
        "surface-light": "#1E1E38",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at top, var(--tw-gradient-stops))",
        "gradient-card": "linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(0,136,204,0.06) 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 40px rgba(108,92,231,0.15)",
        "glow-green": "0 0 20px rgba(0,210,160,0.12)",
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
