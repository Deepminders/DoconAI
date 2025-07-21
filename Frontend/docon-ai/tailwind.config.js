/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.15s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: 0, transform: 'translateY(-4px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
    },
  },
},
  theme: {
    extend: {
      fontFamily: {
        // Remove all Google fonts, keep only default if needed
        // Example: sans: ['ui-sans-serif', 'system-ui', ...],
      },
    },
  },
  plugins: [],
}

