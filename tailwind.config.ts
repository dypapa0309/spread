import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        spread: {
          bg: "#F7F5EF",
          ink: "#1E1E1E",
          point: "#7A5CFF"
        }
      },
      borderRadius: {
        spread: "18px"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(30, 30, 30, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
