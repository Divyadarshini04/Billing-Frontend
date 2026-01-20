export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        light: "#F5F8FC",
        primary: "#2563EB",
        secondary: "#3B82F6",
        accent: "#16A34A",
        bgLight: "#F8FAFC",
        textDark: "#1E293B",
        "dark-sidebar": "#1a1f35",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
