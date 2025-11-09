/** @type {import('tailwindcss').Config} */
module.exports = {
    // This tells Tailwind which files to scan for class names
    content: [
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        // You can add custom colors, fonts, or utilities here
      },
    },
    plugins: [
      // Registers the animation plugin you just installed
      require('tailwindcss-animate'),
    ],
  };