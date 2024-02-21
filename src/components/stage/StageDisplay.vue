<script setup lang="ts">
import { normalizeDrops } from '@/composables/stages';
import { IStage } from '@/types';
import MaterialIcon from '@/components/item/material/MaterialIcon.vue';
import StageSelectionIcon from './StageSelectionIcon.vue';

const props = defineProps({
    selectedStage: {
        type: Object as () => IStage,
        required: true
    },
    stageName: {
        type: String,
        required: true
    }
});

</script>

<template>
    <div class="custom-box custom-border">
        <div class="space-y-1">
            <h2 class="text-white text-2xl font-bold py-1">{{ $t(props.stageName) }}</h2>
            <p class="" :class="{
                'text-error': props.selectedStage.category === 'Story',
                'text-purple-400': props.selectedStage.category === 'Hard',
                'text-indigo-400': props.selectedStage.category === 'Insight',
                'text-yellow-400': props.selectedStage.category === 'Resource',
            }"> {{ $t(props.selectedStage.category) }} </p>
            <div class="flex items-center">
                <p class="text-white text-lg font-bold"> {{ props.selectedStage.cost }} </p>
                <div class="w-9 rounded pb-0.5">
                    <img src="/images/items/common/0.webp" alt="avatar" />
                </div>
            </div>
            <div class="flex justify-center">
                <StageSelectionIcon :stage="props.selectedStage" :stageName="props.stageName" />
            </div>
        </div>
    </div>

    <div class="custom-box custom-border">
        <h2 class="text-white">{{ $t('possible-drops') }}</h2>
        <div class="custom-item-list">
            <MaterialIcon v-for="material in normalizeDrops(props.selectedStage)" :key="material.Material"
                :material="material" />
        </div>
    </div>
</template>

<style scoped></style>
