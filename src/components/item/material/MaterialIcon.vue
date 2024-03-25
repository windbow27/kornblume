<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { IMaterialUnit } from '@/types';
import { useRouter } from 'vue-router';
import { normalizeDisplayMaterial } from '@/composables/materials';
import { useGlobalStore } from '@/stores/global';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const globalStore = useGlobalStore();
const router = useRouter();
const { t } = useI18n();
const tooltip = ref(null);

const getNormalizedMaterial = computed(() => {
    return normalizeDisplayMaterial(props.material);
});

const selectMaterial = () => {
    globalStore.setSelectedMaterial(props.material);
    router.push('/items')
};

onMounted(() => {
    tippy(tooltip.value as unknown as Element, {
        content: t(getNormalizedMaterial.value?.material),
        theme: 'daisyui'
    });
});

</script>

<template>
    <div @click="selectMaterial" class="cursor-pointer">
        <div ref="tooltip" class="relative inline-block">
            <img :src="getNormalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
            <img :src="getNormalizedMaterial.itemImagePath" :alt="$t(getNormalizedMaterial.material)"
                class="w-20 h-20 avatar" />
            <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
                {{ getNormalizedMaterial.quantity }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
