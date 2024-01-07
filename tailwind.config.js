module.exports = {
    mode: 'jit',
    theme: {
        extend: {
            colors: {
                'badge-yellow': '#807215',
                'badge-green': '#15803D',
                'badge-red': '#9E1E26',
                'badge-black': '#374151'
            }
        }
    },
    variants: {
        extend: {}
    },
    plugins: [
        require('daisyui')
    ],
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}'
    ]
}
