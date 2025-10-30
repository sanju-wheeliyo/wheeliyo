/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['pages/**/*.{js,ts,jsx,tsx}', 'components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#EEEFF1',
                secondary: '#DE317A',
                white: '#FCFCFC',
                gray: {
                    light: '#FCFCFC',
                    dark: '#626263',
                    medium: '#F8F9FD',
                    extraLight: '#E2E8F0',
                },
            },
            textColor: {
                white: '#FFFFFF',
                primary: '#231F20',
                secondary: '#DE317A',
                gray: '#030305',
                grayMedium: '#64748B',
                grayLight: '#475569',
                grayDark: '#1E293B',
                grayNormal: '#334155',
            },
            backgroundImage: {
                hero: "url('/assets/ready_to_sell_bg.png')",
            },
            width: {
                xl: '80%',
            },
            screens: {
                '3xl': '1600px',
            },
        },
    },
    plugins: [],
}
