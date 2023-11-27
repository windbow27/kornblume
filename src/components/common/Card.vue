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
    <div class="bg-gray-700/40 shadow rounded flex flex-col items-center justify-between relative">
        <div class="stage text-white p-2">
            <p>{{ card.stage }}</p>
        </div>
        <div
            class="calculations w-full flex justify-center items-center bg-gradient-to-r from-blue-800/70 to-blue-900/90 text-white p-2 rounded-md">
            <p class="border-blue-700/90 border-r pr-3">
                <span v-if="card.runs > 0">
                    <i class="fa-solid fa-xmark text-xs mr-0.5"></i>{{ card.runs }}
                </span>
                <span v-else>{{ card.runs }}</span>
            </p>
            <p class="pl-2">{{ card.activity == null ? '?' : card.activity }}</p>
            <img :src="card.activityImagePath" alt="Activity Image" class="inline-block w-8 h-8" />
            <p class="border-blue-700/90 border-l pl-3">{{ card.days }} {{ card.days === null ? '' : card.days > 1 ? 'days'
                : 'day' }}</p>
        </div>

        <div class="items-center flex">
            <div v-for="(material, materialIndex) in card.materials" :key="materialIndex">
                <ItemIcon :material="material" />
            </div>
        </div>

    </div>
</template>
  
<style scoped></style>
