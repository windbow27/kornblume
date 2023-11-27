<script setup>
import ItemIcon from '../item/ItemIcon.vue';
const props = defineProps({
    card: {
        type: Object,
        required: true
    }
});

</script>

<template>
    <div class="bg-gray-700/70 shadow rounded flex flex-col items-center justify-between relative">
        <div class="stage text-white p-2">
            <p>{{ card.stage }}</p>
        </div>
        <div class="calculations w-full flex justify-center items-center bg-gradient-to-r from-blue-800 to-blue-900 text-white p-2 rounded-md">
            <p>{{ card.runs > 0 ? 'x' : '' }}{{ card.runs }}</p>
            <p class="separator mx-1">{{ card.runs > 0 ? '|' : '' }}</p>
            <p>{{ card.activity }}</p>
            <img :src="card.activityImagePath" alt="Activity Image" class="inline-block w-8 h-8" />
            <p class="separator mx-1">{{ card.runs > 0 ? '|' : '' }}</p>
            <p>{{ card.days }} {{ card.days === null ? '' : card.days > 1 ? 'days' : 'day' }}</p>
        </div>

        <div class="materials flex items-center text-white">
            <div v-for="(material, materialIndex) in card.materials" :key="materialIndex" class="image-container mx-1">
                <ItemIcon :material="material" />
            </div>
        </div>
    </div>
</template>
  
<style scoped>
</style>
