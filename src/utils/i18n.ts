import { createI18n } from 'vue-i18n'
import enUS from '../../lang/en-US.json'
import zhTW from '../../lang/zh-TW.json'

const i18n = createI18n({
    legacy: false, // to enable Composition API
    locale: 'en-US',
    fallbackLocale: 'en-US',
    globalInjection: true,
    messages: {
        'en-US': enUS,
        'zh-TW': zhTW
    }
})

export default i18n
