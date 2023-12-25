import { createI18n } from 'vue-i18n'

const i18n = createI18n({
    legacy: false, // to enable Composition API
    locale: 'en-US',
    fallbackLocale: 'en-US',
    globalInjection: true,
    messages: {
        // 'zh-TW': zh,
        // 'en-US': en
    }
})

export default i18n
