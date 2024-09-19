<script setup lang="ts">
import { computed } from 'vue';
import { getItemImagePathByMatl } from '@/composables/images';
import { useDataStore } from '@/stores/dataStore';
import { formatQuantity } from '@/composables/materials';
import { formatArcanists } from '@/composables/arcanists';
import MaterialIcon from './MaterialIcon.vue';
import ArcanistIconDisplay from '@/components/arcanist/ArcanistIconDisplay.vue';
import StageIcon from '@/components/stage/StageIcon.vue';

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
const stageStore = useDataStore().stages1_9_greedy;

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
    if (props.selectedMaterial.Name === 'Dust') {
        const arcanists = formatArcanists(arcanistStore);
        return arcanists;
    }
    let arcanists = arcanistStore.filter(arcanist => {
        return arcanist.Insight.some(insight => insight.Material.includes(props.selectedMaterial.Name)) ||
            arcanist.Resonance.some(resonance => resonance.Material.includes(props.selectedMaterial.Name));
    });
    arcanists = formatArcanists(arcanists);
    return arcanists;
});

const stageList = computed(() => {
    // console.log('selectedMaterial:', props.selectedMaterial);

    const stages = Object.entries(stageStore)
        .filter(([, stage]) => {
            return props.selectedMaterial.Name in stage.drops;
        })
        .map(([name, stage]) => ({
            name,
            stage,
            dropRate: (stage.drops[props.selectedMaterial.Name] / stage.count) as number // kdoc data
            // dropRate: stage.drops[props.selectedMaterial.Name] as number // pending shiroi
        }))
        .sort((a, b) => b.dropRate - a.dropRate)
        .map(stage => ({
            ...stage,
            dropRate: formatQuantity(stage.dropRate)
        }));
    return stages;
});

</script>

<template>
    <div v-if="props.selectedMaterial" class="custom-box custom-border">
        <div class="space-y-1">
            <h2 class="text-white text-2xl font-bold py-1">{{ $t(props.selectedMaterial.Name) }}</h2>
            <p class="" :class="{
                'text-error': props.selectedMaterial.Category === categories[0],
                'text-info': props.selectedMaterial.Category === categories[1],
                'text-success': props.selectedMaterial.Category === categories[2],
                'text-warning': props.selectedMaterial.Category === categories[3],
                'text-secondary': props.selectedMaterial.Category === categories[4]
            }"> {{ $t(props.selectedMaterial.Category) }} </p>
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
    <div v-if="formulaItemList.length > 0" class="custom-box custom-border space-y-2.5">
        <h2 class="text-white">{{ $t('wishing-spring-formula') }}</h2>
        <div class="flex flex-wrap gap-x-2 gap-y-1 items-center justify-center">
            <div v-for="material in formulaItemList" :key="material.Material" class="flex flex-wrap gap-x-2 gap-y-2">
                <MaterialIcon :material="material" />
            </div>
        </div>
    </div>

    <!-- Drop Stages-->
    <div v-if="stageList.length > 0" class="custom-box custom-border space-y-2.5">
        <h2 class="text-white">{{ $t('obtained-from-the-following-stages') }}</h2>
        <div class="custom-item-list max-h-[calc(33vh)]">
            <StageIcon v-for="stage in stageList" :key="stage.name" :selectedStage="stage.stage" :stageName="stage.name"
                :dropRate="stage.dropRate" class="px-2 py-1" />
        </div>
    </div>

    <!-- Used by -->
    <div v-if="arcanistIconList.length > 0" class="custom-box custom-border space-y-2.5">
        <h2 class="text-white">{{ $t('used-by-the-following-arcanists') }}</h2>
        <div class="custom-item-list gap-x-2 gap-y-1 max-h-[calc(33vh)]">
            <ArcanistIconDisplay v-for="arcanist in arcanistIconList" :key="arcanist.Name" :arcanist="arcanist" />
        </div>
    </div>
</template>

<style scoped></style>
