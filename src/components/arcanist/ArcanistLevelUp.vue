<script setup lang="ts">
import { computed } from 'vue';
import { useCalculation } from '@/composables/calculations';
import { CrystalCasketMaterials } from '@/constants';
import { ISelectedArcanist } from '@/types';
import ItemGoalIcon from '@/components/item/ItemGoalIcon.vue';

const props = defineProps({
    arcanist: {
        type: Object as () => ISelectedArcanist,
        required: true
    }
});

const materialRequirement = computed(() => {
    const arc = props.arcanist;

    return useCalculation(arc).map((matl) => {
        if (CrystalCasketMaterials.includes(matl.Material)) {
            return { Material: 'Crystal Casket', Quantity: matl.Quantity }
        } else return matl
    });
});

</script>

<template>
    <div class="mb-8 hidden-scrollbar custom-item-list">
        <ItemGoalIcon class="py-2" v-for="material in materialRequirement" :key="material.Material" :material="material" />
    </div>
</template>

<style scoped></style>
