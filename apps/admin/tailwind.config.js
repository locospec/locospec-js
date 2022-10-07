/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/react/**/*.{js,ts,jsx,tsx}",
    "../../node_modules/@reusejs/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwindcss-animate"),
    function ({ addVariant }) {
      addVariant("initial", "html :where(&)");
    },
  ],
};
