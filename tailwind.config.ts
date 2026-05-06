
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '390px',
        'md': '428px',
        'lg': '768px',
        'xl': '1024px',
      },
    },
  },
  plugins: [],
} satisfies Config;
