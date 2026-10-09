/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka One"', 'Nunito', 'sans-serif'],
        body: ['Nunito', 'Inter', 'sans-serif'],
      },
      colors: {
        wonder: '#c084fc',
        story: '#fb923c',
        simulate: '#38bdf8',
        play: '#4ade80',
        reflect: '#818cf8',
        gold: '#facc15',
      }
    },
  },
  plugins: [],
}
