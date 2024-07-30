<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import SelectList from '@/components/common/SelectList.vue';
import ArcanistCalculate from '@/components/arcanist/ArcanistCalculate.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const updateKey = ref(0);
const selectedCurrentResonance = ref(1);
const selectedGoalResonance = ref(1);

const currentResonanceOptions = computed(() => {
    return props.arcanist.Rarity >= 5
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
});

const editingArcanist = computed(() => ({
    Id: props.arcanist.Id,
    isVisible: true,
    currentInsight: 0,
    currentLevel: 1,
    goalInsight: 0,
    goalLevel: 1,
    currentResonance: selectedCurrentResonance.value,
    goalResonance: selectedGoalResonance.value
}));

const goalResonanceOptions = computed(() => {
    const currentResonance = Number(selectedCurrentResonance.value);
    const upperLimit = props.arcanist.Rarity >= 5 ? 15 : 10;
    return Array.from({ length: upperLimit - currentResonance + 1 }, (_, index) => Number(currentResonance + index));
});

const handleSelected = (option: number, optionType: unknown) => {
    switch (optionType) {
    case 'Current Resonance':
        selectedCurrentResonance.value = option;
        break;
    case 'Goal Resonance':
        selectedGoalResonance.value = option;
        break;
    default:
        break;
    }
};

watch([selectedCurrentResonance, selectedGoalResonance], () => {
    updateKey.value += 1;
    if (selectedCurrentResonance.value < currentResonanceOptions.value[0]) {
        selectedCurrentResonance.value = currentResonanceOptions.value[0];
    }
    if (selectedGoalResonance.value < goalResonanceOptions.value[0]) {
        selectedGoalResonance.value = goalResonanceOptions.value[0];
    }
});

</script>

<template>
    <div class="px-2">
        {{ console.log(props.arcanist) }}
        <h2 class=" text-white text-2xl font-bold">Resonances</h2>
        <div class="mt-2 flex justify-center items-center leading-none">
            <SelectList :key="updateKey" v-model="selectedCurrentResonance" :selected="selectedCurrentResonance"
                :label="'Current Resonance'" :options="currentResonanceOptions" v-on:update:selected="handleSelected" />
            <i class="text-white fa-solid fa-angles-right text-center"></i>
            <SelectList :key="updateKey" v-model="selectedGoalResonance" :selected="selectedGoalResonance"
                :label="'Goal Resonance'" :options="goalResonanceOptions" v-on:update:selected="handleSelected" />
        </div>
    </div>
    <div v-if="selectedCurrentResonance == selectedGoalResonance
    " class="pb-60"></div>
    <ArcanistCalculate :arcanist="editingArcanist" />
</template>

<style scoped></style>
