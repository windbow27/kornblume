<script setup lang="ts" name="MaterialItem">
import { computed } from 'vue';
import { normalizeDisplayMaterial, formatQuantity } from '../../../composables/materials';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useGlobalStore } from '@/stores/global';
import { useDataStore } from '@/stores/dataStore';
import WarehouseItemEditor from './WarehouseItemEditor.vue';
import MaterialCraftingRecipe from './MaterialCraftingRecipe.vue'
import Popper from 'vue3-popper';
import { storeToRefs } from 'pinia'

const props = defineProps({
    material: {
        type: Object,
        required: true
    },
    layerId: {
        type: Number,
        required: true
    }
});

const normalizedMaterial = computed(() => {
    const result = normalizeDisplayMaterial(props.material);
    return result;
});

const items = useDataStore().items;
const warehouseStore = useWarehouseStore()
const { data: warehouseData } = storeToRefs(warehouseStore)

const materialItem = computed(() => {
    return items.find(item => item.Name === props.material.Material)
})

const warehouseMaterial = computed(() => {
    return warehouseData.value.find((matl) => matl.Material === props.material.Material)
})

const neededQuantity = computed(() => {
    if (props.material.Material === 'Crystal Casket') {
        let quantity = 0;
        useDataStore().items.filter((matl) => matl.Category === 'Resonate Material' && matl.Rarity === 6).forEach((resonanceMatl) => {
            quantity += useGlobalStore().getNeededMaterialsQuantity(resonanceMatl.Name)
        })
        return quantity;
    }
    const quantity = useGlobalStore().getNeededMaterialsQuantity(normalizedMaterial.value.material)
    return quantity;
});

const formatNeededQuantity = computed(() => {
    return formatQuantity(neededQuantity.value)
})

const isReachGoal = computed(() => {
    return (warehouseMaterial.value?.Quantity || 0) >= neededQuantity.value;
});

const needQuantityForGoal = computed(() => {
    return isReachGoal.value ? 0 : neededQuantity.value - (warehouseMaterial.value?.Quantity || 0)
})

const formula = computed(() => {
    return useDataStore().formulas.find((matl) => matl.Name === props.material.Material)
})

</script>

<template>
    <Popper arrow placement="top" offsetDistance="2" @open:popper="useGlobalStore().setIsEditingWarehouse(true)"
        @close:popper="useGlobalStore().setIsEditingWarehouse(false)">
        <div class="pb-6 cursor-pointer">
            <div class="relative inline-block">
                <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
                <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
                <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs cursor-default">
                    {{ normalizedMaterial.quantity }}
                </div>
                <div class="btn btn-xs text-white absolute -bottom-3 left-3 w-14 rounded-t-none text-center flex-nowrap btn-ghost custom-gradient-gray-blue-light opacity-95"
                    :class="(formatNeededQuantity.length > 3 && 'gap-0.5')">
                    <i class="text-[10px]"
                        :class="isReachGoal ? 'fa-solid fa-check text-green-300' : 'fa-solid fa-flag text-red-400/60'" />{{
                            formatNeededQuantity }}
                </div>
            </div>
        </div>
        <template #content>
            <div class="flex items-center justify-center flex-col">
                <p v-if="props.layerId !== 0" class="text-center text-slate-300 text-sm opacity-80">
                    <span class="text-white">{{ props.material.Quantity }}</span>
                    {{ (layerId === 3 ? 'expected to be crafted' : 'expected to drop') }}
                </p>
                <p v-if="materialItem?.Category === 'Build Material' && materialItem?.Rarity < 6" class="text-center text-slate-300 text-sm opacity-80">
                    <span class="text-white">{{ Math.max(props.material.Quantity - needQuantityForGoal, 0) }}
                    </span>
                    needed to craft higher tier materials
                </p>
                <p class="text-center text-slate-300 text-sm opacity-80">
                    <span class="text-white">{{ needQuantityForGoal }}
                    </span>
                    needed to complete the goal
                </p>
                <div v-if="!isReachGoal" class="badge badge-lg mt-2 mb-2 red-badge">Insufficient Materials in Warehouse
                </div>
                <div v-if="isReachGoal" class="badge badge-lg mt-2 mb-2 green-badge">Sufficient Materials in Warehouse</div>
                <div class="flex">
                    <WarehouseItemEditor :material="material" :normalizedMaterial="normalizedMaterial" />
                    <MaterialCraftingRecipe v-if="!!formula?.Material.length" :material="material"
                        :normalizedMaterial="normalizedMaterial" :formula="(formula as Object)" />
                </div>
            </div>
        </template>
    </Popper>
</template>

<style>
/* @see: https://valgeirb.github.io/vue3-popper/guide/getting-started.html#css-variables */
:root {
    --popper-theme-background-color: #172554;
    --popper-theme-background-color-hover: #172554;
    --popper-theme-text-color: #ffffff;
    --popper-theme-border-width: 1px;
    --popper-theme-border-style: solid;
    --popper-theme-border-color: rgb(147, 197, 253);
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 20px;
    --popper-theme-box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
</style>
