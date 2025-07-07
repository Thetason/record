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
        primary: {
          DEFAULT: "#FF6B35",
          50: "#FFF5F1",
          100: "#FFE5DA",
          200: "#FFCAB5",
          300: "#FFAB8A",
          400: "#FF8B5F",
          500: "#FF6B35",
          600: "#FF4500",
          700: "#CC3700",
          800: "#992A00",
          900: "#661C00",
        },
        secondary: {
          DEFAULT: "#FF8CC8",
          50: "#FFF5FB",
          100: "#FFE6F5",
          200: "#FFCCED",
          300: "#FFB3E3",
          400: "#FF9FD8",
          500: "#FF8CC8",
          600: "#FF66B8",
          700: "#FF3FA7",
          800: "#E6208E",
          900: "#B31A6F",
        },
        background: "#FAFAFA",
        foreground: "#2D3748",
        gray: {
          50: "#F7FAFC",
          100: "#EDF2F7",
          200: "#E2E8F0",
          300: "#CBD5E0",
          400: "#A0AEC0",
          500: "#718096",
          600: "#4A5568",
          700: "#2D3748",
          800: "#1A202C",
          900: "#171923",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 12px 25px -5px rgba(0, 0, 0, 0.08)',
        'large': '0 10px 40px -3px rgba(0, 0, 0, 0.1), 0 20px 50px -5px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
      },
      transitionDuration: {
        '250': '250ms',
      },
    },
  },
  plugins: [],
}