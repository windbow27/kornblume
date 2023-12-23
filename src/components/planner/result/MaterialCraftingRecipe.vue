<script setup lang="ts" name="MaterialCraftingRecipe">
import { computed } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore';
import MaterialFormulaItem from './MaterialFormulaItem.vue';
import { storeToRefs } from 'pinia'

const warehouseStore = useWarehouseStore()
const { data: warehouseData } = storeToRefs(warehouseStore)

const props = defineProps({
    normalizedMaterial: {
        type: Object,
        required: true
    },
    material: {
        type: Object,
        required: true
    },
    formula: {
        type: Object,
        required: true
    }
});

const craft = () => {
    if (props.formula) {
        const formula = props.formula
        useWarehouseStore().addItem(formula.Name, 1);
        formula.Material.forEach((matlName, matlIndex) => {
            const matlQuantity = formula.Quantity[matlIndex] || 0;
            useWarehouseStore().reduceItem(matlName, matlQuantity);
        })
    }
}

const isCraftable = computed(() => {
    if (props.formula?.Material) {
        const isLessThanWarehouse = props.formula?.Material.some((matlName, matlIndex) => {
            const warehouseQuantity = warehouseData.value.find((matl) => matl.Material === matlName)?.Quantity || 0;
            const formulaQuantity = props.formula?.Quantity[matlIndex];
            return warehouseQuantity < formulaQuantity
        })
        return !isLessThanWarehouse;
    }
    return false
})

const reverse = () => {
    if (props.formula) {
        const formula = props.formula
        useWarehouseStore().reduceItem(formula.Name, 1);
        formula.Material.forEach((matlName, matlIndex) => {
            const matlQuantity = formula.Quantity[matlIndex] || 0;
            useWarehouseStore().addItem(matlName, matlQuantity);
        })
    }
}

const isReversible = computed(() => {
    const matlName = props.material.Material
    const warehouseQuantity = warehouseData.value.find((matl) => matl.Material === matlName)?.Quantity || 0;
    return warehouseQuantity > 0;
})

</script>

<template>
    <div class="flex flex-col bg-slate-300/10 rounded py-2">
        <p class="text-center text-slate-300 text-sm opacity-70">Crafting Recipes</p>
       <div class="grid grid-cols-2 sm:flex flex-row m-auto">
            <div v-for="(material, materialIndex) in formula?.Material" :key="materialIndex">
                <MaterialFormulaItem :material="{
                    Material: material,
                    Quantity: formula?.Quantity[materialIndex]
                }" />
            </div>
       </div>
        <div class="flex px-3 items-center justify-center gap-3">
            <button class="btn btn-success btn-xs font-bold  text-white" @click="craft"
            :disabled="!isCraftable" :class="isCraftable ? 'btn-success': 'btn-info'" >Craft</button>
            <button class="btn btn-success btn-xs font-bold  text-white" @click="reverse"
            :disabled="!isReversible" :class="isReversible ? 'btn-success': 'btn-info'" >Reverse</button>
        </div>
    </div>
</template>
