<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useCalculation, mergeResults } from '../../composables/calculation';
import PlannerCardList from './PlannerCardList.vue';

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const calculateAll = ref([]);

watchEffect(() => {
    const result = props.selectedArcanists.map(arc => {
        const arcResult = useCalculation(arc);
        return arcResult;
    });

    const mergedResult = mergeResults(result);
    calculateAll.value = mergedResult;
});

</script>

<template>
    <div>
        {{ console.log(calculateAll) }}
        <PlannerCardList :calcArcanists="calculateAll" />
    </div>
</template>

<style scoped>
</style>
