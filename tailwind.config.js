/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/js/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      spacing: {
        16: "64px",
        20: "80px",
        25: "100px",
        30: "120px",
        84: "336px",
      },
      colors: {
        gold: "#F0B90B",
        darkgold: "oklch(68.1% 0.162 75.834)",
      },
    },
  },
  plugins: [],
};
