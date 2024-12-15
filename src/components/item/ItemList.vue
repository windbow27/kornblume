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
    <div class="h-64 overflow-y-auto overflow-x-hidden">
        <div class="mt-2 flex flex-wrap justify-center">
            <MaterialIcon v-for="material in props.materialList" :key="material.Material" :material="material" />
        </div>
    </div>
</template>

<style scoped></style>
