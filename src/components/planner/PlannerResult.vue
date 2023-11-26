<script setup>
import { ref } from 'vue';
const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});
const arcanists = ref(props.selectedArcanists);

</script>

<template>
    <div>
        HEllo
    </div>
</template>

<style scoped>

</style>