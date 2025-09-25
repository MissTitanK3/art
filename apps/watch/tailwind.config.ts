import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}', // Next.js app dir
    './components/**/*.{ts,tsx}', // local components
    '../../packages/ui/**/*.{ts,tsx}', // shared UI package (shadcn/ui etc.)
  ],
  theme: {
    extend: {
      keyframes: {
        'radar-ping': {
          '0%': { transform: 'scale(0.25)', opacity: '0.75' },
          '80%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'radar-ping': 'radar-ping 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
