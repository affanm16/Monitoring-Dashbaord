/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // You can define specific dark mode colors here if needed,
        // but many will be handled by dark: prefixes in components.
        // Example:
        // background_dark: "#1a202c",
        // foreground_dark: "#e2e8f0",
      },
    },
  },
  plugins: [],
};
