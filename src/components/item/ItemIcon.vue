<script setup>
import { computed } from 'vue';
import { normalizeDisplayMaterial } from '../../composables/materials';

const props = defineProps({
    material: {
        type: Object,
        required: true
    }
});

const normalizedMaterial = computed(() => {
    const result = normalizeDisplayMaterial(props.material);
    return result;
});

</script>

<template>
    <div class="tooltip" :data-tip="normalizedMaterial.material">
        <div class="relative inline-block">
            <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class=" w-20 h-20 absolute" />
            <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
            <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
                {{ normalizedMaterial.quantity }}
            </div>
        </div>
    </div>
</template>

<style scoped></style>
