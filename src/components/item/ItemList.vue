<script setup>
import ItemIcon from '../item/ItemIcon.vue';

const props = defineProps({
    materialList: {
        type: Array,
        required: true
    }
});

</script>

<template>
    <div class="flex flex-wrap gap-0 justify-center">
        <ItemIcon v-for="material in props.materialList" :key="material" :material="material" />
    </div>
</template>

<style scoped>
/* You can include any additional scoped styles here if needed */
</style>
