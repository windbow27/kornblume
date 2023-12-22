<script setup lang="ts" name="MaterialFormula">
import { defineProps, computed } from 'vue';
import { useWarehouseStore } from '@/stores/warehouseStore';
import MaterialFormulaItem from './MaterialFormulaItem.vue';

const props = defineProps({
    processMaterial: {
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

// FIXME: sync with the left text field
// FIXME: need to check if the materials are sufficient
const craft = () => {
    if (props.formula) {
        const formula = props.formula
        useWarehouseStore().addItem(formula.Name, 1);
        formula.Material.forEach((matlName, matlIndex) => {
            const matlQuantity = props.formula.value?.Quantity[matlIndex] || 0;
            useWarehouseStore().reduceItem(matlName, matlQuantity);
        })
    }
}

const isCraftable = computed(() => {
    if (props.formula?.Material) {
        const isLessThanWarehouse = props.formula?.Material.some((matlName, matlIndex) => {
            const warehouseQuantity = useWarehouseStore().getItem(matlName)?.Quantity || 0;
            const formulaQuantity = props.formula?.Quantity[matlIndex];
            return warehouseQuantity < formulaQuantity
        })
        return !isLessThanWarehouse;
    }
    return false
})

</script>

<template>
    <div class="flex flex-col bg-slate-300/10 rounded py-2">
        <p class="text-center text-slate-300 text-sm opacity-70">Crafting Recipes</p>
        <div class="flex">
            <div v-for="(material, materialIndex) in formula?.Material" :key="materialIndex">
                <MaterialFormulaItem
                    :material="{
                        Material: material,
                        Quantity: formula?.Quantity[materialIndex]
                    }"
                />
            </div>
        </div>
        <div class="flex px-3 items-center justify-center gap-3">
            <button class="btn btn-success btn-xs font-bold  text-white" @click="craft"
            :disabled="!isCraftable" :class="isCraftable ? 'btn-success': 'btn-info'" >Craft</button>
        </div>
</div>
</template>
