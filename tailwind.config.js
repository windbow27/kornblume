module.exports = {
    mode: 'jit',
    theme: {
        extend: {}
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
