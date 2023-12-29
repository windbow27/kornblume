<script setup lang="ts" name="MaterialItem">
import { computed, watch, ref } from 'vue';
import { normalizeDisplayMaterial } from '../../../composables/materials';
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

const quantity = ref(props.material.Quantity);

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

const neededRawQuantity = computed(() => {
    if (props.material.Material === 'Crystal Casket') {
        let quantity = 0;
        useDataStore().items.filter((matl) => matl.Category === 'Resonate Material' && matl.Rarity === 6).forEach((resonanceMatl) => {
            quantity += useGlobalStore().getNeededRawMaterialsQuantity(resonanceMatl.Name)
        })
        return quantity;
    }
    const quantity = useGlobalStore().getNeededRawMaterialsQuantity(normalizedMaterial.value.material)
    return quantity;
});

const neededQuantityIncludingCraft = computed(() => {
    if (props.material.Material === 'Crystal Casket') {
        return neededRawQuantity.value
    }
    return useGlobalStore().getNeededMaterialsQuantity(normalizedMaterial.value.material)
})

const neededQuantityForCraftingHigherTier = computed(() => {
    return Math.max(neededQuantityIncludingCraft.value - neededRawQuantity.value, 0)
})

const isReachGoal = computed(() => {
    return (warehouseMaterial.value?.Quantity || 0) >= neededQuantityIncludingCraft.value;
});

const formula = computed(() => {
    return useDataStore().formulas.find((matl) => matl.Name === props.material.Material)
})

// Must listen to parent component's prop changes, or the quantity won't update instantly
watch(() => props.material, (newValue) => {
    quantity.value = newValue.Quantity
})

// Because props.material.Quantit is calculated by the LP solver and keeps static during warehouse changes
// when user crafting, we may need to consider shifts in the warehouse during this case for wording
const originalWarehouseQuantity = ref(warehouseMaterial.value ? warehouseMaterial.value?.Quantity : 0);
const warehouseQuantityShift = ref(0);

watch(warehouseMaterial, (newMatl) => {
    if (useGlobalStore().isEditingMaterial === props.material.Material) {
        const newQuantity = newMatl ? newMatl.Quantity : 0
        warehouseQuantityShift.value = newQuantity - originalWarehouseQuantity.value
    }
})

const openPopover = () => {
    originalWarehouseQuantity.value = warehouseMaterial.value ? warehouseMaterial.value?.Quantity : 0;
    warehouseQuantityShift.value = 0;
    // reset the shift
    useGlobalStore().setIsEditingWarehouse(true)
    useGlobalStore().setIsEditingMaterial(props.material.Material)
}

const closePopover = () => {
    useGlobalStore().setIsEditingWarehouse(false)
    useGlobalStore().setIsEditingMaterial()
    // reset the shift
    originalWarehouseQuantity.value = warehouseMaterial.value ? warehouseMaterial.value?.Quantity : 0;
    warehouseQuantityShift.value = 0;
}

const isLowerBuildMaterial = computed(() => materialItem.value?.Category === 'Build Material' && materialItem.value?.Rarity < 6)

</script>

<template>
    <Popper arrow placement="top" offsetDistance="2" @open:popper="openPopover"
        @close:popper="closePopover">
        <div class="cursor-pointer" :class="isReachGoal ? 'opacity-40': ''">
            <div class="relative inline-block">
                <img :src="normalizedMaterial.borderImagePath" alt="Border Image" class="w-20 h-20 absolute" />
                <img :src="normalizedMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
                <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs cursor-default">
                    {{ normalizedMaterial.quantity }}
                </div>
            </div>
        </div>
        <template #content>
            <div class="flex items-center justify-center flex-col">
                <p v-if="props.layerId === 1 || props.layerId === 2" class="text-center text-slate-300 text-sm opacity-80">
                    <!-- just a sum of the current values of a given mat in the LP result -->
                    <i18n-t keypath="numbers-expected-to-drop">
                        <template #numbers>
                            <span class="text-white">{{ props.material.Quantity }}</span>
                        </template>
                    </i18n-t>
                </p>
                <p v-if="props.layerId === 3" class="text-center text-slate-300 text-sm opacity-80">
                    <!-- only consider warehouseQuantityShift for crafting -->
                    <i18n-t keypath="numbers-expected-to-be-crafted">
                        <template #numbers>
                            <span class="text-white">{{ Math.max(props.material.Quantity - warehouseQuantityShift, 0)}}</span>
                        </template>
                    </i18n-t>
                </p>

                <p class="text-center text-slate-300 text-sm opacity-80">
                    <i18n-t keypath="numbers-needed-to-complete-the-goal">
                        <template #numbers>
                            <span class="text-white">{{ neededQuantityIncludingCraft }}</span>
                        </template>
                    </i18n-t>
                </p>

                <p v-if="(isLowerBuildMaterial || props.material.Material === 'Sharpodonty') && neededQuantityForCraftingHigherTier > 0" class="text-center text-slate-300 text-sm opacity-80">
                    <i18n-t keypath="with-numbers-used-in-crafting">
                        <template #numbers>
                            <span class="text-white">{{ neededQuantityForCraftingHigherTier }}</span>
                        </template>
                    </i18n-t>
                </p>
                <!-- <div v-if="!isReachGoal" class="badge badge-lg mt-2 mb-2 red-badge text-center">Insufficient Materials in Warehouse
                </div>
                <div v-if="isReachGoal" class="badge badge-lg mt-2 mb-2 green-badge text-center">Sufficient Materials in Warehouse</div> -->
                <div class="flex pt-2 justify-center items-center">
                    <WarehouseItemEditor :material="material" :normalizedMaterial="normalizedMaterial" />
                    <MaterialCraftingRecipe v-if="!!formula?.Material.length" :material="material"
                        :normalizedMaterial="normalizedMaterial" :formula="(formula as Object)" />
                </div>
            </div>
        </template>
    </Popper>
</template>

<style scoped>
/* @see: https://valgeirb.github.io/vue3-popper/guide/getting-started.html#css-variables */
</style>
