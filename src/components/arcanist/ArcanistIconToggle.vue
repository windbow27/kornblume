<script setup>
const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    },
    visible: {
        type: Boolean,
        required: true
    }
});
const getArcanistImagePath = (id) => {
    return `/images/arcanists/icon/${id}.png`;
};
</script>

<template>
    <div class="rounded-md overflow-hidden">
        <div class="avatar">
            <div class="w-12 rounded" :class="{
                'filter-grayscale opacity-50': !visible,
                'bg-orange-300': arcanist.Rarity === 6,
                'bg-yellow-100': arcanist.Rarity === 5,
                'bg-purple-400': arcanist.Rarity === 4,
                'bg-sky-200': arcanist.Rarity === 3,
                'bg-green-200': arcanist.Rarity === 2
            }">
                <img :src="getArcanistImagePath(arcanist.Id)" :alt="arcanist.Name" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.filter-grayscale {
    filter: grayscale(100%);
}
</style>
