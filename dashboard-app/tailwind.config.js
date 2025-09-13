/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    // Esta línea ahora le dice a Tailwind que busque en la carpeta src
    // y en TODAS sus subcarpetas (como pages, components, context, etc.)
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}