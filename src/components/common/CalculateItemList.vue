<script setup lang="ts" name="CalculateItemList">
import { computed } from 'vue';
import { useCalculation } from '@/composables/calculations';
import { ISelectedArcanist, IMaterialUnit } from '@/types';
import ItemList from '@/components/item/ItemList.vue'

const props = defineProps({
    arcanist: {
        type: Object as () => ISelectedArcanist,
        required: true
    }
});

const calculateArcanist = computed(() => {
    const arc = props.arcanist;
    const result = useCalculation(arc);
    return result.filter((item: IMaterialUnit) => item.Quantity !== 0);
});

</script>

<template>
    <div>
        <ItemList :materialList="calculateArcanist" />
    </div>
</template>

<style scoped></style>
