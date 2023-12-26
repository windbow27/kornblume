import { createI18n } from 'vue-i18n'

import enUS from '../../lang/en-US.json'
import arcanistsEnUS from '../../lang/arcanists/en-US.json'
import itemsEnUS from '../../lang/items/en-US.json'

import zhTW from '../../lang/zh-TW.json'
import arcanistsZhTW from '../../lang/arcanists/zh-TW.json'
import itemsZhTW from '../../lang/items/zh-TW.json'

import zhCN from '../../lang/zh-CN.json'
import arcanistsZhCN from '../../lang/arcanists/zh-CN.json'
import itemsZhCN from '../../lang/items/zh-CN.json'

const getI18nKeyFromText = (str: string) => {
    return str.replaceAll('.', '').replaceAll(' ', '-').toLowerCase()
}

function messageResolver (obj, path) {
    const msg = obj[path]
    return msg != null ? msg : obj[getI18nKeyFromText(path)]
}

const i18n = createI18n({
    legacy: false, // to enable Composition API
    locale: 'en-US',
    fallbackLocale: 'en-US',
    globalInjection: true,
    messageResolver,
    messages: {
        'en-US': {
            ...enUS,
            ...arcanistsEnUS,
            ...itemsEnUS
        },
        'zh-TW': {
            ...zhTW,
            ...arcanistsZhTW,
            ...itemsZhTW
        },
        'zh-CN': {
            ...zhCN,
            ...arcanistsZhCN,
            ...itemsZhCN
        }
    }
})

export default i18n
