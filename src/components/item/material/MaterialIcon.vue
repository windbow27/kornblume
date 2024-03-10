<script setup lang="ts">
import { IMaterialUnit } from '@/types';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/stores/global';
import ItemIcon from '@/components/item/ItemIcon.vue';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const globalStore = useGlobalStore();
const router = useRouter();

const selectMaterial = () => {
    globalStore.setSelectedMaterial(props.material);
    router.push('/items')
};

</script>

<template>
    <div @click="selectMaterial" class="cursor-pointer">
        <ItemIcon :material="props.material" />
    </div>
</template>

<style scoped></style>
