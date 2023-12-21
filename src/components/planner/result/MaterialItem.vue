<script setup lang="ts" name="MaterialItem">
import { computed } from 'vue';
import { useProcessMaterial, formatQuantity } from '../../../composables/ProcessItems';
import { useWarehouseStore } from '@/stores/warehouseStore';

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

const warehouseMaterial = computed(() => {
    const warehouseMatl = useWarehouseStore().getItem(processMaterial.value.material)
    return warehouseMatl;
});

const isReachGoal = computed(() => {
    return (warehouseMaterial.value?.Quantity || 0) >= processMaterial.value.quantity;
});

</script>

<template>
    <div class="pb-6">
        <div class="relative inline-block">
            <img :src="processMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
            <img :src="processMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
            <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs cursor-default">
                {{ processMaterial.quantity }}
            </div>
            <button class="btn btn-xs absolute -bottom-3 left-3 w-14 rounded-t-none text-center cursor-pointer"
                    :class="isReachGoal ? 'btn-success text-white' : 'btn-warning text-black'"
            >
                {{ formatQuantity(warehouseMaterial?.Quantity) }}
            </button>
        </div>
    </div>
</template>
