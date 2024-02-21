<script setup lang="ts">
import { IStage } from '@/types';
import { normalizeDisplayStage } from '@/composables/stages';

const props = defineProps({
    stage: {
        type: Object as () => IStage,
        required: true
    },
    stageName: {
        type: String,
        required: true
    }
});

const getNormalizedStage = () => {
    return normalizeDisplayStage(props.stage, props.stageName);
};

</script>

<template>
    <div class="tooltip relative overflow-hidden group cursor-pointer" :data-tip="$t(getNormalizedStage().stage)">
        <div class="transform transition-transform duration-500 overflow-hidden relative">
            <img :src="getNormalizedStage().stageImagePath" alt="Border Image"
                class="w-32 lg:w-40 rounded transform transition-transform duration-300 group-hover:scale-110" />
            <div
                class="absolute text-white bottom-0.5 right-0.5 rounded bg-gray-700 rounded-tl px-1 py-px text-xs max-w-[7.775rem] lg:max-w-[9.775rem] whitespace-nowrap overflow-hidden overflow-ellipsis">
                {{ $t(getNormalizedStage().stage) }}
            </div>
            <div
                class="overlay absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
            </div>
        </div>
    </div>
</template>

<style scoped></style>
