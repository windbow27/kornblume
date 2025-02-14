module.exports = {
    root: true,
    env: {
        node: true,
        es2021: true
    },
    extends: [
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:vue/vue3-essential',
        '@vue/standard',
        'prettier'
    ],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 2020
    },
    rules: {
        camelcase: 'off',
        semi: 0,
        'vue/multi-word-component-names': 'off',
        indent: 'off'
    }
};
