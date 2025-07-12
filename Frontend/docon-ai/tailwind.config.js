/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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