<script setup lang="ts" name="MaterialFormula">
import { computed } from 'vue';
import { normalizeDisplayMaterial } from '../../../composables/materials';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { storeToRefs } from 'pinia'

const props = defineProps({
    material: {
        type: Object,
        required: true
    }
});

const warehouseStore = useWarehouseStore()
const { data: warehouseData } = storeToRefs(warehouseStore)

const normalizedMaterial = computed(() => {
    const result = normalizeDisplayMaterial(props.material);
    return result;
});

const warehouseQuantity = computed(() => {
    return warehouseData.value.find((matl) => matl.Material === props.material.Material)?.Quantity || 0
})

</script>

<template>
    <div class="relative inline-block">
        <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class=" w-20 h-20 absolute" />
        <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
        <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
            {{ warehouseQuantity >= 1000 ? normalizedMaterial.quantity :
                `${warehouseQuantity}/${normalizedMaterial.quantity}` }}
        </div>
    </div>
</template>
