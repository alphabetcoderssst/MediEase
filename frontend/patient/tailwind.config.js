/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colors from DESIGN.md
        primary: {
          DEFAULT: '#091426',
          container: '#1e293b',
          'on-container': '#8590a6',
          fixed: '#d8e3fb',
          'fixed-dim': '#bcc7de',
        },
        secondary: {
          DEFAULT: '#006b5f',
          container: '#62fae3',
          'on-container': '#007165',
        },
        tertiary: {
          DEFAULT: '#000453',
          container: '#061286',
          'on-container': '#7b86f2',
        },
        surface: {
          DEFAULT: '#f7f9fb',
          dim: '#d8dadc',
          bright: '#f7f9fb',
          'container-lowest': '#ffffff',
          'container-low': '#f2f4f6',
          container: '#eceef0',
          'container-high': '#e6e8ea',
          'container-highest': '#e0e3e5',
        },
        'on-surface': '#191c1e',
        'on-surface-variant': '#45474c',
        outline: '#75777d',
        'outline-variant': '#c5c6cd',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          'on-container': '#93000a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
