<script setup lang="ts" name="StageIcon">
import { computed } from 'vue';
import { normalizeDisplayStage } from '@/composables/stages';

const props = defineProps({
    stage: {
        type: Object,
        required: true
    },
    stageName: {
        type: String,
        required: true
    }
});

const normalizedStage = computed(() => {
    const result = normalizeDisplayStage(props.stage, props.stageName);
    return result;
});

</script>

<template>
    <div class="tooltip" :data-tip="$t(normalizedStage.stage)">
        <div class="relative inline-block">
            {{ console.log(normalizedStage.stage) }}
            <img :src="normalizedStage.stageImagePath" alt="Border Image" class="w-32 rounded" />
            <div class="absolute text-white bottom-0.5 right-0.5 rounded bg-gray-700 rounded-tl px-1 py-px text-sm"
                :style="{ maxWidth: '120px' }" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ $t(normalizedStage.stage) }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
