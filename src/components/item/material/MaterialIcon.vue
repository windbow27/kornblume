<script setup lang="ts">
import { IMaterialUnit } from '@/types';
import { useRouter } from 'vue-router';
import { INormalizedMaterial, formatQuantity } from '@/composables/materials';
import { useGlobalStore } from '@/stores/global';
import { getItemImageIconPathByMatl, getBorderImageIconPathByMatl } from '@/composables/images'

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

function normalizeDisplayMaterial (unprocessedMaterial: IMaterialUnit): INormalizedMaterial {
    const result = {
        material: unprocessedMaterial.Material,
        quantity: formatQuantity(unprocessedMaterial.Quantity),
        itemImagePath: getItemImageIconPathByMatl(unprocessedMaterial.Material),
        borderImagePath: getBorderImageIconPathByMatl(unprocessedMaterial.Material)
    };
    return result;
}

</script>

<template>
    <div @click="selectMaterial" class="cursor-pointer">
        <div class="tooltip" :data-tip="$t(getNormalizedMaterial().material)">
            <div class="relative inline-block">
                <img v-if="getNormalizedMaterial().borderImagePath" :src="getNormalizedMaterial().borderImagePath"
                    alt="Border Image" class=" w-20 h-20 absolute" />
                <img v-if="getNormalizedMaterial().itemImagePath" :src="getNormalizedMaterial().itemImagePath"
                    alt="Material Image" class="w-20 h-20 avatar" />
                <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
                    {{ getNormalizedMaterial().quantity }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
