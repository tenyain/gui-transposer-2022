/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      // 'primary': ['Inter', 'sans-serif'],
      'primary': ['Fira Mono', 'monospace']
    },
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
};
