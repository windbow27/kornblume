<script setup lang="ts" name="ArcanistCalculate">
import { computed } from 'vue';
import { useCalculation } from '@/composables/calculations';
import { ISelectedArcanist } from '@/types';
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
