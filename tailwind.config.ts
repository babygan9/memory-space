import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 米白色背景 - 温暖怀旧感
        cream: {
          50: "#FFFBF5",
          100: "#FDF8F0",
          200: "#F9F0E2",
        },
        // 像素风主色调
        pixel: {
          brown: "#8B7355",
          pink: "#F5B8B8",
          green: "#7CB87C",
          blue: "#7CA8D8",
          yellow: "#F0D060",
          orange: "#E8A060",
        },
      },
      fontFamily: {
        // 像素感字体 - 用 monospace 模拟
        pixel: ['"Press Start 2P"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
