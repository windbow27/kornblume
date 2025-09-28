<script setup lang="ts">
import { computed, PropType, ref } from 'vue';
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

const isScrolledToBottom = ref(false);

const handleScroll = (event: UIEvent) => {
    const target = event.target as HTMLElement;
    // Tolerance matches bottom padding
    isScrolledToBottom.value = target.scrollHeight - target.scrollTop <= target.clientHeight + 80;
};
</script>

<template>
    <div :class="heightClass" class="relative flex-grow flex flex-col min-h-0">
        <div class="flex-grow overflow-y-auto overflow-x-hidden pb-20" @scroll="handleScroll">
            <div class="mt-2 flex flex-wrap justify-center">
                <MaterialIcon
                    v-for="material in props.materialList"
                    :key="material.Material"
                    :material="material" />
            </div>
        </div>
        <div
            class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-950 to-transparent pointer-events-none transition-opacity duration-300"
            :class="{ 'opacity-0': isScrolledToBottom }"
            style="mask-image: radial-gradient(ellipse 100% 50% at 50% 100%, #000, transparent)"></div>
    </div>
</template>

<style scoped></style>
