module.exports = {
    mode: 'jit',
    theme: {
        extend: {
            colors: {
                'badge-yellow': '#D8AE2D'
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
