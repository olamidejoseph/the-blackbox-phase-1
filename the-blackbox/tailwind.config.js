/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      letterSpacing: {
        tighter2: "-0.075em",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
