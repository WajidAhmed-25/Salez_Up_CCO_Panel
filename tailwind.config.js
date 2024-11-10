const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      keyframes: {
        slideOutLeft: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        slideOutLeft: 'slideOutLeft 0.5s ease-in',
        slideInRight: 'slideInRight 0.5s ease-out',
      },
    },
    colors: {
      "dGreen": "#072D20",
      "lGreen": "#F5FBFA",
      "themeGreen": "#1E8675",
      "themeGray": "#626E70",
    },
  },

  plugins: [
    flowbite.plugin(),
  ],
}

