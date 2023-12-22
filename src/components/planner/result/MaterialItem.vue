<script setup lang="ts" name="MaterialItem">
import { computed } from 'vue';
import { useProcessMaterial, formatQuantity } from '../../../composables/ProcessItems';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useGlobalStore } from '@/stores/global';
import { useDataStore } from '@/stores/dataStore';
import WarehouseItemEditor from './WarehouseItemEditor.vue';
import MaterialFormula from './MaterialFormula.vue'
import Popper from 'vue3-popper';
import { storeToRefs } from 'pinia'

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

const warehouseStore = useWarehouseStore()
const { data: warehouseData } = storeToRefs(warehouseStore)

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
    const quantity = useGlobalStore().getNeededMaterialsQuantity(processMaterial.value.material)
    return quantity;
});

const formatNeededQuantity = computed(() => {
    return formatQuantity(neededQuantity.value)
})

const isReachGoal = computed(() => {
    return (warehouseMaterial.value?.Quantity || 0) >= neededQuantity.value;
});

const formula = computed(() => {
    return useDataStore().formulas.find((matl) => matl.Name === props.material.Material)
})

</script>

<template>
    <Popper arrow placement="top" offsetDistance="2"
            @open:popper="useGlobalStore().setIsEditingWarehouse(true)"
            @close:popper="useGlobalStore().setIsEditingWarehouse(false)">
        <div class="pb-6 cursor-pointer">
            <div class="relative inline-block">
                <img :src="processMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
                <img :src="processMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
                <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs cursor-default">
                    {{ processMaterial.quantity }}
                </div>
                <div class="btn btn-xs text-white absolute -bottom-3 left-3 w-14 rounded-t-none text-center flex-nowrap"
                        :class="isReachGoal ? 'btn-success ' : 'btn-error ' + (formatNeededQuantity.length > 3 && 'gap-0.5')"
                >
                    <i class="text-[10px]" :class="isReachGoal ? 'fa-solid fa-check': 'fa-solid fa-flag'" />{{ formatNeededQuantity }}
            </div>
            </div>
        </div>
        <template #content>
            <div class="flex items-center justify-center flex-col">
                <p class="text-center text-slate-300 text-sm opacity-70">
                    <span class="text-white">{{ props.material.Quantity }}</span>
                    expected to drop/craft here
                </p>
                <p class="text-center text-slate-300 text-sm opacity-70">
                    <span class="text-white">{{ neededQuantity }}</span>
                    needed for your goals
                </p>
                <div v-if="!isReachGoal" class="badge badge-lg mt-2 mb-2 red-badge">You don't have enough</div>
                <div v-if="isReachGoal" class="badge badge-lg mt-2 mb-2 green-badge">You have the amount needed for all</div>
                <div class="flex">
                    <WarehouseItemEditor :material="material" :processMaterial="processMaterial"/>
                    <MaterialFormula v-if="!!formula?.Material.length" :material="material" :processMaterial="processMaterial" :formula="(formula as Object)" />
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
    --popper-theme-border-color: rgb(147,197,253);
    --popper-theme-border-radius: 6px;
    --popper-theme-padding: 20px;
    --popper-theme-box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
</style>
