<script setup lang="ts">
import { normalizeDisplayMaterial } from '@/composables/materials';
import { IMaterialUnit } from '@/types';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const getNormalizedMaterial = () => {
    return normalizeDisplayMaterial(props.material);
};

</script>

<template>
    <div class="tooltip" :data-tip="$t(getNormalizedMaterial().material)">
        <div class="relative inline-block">
            <img :src="getNormalizedMaterial().borderImagePath" alt="Border Image" class=" w-20 h-20 absolute" />
            <img :src="getNormalizedMaterial().itemImagePath" alt="Material Image" class="w-20 h-20 avatar" />
            <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
                {{ getNormalizedMaterial().quantity }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
