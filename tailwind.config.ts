import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'bg-base': '#1B1D21',
        'bg-node': '#32363C',
        'text-primary': '#EDEFF3',
        'text-secondary': '#D5D8DE',
        'text-muted': '#8A8F98',
        'text-placeholder': '#7D828B',
        'connector': '#8B92A1',
        'accent-cyan': '#00bfff',
        'accent-teal': '#00c896',
        'status-overdue': '#f85149',
        'priority-low': '#3fb950',
        'priority-medium': '#d29922',
        'priority-high': '#f85149',
      },
    },
  },
  plugins: [],
};

export default config;
