<script setup lang="ts" name="PlannerCard">
import { computed, ref, watch } from 'vue';
import MaterialItem from './MaterialItem.vue';
const props = defineProps({
    card: {
        type: Object,
        required: true
    },
    layerId: {
        type: Number,
        required: true
    }
});

const shouldHideScrollbar = computed(() => {
    return props.card.materials.length < 4;
});

const scrollDiv = ref(null);

watch(shouldHideScrollbar, (newVal) => {
    if (newVal && scrollDiv.value) {
        (scrollDiv.value as HTMLDivElement).scrollLeft = 0;
    }
});

</script>

<template>
    <div class="bg-gray-700/40 shadow rounded flex flex-col items-center justify-between relative">
        <div class="stage text-white p-2">
            <p>{{ card.stage }}</p>
        </div>

        <div class="tooltip w-full" data-tip="Number of runs | Activities | Days">
            <div class="calculations flex justify-center items-center bg-gradient-to-r from-blue-800/70 to-blue-900/90 text-white p-2 rounded-md">
                <p class="border-blue-700/90 border-r pr-3">
                    <span v-show="card.runs > 0">
                        <i class="fa-solid fa-xmark text-xs mr-0.5" />{{ card.runs }}
                    </span>
                </p>

                <p class="pl-2">
                    {{ card.activity === 0 ?
                        'Crafted from available Materials. List includes dependencies.':
                        card.activity
                    }}
                </p>
                <img v-show="card.activity" :src="card.activityImagePath" alt="Activity Image" class="inline-block w-8 h-8" />

                <p class="border-blue-700/90 border-l pl-3">
                    <span v-show="card.days > 0">
                        {{ card.days }} {{ card.days === 0 ? '' : card.days > 1 ? 'days': 'day' }}
                    </span>
                </p>
            </div>
        </div>

        <div ref="scrollDiv" :class="{'custom-scrollbar':shouldHideScrollbar}" class="flex overflow-y-hidden overflow-x-auto scrollbar m-auto">
            <div v-for="(material, materialIndex) in card.materials" :key="materialIndex" class="flex-shrink-0">
                <MaterialItem :material="material" :layerId="layerId"/>
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
