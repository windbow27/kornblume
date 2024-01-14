<script setup>
import { ref, watch, computed } from 'vue';
import { useDataStore } from '../../stores/dataStore';
import { levelUpResources, CrystalCasketMaterials } from '../../constants';
import ArcanistIcon from '../arcanist/ArcanistIcon.vue';
import ArcanistCalculate from '../arcanist/ArcanistCalculate.vue'
import ArcanistLevelUp from '../arcanist/ArcanistLevelUp.vue'
import SelectList from '../common/SelectList.vue';
import { useCalculation } from '../../composables/CalculateMaterials';
import { useWarehouseStore } from '../../stores/warehouseStore';

const props = defineProps({
    selectedArcanist: {
        type: Object,
        required: true
    },
    selectedArcanists: {
        type: Array,
        required: true
    },
    listArcanists: {
        type: Array,
        required: true
    }
});
const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    },
    updateSelectedArcanists: {
        type: Function,
        required: true
    },
    updateListArcanists: {
        type: Function,
        required: true
    }
});

const arcanists = useDataStore().arcanists;
const isTheSame = ref(false);
const updateKey = ref(0);
const calculations = levelUpResources;
const selectedArcanist = ref(arcanists.find(arc => Number(arc.Id) === Number(props.selectedArcanist.Id)));
const selectedArcanists = ref(props.selectedArcanists);
const listArcanists = ref(props.listArcanists);
const selectedCurrentInsight = ref(props.selectedArcanist.currentInsight);
const selectedCurrentLevel = ref(props.selectedArcanist.currentLevel);
const selectedCurrentResonance = ref(props.selectedArcanist.currentResonance);
const selectedGoalInsight = ref(props.selectedArcanist.goalInsight);
const selectedGoalLevel = ref(props.selectedArcanist.goalLevel);
const selectedGoalResonance = ref(props.selectedArcanist.goalResonance);
const selectedVisible = ref(props.selectedArcanist.isVisible);

const compareLevels = (currentInsightSelect, currentLevelSelect, goalInsightSelect, goalLevelSelect) => {
    if (Number(currentInsightSelect) > Number(goalInsightSelect)) {
        // If current insight is higher, consider it as "lower" regardless of levels
        return true;
    } else if (Number(currentInsightSelect) < Number(goalInsightSelect)) {
        // If current insight is lower, consider it as "higher" regardless of levels
        return false;
    } else {
        // If insights are equal, compare levels
        return Number(currentLevelSelect) > Number(goalLevelSelect);
    }
};

const checkIfCurrentAndGoalAreTheSame = () => {
    if (selectedCurrentInsight.value === selectedGoalInsight.value &&
        selectedCurrentLevel.value === selectedGoalLevel.value &&
        selectedCurrentResonance.value === selectedGoalResonance.value) {
        isTheSame.value = true;
        setTimeout(() => {
            isTheSame.value = false;
        }, 1200);
        return true;
    }
    isTheSame.value = false;
};

const indexInArcanistsList = computed(() => {
    return selectedArcanists.value.findIndex(arc => Number(arc.Id) === Number(editingArcanist.value.Id))
})

const addArcanist = () => {
    if (checkIfCurrentAndGoalAreTheSame()) return;
    // console.log(selectedArcanists.value);
    const existingIndex = indexInArcanistsList.value;
    // console.log(existingIndex);

    if (existingIndex !== -1) {
        // If the arcanist with the same Id already exists, update it
        selectedArcanists.value[existingIndex] = {
            ...selectedArcanists.value[existingIndex],
            ...editingArcanist.value
        };
    } else {
        // If the arcanist with the same Id doesn't exist, add it
        selectedArcanists.value.push(editingArcanist.value);
    }

    // Remove the arcanist from listArcanists
    listArcanists.value = listArcanists.value.filter(arc => arc.Id !== editingArcanist.value.Id);

    emit('updateSelectedArcanists', selectedArcanists.value);
    emit('updateListArcanists', listArcanists.value);
    emit('closeOverlay');
};

