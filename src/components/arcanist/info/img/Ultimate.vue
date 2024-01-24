<script setup lang="ts">
const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    },
    number: {
        type: Number,
        required: true
    }
});

const getArcanistUltPath = (id: string, ult: number) => {
    return `images/arcanists/skill/${id}/${ult}.png`;
};
</script>

<template>
    <div class="flex">
        <div class="relative w-1/5 flex items-end">
            <img class="w-full" src="/images/arcanists/misc/bg-ult.png" alt="">
            <img class="ult" :src="getArcanistUltPath(props.arcanist.Id, 3)" alt="">
        </div>
        <div class="w-4/5 flex flex-wrap items-center">
            <p class="skill-text">
                1-target attack. Deals 550% Reality DMG and inflicts [Seal] for 3 rounds.
                If the target is immune to [Seal], Moxie -2 to the target instead.
            </p>
        </div>
    </div>
</template>

<style scoped>
.ult {
    @apply w-[calc(80%)] absolute bottom-[5%] left-[9%] rounded-t-full;
}
.skill-text {
    @apply pl-4 text-white text-xs sm:text-sm xl:text-base;
}
</style>
