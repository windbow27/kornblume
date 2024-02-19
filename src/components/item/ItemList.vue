<script setup lang="ts">
import { IMaterialUnit } from '@/types';
import MaterialIcon from '@/components/item/material/MaterialIcon.vue';

const props = defineProps({
    materialList: {
        type: Array as () => IMaterialUnit[],
        required: true
    }
});

</script>

<template>
    <div class="hidden-scrollbar pt-9 flex flex-wrap justify-center overflow-y-auto overflow-x-hidden">
        <MaterialIcon v-for="material in props.materialList" :key="material.Material" :material="material" />
    </div>
</template>

<style scoped></style>
