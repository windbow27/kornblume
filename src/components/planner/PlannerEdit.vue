<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { levelUpResources, CrystalCasketMaterials } from '@/constants';
import { useCalculation } from '@/composables/calculations';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useGlobalStore } from '@/stores/global';
import { IArcanist, ISelectedArcanist } from '@/types';
import { getArcanistFrequencyPath, getArcanistEuphoriaPath } from '@/composables/images';
import Popper from 'vue3-popper';
import ArcanistIcon from '@/components/arcanist/ArcanistIcon.vue';
import SelectList from '@/components/common/SelectList.vue';
import ArcanistLevelUp from '@/components/arcanist/ArcanistLevelUp.vue';
import CalculateItemList from '@/components/common/CalculateItemList.vue';

const props = defineProps({
    selectedArcanist: {
        type: Object as () => ISelectedArcanist,
        required: true
    },
    selectedArcanists: {
        type: Array as () => ISelectedArcanist[],
        required: true
    },
    listArcanists: {
        type: Array as () => IArcanist[],
        required: true
    }
});

const emit = defineEmits(['closeOverlay', 'updateSelectedArcanists', 'updateListArcanists']);

const arcanists = useDataStore().arcanists;
const updateKey = ref(0);
const calculations = levelUpResources;
const selectedArcanist = ref(
    arcanists.find((arc) => Number(arc.Id) === Number(props.selectedArcanist.Id)) ||
        ({} as IArcanist)
);
const selectedArcanists = ref(props.selectedArcanists);
const listArcanists = ref(props.listArcanists);
const selectedCurrentInsight = ref(props.selectedArcanist.currentInsight);
const selectedCurrentLevel = ref(props.selectedArcanist.currentLevel);
const selectedCurrentResonance = ref(props.selectedArcanist.currentResonance);
const selectedGoalInsight = ref(props.selectedArcanist.goalInsight);
const selectedGoalLevel = ref(props.selectedArcanist.goalLevel);
const selectedGoalResonance = ref(props.selectedArcanist.goalResonance);
const selectedFrequency = ref(props.selectedArcanist.frequency ?? []);
const selectedVisible = ref(props.selectedArcanist.isVisible);
const selectedEuphoria = ref(props.selectedArcanist.euphoria ?? []);
const selectedCurrentMastery = ref(props.selectedArcanist.currentMastery);
const selectedGoalMastery = ref(props.selectedArcanist.goalMastery);

const compareLevels = (
    currentInsightSelect: number,
    currentLevelSelect: number,
    goalInsightSelect: number,
    goalLevelSelect: number
) => {
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

const indexInArcanistsList = computed(() => {
    return selectedArcanists.value.findIndex(
        (arc) => Number(arc.Id) === Number(editingArcanist.value.Id)
    );
});

const addArcanist = () => {
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
    listArcanists.value = listArcanists.value.filter((arc) => arc.Id !== editingArcanist.value.Id);

    emit('updateSelectedArcanists', selectedArcanists.value);
    emit('updateListArcanists', listArcanists.value);
    emit('closeOverlay');
};

const removeArcanist = () => {
    const existingIndex = selectedArcanists.value.findIndex(
        (arc) => Number(arc.Id) === Number(editingArcanist.value.Id)
    );
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
    return (
        materialRequirement.value.filter((matl) => {
            if (CrystalCasketMaterials.includes(matl.Material)) {
                return useWarehouseStore().getItemQuantity('Crystal Casket') < matl.Quantity;
            } else if (useWarehouseStore().getItemQuantity(matl.Material) < matl.Quantity) {
                return true;
            } else {
                return false;
            }
        }).length === 0
    );
});

const levelUpArcanist = () => {
    if (isWarehouseSufficient.value) {
        useGlobalStore().setIsEditingPlanner(true);
        materialRequirement.value.forEach((matl) => {
            if (CrystalCasketMaterials.includes(matl.Material)) {
                useWarehouseStore().reduceItem('Crystal Casket', matl.Quantity);
            } else {
                useWarehouseStore().reduceItem(matl.Material, matl.Quantity);
            }
        });
        selectedCurrentLevel.value = selectedGoalLevel.value;
        selectedCurrentInsight.value = selectedGoalInsight.value;
        selectedCurrentResonance.value = selectedGoalResonance.value;
        selectedFrequency.value = [];
        selectedEuphoria.value = [];
        selectedCurrentMastery.value = selectedGoalMastery.value;
        useGlobalStore().setIsEditingPlanner(false);
        addArcanist();
    }
};

