<script setup lang="ts" name="WarehouseItemEditor">
import { computed } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { storeToRefs } from 'pinia';
import NumericInput from '@/components/common/NumericInput.vue';
import { IMaterialUnit } from '@/types';
import { INormalizedMaterial } from '../../../composables/materials';

const props = defineProps<{
    normalizedMaterial: INormalizedMaterial;
    material: IMaterialUnit;
}>();

const warehouseStore = useWarehouseStore();
const { data: warehouseData } = storeToRefs(warehouseStore);

const warehouseMatl = computed(() => {
    return warehouseData.value.find((matl) => matl.Material === props.material.Material);
});

const quantity = computed(() => warehouseMatl.value?.Quantity || 0);

const handleUpdate = (newQuantity: number) => {
    useWarehouseStore().updateItem(props.material.Material, newQuantity);
};

const minus = () => {
    useWarehouseStore().reduceItem(props.material.Material, 1);
};

const plus = () => {
    useWarehouseStore().addItem(props.material.Material, 1);
};

const isMoreThanZero = computed(() => {
    return quantity.value > 0;
});
</script>

<template>
    <div class="pb-4">
        <div class="relative flex flex-col">
            <div class="relative">
                <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
                <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20 avatar" />
            </div>
            <NumericInput
                :modelValue="quantity"
                @update:modelValue="handleUpdate"
                class="bg-slate-600 text-white w-14 input input-xs rounded-none text-center absolute right-3 bottom-6"
            />
            <div class="flex items-center justify-center font-bold w-20 mt-3">
                <button
                    class="btn btn-ghost custom-gradient-gray-blue-light btn-xs w-7 text-base rounded-t-none rounded-r-none text-white"
                    :disabled="!isMoreThanZero" @click="minus">-</button>
                <button
                    class="btn btn-ghost custom-gradient-gray-blue-light btn-xs w-7 text-base rounded-t-none rounded-l-none text-white"
                    @click="plus">+</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.btn:disabled {
    color: rgb(255, 255, 255);
    background-color: rgb(0, 0, 0);
    opacity: 0.5;
}
</style>