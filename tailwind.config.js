/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            animation: {
                'glow-pulse': 'glow-pulse 3s ease-in-out infinite alternate',
                'gradient-x': 'gradient-x 3s ease infinite',
                'fade-in': 'fade-in 1s ease-out',
                'fade-in-delay': 'fade-in 1s ease-out 0.5s both',
                'fade-in-delay-2': 'fade-in 1s ease-out 1s both',
            },
            keyframes: {
                'glow-pulse': {
                    '0%': {
                        boxShadow: '0 0 20px #00f5d4, 0 0 40px #00f5d4, 0 0 60px #00f5d4',
                        opacity: '0.8'
                    },
                    '50%': {
                        boxShadow: '0 0 30px #ff00ff, 0 0 60px #ff00ff, 0 0 90px #ff00ff',
                        opacity: '1'
                    },
                    '100%': {
                        boxShadow: '0 0 20px #8a2be2, 0 0 40px #8a2be2, 0 0 60px #8a2be2',
                        opacity: '0.8'
                    }
                },
                'gradient-x': {
                    '0%, 100%': {
                        'background-size': '200% 200%',
                        'background-position': 'left center'
                    },
                    '50%': {
                        'background-size': '200% 200%',
                        'background-position': 'right center'
                    }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            }
        },
    },
    plugins: [],
};
