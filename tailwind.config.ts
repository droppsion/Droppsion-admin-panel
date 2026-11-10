import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          dark: '#0B0F19',
          surface: '#111827',
          border: '#1F2937',
          accent: '#FF4D00',
          muted: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};

export default config;

