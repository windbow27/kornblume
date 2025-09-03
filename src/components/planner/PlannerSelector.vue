<script setup lang="ts" name="PlannerSelector">
import { ref, computed } from 'vue';
import { useCalculation, mergeResults, formatResultsWithCasket } from '@/composables/calculations';
import { useScreen } from '@/composables/useScreen';
import { ISelectedArcanist } from '@/types';
import ArcanistIconToggle from '@/components/arcanist/ArcanistIconToggle.vue';
import ItemGoalIcon from '@/components/item/ItemGoalIcon.vue';

const props = defineProps({
    selectedArcanists: {
        type: Array<ISelectedArcanist>,
        required: true
    }
});

const emit = defineEmits(['open-edit-overlay']);

const arcanists = ref(props.selectedArcanists);
const { hasFinePointer } = useScreen();

const handleLeftClick = (arcanist: ISelectedArcanist) => {
    emit('open-edit-overlay', arcanist);
};

const handleRightClick = (arcanist: ISelectedArcanist) => {
    // console.log('right clicked');
    arcanist.isVisible = !arcanist.isVisible;
};

const arcanistsLength = computed(() => {
    return arcanists.value?.length || 0;
})

const totalMaterials = computed(() => {
    const result = arcanists.value.map(arc => {
        if (!arc.isVisible) return [];
        return useCalculation(arc);
    });
    const mergedResult = mergeResults(result);
    const formattedResult = formatResultsWithCasket(mergedResult);
    return formattedResult;
});

</script>

<template>
    <div class="p-2">
        <div class="flex flex-wrap justify-center space-x-2">
            <ArcanistIconToggle v-for="arcanist in arcanists" :key="arcanist.Id" :arcanist="arcanist.Id"
                :visible="arcanist.isVisible" @click="handleLeftClick(arcanist)"
                @contextmenu.prevent="handleRightClick(arcanist)" class="mb-2" />
            <div class="flex justify-center items-center" v-show="arcanistsLength > 0">
                <button class="btn btn-ghost custom-gradient-button btn-sm text-white"
                    onclick="goalMaterials.showModal()">{{ $t('goal') }}</button>
                <dialog id="goalMaterials" class="modal">
                    <div class="modal-box custom-gradient-gray-blue custom-border hidden-scrollbar">
                        <form method="dialog">
                            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                        </form>
                        <h2 class="font-bold text-lg text-white text-center mb-4">{{ $t('total-goal-materials') }}</h2>
                        <div class="hidden-scrollbar custom-item-list max-h-96 lg:max-h-[600px]">
                            <ItemGoalIcon class="py-2" v-for="material in totalMaterials" :key="material.Material.toString()" :material="material" />
                        </div>
                        <form method="dialog" class="flex justify-center pt-5">
                            <button class="green-button-small">{{ $t('close') }}</button>
                        </form>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            </div>
        </div>

        <div v-if="arcanistsLength === 0" class="text-center text-slate-300 text-sm opacity-70">
            <i18n-t scope="global" keypath='click-add-arcanist-button-to-start-planning'>
                <template #button>
                    <span>{{ $t('add-arcanist') }}</span>
                </template>
            </i18n-t>
        </div>
        <p v-else-if="hasFinePointer" class="text-center text-slate-300 text-sm opacity-70">
            {{ $t('left-click-to-edit-right-click-to-show-hide') }}
        </p>
    </div>
</template>

<style scoped></style>
