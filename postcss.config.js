// postcss.config.js (ESM)
export default {
  plugins: {
    theme: {
      extend: {
        fontFamily: {
          sans: [
            "Gill Sans",
            "Gill Sans MT",
            "Calibri",
            "Trebuchet MS",
            "sans-serif",
          ],
        },
      },
    },
    "@tailwindcss/postcss": {},
  },
};
