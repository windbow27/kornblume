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
    <div class="hidden-scrollbar pt-9 flex flex-wrap justify-center overflow-y-scroll overflow-x-hidden">
        <ItemIcon v-for="material in props.materialList" :key="material" :material="material" />
    </div>
</template>

<style scoped></style>
