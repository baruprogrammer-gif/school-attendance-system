import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        slatewash: "#eef3f0",
        fern: "#3f7d58",
        coral: "#d9654f",
        saffron: "#d9a441"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
