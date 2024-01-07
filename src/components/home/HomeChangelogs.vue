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

const changelogs = [
    // Add more from top
    { date: '07/01/2024', description: '• Added French translations thanks to я герой#3673. \n • Improved Japanese translations thanks to yagochi.' },
    { date: '06/01/2024', description: '• Added Spanish translations thanks to mgeshagrath. \n • Added Russian translations thanks to spun4ik and dagufz37. \n • Released 1.3 Arcanists.' },
    { date: '05/01/2024', description: '• Big Summon Tracker Update. \n • Added Japanese translations thanks to yagochi.' },
    { date: '04/01/2024', description: '• Added Korean translations thanks to CaptinRegulus.\n • Added Banner Type for Tracker.' },
    { date: '03/01/2024', description: '• Improved i18n. \n • Improved Tracker OCR' },
    { date: '02/01/2024', description: '• Error log for Summon Tracker.' },
    { date: '29/12/2023', description: '• Added more languages! vi-VN, zh-CN, zh-TW have been fully translated. We need your help!' },
    { date: '28/12/2023', description: '• Summon Tracker out of beta release. \n • Various UI updates.' },
    { date: '26/12/2023', description: '• Improved OCR for 5*. \n • Updated Stage Data and Greedy Method improvements. \n • Added Ezra Theodore and Desert Flanndel.' },
    { date: '25/12/2023', description: '• Improved Activity Settings. UI Improvements.' },
    { date: '24/12/2023', description: '• UI Improvements\n • Wilderness output is now considered for calculations.\n • Merry Christmas.' },
    { date: '23/12/2023', description: '• UI Improvements for goals and crafting list. \n • Added Goal Button.' },
    { date: '21/12/2023', description: '• UI Improvements. \n • Added Goals and Crafting List.' },
    { date: '20/12/2023', description: '• Yet another warehouse update. \n • Summon Tracker. Beta. \n • Added Greedy method to prioritize Purple Materials ' },
    { date: '16/12/2023', description: '• Add names to 1.4 data. UI improvements.\n • Added Activity Settings for Roaring Month and Refills.' },
    { date: '15/12/2023', description: '• Updated storing. Prior selected data will be corrupted, please head to profile to reset.' },
    { date: '14/12/2023', description: '• Warehouse bug fixes (again), changed t6 resonate materials to casket. Sorry for the inconvenience but please reset your warehouse.\n • Added 6, Spathodea and Ulu. Updated arcanists.json\n • Various bug fixes and UI improvements.' },
    { date: '12/12/2023', description: '• Optimized farming route, from the help of Fran!' },
    { date: '05/12/2023', description: '• Added Profile. WIP.' },
    { date: '04/12/2023', description: '• Updated credits, minor bug fixes.' },
    { date: '03/12/2023', description: '• Fixed wrong jsons. Hopefully it is correct now.\n • Soldius. \n • Added 1.2 event shops. Two buttons, all the items.' },
    { date: '02/12/2023', description: '• Fixed warehouse, added Tooth Fairy and Changeling to released.\n • Fixed more warehouse bugs, added reset button.\n • Fixed MORE warehouse bugs.' },
    { date: '01/12/2023', description: '• Warehouse filter is broken, temporary disabled.' },
    { date: '30/11/2023', description: '• Added Warehouse. Fixed wrong Insight levels and unreleased Arcanists' },
    { date: '29/11/2023', description: '• First release.' }
];

</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-small h-2/3 lg:h-1/2 overflow-y-scroll hidden-scrollbar">
            <button @click="closeOverlay" class="absolute top-2 right-2 text-white">
                <i class="fas fa-times"></i>
            </button>
            <h1 class="text-white font-bold text-2xl pb-2">{{ $t('changelogs') }}</h1>

            <ul class="text-white space-y-5">
                <li v-for="(log, index) in changelogs" :key="index">
                    <p class="text-sky-300">{{ log.date }}:</p>
                    <ul>
                        <li v-for="(line, lineIndex) in log.description.split('\n')" :key="lineIndex" class="text-sm">{{
                            line }}</li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped></style>
