<script setup lang="ts" name="WarehouseItem">
import { ref, computed, watch } from 'vue';
import { IMaterialUnit } from '@/types';
import { normalizeDisplayMaterial } from '../../../composables/materials';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const emit = defineEmits<{(e: 'update:quantity', quantity: number): void }>()

const quantity = ref(props.material.Quantity);

const updateQuantity = () => {
    const newQuantity = Number(quantity.value)
    if (!isNaN(newQuantity)) {
        emit('update:quantity', Number(quantity.value));
    }
};

const normalizedMaterial = computed(() => {
    const result = normalizeDisplayMaterial(props.material);
    return result;
});

// Must listen to parent component's prop changes, or the quantity won't update instantly
watch(() => props.material, (newValue) => {
    quantity.value = newValue.Quantity
})

</script>

<template>
    <div class="pb-6">
        <div class="relative inline-block">
            <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute"
                :class="{ 'w-36': normalizedMaterial.material === 'Sharpodonty' || normalizedMaterial.material === 'Dust' }" />
            <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20 avatar"
                :class="{ 'mx-5': normalizedMaterial.material === 'Sharpodonty' || normalizedMaterial.material === 'Dust' }" />
            <input v-model="quantity" @input="updateQuantity" type="number" inputmode="numeric" step=1 min=0 placeholder=""
                class="bg-slate-600 text-white absolute -bottom-3 left-3 w-14 input input-xs rounded-t-none text-center"
                :class="{
                    'left-[17px] w-[85px]': normalizedMaterial.material === 'Sharpodonty' || normalizedMaterial.material === 'Dust'
                }" />
        </div>
    </div>
</template>
