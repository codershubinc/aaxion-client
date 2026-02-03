import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            screens: {
                'xs': '475px',
            },
            colors: {
                dark: {
                    bg: '#0a0a0a',
                    surface: '#141414',
                    hover: '#1f1f1f',
                    border: '#2a2a2a',
                    text: '#e5e5e5',
                    muted: '#a3a3a3',
                },
                accent: {
                    blue: '#3b82f6',
                    purple: '#8b5cf6',
                    green: '#10b981',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
                cursive: ['var(--font-cursive)'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
};

export default config;
