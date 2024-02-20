import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages';

// List of all supported lang codes, please update this list when new language is added
export const supportedLangCodes = ['en-US', 'de-DE', 'zh-CN', 'zh-TW', 'vi-VN', 'id-ID', 'ko-KR', 'ja-JP', 'es-ES', 'fr-FR'];

export const langDropdownOptions = [
    {
        locale: 'en-US',
        text: 'English',
        icon: 'fi fi-us'
    },
    {
        locale: 'es-ES',
        text: 'Español',
        icon: 'fi fi-es'
    },
    {
        locale: 'fr-FR',
        text: 'Français',
        icon: 'fi fi-fr'
    },
    {
        locale: 'de-DE',
        text: 'Deutsch',
        icon: 'fi fi-de'
    },
    {
        locale: 'ja-JP',
        text: '日本語',
        icon: 'fi fi-jp'
    },
    {
        locale: 'ko-KR',
        text: '한국어',
        icon: 'fi fi-kr'
    },
    {
        locale: 'zh-CN',
        text: '简体中文',
        icon: 'fi fi-cn'
    },
    {
        locale: 'zh-TW',
        text: '繁體中文',
        icon: 'fi fi-tw'
    },
    {
        locale: 'vi-VN',
        text: 'Tiếng Việt',
        icon: 'fi fi-vn'
    },
    {
        locale: 'id-ID',
        text: 'Indonesia',
        icon: 'fi fi-id'
    },
    {
        locale: 'ru-RU',
        text: 'Русский',
        icon: 'fi fi-ru'
    },
    {
        locale: 'th-TH',
        text: 'ภาษาไทย',
        icon: 'fi fi-th'
    }
]

// this function is used to map plain text to i18n keys
// and it specifically handles static data like arcanists, items, and stages
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
    missingWarn: false,
    fallbackWarn: false,
    globalInjection: true,
    messageResolver,
    messages
})

// Set new locale
export async function setLocale (locale) {
    // Load locale if not available yet
    const lang = supportedLangCodes.includes(locale) ? locale : 'en-US'

    if (!i18n.global.availableLocales.includes(lang)) {
        const messages = await loadLocale(`../../lang/${lang}.json`);
        const arcanists = await loadLocale(`../../lang/static/arcanists/${lang}.json`);
        const items = await loadLocale(`../../lang/static/items/${lang}.json`);
        const stages = await loadLocale(`../../lang/static/stages/${lang}.json`);

        // Add locale
        i18n.global.setLocaleMessage(locale, {
            ...messages,
            ...arcanists,
            ...items,
            ...stages
        });
    }

    // Set locale
    i18n.global.locale.value = locale;
    localStorage.setItem('locale', locale);
}

// Fetch locale
function loadLocale (path) {
    return fetch(path)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(`Failed to fetch locale json file: ${path}`);
        })
        .catch((error) => {
            console.error(error);
        });
}

export default i18n
