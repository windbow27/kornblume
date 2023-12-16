<script setup>
const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    }
});

const closeOverlay = () => {
    emit('closeOverlay');
};

// { name: '', author:'', comment:'', link: '' },
const resources = [
    { name: 'Huji wiki', author: 'Huji wiki team', comment: 'Very detailed. Most of the data are from this wiki.', link: 'https://res1999.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5' },
    { name: '必要的记录', author: 'Chinese community', comment: 'The drop rates of farming stages are provided by this sheet.', link: 'https://www.kdocs.cn/l/cd5MWeCl5bKw' },
    { name: 'ArkPlanner', author: 'Penguine Statistics', comment: 'Referred to ArkPlanner\'s farming route algorithm, enhanced with linear programming magic', link: 'https://penguin-stats.io/planner' },
    { name: 'Vanity Cake Reverse 1999', author: 'Vanity & Cake', comment: 'Spreadsheet for a lot of things. Insight III levels are taken here.', link: 'https://docs.google.com/spreadsheets/d/1qQinxxU_e0-YXwPj5WAd2PgTFksyLwIaHXwEcosUxU0/edit#gid=470385843' },
    { name: 'Seelie', author: 'Gabriel', comment: 'Ever wonder why this looks like Seelie?', link: 'https://hsr.seelie.me/' },
    { name: 'Schale', author: 'lonqie', comment: 'cunny uwooghh', link: 'https://schale.gg/' }
    // Add more resources as needed
];
</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-small h-2/3 overflow-y-scroll custom-scrollbar">
            <button @click="closeOverlay" class="absolute top-2 right-2 text-white">
                <i class="fas fa-times"></i>
            </button>

            <h1 class="text-white font-bold text-2xl pb-2">Credits</h1>

            <ul class="text-white space-y-5">
                <li v-for="(resource, index) in resources" :key="index">
                    <a :href="resource.link" target="_blank" class="text-sky-300 text-lg"> <i class="fa-solid fa-link"></i> {{
                        resource.name }}</a>
                    <a class="text-sm"> by {{ resource.author }} </a>
                    <p class="text-sm"> {{ resource.comment }}</p>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
</style>
