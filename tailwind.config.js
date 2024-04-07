/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    
    colors: {
      'primaryBrown' : '#9D775D',
      'primaryBeige' : '#FFE3CB',
      'secondaryBeige' : '#FFF1E5',
      'lightBeige' : '#FFF9F5',
      'darkBlue' : '#171925',
      'red' : '#E73343',
      'darkred': '#A52B3A',
      'lightBlue' : '#232D41',
      'white': '#FFFFFF',
      'black': '#000000',
    },
  },
  plugins: [],
}