<script setup>
import { ref, watchEffect } from 'vue';
import { useCalculation, mergeResults } from '../../composables/CalculateMaterials';
import { useProcessCards, getTotalActivityAndDays } from '../../composables/ProcessCards.js';
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
        const arcResult = useCalculation(arc);
        return arcResult;
    });

    const mergedResult = mergeResults(result);
    calculateAllMaterials.value = mergedResult;

    emits('update:totalActivityAndDays', getTotalActivityAndDays(useProcessCards(mergedResult)));

    // Update the calculateCards ref
    calculateCards.value = useProcessCards(mergedResult);
});
</script>

<template>
    <div class="flex flex-wrap">
        <PlannerLayer v-for="(layer, index) in calculateCards" :key="index" :layer="layer" />
    </div>
</template>

<style scoped></style>
