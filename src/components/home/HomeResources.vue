<script setup>
import { useI18n } from 'vue-i18n';

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    }
});

const { t } = useI18n()

const closeOverlay = () => {
    emit('closeOverlay');
};

// { name: '', author:'', comment:'', link: '' },
const resources = [
    { name: 'Huji wiki', author: 'Huji wiki team', comment: t('very-detailed-most-of-the-data-is-from-this-wiki'), link: 'https://res1999.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5' },
    { name: 'Reverse: 1999 Materials', author: 'Shiroi Negai', comment: t('another-drop-rates'), link: 'https://docs.google.com/spreadsheets/d/1GZMH5rJIqIUIh--MW9ahWCn2ExNvttjWGhT1lP1d4XM/edit#gid=2075797160' },
    { name: '必要的记录', author: 'Chinese community', comment: t('the-drop-rates-of-farming-stages-are-provided-by-this-sheet'), link: 'https://www.kdocs.cn/l/cd5MWeCl5bKw' },
    { name: 'ArkPlanner', author: 'Penguine Statistics', comment: t('referred-to-arkplanner-s-farming-route-algorithm-enhanced-with-linear-programming-magic'), link: 'https://penguin-stats.io/planner' },
    { name: 'Vanity Cake Reverse 1999', author: 'Vanity & Cake', comment: t('spreadsheet-for-a-lot-of-things-insight-iii-levels-are-taken-here'), link: 'https://docs.google.com/spreadsheets/d/1qQinxxU_e0-YXwPj5WAd2PgTFksyLwIaHXwEcosUxU0/edit#gid=470385843' },
    { name: 'Vertin Wheel', author: 'PG小老弟', comment: t('loading-indicator-vertin-wheel-vertin-wheel-vertin-wheel'), link: 'https://weibo.com/1851315674/N36YRc9zw?pagetype=viewer' },
    { name: '柏林以东', author: '早餐奶猹', comment: t('homescreen-image'), link: 'https://www.pixiv.net/en/artworks/110046834' },
    { name: 'Seelie', author: 'Gabriel', comment: t('ever-wonder-why-this-looks-like-seelie'), link: 'https://hsr.seelie.me/' },
    { name: 'Star Rail Station', author: 'Star Rail Station', comment: t('summon-tracker-ideas'), link: 'https://starrailstation.com/' },
    { name: 'Schale', author: 'lonqie', comment: 'cunny uwooghh', link: 'https://schale.gg/' }
    // Add more resources as needed
];
</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-big h-2/3 lg:h-1/2 relative">
            <div class="absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue">
                <button @click="closeOverlay" class="absolute top-5 right-7 text-white">
                    <i class="fas fa-times"></i>
                </button>
                <h1 class="text-white font-bold text-2xl p-2">{{ $t('credits') }}</h1>
            </div>

            <ul class="text-white space-y-5 pt-12 overflow-y-auto h-full">
                <li v-for="(resource, index) in resources" :key="index">
                    <a :href="resource.link" target="_blank" class="text-sky-300 text-lg"> <i class="fa-solid fa-link"></i>
                        {{ resource.name }} </a>
                    <span class="text-sm pl-1">
                        <i18n-t keypath="by-author">
                            <template #author>
                                <span class="text-sm">{{ resource.author }}</span>
                            </template>
                        </i18n-t>
                    </span>
                    <p class="text-sm"> {{ resource.comment }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped></style>
