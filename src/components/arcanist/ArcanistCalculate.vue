<script setup>
import { computed } from 'vue';
import ItemList from '../item/ItemList.vue'
import { useCalculation } from '../../composables/calculation';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const calculateArcanist = computed(() => {
    const arc = props.arcanist;
    const result = useCalculation(arc);
    //console.log(result);
    return result;
});

</script>

<template>
    <div>
        <ItemList :materialList="calculateArcanist" />
    </div>
</template>

<style scoped></style>