/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        dark: '#2D3436',
        light: '#F5F6FA'
      }
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
    }
  },
  plugins: []
}