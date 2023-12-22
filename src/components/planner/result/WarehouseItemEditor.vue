<script setup lang="ts" name="WarehouseItemEditor">
import { ref, computed, onMounted, watch } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore';

const props = defineProps({
    processMaterial: {
        type: Object,
        required: true
    },
    material: {
        type: Object,
        required: true
    }
});

const quantity = ref(props.material.Quantity);

const updateQuantity = () => {
    const newQuantity = Number(quantity.value)
    if (!isNaN(newQuantity)) {
        useWarehouseStore().updateItem(props.material.Material, newQuantity)
    }
};

onMounted(() => {
    quantity.value = useWarehouseStore().getItem(props.material.Material)?.Quantity
})

const isMoreThanZero = computed(() => {
    return quantity.value > 0;
});

const minus = () => {
    useWarehouseStore().reduceItem(props.material.Material, 1)
    quantity.value = quantity.value - 1
}

const plus = () => {
    useWarehouseStore().addItem(props.material.Material, 1)
    quantity.value = quantity.value + 1
}

// Must listen to parent component's prop changes, or the quantity won't update instantly
watch(() => props.material, (newValue) => {
    quantity.value = newValue.Quantity
})

</script>

<template>
    <div class="pb-6">
        <div class="relative flex flex-col">
            <div class="relative">
                <img :src="processMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
                <img :src="processMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
            </div>
            <input v-model="quantity" @input="updateQuantity" type="text" placeholder=""
                   class="bg-slate-600 text-white w-14 input input-xs rounded-none text-center absolute right-3 bottom-6" />
            <div class="flex items-center justify-center font-bold w-20 mt-3">
                <button class="btn btn-info btn-xs w-7 font-bold rounded-t-none rounded-r-none text-white"
                        :disabled="!isMoreThanZero" @click="minus">-</button>
                <button class="btn btn-info btn-xs w-7 font-bold rounded-t-none rounded-l-none text-white" @click="plus">+</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.btn:disabled {
    color: rgb(255, 255, 255);
    background-color: var(--tw-ring-color);
}
</style>
