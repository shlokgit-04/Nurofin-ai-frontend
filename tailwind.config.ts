import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },
        surface: {
          card: 'var(--surface-card)',
          hover: 'var(--surface-card-hover)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          active: 'var(--border-active)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          blue: {
            DEFAULT: 'var(--accent-blue)',
            hover: 'var(--accent-blue-hover)',
            light: 'var(--accent-blue-light)',
          },
          green: {
            DEFAULT: 'var(--accent-green)',
            light: 'var(--accent-green-light)',
          },
          orange: {
            DEFAULT: 'var(--accent-orange)',
            light: 'var(--accent-orange-light)',
          },
          red: {
            DEFAULT: 'var(--accent-red)',
            light: 'var(--accent-red-light)',
          },
        },
      },
      fontFamily: {
        sans: ['var(--font-family)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
};

export default config;
