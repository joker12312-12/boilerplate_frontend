// tailwind.config.js
module.exports = {
  theme: {
    extend: {},
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      between: { raw: '(min-width: 1250px) and (max-width: 1700px)' },
      '3xl': '1700px',
    },
  },
  plugins: [],
};
