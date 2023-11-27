<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useCalculation, mergeResults } from '../../composables/CalculateMaterials';
import { useProcessCards } from '../../composables/ProcessCards.js';
import PlannerLayer from './PlannerLayer.vue';

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const calculateAllMaterials = ref([]);

watchEffect(() => {
    const result = props.selectedArcanists.map(arc => {
        const arcResult = useCalculation(arc);
        return arcResult;
    });

    const mergedResult = mergeResults(result);
    calculateAllMaterials.value = mergedResult;
});

const calculateCards = computed(() => {
    console.log(useProcessCards(calculateAllMaterials.value))
    return useProcessCards(calculateAllMaterials.value);
});

</script>

<template>
    <div class="flex flex-wrap">
        <PlannerLayer v-for="(layer, index) in calculateCards" :key="index" :layer="layer" />
    </div>
</template>

<style scoped></style>
