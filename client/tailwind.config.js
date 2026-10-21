/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Superficies: azul medianoche en lugar de negro neutro
        ink: {
          950: '#080d18',
          900: '#0d1424',
          800: '#131c30',
          700: '#1c2842',
          600: '#2a3a5c',
        },
        chalk: '#e6ecf8',
        mist: '#8392b0',
        // Ámbar de señal de precaución: acción principal y cambios sin guardar
        hazard: {
          DEFAULT: '#ffb224',
          soft: '#ffc85a',
        },
        go: '#3ddc97',
        stop: '#ff6b6b',
        info: '#5ec2ff',
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
