<script setup lang="ts">
import { computed, PropType } from 'vue';
import { IMaterialUnit } from '@/types';
import MaterialIcon from '@/components/item/material/MaterialIcon.vue';

type LayoutType = 'fill' | 'fixed';

const props = defineProps({
    materialList: {
        type: Array as () => IMaterialUnit[],
        required: true
    },
    layout: {
        type: String as PropType<LayoutType>,
        default: 'fixed',
        validator: (value: LayoutType) => ['fill', 'fixed'].includes(value)
    }
});

const heightClass = computed(() => {
  if (props.layout === 'fill') return 'h-full';
  if (props.layout === 'fixed') return 'h-64';
  return '';
});
</script>

<template>
    <div :class="heightClass" class="overflow-y-auto overflow-x-hidden pb-20">
        <div class="mt-2 flex flex-wrap justify-center">
            <MaterialIcon
                v-for="material in props.materialList"
                :key="material.Material"
                :material="material" />
        </div>
    </div>
</template>

<style scoped></style>
