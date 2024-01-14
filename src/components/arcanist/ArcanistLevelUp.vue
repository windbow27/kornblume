<script setup lang="ts" name="ArcanistCalculate">
import { computed } from 'vue';
import { useCalculation } from '../../composables/CalculateMaterials';
import ItemGoalIcon from '../item/ItemGoalIcon.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const materialRequirement = computed(() => {
    const arc = props.arcanist;
    return useCalculation(arc);
});

</script>

<template>
    <div class="mb-8 hidden-scrollbar custom-item-list">
        <ItemGoalIcon class="py-2" v-for="material in materialRequirement" :key="material" :material="material" />
    </div>
</template>

<style scoped></style>
