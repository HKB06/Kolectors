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
      'darkBlue' : '#2E3B52',
      'lightBlue' : '#232D41',
      'white': '#FFFFFF',
      'black': '#000000',
    },
  },
  plugins: [],
}
