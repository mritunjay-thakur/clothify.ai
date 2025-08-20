export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      translate: {
        101: "101%",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        shine: "shine 5s linear infinite",
        marquee: "marquee 15s linear infinite",
        first: "first 20s ease infinite",
        second: "second 25s ease infinite",
        third: "third 20s ease infinite",
        fourth: "fourth 30s ease infinite",
        fifth: "fifth 25s ease infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
        marquee: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(-50%)" },
        },
        first: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        second: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(-180deg) scale(1.1)" },
          "100%": { transform: "rotate(-360deg) scale(1)" },
        },
        third: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        fourth: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(-180deg) scale(1.1)" },
          "100%": { transform: "rotate(-360deg) scale(1)" },
        },
        fifth: {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.1)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
