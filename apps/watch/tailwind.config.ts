import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}', // Next.js app dir
    './components/**/*.{ts,tsx}', // local components
    '../../packages/ui/**/*.{ts,tsx}', // shared UI package (shadcn/ui etc.)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
