/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Indian government palette */
        navy:        '#0B1F4F',
        'navy-dark': '#071540',
        'navy-light':'#1A3369',
        saffron:     '#FF6700',
        'saffron-lt':'#FF8C38',
        'gov-green': '#128807',
        gold:        '#C8A400',
        'gold-lt':   '#E8C420',
        neutral:     '#4A5568',
        /* Legacy aliases so existing pages still compile */
        primary:     '#0B1F4F',
        'primary-dark': '#071540',
        accent:      '#1A3369',
        success:     '#1B7A34',
        warning:     '#D97706',
        danger:      '#C0392B',
      },
      fontFamily: {
        sans:  ['Noto Sans', 'Arial', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        gov:   '0 1px 4px rgba(11,31,79,0.10)',
        'gov-lg': '0 6px 24px rgba(11,31,79,0.15)',
      },
      borderRadius: {
        gov: '4px',
      },
    },
  },
  plugins: [],
}