<script setup lang="ts">
import { IItem } from '@/types';
import { baseDisplayMaterial } from '@/composables/materials';

const props = defineProps({
    material: {
        type: Object as () => IItem,
        required: true
    }
});

const getNormalizedMaterial = () => {
    return baseDisplayMaterial(props.material);
};

</script>
<template>
    <div class="tooltip relative overflow-hidden group cursor-pointer" :data-tip="$t(getNormalizedMaterial().material)">
        <div class="transform transition-transform duration-500 overflow-hidden relative w-20 h-20">
            <img :src="getNormalizedMaterial().itemImagePath" alt="Material Image"
                class="absolute transform transition-transform duration-300 group-hover:scale-125" />
            <img :src="getNormalizedMaterial().borderImagePath" alt="Border Image"/>
            <div
                class="overlay absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
            </div>
        </div>
    </div>
</template>
