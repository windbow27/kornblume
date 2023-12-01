<script setup>
const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true,
    }
});

const closeOverlay = () => {
    emit('closeOverlay');
};

const changelogs = [
    //Add more from top
    { date: '01/12/2023', description: '• Warehouse filter is broken, temporary disabled.'},
    { date: '30/11/2023', description: '• Added Warehouse. Fixed wrong Insight levels and unreleased Arcanists'},
    { date: '29/11/2023', description: '• First release.' },
];

</script>

<template>
    <div class="list-overlay">
      <div class="custom-modal-small h-2/3 lg:h-1/2 overflow-y-scroll custom-scrollbar">
        <button @click="closeOverlay" class="absolute top-2 right-2 text-white">
          <i class="fas fa-times"></i>
        </button>
        <h1 class="text-white font-bold text-2xl pb-2">Changelogs</h1>

        <ul class="text-white space-y-5">
            <li v-for="(log, index) in changelogs" :key="index">
                <p class="text-sky-300">{{ log.date }}:</p>
                <ul>
                    <li class="text-sm">{{ log.description }}</li>
                </ul>
            </li>
        </ul>
      </div>
    </div>
</template>

<style scoped>
</style>