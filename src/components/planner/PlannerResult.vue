<script setup>
import { ref, watchEffect } from 'vue';
import { useCalculation, mergeResults } from '../../composables/CalculateMaterials';
import { getTotalActivityAndDays, getPlan } from '../../composables/ProcessCards.js';
import PlannerLayer from './PlannerLayer.vue';

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const emits = defineEmits([
    'update:totalActivityAndDays'
]);

const calculateAllMaterials = ref([]);
const calculateCards = ref([]);

watchEffect(() => {
    const result = props.selectedArcanists.map(arc => {
        if (!arc.isVisible) return [];
        const arcResult = useCalculation(arc);
        return arcResult;
    });

    const mergedResult = mergeResults(result);
    calculateAllMaterials.value = mergedResult;

    const processedCards = getPlan(mergedResult);

    emits('update:totalActivityAndDays', getTotalActivityAndDays(processedCards));

    // Update the calculateCards ref
    calculateCards.value = processedCards;
});
</script>

<template>
    <div class="flex flex-wrap">
        <p class="text-slate-300 opacity-70 text-sm">High tier materials are converted to farmable ones.</p>
        <PlannerLayer v-for="(layer, index) in calculateCards" :key="index" :layer="layer" />
    </div>
</template>

<style scoped></style>
