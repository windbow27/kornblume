import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'
import { fileURLToPath, URL } from 'node:url'
import { resolve, dirname } from 'node:path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import vsharp from 'vite-plugin-vsharp'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/Kornblume/',
    plugins: [
        vue(),
        VueI18nPlugin({
            // locale messages resource pre-compile option
            include: resolve(dirname(fileURLToPath(import.meta.url)), './lang/**'),
            runtimeOnly: false,
            strictMessage: false
        }),
        vsharp({
            // Plugin options go here
            width: 80 // Max width
        }),
        eslintPlugin({ cache: false })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        watch: {
            usePolling: true // set to ensure that hot reload is enabled
        }
    }
})
