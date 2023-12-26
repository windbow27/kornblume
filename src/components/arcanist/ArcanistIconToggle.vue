<script setup>
import { useDataStore } from '../../stores/dataStore';

const props = defineProps({
    arcanist: {
        type: Number,
        required: true
    },
    visible: {
        type: Boolean,
        required: true
    }
});

const arcInfo = useDataStore().arcanists.find(arc => arc.Id === props.arcanist);

const getArcanistImagePath = (id) => {
    return `images/arcanists/icon/${id}.png`;
};
</script>

<template>
    <div class="tooltip" :data-tip="$t(arcInfo.Name)">
        <div class="rounded-md overflow-hidden w-12 h-12">
            <div class="avatar">
                <div class="w-12 rounded" :class="{
                    'filter-grayscale opacity-50': !visible,
                    'bg-orange-300': arcInfo.Rarity === 6,
                    'bg-yellow-100': arcInfo.Rarity === 5,
                    'bg-purple-400': arcInfo.Rarity === 4,
                    'bg-sky-200': arcInfo.Rarity === 3,
                    'bg-green-200': arcInfo.Rarity === 2
                }">
                    <img :src="getArcanistImagePath(arcInfo.Id)" :alt="arcInfo.Name" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.filter-grayscale {
    filter: grayscale(100%);
}
</style>
