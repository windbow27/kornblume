<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { IStage } from '@/types';
import { useGlobalStore } from '@/stores/global';
import { useRouter } from 'vue-router';
import { normalizeDisplayStage } from '@/composables/stages';
import { useI18n } from 'vue-i18n';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const props = defineProps({
    selectedStage: {
        type: Object as () => IStage,
        required: true
    },
    stageName: {
        type: String,
        required: true
    },
    dropRate: {
        type: String,
        required: true
    }
});

const globalStore = useGlobalStore();
const router = useRouter();
const tooltip = ref(null);
const { t } = useI18n();

const getNormalizedStage = () => {
    return normalizeDisplayStage(props.selectedStage, props.stageName);
};

const selectStage = () => {
    globalStore.setSelectedStage(props.selectedStage);
    router.push('/stages')
};

onMounted(() => {
    tippy(tooltip.value as unknown as Element, {
        content: t(getNormalizedStage().stage),
        theme: 'daisyui'
    });
});

</script>

<template>
    <div @click="selectStage" class="cursor-pointer">
        <div ref="tooltip" class="relative inline-block">
            <img :src="getNormalizedStage().stageImagePath" alt="Border Image" class="w-32 lg:w-40 rounded" />
            <div
                class="absolute text-white bottom-0.5 right-0.5 rounded bg-gray-700 rounded-tl px-1 py-px text-xs max-w-[7.775rem] lg:max-w-[9.775rem] whitespace-nowrap overflow-hidden overflow-ellipsis">
                {{ $t(getNormalizedStage().stage) }}
            </div>
            <div class="absolute text-white top-0.5 left-0.5 bg-gray-700 rounded px-1 py-px text-xs">
                {{ dropRate }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
