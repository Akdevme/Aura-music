/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "playercontrols": "#00000077",
        "play-button-overlay": "#FFFFFF6D",
        "ssbg": "#ffffff59",
      },
    },
  },
  plugins: [],
};
