<script setup lang="ts" name="ArcanistCalculate">
import { computed } from 'vue';
import { useCalculation } from '../../composables/CalculateMaterials';
import ItemList from '../item/ItemList.vue'

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const calculateArcanist = computed(() => {
    const arc = props.arcanist;
    const result = useCalculation(arc);
    // console.log(result);
    return result;
});

</script>

<template>
    <div>
        <ItemList class="max-h-48" :materialList="calculateArcanist" />
    </div>
</template>

<style scoped></style>
