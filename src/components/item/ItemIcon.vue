<script setup>
import { computed } from 'vue';
import { useProcessMaterial } from '../../composables/item';

const props = defineProps({
    material: {
        type: Object,
        required: true
    }
});

const processMaterial = computed(() => {
    const result = useProcessMaterial(props.material);
    return result;
});

</script>

<template>
    <div class="image-container relative inline-block">
        <img :src="processMaterial.borderImagePath" alt="Border Image" class=" w-20 h-20 absolute" />
        <img :src="processMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
        <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
            {{ processMaterial.quantity }}
        </div>
    </div>
</template>
  
<style scoped></style>
  