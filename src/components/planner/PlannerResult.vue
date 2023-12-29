<script setup lang="ts" name="PannerResult">
import { ref, watchEffect } from 'vue';
import { useCalculation, mergeResults } from '../../composables/CalculateMaterials';
import { getTotalActivityAndDays, getPlan, IPlanCards } from '../../composables/planner';
import PlannerLayer from './result/PlannerLayer.vue';
import { useGlobalStore } from '../../stores/global';
import { usePlannerStore } from '../../stores/plannerStore';
import { IMaterialUnit } from '@/types';

const emits = defineEmits([
    'update:totalActivityAndDays'
]);

const calculateCards = ref<IPlanCards>([]);

watchEffect(() => {
    if (!useGlobalStore().isEditingWarehouse) {
        const result = usePlannerStore().selectedArcanists.map(arc => {
            if (!arc.isVisible) return [];
            const arcResult: IMaterialUnit = useCalculation(arc);
            return arcResult;
        });

        const mergedResult: IMaterialUnit[] = mergeResults(result);

        const normalizedCards = getPlan(mergedResult);

        emits('update:totalActivityAndDays', getTotalActivityAndDays(normalizedCards));

        // Update the calculateCards ref
        calculateCards.value = normalizedCards;
    }
});
</script>

<template>
    <div class="flex flex-wrap">
        <button class="text-center text-info font-bold text-sm hover:text-blue-200 opacity-90" onclick="process_explaination.showModal()">{{ $t('planner-calculation-explanation') }}</button>
        <dialog id="process_explaination" class="modal">
            <div class="modal-box custom-gradient-gray-blue border border-blue-800">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                </form>
                <div>
                    <p class="py-4 text-white">
                        {{ $t('when-you-add-arcanists-to-the-planner-with-their-current-goal-levels') }} {{ $t('and-resonance-you-will-see-several-sections-appear-below') }} <br>
                        <br>
                        {{ $t('the') }} <span class="text-yellow-500">{{ $t('resources') }}</span> & <span class="text-blue-500">{{ $t('insight') }}</span>
                        {{ $t('sections-are-straightforward-and-they-show-you-how-many-times-you-need-to-run-each-stage-in-order-to-get-the-materials-based-on-your-intended-arcanist-levels-since-we-cant-farm-resonance-materials-those-are-shown-with-the-cost-associated-in-the-oneiric-shop-found-in-the-bank') }} <br>
                        <br>
                        {{ $t('the-other-two-sections-are') }} <span class="text-purple-500">{{ $t('hard-stages') }}</span> & <span
                            class="text-green-500">{{ $t('crafting') }}</span>{{ $t('these-results-have-been-optimized-to-reduce-the-stamina-required-for-farming-these-materials-by-running-the-listed-stages-the-number-of-times-it-suggests-it-is-expected-you-will-receive-all-the-materials-you-need-the-materials-obtained-from-the-hard-stage-farming-will-help-you-make-the-items-listed-in-the-crafting-section') }} <br>
                        <br>
                        {{ $t('as-you-obtain-materials-from-farming-hard-stages-its-recommended-that-you-update-your-warehouse-values-so-that-the-planner-remains-up-to-date') }} {{ $t('and-your-results-are-accurate') }}
                        <br>
                        <br>
                        {{ $t('please-note-that-we-do-not-know-exact-drop-rates-so-we-can-only-show-what-youre') }} <span class="text-red-500"> expected </span> {{ $t('to-get-not-what-you-will-get-exactly-the') }} <span class="text-purple-500">{{ $t('hard-stages-0') }}</span> {{ $t('section-will-also-show') }} <span class="text-red-500"> any </span> {{ $t('drop-that-you-may-get-rather-than-only-the-items-that-you-need-this-does-not-affect-the-results-of-the-farm-plan') }} </p>
                </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
    <PlannerLayer v-for="(layer, index) in calculateCards" :key="index" :layer="layer" />
</div></template>

<style scoped></style>
