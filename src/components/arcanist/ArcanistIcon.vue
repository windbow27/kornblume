<!-- eslint-disable no-unused-vars -->
<script setup>
// FIXME
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});
const getArcanistImagePath = (id) => {
    return `images/arcanists/icon/${id}.png`;
};
</script>

<template>
    <div class="tooltip" :data-tip="arcanist.Name">
        <div class="rounded-md overflow-hidden">
            <div class="avatar">
                <div class="w-10 rounded" :class="{
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
    </div>
</template>

<style scoped></style>
