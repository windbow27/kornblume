<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { getArcanistFrequencyPath } from '@/composables/images';
import SelectList from '@/components/common/SelectList.vue';
import CalculateItemList from '@/components/common/CalculateItemList.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const updateKey = ref(0);
const selectedCurrentResonance = ref(1);
const selectedGoalResonance = ref(10);
const selectedFrequency = ref<{ Id: number; Type: string; }[]>([]);

const currentResonanceOptions = computed(() => {
    return props.arcanist.Rarity >= 5
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
});

const frequencyOptions = computed(() => {
    const arcanistFrequency = props.arcanist.Frequency ?? [];
    return arcanistFrequency.map((item: { Type: string; Id: number; }) => ({
        Type: item.Type,
        Id: item.Id
    }));
});

const toggleFrequency = (frequency: { Id: number; Type: string; }) => {
    const index = selectedFrequency.value.findIndex(f => f.Id === frequency.Id);
    if (index !== -1) {
        // remove if selected
        selectedFrequency.value.splice(index, 1);
    } else {
        // add if not selected
        selectedFrequency.value.push({ Id: frequency.Id, Type: frequency.Type });
    }
};

const editingArcanist = computed(() => ({
    Id: props.arcanist.Id,
    isVisible: true,
    currentInsight: 0,
    currentLevel: 1,
    goalInsight: 0,
    goalLevel: 1,
    currentResonance: selectedCurrentResonance.value,
    goalResonance: selectedGoalResonance.value,
    frequency: selectedFrequency.value,
    euphoria: [],
    currentMastery: 0,
    goalMastery: 0
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
    <div class="card-container">
        <div class="px-2">
            <h2 class="text-white text-2xl font-bold">Resonances</h2>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList :key="updateKey" v-model="selectedCurrentResonance" :selected="selectedCurrentResonance"
                    :label="'Current Resonance'" :options="currentResonanceOptions" v-on:update:selected="handleSelected" />
                <i class="text-white fa-solid fa-angles-right text-center w-11"></i>
                <SelectList :key="updateKey" v-model="selectedGoalResonance" :selected="selectedGoalResonance"
                    :label="'Goal Resonance'" :options="goalResonanceOptions" v-on:update:selected="handleSelected" />
            </div>
        </div>

        <div class="flex justify-center p-4">
            <div class="flex flex-wrap gap-4 justify-center">
                <button v-for="(frequency, index) in frequencyOptions" :key="index"
                    @click="toggleFrequency({ Id: frequency.Id, Type: frequency.Type || '' })" :class="{
                        'border-2 border-info': selectedFrequency.some(f => f.Id === frequency.Id),
                        'border-2 border-transparent': !selectedFrequency.some(f => f.Id === frequency.Id),
                        'hover:border-info': selectedFrequency.some(f => f.Id === frequency.Id),
                        'hover:border-transparent': !selectedFrequency.some(f => f.Id === frequency.Id)
                    }" class="rounded-lg">
                    <div class="tooltip px-2 font-light" :data-tip="$t('frequency-modulation-' + frequency.Id)">
                        <img class="h-16 pt-1.5" :src="getArcanistFrequencyPath(frequency.Type || '', frequency.Id)"
                            alt="Frequency Icon" />
                    </div>
                </button>
            </div>
        </div>

        <CalculateItemList :arcanist="editingArcanist" />
    </div>
</template>

<style scoped>
.card-container {
    min-height: 568px;
}
</style>
