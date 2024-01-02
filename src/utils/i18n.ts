import { createI18n } from 'vue-i18n'

import enUS from '../../lang/en-US.json'
import arcanistsEnUS from '../../lang/static/arcanists/en-US.json'
import itemsEnUS from '../../lang/static/items/en-US.json'
import stagesEnUs from '../../lang/static/stages/en-US.json'

import zhTW from '../../lang/zh-TW.json'
import arcanistsZhTW from '../../lang/static/arcanists/zh-TW.json'
import itemsZhTW from '../../lang/static/items/zh-TW.json'
import stagesZhTW from '../../lang/static/stages/zh-TW.json'

import zhCN from '../../lang/zh-CN.json'
import arcanistsZhCN from '../../lang/static/arcanists/zh-CN.json'
import itemsZhCN from '../../lang/static/items/zh-CN.json'
import stagesZhCN from '../../lang/static/stages/zh-CN.json'

import jaJP from '../../lang/ja-JP.json'
import koKR from '../../lang/ko-KR.json'
import viVN from '../../lang/vi-VN.json'
import deDE from '../../lang/de-DE.json'
import idID from '../../lang/id-ID.json'

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
            ...itemsEnUS,
            ...stagesEnUs
        },
        'zh-TW': {
            ...zhTW,
            ...arcanistsZhTW,
            ...itemsZhTW,
            ...stagesZhTW
        },
        'zh-CN': {
            ...zhCN,
            ...arcanistsZhCN,
            ...itemsZhCN,
            ...stagesZhCN
        },
        'ja-JP': {
            ...jaJP
        },
        'ko-KR': {
            ...koKR
        },
        'vi-VN': {
            ...viVN
        },
        'de-DE': {
            ...deDE
        },
        'id-ID': {
            ...idID
        }
    }
})

export default i18n