const removeArcanist = () => {
    const existingIndex = selectedArcanists.value.findIndex(arc => Number(arc.Id) === Number(editingArcanist.value.Id));
    if (existingIndex !== -1) {
        // If found, remove it
        selectedArcanists.value.splice(existingIndex, 1);
    }
    closeOverlay();
};

const materialRequirement = computed(() => {
    return editingArcanist.value ? useCalculation(editingArcanist.value) : [];
});

const isWarehouseSufficient = computed(() => {
    if (useWarehouseStore().data?.length === 0) {
        return false;
    }
    return materialRequirement.value.filter((matl) => {
        if (CrystalCasketMaterials.includes(matl.Material)) {
            return useWarehouseStore().getItemQuantity('Crystal Casket') < matl.Quantity
        } else if (useWarehouseStore().getItemQuantity(matl.Material) < matl.Quantity) {
            return true
        } else {
            return false
        }
    }).length === 0
})

const levelUpArcanist = () => {
    if (checkIfCurrentAndGoalAreTheSame()) return;
    if (isWarehouseSufficient.value) {
        materialRequirement.value.forEach((matl) => {
            if (CrystalCasketMaterials.includes(matl.Material)) {
                useWarehouseStore().reduceItem('Crystal Casket', matl.Quantity)
            } else {
                useWarehouseStore().reduceItem(matl.Material, matl.Quantity)
            }
        })
        selectedCurrentLevel.value = selectedGoalLevel.value
        selectedCurrentInsight.value = selectedGoalInsight.value
        selectedCurrentResonance.value = selectedGoalResonance.value
    }
};

const closeOverlay = () => {
    emit('closeOverlay');
};

const handleSelected = (option, optionType) => {
    switch (optionType) {
    case 'Current Insight':
        selectedCurrentInsight.value = option;
        break;
    case 'Current Level':
        selectedCurrentLevel.value = option;
        break;
    case 'Current Resonance':
        selectedCurrentResonance.value = option;
        break;
    case 'Goal Insight':
        selectedGoalInsight.value = option;
        break;
    case 'Goal Level':
        selectedGoalLevel.value = option;
        break;
    case 'Goal Resonance':
        selectedGoalResonance.value = option;
        break;
    case 'Visible':
        selectedVisible.value = option;
        break;
    default:
        break;
    }
};

const editingArcanist = computed(() => ({
    Id: selectedArcanist.value.Id,
    isVisible: selectedVisible.value,
    currentInsight: selectedCurrentInsight.value,
    currentLevel: selectedCurrentLevel.value,
    goalInsight: selectedGoalInsight.value,
    goalLevel: selectedGoalLevel.value,
    currentResonance: selectedCurrentResonance.value,
    goalResonance: selectedGoalResonance.value
}));

const rarity = computed(() => {
    return selectedArcanist.value.Rarity;
});

const currentInsightOptions = computed(() => {
    return [0, ...selectedArcanist.value.Insight.map((insight) => insight.Id)];
});

const goalInsightOptions = computed(() => {
    return currentInsightOptions.value.filter(insight => insight >= selectedCurrentInsight.value);
});

const currentLevelOptions = computed(() => {
    // if (selectedCurrentInsight.value == null) return [];
    const calc = calculations.find((calc) =>
        calc.Rarity.includes(selectedArcanist.value.Rarity) &&
        calc.Insight === selectedCurrentInsight.value
    );

    if (!calc) return [];

    return [1, ...Object.keys(calc.Levels).map(Number).filter(level => level % 5 === 0)];
});

const goalLevelOptions = computed(() => {
    if (selectedGoalInsight.value === null) return [];
    const calc = calculations.find((calc) =>
        calc.Rarity.includes(selectedArcanist.value.Rarity) &&
        calc.Insight === selectedGoalInsight.value
    );

    if (!calc) return [];
    // console.log(calc);

    if (selectedGoalInsight.value === selectedCurrentInsight.value) {
        return [1, ...Object.keys(calc.Levels).map(Number).filter(level => level % 5 === 0)].filter(level => level >= selectedCurrentLevel.value);
    }

    return [1, ...Object.keys(calc.Levels).map(Number).filter(level => level % 5 === 0)];
});

