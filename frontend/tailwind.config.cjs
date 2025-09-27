/**** Tailwind Config ****/
/**** cjs for compatibility ****/
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#14b8a6',
      }
    },
  },
  plugins: [],
}
