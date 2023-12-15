<script setup>
import { computed, ref, watch } from 'vue';
import ItemIcon from '../item/ItemIcon.vue';
const props = defineProps({
    card: {
        type: Object,
        required: true
    }
});

const shouldHideScrollbar = computed(() => {
    return props.card.materials.length < 4;
});

const scrollDiv = ref(null);

watch(shouldHideScrollbar, (newVal) => {
    if (newVal && scrollDiv.value) {
        scrollDiv.value.scrollLeft = 0;
    }
});

</script>

<template>
    <div class="bg-gray-700/40 shadow rounded flex flex-col items-center justify-between relative">
        <div class="stage text-white p-2">
            <p>{{ card.stage }}</p>
        </div>

        <div class="tooltip w-full" data-tip="Number of runs | Activities | Days">
            <div
                class="calculations flex justify-center items-center bg-gradient-to-r from-blue-800/70 to-blue-900/90 text-white p-2 rounded-md">
                <p class="border-blue-700/90 border-r pr-3">
                    <span v-if="card.runs > 0">
                        <i class="fa-solid fa-xmark text-xs mr-0.5"></i>{{ card.runs }}
                    </span>
                    <span v-else>{{ card.runs }}</span>
                </p>
                <p class="pl-2">{{ card.activity == null ? 'Crafted from available Materials' : card.activity }}</p>
                <img v-show="card.activity" :src="card.activityImagePath" alt="Activity Image" class="inline-block w-8 h-8" />
                <p class="border-blue-700/90 border-l pl-3">{{ card.days }} {{ card.days === null ? '' : card.days > 1 ? 'days'
                    : 'day' }}</p>
            </div>
        </div>

        <div ref="scrollDiv" :class="{'custom-scrollbar':shouldHideScrollbar}" class="flex overflow-y-hidden overflow-x-auto scrollbar m-auto">
            <div v-for="(material, materialIndex) in card.materials" :key="materialIndex" class="flex-shrink-0">
                <ItemIcon class="" :material="material" />
            </div>
        </div>
    </div>
</template>
  
<style scoped>
.scrollbar {
    scrollbar-width: thin;
}

.scrollbar::-webkit-scrollbar {
    height: 6px;
}
</style>


