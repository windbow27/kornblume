<script setup lang="ts">
import { ref, computed } from 'vue';
import SelectList from '@/components/common/SelectList.vue';
import { getArcanistEuphoriaPath } from '@/composables/images';
import CalculateItemList from '@/components/common/CalculateItemList.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const updateKey = ref(0);

const selectedEuphoria = ref<number[]>([1]);
const selectedCurrentMastery = ref(0);
const selectedGoalMastery = ref(4);

const euphoriaOptions = computed(() => {
    const arcanistEuphoria = props.arcanist.Euphoria ?? [];
    return arcanistEuphoria.map((item) => ({
        Id: item.Id
    }));
});

const currentMasteryOptions = computed(() => {
    return [0, 1, 2, 3, 4];
});

const goalMasteryOptions = computed(() => {
    return [0, 1, 2, 3, 4].filter((mastery) => mastery >= selectedCurrentMastery.value);
});

const toggleEuphoria = (euphoria: number) => {
    const index = selectedEuphoria.value.findIndex((e) => e === euphoria);
    if (index !== -1) {
        // remove if selected
        selectedEuphoria.value.splice(index, 1);
    } else {
        // add if not selected
        selectedEuphoria.value.push(euphoria);
    }
};

const handleSelected = (option, optionType) => {
    switch (optionType) {
        case 'Current Mastery':
            selectedCurrentMastery.value = option;
            break;
        case 'Goal Mastery':
            selectedGoalMastery.value = option;
            break;
        default:
            break;
    }
};

const editingArcanist = computed(() => ({
    Id: props.arcanist.Id,
    isVisible: true,
    currentInsight: 0,
    currentLevel: 1,
    goalInsight: 0,
    goalLevel: 1,
    currentResonance: 0,
    goalResonance: 0,
    frequency: [],
    euphoria: selectedEuphoria.value,
    currentMastery: selectedCurrentMastery.value,
    goalMastery: selectedGoalMastery.value
}));
</script>

<template>
    <div class="h-full flex flex-col">
        <div class="px-2">
            <h2 class="text-white text-2xl font-bold">Euphoria</h2>
            <div class="flex flex-col gap-y-2 mt-2">
                <div class="flex justify-center space-x-4">
                    <button
                        v-for="(euphoria, index) in euphoriaOptions"
                        :key="index"
                        @click="toggleEuphoria(euphoria.Id)"
                        class="rounded-lg">
                        <div class="tooltip px-2 font-light">
                            <img
                                class="h-36 pt-1.5"
                                :src="getArcanistEuphoriaPath(arcanist.Id, euphoria.Id)"
                                :class="{
                                    'opacity-50': !selectedEuphoria.some((e) => e === euphoria.Id),
                                    'hover:scale-110': true
                                }"
                                alt="Euphoria Icon" />
                        </div>
                    </button>
                </div>

                <div v-if="euphoriaOptions.length === 0" class="m-auto text-white">
                    {{ $t('euphoria-requirement') }}
                </div>

                <div class="mt-2 flex justify-center items-center leading-none">
                    <SelectList
                        :key="'current-' + updateKey"
                        v-model="selectedCurrentMastery"
                        :selected="selectedCurrentMastery"
                        :label="'Current Mastery'"
                        :options="currentMasteryOptions"
                        v-on:update:selected="handleSelected" />
                    <i class="text-white fa-solid fa-angles-right text-center w-10"></i>
                    <SelectList
                        :key="'goal-' + updateKey"
                        v-model="selectedGoalMastery"
                        :selected="selectedGoalMastery"
                        :label="'Goal Mastery'"
                        :options="goalMasteryOptions"
                        v-on:update:selected="handleSelected" />
                </div>
            </div>
        </div>

        <CalculateItemList :arcanist="editingArcanist" class="h-full"/>
    </div>
</template>

<style scoped></style>
