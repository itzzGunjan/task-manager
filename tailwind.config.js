/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#eef3f8",
        line: "#d8e2ec",
        brand: "#2563eb",
        success: "#0f8a5f",
        warning: "#b7791f",
        danger: "#c2410c"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};
