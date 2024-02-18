<script setup lang="ts">
import { computed } from 'vue';
import { getItemImagePathByMatl } from '@/composables/images';
import { useDataStore } from '@/stores/dataStore';
import MaterialFormulaIcon from './MaterialFormulaIcon.vue';
import ArcanistIcon from '../../arcanist/ArcanistIcon.vue';

const props = defineProps({
    selectedMaterial: {
        type: Object,
        required: true
    },
    categories: {
        type: Array,
        required: true
    }
});

const formulaStore = useDataStore().formulas;
const arcanistStore = useDataStore().arcanists;

const formulaItemList = computed(() => {
    const formula = formulaStore.find(formula => formula.Name === props.selectedMaterial.Name);
    if (formula) {
        return formula.Material.map((material, index) => {
            return {
                Material: material,
                Quantity: formula.Quantity[index]
            };
        });
    }
    return [];
});

const arcanistIconList = computed(() => {
    if (props.selectedMaterial.Name === 'Dust') return arcanistStore;
    const arcanists = arcanistStore.filter(arcanist => {
        return arcanist.Insight.some(insight => insight.Material.includes(props.selectedMaterial.Name)) ||
               arcanist.Resonance.some(resonance => resonance.Material.includes(props.selectedMaterial.Name));
    });
    return arcanists;
});

</script>

<template>
    <div class="custom-box custom-border">
        <div v-if="props.selectedMaterial" class="space-y-1">
            <h2 class="text-white text-2xl font-bold py-1">{{ props.selectedMaterial.Name }}</h2>
            <p class="" :class="{
                'text-error': props.selectedMaterial.Category === categories[0],
                'text-info': props.selectedMaterial.Category === categories[1],
                'text-success': props.selectedMaterial.Category === categories[2],
                'text-warning': props.selectedMaterial.Category === categories[3],
                'text-secondary': props.selectedMaterial.Category === categories[4]
            }"> {{ props.selectedMaterial.Category }} </p>
            <p class="" :class="{
                'text-orange-300': props.selectedMaterial.Rarity === 6,
                'text-yellow-100': props.selectedMaterial.Rarity === 5,
                'text-purple-400': props.selectedMaterial.Rarity === 4,
                'text-sky-200': props.selectedMaterial.Rarity === 3,
                'text-green-200': props.selectedMaterial.Rarity === 2
            }"> {{ props.selectedMaterial.Rarity }} <i class="fa-solid fa-star"></i> </p>
            <div class="flex flex-col justify-center items-center">
                <img :src="getItemImagePathByMatl(props.selectedMaterial.Name)" alt="Material Image" class="w-32 h-32" />
                <p class="text-white text-center"> {{ props.selectedMaterial.Description }} </p>
            </div>
        </div>
    </div>

    <!-- Crafting -->
    <div v-if="props.selectedMaterial.Category === categories[1]" class="custom-box custom-border">
        <h2 class="text-white">Wishing Spring Formula</h2>
        <div class="flex flex-wrap gap-x-2 gap-y-1 items-center justify-center">
            <div v-for="material in formulaItemList" :key="material.Material" class="flex flex-wrap gap-x-2 gap-y-2">
                <MaterialFormulaIcon :material="material" />
            </div>
        </div>
    </div>

    <!-- Used by -->
    <div v-if="arcanistIconList.length > 0" class="custom-box custom-border">
        <h2 class="text-white">Used by the following arcanists</h2>
        <div class="flex flex-wrap gap-x-2 gap-y-1 p-2 items-center justify-center">
            <div v-for="arcanist in arcanistIconList" :key="arcanist.Id" class="flex flex-wrap">
                <ArcanistIcon :arcanist="arcanist" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
