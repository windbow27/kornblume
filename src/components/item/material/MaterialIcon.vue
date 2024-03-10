<script setup lang="ts">
import { IMaterialUnit } from '@/types';
import { useRouter } from 'vue-router';
import { normalizeDisplayMaterial } from '@/composables/materials';
import { useGlobalStore } from '@/stores/global';

const props = defineProps({
    material: {
        type: Object as () => IMaterialUnit,
        required: true
    }
});

const globalStore = useGlobalStore();
const router = useRouter();

const getNormalizedMaterial = () => {
    return normalizeDisplayMaterial(props.material);
};

const selectMaterial = () => {
    globalStore.setSelectedMaterial(props.material);
    router.push('/items')
};

</script>

<template>
    <div @click="selectMaterial" class="cursor-pointer">
        <div class="tooltip" :data-tip="$t(getNormalizedMaterial().material)">
            <div class="avatar">
                <div class="relative inline-block">
                    <img v-if="getNormalizedMaterial().borderImagePath" :src="getNormalizedMaterial().borderImagePath"
                        alt="Border Image" class=" w-20 h-20 absolute" />
                    <img v-if="getNormalizedMaterial().itemImagePath" :src="getNormalizedMaterial().itemImagePath"
                        alt="Material Image" class="w-20 h-20" />
                    <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
                        {{ getNormalizedMaterial().quantity }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
