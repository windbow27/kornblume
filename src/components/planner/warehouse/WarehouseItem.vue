<script setup lang="ts" name="WarehouseItem">
import { computed } from 'vue';
import { IMaterialUnit } from '@/types';
import { normalizeDisplayMaterial } from '../../../composables/materials';
import NumericInput from '@/components/common/NumericInput.vue';

const props = defineProps<{
    material: IMaterialUnit;
}>();

const emit = defineEmits<{(e: 'update:quantity', quantity: number): void }>();

const handleUpdate = (newQuantity: number) => {
    emit('update:quantity', newQuantity);
};

const normalizedMaterial = computed(() => {
    const result = normalizeDisplayMaterial(props.material);
    return result;
});

</script>

<template>
    <div class="pb-6">
        <div class="relative inline-block">
            <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute"
                :class="{ 'w-36': normalizedMaterial.material === 'Sharpodonty' || normalizedMaterial.material === 'Dust' }" />
            <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20 avatar"
                :class="{ 'mx-5': normalizedMaterial.material === 'Sharpodonty' || normalizedMaterial.material === 'Dust' }" />
            <NumericInput
                :modelValue="props.material.Quantity"
                @update:modelValue="handleUpdate"
                class="bg-slate-600 text-white absolute -bottom-3 left-3 w-14 input input-xs rounded-t-none text-center"
                :class="{
                    'left-[17px] w-[85px]': normalizedMaterial.material === 'Sharpodonty' || normalizedMaterial.material === 'Dust'
                }"
            />
        </div>
    </div>
</template>