const quickGoal = () => {
    if (selectedArcanist.value.Rarity >= 5) {
        selectedGoalInsight.value = 3;
        selectedGoalLevel.value = 30;
        selectedGoalResonance.value = 10;
        return;
    }
    selectedGoalInsight.value = 2;
    selectedGoalLevel.value = 50;
    selectedGoalResonance.value = 10;
};

const toggleFrequency = (frequency: { Id: number; Type: string }) => {
    const index = selectedFrequency.value.findIndex((f) => f.Id === frequency.Id);
    if (index !== -1) {
        // remove if selected
        selectedFrequency.value.splice(index, 1);
    } else {
        // add if not selected
        selectedFrequency.value.push({
            Id: frequency.Id,
            Type: frequency.Type
        });
    }
};

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
        case 'Current Mastery':
            selectedCurrentMastery.value = option;
            break;
        case 'Goal Mastery':
            selectedGoalMastery.value = option;
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
    goalResonance: selectedGoalResonance.value,
    frequency: selectedFrequency.value,
    euphoria: selectedEuphoria.value,
    currentMastery: selectedCurrentMastery.value,
    goalMastery: selectedGoalMastery.value
}));

const rarity = computed(() => {
    return selectedArcanist.value.Rarity;
});

const currentInsightOptions = computed(() => {
    return [0, ...(selectedArcanist.value.Insight ?? []).map((insight) => insight.Id)];
});

const goalInsightOptions = computed(() => {
    return currentInsightOptions.value.filter((insight) => insight >= selectedCurrentInsight.value);
});

const currentLevelOptions = computed(() => {
    // if (selectedCurrentInsight.value == null) return [];
    const calc = calculations.find(
        (calc) =>
            calc.Rarity.includes(selectedArcanist.value.Rarity) &&
            calc.Insight === selectedCurrentInsight.value
    );

    if (!calc) return [];

    return [
        1,
        ...Object.keys(calc.Levels)
            .map(Number)
            .filter((level) => level % 5 === 0)
    ];
});

const goalLevelOptions = computed(() => {
    if (selectedGoalInsight.value === null) return [];
    const calc = calculations.find(
        (calc) =>
            calc.Rarity.includes(selectedArcanist.value.Rarity) &&
            calc.Insight === selectedGoalInsight.value
    );

    if (!calc) return [];
    // console.log(calc);

    if (selectedGoalInsight.value === selectedCurrentInsight.value) {
        return [
            1,
            ...Object.keys(calc.Levels)
                .map(Number)
                .filter((level) => level % 5 === 0)
        ].filter((level) => level >= selectedCurrentLevel.value);
    }

    return [
        1,
        ...Object.keys(calc.Levels)
            .map(Number)
            .filter((level) => level % 5 === 0)
    ];
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
        selectedCurrentResonance.value = 0;
        return [];
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
        selectedGoalResonance.value = 0;
        return [];
    }
    const lowerLimit = currentResonance || 1; // Start from selectedCurrentResonance or 1 if not set
    const upperLimit = insightValue * 5;
    return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, index) =>
        Number(lowerLimit + index)
    );
});

const frequencyOptions = computed(() => {
    const arcanistFrequency = selectedArcanist.value.Frequency ?? [];
    return arcanistFrequency.map((item) => ({
        Type: item.Type,
        Id: item.Id
    }));
});

