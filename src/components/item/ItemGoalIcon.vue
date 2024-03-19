<script setup lang="ts">
import { computed } from 'vue';
import { normalizeDisplayMaterial, formatQuantity } from '../../composables/materials';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { IMaterialUnit } from '@/types';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const checkQuantity = () => {
    if (props.material.Quantity > 99 || useWarehouseStore().getItemQuantity(props.material.Material) > 99) {
        return true;
    }
    return false;
};

const getNormalizedMaterial = computed(() => {
    return normalizeDisplayMaterial(props.material);
});

</script>

<template>
    <div class="tooltip" :data-tip="$t(getNormalizedMaterial.material)">
        <div class="relative inline-block">
            <img :src="getNormalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute"
                :class="{ 'w-36': checkQuantity() }" />
            <img :src="getNormalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20 avatar"
                :class="{ 'mx-5': checkQuantity() }" />
            <div class="flex items-center justify-center small-text text-white absolute -bottom-3 left-3 input input-xs rounded-t-none"
                :class="{
        'left-[17px] w-[85px]': checkQuantity(), 'w-14': !checkQuantity(),
        'bg-green-800/80': useWarehouseStore().getItemQuantity(props.material.Material) >= props.material.Quantity, 'bg-red-500/60': useWarehouseStore().getItemQuantity(props.material.Material) < props.material.Quantity
    }">
                {{ formatQuantity(useWarehouseStore().getItemQuantity(getNormalizedMaterial.material)) }} / {{
        getNormalizedMaterial.quantity }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.small-text {
    font-size: 11px;
}
</style>
