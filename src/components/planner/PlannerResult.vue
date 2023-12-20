<script setup>
import { ref, watchEffect } from 'vue';
import { useCalculation, mergeResults } from '../../composables/CalculateMaterials';
import { getTotalActivityAndDays, getPlan } from '../../composables/ProcessCards.js';
import PlannerLayer from './PlannerLayer.vue';
import { useGlobalStore } from '../../stores/global';

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
    if (!useGlobalStore().isEditingWarehouse) {
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
    }
});
</script>

<template>
    <div class="flex flex-wrap">
        <button class="text-center text-info text-sm opacity-80" onclick="process_explaination.showModal()">Confused at how
            the process works?</button>
        <dialog id="process_explaination" class="modal">
            <div class="modal-box custom-gradient-gray-blue">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                </form>
                <div>
                    <p class="py-4 text-white">
                        When you add arcanists to the planner with their current/goal levels & resonance, you will see
                        several sections appear below.
                        <br>
                        <br>
                        The <span class="text-yellow-500">Resources</span> & <span class="text-blue-500">Insight</span>
                        sections are straightforward, and they show you how many times you need to run each stage in order
                        to get the materials based on your intended arcanist levels. Since we can't farm resonance
                        materials, those are shown with the cost associated in the Oneiric Shop found in the Bank.
                        <br>
                        <br>
                        The other two sections are <span class="text-purple-500">Hard Stages</span> & <span
                            class="text-green-500">Crafting</span>. These results have been optimized to reduce the stamina
                        required for farming these materials. By running the listed stages the number of times it suggests,
                        it is expected you will receive all the materials you need. The materials obtained from the hard
                        stage farming will help you make the items listed in the crafting section.
                        <br>
                        <br>
                        As you obtain materials from farming hard stages, it's recommended that you update your warehouse
                        values so that the planner remains up-to-date & your results are accurate.
                        <br>
                        <br>
                        Please note that we do not know exact drop rates, so we can only show what you're <span class="text-red-500"> expected </span> to
                        get - not what you will get exactly. The <span class="text-purple-500">Hard Stages</span> section will also show <span class="text-red-500"> any </span> drop that you may
                        get - rather than only the items that you need. This does not affect the results of the farm plan.
                    </p>
                </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <PlannerLayer v-for="(layer, index) in calculateCards" :key="index" :layer="layer" />
</div></template>

<style scoped></style>
