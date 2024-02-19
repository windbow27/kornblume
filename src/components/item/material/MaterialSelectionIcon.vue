<script setup lang="ts" name="ItemIcon">
import { computed } from 'vue';
import { baseDisplayMaterial } from '@/composables/materials';

const props = defineProps({
    material: {
        type: Object,
        required: true
    }
});

const normalizedMaterial = computed(() => {
    const result = baseDisplayMaterial(props.material);
    return result;
});

</script>

<template>
    <div class="tooltip" :data-tip="$t(normalizedMaterial.material)">
        <div class="relative inline-block">
            <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class=" w-20 h-20 absolute" />
            <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
        </div>
    </div>
</template>

<style scoped></style>
