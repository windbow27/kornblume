<script setup lang="ts" name="ItemIcon">
import { computed } from 'vue';
import { IItem } from '@/types';
import { baseDisplayMaterial } from '@/composables/materials';

const props = defineProps({
    material: {
        type: Object as () => IItem,
        required: true
    }
});

const normalizedMaterial = computed(() => {
    const result = baseDisplayMaterial(props.material);
    return result;
});

</script>
<template>
    <div class="tooltip relative overflow-hidden group" :data-tip="$t(normalizedMaterial.material)">
        <div class="transform transition-transform duration-500 overflow-hidden relative">
            <img :src="normalizedMaterial.itemImagePath" alt="Material Image"
                class="w-20 h-20 absolute transform transition-transform duration-300 group-hover:scale-125" />
            <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20" />
            <div
                class="overlay absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
            </div>
        </div>
    </div>
</template>