const euphoriaOptions = computed(() => {
    const arcanistEuphoria = selectedArcanist.value.Euphoria ?? [];
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

watch(
    [
        selectedCurrentInsight,
        selectedCurrentLevel,
        selectedCurrentResonance,
        selectedGoalInsight,
        selectedGoalLevel,
        selectedGoalResonance,
        selectedCurrentMastery,
        selectedGoalMastery
    ],
    () => {
        // Whenever any selectedX changes, update the key to trigger a re-render in all SelectList components
        updateKey.value += 1;
        if (
            selectedCurrentLevel.value >
            currentLevelOptions.value[currentLevelOptions.value.length - 1]
        ) {
            selectedCurrentLevel.value =
                currentLevelOptions.value[currentLevelOptions.value.length - 1];
        }
        if (selectedGoalLevel.value > goalLevelOptions.value[goalLevelOptions.value.length - 1]) {
            selectedGoalLevel.value = goalLevelOptions.value[goalLevelOptions.value.length - 1];
        }
        if (Number(selectedCurrentResonance.value) > Number(selectedGoalResonance.value)) {
            selectedGoalResonance.value = selectedCurrentResonance.value;
        }

        // If the selected value is lower than the first option, set it to the first option
        if (selectedCurrentResonance.value < currentResonanceOptions.value[0]) {
            selectedCurrentResonance.value = currentResonanceOptions.value[0];
        }
        if (selectedGoalResonance.value < goalResonanceOptions.value[0]) {
            selectedGoalResonance.value = goalResonanceOptions.value[0];
        }
        if (selectedCurrentMastery.value < currentMasteryOptions.value[0]) {
            selectedCurrentMastery.value = currentMasteryOptions.value[0];
        }
        if (selectedGoalMastery.value < goalMasteryOptions.value[0]) {
            selectedGoalMastery.value = goalMasteryOptions.value[0];
        }

        if (
            compareLevels(
                selectedCurrentInsight.value,
                selectedCurrentLevel.value,
                selectedGoalInsight.value,
                selectedGoalLevel.value
            )
        ) {
            // console.log('Current is higher than goal');
            selectedGoalInsight.value = selectedCurrentInsight.value;
            selectedGoalLevel.value = selectedCurrentLevel.value;
        }
    }
);
</script>

<template>
    <div class="edit-overlay">
        <div
            class="fixed p-4 custom-modal-big custom-border rounded-md w-11/12 sm:max-w-2xl 2xl:h-[75vh]">
            <button @click="closeOverlay" class="text-white absolute top-2 right-4">
                <i class="fas fa-times"></i>
            </button>
            <!-- Header -->
            <div class="flex flex-wrap items-center p-2 shadow-border-b">
                <div class="flex items-center justify-center mr-2 space-x-3">
                    <ArcanistIcon class="ml-2" :arcanist="selectedArcanist" />
                    <h2 class="text-1xl md:text-2xl text-white font-bold">
                        {{ $t(selectedArcanist.Name) }}
                    </h2>
                    <label class="text-sm text-white" for="raritySelect"
                        >{{ rarity }}
                        <i
                            class="fa-solid fa-star"
                            :class="{
                                'text-orange-300': rarity === 6,
                                'text-yellow-100': rarity === 5,
                                'text-purple-400': rarity === 4,
                                'text-sky-200': rarity === 3,
                                'text-green-200': rarity === 2
                            }"></i>
                    </label>
                </div>
                <div class="ml-auto flex items-center space-x-3">
                    <div class="tooltip" :data-tip="$t('remove-arcanist')">
                        <i @click="removeArcanist" class="fas fa-trash-alt text-gray-500"></i>
                    </div>
                    <div class="tooltip" :data-tip="$t('hidden-show')">
                        <div
                            @click="selectedVisible = !selectedVisible"
                            class="badge badge-ghost"
                            :class="selectedVisible ? 'green-badge' : 'red-badge'">
                            <i
                                :class="
                                    selectedVisible
                                        ? 'fa-regular fa-eye'
                                        : 'fa-regular fa-eye-slash'
                                "></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="custom-line mb-4"></div>
            <!-- Selectors -->
            <div class="custom-label text-blue-100">
                {{ $t('current-level') }}
            </div>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList
                    :key="updateKey"
                    v-model="selectedCurrentInsight"
                    :selected="selectedCurrentInsight"
                    :label="'Current Insight'"
                    :options="currentInsightOptions"
                    v-on:update:selected="handleSelected" />
                <i
                    class="text-white text-center flex items-center justify-center font-extrabold text-2xl -translate-y-2 w-16"
                    >_</i
                >
                <SelectList
                    :key="updateKey"
                    v-model="selectedCurrentLevel"
                    :selected="selectedCurrentLevel"
                    :label="'Current Level'"
                    :options="currentLevelOptions"
                    v-on:update:selected="handleSelected" />
            </div>
            <div class="custom-label text-blue-100">{{ $t('goal-level') }}</div>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList
                    :key="updateKey"
                    v-model="selectedGoalInsight"
                    :selected="selectedGoalInsight"
                    :label="'Goal Insight'"
                    :options="goalInsightOptions"
                    v-on:update:selected="handleSelected" />
                <i
                    class="text-white text-center flex items-center justify-center font-extrabold text-2xl -translate-y-2 w-16"
                    >_</i
                >
                <SelectList
                    :key="updateKey"
                    v-model="selectedGoalLevel"
                    :selected="selectedGoalLevel"
                    :label="'Goal Level'"
                    :options="goalLevelOptions"
                    v-on:update:selected="handleSelected" />
            </div>
            <div class="custom-label text-blue-100">{{ $t('resonance') }}</div>
            <div class="mt-2 flex justify-center items-center leading-none">
                <SelectList
                    :key="updateKey"
                    v-model="selectedCurrentResonance"
                    :selected="selectedCurrentResonance"
                    :label="'Current Resonance'"
                    :options="currentResonanceOptions"
                    v-on:update:selected="handleSelected" />
                <i class="text-white fa-solid fa-angles-right text-center w-16"></i>
                <SelectList
                    :key="updateKey"
                    v-model="selectedGoalResonance"
                    :selected="selectedGoalResonance"
                    :label="'Goal Resonance'"
                    :options="goalResonanceOptions"
                    v-on:update:selected="handleSelected" />
            </div>

            <div class="custom-line my-2"></div>

            <div class="flex justify-center py-2 gap-x-2">
                <!-- Quick Goal -->
                <div class="tooltip" :data-tip="$t('quick-goal')">
                    <button
                        @click="quickGoal"
                        class="gradient-blue btn btn-ghost btn-sm w-10 mr-0.5">
                        <i class="fa-solid fa-angles-right"></i>
                    </button>
                </div>

                <!-- Frequency -->
                <div>
                    <Popper arrow placement="bottom" offsetDistance="2">
                        <div
                            :class="{
                                'opacity-50 pointer-events-none': selectedGoalResonance < 10
                            }"
                            class="tooltip"
                            :data-tip="$t('frequency')">
                            <button class="btn-ghost btn btn-sm">
                                <img
                                    class="h-8"
                                    :src="getArcanistFrequencyPath(frequencyOptions[0].Type as string, 0)"
                                    alt="Frequency Icon" />
                            </button>
                        </div>
                        <template #content>
                            <div class="grid grid-cols-3 gap-4 justify-center">
                                <button
                                    v-for="(frequency, index) in frequencyOptions.slice(0, 3)"
                                    :key="index"
                                    @click="
                                        toggleFrequency({
                                            Id: frequency.Id,
                                            Type: frequency.Type || ''
                                        })
                                    "
                                    class="rounded-lg">
                                    <div
                                        class="tooltip px-2 font-light"
                                        :data-tip="$t('frequency-modulation-' + frequency.Id)">
                                        <img
                                            class="h-16 pt-1.5 transition-transform duration-200"
                                            :class="{
                                                'opacity-50': !selectedFrequency.some(
                                                    (f) => f.Id === frequency.Id
                                                ),
                                                'hover:scale-110': true
                                            }"
                                            :src="
                                                getArcanistFrequencyPath(
                                                    frequency.Type || '',
                                                    frequency.Id
                                                )
                                            "
                                            alt="Frequency Icon" />
                                    </div>
                                </button>
                            </div>
                            <div class="grid grid-cols-3 gap-4 justify-center mt-4">
                                <div class="col-span-3 flex justify-center space-x-4">
                                    <button
                                        v-for="(frequency, index) in frequencyOptions.slice(3, 5)"
                                        :key="index"
                                        @click="
                                            toggleFrequency({
                                                Id: frequency.Id,
                                                Type: frequency.Type || ''
                                            })
                                        "
                                        class="rounded-lg">
                                        <div
                                            class="tooltip px-2 font-light"
                                            :data-tip="$t('frequency-modulation-' + frequency.Id)">
                                            <img
                                                class="h-16 pt-1.5 transition-transform duration-200"
                                                :class="{
                                                    'opacity-50': !selectedFrequency.some(
                                                        (f) => f.Id === frequency.Id
                                                    ),
                                                    'hover:scale-110': true
                                                }"
                                                :src="
                                                    getArcanistFrequencyPath(
                                                        frequency.Type || '',
                                                        frequency.Id
                                                    )
                                                "
                                                alt="Frequency Icon" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </template>
                    </Popper>
                </div>

                <!-- Euphoria -->
                <div>
                    <Popper class="euphoria-popper" arrow offsetDistance="2">
                        <div
                            :class="{
                                'opacity-50 pointer-events-none':
                                    selectedGoalLevel < 30 || selectedGoalInsight < 3
                            }"
                            class="tooltip"
                            :data-tip="$t('euphoria')">
                            <button class="btn-ghost btn btn-sm">
                                <img
                                    class="h-8 transform scale-150"
                                    src="/images/items/icon/77.webp"
                                    alt="Frequency Icon" />
                            </button>
                        </div>
                        <template #content>
                            <div class="flex flex-col gap-y-2">
                                <div class="flex justify-center space-x-4">
                                    <button
                                        v-for="(euphoria, index) in euphoriaOptions"
                                        :key="index"
                                        @click="toggleEuphoria(euphoria.Id)"
                                        class="rounded-lg">
                                        <div class="tooltip px-2 font-light">
                                            <img
                                                class="h-24 pt-1.5"
                                                :src="
                                                    getArcanistEuphoriaPath(
                                                        selectedArcanist.Id,
                                                        euphoria.Id
                                                    )
                                                "
                                                :class="{
                                                    'opacity-50': !selectedEuphoria.some(
                                                        (e) => e === euphoria.Id
                                                    ),
                                                    'hover:scale-110': true
                                                }"
                                                alt="Euphoria Icon" />

                                            <div
                                                class="form-control flex justify-center items-center">
                                                <label class="cursor-pointer label">
                                                    <input
                                                        type="checkbox"
                                                        :checked="
                                                            selectedEuphoria.some(
                                                                (e) => e === euphoria.Id
                                                            )
                                                        "
                                                        class="checkbox checkbox-info" />
                                                </label>
                                            </div>
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
                                        v-on:update:selected="handleSelected"
                                        :class="{
                                            'opacity-50 pointer-events-none':
                                                selectedGoalLevel < 30 || selectedGoalInsight < 3
                                        }" />
                                    <i
                                        class="text-white fa-solid fa-angles-right text-center w-10"
                                        :class="{
                                            'opacity-50 pointer-events-none':
                                                selectedGoalLevel < 30 || selectedGoalInsight < 3
                                        }"></i>
                                    <SelectList
                                        :key="'goal-' + updateKey"
                                        v-model="selectedGoalMastery"
                                        :selected="selectedGoalMastery"
                                        :label="'Goal Mastery'"
                                        :options="goalMasteryOptions"
                                        v-on:update:selected="handleSelected"
                                        :class="{
                                            'opacity-50 pointer-events-none':
                                                selectedGoalLevel < 30 || selectedGoalInsight < 3
                                        }" />
                                </div>
                            </div>
                        </template>
                    </Popper>
                </div>

                <!-- Level Up -->
                <div class="tooltip" :data-tip="$t('level-up')">
                    <button
                        :disabled="indexInArcanistsList < 0 || materialRequirement.length === 0"
                        onclick="level_up_container.showModal()"
                        class="gradient-blue btn btn-ghost btn-sm w-10 ml-0.5">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                    </button>
                </div>
            </div>

            <!-- Save -->
            <div class="flex justify-center">
                <button @click="addArcanist" class="green-button mb-2">
                    {{ $t('save') }}
                </button>
            </div>

            <!-- Level Up Modal -->
            <dialog id="level_up_container" class="modal">
                <div
                    class="modal-box custom-gradient-gray-blue custom-border relative flex flex-col min-h-[calc(30dvh)] max-h-[calc(85dvh)] sm:max-h-[calc(75dvh)] gap-4">
                    <form method="dialog">
                        <button
                            class="btn btn-sm btn-circle btn-ghost text-white absolute right-2 top-2">
                            ✕
                        </button>
                    </form>
                    <div class="flex items-center justify-center flex-col">
                        <p class="text-white text-xl font-bold">
                            {{ $t('level-up') }}
                        </p>
                        <p class="text-white text-center">
                            {{
                                $t(
                                    'leveling-up-will-update-the-arcanists-current-status-and-consume-your-warehouse-inventory-proceed'
                                )
                            }}
                        </p>
                    </div>
                    <div class="overflow-y-auto shrink max-h-96">
                        <ArcanistLevelUp :arcanist="editingArcanist" />
                    </div>
                    <form method="dialog" class="flex justify-center">
                        <button
                            v-if="isWarehouseSufficient"
                            class="green-button"
                            @click="levelUpArcanist">
                            {{ $t('level-up') }}
                        </button>
                        <p v-else class="text-error">
                            {{ $t('not-enough-materials') }}
                        </p>
                    </form>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <!-- Materials -->
            <CalculateItemList :arcanist="editingArcanist" />
        </div>
    </div>
</template>

<style scoped>
.euphoria-popper :deep(.popper #arrow::before) {
    /* not sure why its off-center */
    left: 96px;
}
</style>