const currentResonanceOptions = computed(() => {
    if (selectedCurrentInsight.value === null) return [];
    if (selectedCurrentInsight.value === 0) {
        // FIXME:
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        selectedCurrentResonance.value = 0;
        return [0];
    }
    const insightValue = Number(selectedCurrentInsight.value);
    if (insightValue === 0) {
        // FIXME:
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        selectedCurrentResonance.value = null;
        return null;
    }
    const upperLimit = insightValue * 5;
    return Array.from({ length: upperLimit }, (_, index) => Number(index + 1));
});

const goalResonanceOptions = computed(() => {
    if (selectedGoalInsight.value === null) return [];
    if (selectedGoalInsight.value === 0) {
        // FIXME:
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        selectedGoalResonance.value = 0;
        return [0];
    }
    const insightValue = Number(selectedGoalInsight.value);
    const currentResonance = Number(selectedCurrentResonance.value);
    if (insightValue === 0) {
        // FIXME:
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        selectedGoalResonance.value = null;
        return null;
    }
    const lowerLimit = currentResonance || 1; // Start from selectedCurrentResonance or 1 if not set
    const upperLimit = insightValue * 5;
    return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, index) => Number(lowerLimit + index));
});

watch([selectedCurrentInsight, selectedCurrentLevel, selectedCurrentResonance, selectedGoalInsight, selectedGoalLevel, selectedGoalResonance], () => {
    // Whenever any selectedX changes, update the key to trigger a re-render in all SelectList components
    updateKey.value += 1;
    if (selectedCurrentLevel.value > currentLevelOptions.value[currentLevelOptions.value.length - 1]) {
        selectedCurrentLevel.value = currentLevelOptions.value[currentLevelOptions.value.length - 1];
    }
    if (selectedGoalLevel.value > goalLevelOptions.value[goalLevelOptions.value.length - 1]) {
        selectedGoalLevel.value = goalLevelOptions.value[goalLevelOptions.value.length - 1];
    }
    if (Number(selectedCurrentResonance.value) > Number(selectedGoalResonance.value)) {
        selectedGoalResonance.value = selectedCurrentResonance.value;
    }
    if (selectedCurrentResonance.value < currentResonanceOptions.value[0]) {
        selectedCurrentResonance.value = currentResonanceOptions.value[0];
    }
    if (selectedGoalResonance.value < goalResonanceOptions.value[0]) {
        selectedGoalResonance.value = goalResonanceOptions.value[0];
    }
    if (compareLevels(selectedCurrentInsight.value, selectedCurrentLevel.value, selectedGoalInsight.value, selectedGoalLevel.value)) {
        // console.log('Current is higher than goal');
        selectedGoalInsight.value = selectedCurrentInsight.value;
        selectedGoalLevel.value = selectedCurrentLevel.value;
    }
});

</script>

