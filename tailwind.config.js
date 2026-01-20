/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
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
        "dark-bg": "#0f172a",
        "dark-card": "#1e293b",
        "dark-border": "#334155",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
        "gradient-dark": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.08)",
        "card-dark": "0 4px 20px rgba(0,0,0,0.3)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        orbitron: ["Orbitron", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
