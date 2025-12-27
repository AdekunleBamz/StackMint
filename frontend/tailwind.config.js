/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        stacks: {
          purple: '#5546FF',
          dark: '#0C0C0D',
        }
      }
    },
  },
  plugins: [],
}