<template>
    <div class="edit-overlay">
        <div
            class="fixed p-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 custom-gradient-gray-blue custom-border rounded-md w-11/12 sm:max-w-2xl lg:h-auto">
            <!-- Header -->
            <div class="flex items-center p-2 mb-3 shadow-border-b">
                <div class="flex items-center justify-center mr-2 space-x-3">
                    <ArcanistIcon class="ml-2" :arcanist="selectedArcanist" />
                    <h2 class="text-1xl md:text-2xl text-white font-bold">{{ $t(selectedArcanist.Name) }}</h2>
                    <label class="text-sm text-white" for="raritySelect">{{ rarity }}
                        <i class="fa-solid fa-star" :class="{
                            'text-orange-300': rarity === 6,
                            'text-yellow-100': rarity === 5,
                            'text-purple-400': rarity === 4,
                            'text-sky-200': rarity === 3,
                            'text-green-200': rarity === 2
                        }"></i>
                    </label>
                    <div class="tooltip" :data-tip="$t('remove-arcanist')"><i @click="removeArcanist"
                            class="fas fa-trash-alt text-gray-500"></i></div>
                </div>
                <div class="ml-auto flex items-center space-x-3">
                    <div class="tooltip" :data-tip="$t('hidden-show')">
                        <div @click="selectedVisible = !selectedVisible" class="badge badge-ghost"
                            :class="selectedVisible ? 'green-badge' : 'red-badge'">
                            <i :class="selectedVisible ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"></i>
                        </div>
                    </div>
                    <button @click="closeOverlay" class="text-white">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="custom-line"></div>
            <!-- Selectors -->
            <div class="custom-label text-blue-100">{{ $t('current-level') }}</div>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList :key="updateKey" v-model="selectedCurrentInsight" :selected="selectedCurrentInsight"
                    :label="'Current Insight'" :options="currentInsightOptions" v-on:update:selected="handleSelected" />
                <i
                    class="text-white text-center flex items-center justify-center font-extrabold text-2xl -translate-y-2">_</i>
                <SelectList :key="updateKey" v-model="selectedCurrentLevel" :selected="selectedCurrentLevel"
                    :label="'Current Level'" :options="currentLevelOptions" v-on:update:selected="handleSelected" />
            </div>
            <div class="custom-label text-blue-100">{{ $t('goal-level') }}</div>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList :key="updateKey" v-model="selectedGoalInsight" :selected="selectedGoalInsight"
                    :label="'Goal Insight'" :options="goalInsightOptions" v-on:update:selected="handleSelected" />
                <i
                    class="text-white text-center flex items-center justify-center font-extrabold text-2xl -translate-y-2">_</i>
                <SelectList :key="updateKey" v-model="selectedGoalLevel" :selected="selectedGoalLevel" :label="'Goal Level'"
                    :options="goalLevelOptions" v-on:update:selected="handleSelected" />
            </div>
            <div class="custom-label text-blue-100">{{ $t('resonance') }}</div>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList :key="updateKey" v-model="selectedCurrentResonance" :selected="selectedCurrentResonance"
                    :label="'Current Resonance'" :options="currentResonanceOptions" v-on:update:selected="handleSelected" />
                <i class="text-white fa-solid fa-angles-right text-center"></i>
                <SelectList :key="updateKey" v-model="selectedGoalResonance" :selected="selectedGoalResonance"
                    :label="'Goal Resonance'" :options="goalResonanceOptions" v-on:update:selected="handleSelected" />
            </div>
            <!-- Save -->
            <div class="flex justify-center space-x-4 pt-2">
                <button v-if="indexInArcanistsList >= 0 && materialRequirement.length != 0"
                    onclick="level_up_container.showModal()" class="btn btn-info">{{ $t('level-up') }}</button>
                <dialog id="level_up_container" class="modal">
                    <div class="modal-box custom-gradient-gray-blue custom-border relative h-5/6 2xl:h-1/2">
                        <form method="dialog">
                            <button class="btn btn-sm btn-circle btn-ghost text-white absolute right-2 top-2 ">✕</button>
                        </form>
                        <div class="h-1/4 overflow-y-auto hidden-scrollbar flex items-center justify-center flex-col">
                            <p class="pt-4 text-white text-center">{{
                                $t('leveling-up-will-update-the-arcanists-current-status-and-consume-your-warehouse-inventory-proceed')
                            }}</p>
                        </div>
                        <div class="h-3/5 overflow-y-auto">
                            <ArcanistLevelUp :arcanist="editingArcanist" />
                        </div>
                        <div class="h-1/6 overflow-y-auto">
                            <form method="dialog" class="flex justify-center pt-4">
                                <button v-if="isWarehouseSufficient" class="btn btn-sm btn-success text-black"
                                    @click="levelUpArcanist">{{ $t('level-up') }}</button>
                                <p v-else class="text-error"> {{ $t('not-enough-materials') }}</p>
                            </form>
                        </div>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
                <div v-if="isTheSame">
                    <div class="text-error font-bold py-3">{{ $t('current-and-goal-are-the-same') }}</div>
                </div>
                <button v-else @click="addArcanist" class="btn btn-success">{{ $t('save') }}</button>
            </div>
            <!-- Materials -->
            <ArcanistCalculate :arcanist="editingArcanist" />
        </div>
    </div>
</template>

<style scoped>
.modal-box {
    overflow-y: unset;
}
</style>
