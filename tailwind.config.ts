/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // WAVEY warm-brown brand palette
          ink: "#2C1810",        // main dark
          brand: "#A8623E",      // brand accent
          cream: "#F7EBE0",      // light beige
          page: "#FDF7F3",       // page background
          cta: "#EDCFB8",        // search/input border
          muted: "#A89890",      // secondary text
          sub: "#6B5C52",        // body secondary
          navmut: "#7B6B64",     // inactive tab
          line: "#DDD4CE",       // borders/dividers
        },
        fontFamily: {
          sans: ['"Pretendard Variable"', "Pretendard", "-apple-system", "system-ui", "sans-serif"],
        },
        boxShadow: {
          card: "0 14px 30px -12px rgba(168, 98, 62, 0.32)",
          soft: "0 10px 28px rgba(44, 24, 16, 0.18)",
          nav: "0 10px 28px rgba(44, 24, 16, 0.4)",
        },
      },
    },
    plugins: [],
  }