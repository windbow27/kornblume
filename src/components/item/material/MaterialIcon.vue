<script setup lang="ts">
import { computed } from 'vue';
import { IMaterialUnit } from '@/types';
import { useRouter } from 'vue-router';
import { normalizeDisplayMaterial } from '@/composables/materials';
import { useGlobalStore } from '@/stores/global';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const globalStore = useGlobalStore();
const router = useRouter();

const getNormalizedMaterial = computed(() => {
    return normalizeDisplayMaterial(props.material);
});

const selectMaterial = () => {
    globalStore.setSelectedMaterial(props.material);
    router.push('/items')
};

</script>

<template>
    <div @click="selectMaterial" class="cursor-pointer">
        <div class="tooltip" :data-tip="$t(getNormalizedMaterial.material)">
            <div class="relative inline-block">
                <img :src="getNormalizedMaterial.borderImagePath"
                    alt="Border Image" class="w-20 h-20 absolute" />
                <img :src="getNormalizedMaterial.itemImagePath"
                :alt="$t(getNormalizedMaterial.material)" class="w-20 h-20 avatar" />
                <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
                    {{ getNormalizedMaterial.quantity }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
