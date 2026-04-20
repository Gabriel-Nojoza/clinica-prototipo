import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1999dd",
        accent: "#8ad6c7",
        surface: "#f6f7fb",
        ink: "#22415a",
        peach: "#f5b5a7",
        lavender: "#c9c2ec",
        mint: "#9edcc7",
        sky: "#6dc6ef",
      },
      boxShadow: {
        card: "0 20px 40px rgba(25, 153, 221, 0.14)",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at 15% 20%, rgba(245,181,167,0.42), transparent 25%), radial-gradient(circle at 80% 24%, rgba(201,194,236,0.4), transparent 24%), radial-gradient(circle at 50% 0%, rgba(158,220,199,0.38), transparent 26%), linear-gradient(180deg, #1aa0e0 0%, #168fd1 58%, #1177bb 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
