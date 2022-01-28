module.exports = {
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primarydark: "#a61c00",
        secondarydark: "#ca2f10",
        thirdlydark: "#e4c8c8",
        primarylight: "white",
        secondarylight: "#e2e2e2",
        primarybackground: "white", 
        secondarybackground: "#ececec",
        thirdlybackground: "#f3f3f3",
        note: "#6d6d6d",
        warning: "#e9c600",
        danger: "#ca2f10",
        good: "#00944a",
        success: "darkgreen"
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', 'sans-serif'],
        serif: ["'Merriweather'", 'serif'],
      },
    },
    boxShadow: {
      DEFAULT: '0px 1px 10px 2px rgb(233, 233, 233)',
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
