<script setup lang="ts">
import Text from '@/components/arcanist/img/Text.vue';

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
    return `images/arcanists/skill/${id}/${ult}.webp`;
};

</script>

<template>
    <div class="flex">
        <div class="relative w-1/5 flex items-end">
            <img class="w-full" src="/images/arcanists/misc/bg-ult.webp" alt="">
            <img class="ult" :src="getArcanistUltPath(props.arcanist.Id, 3)" alt="">
        </div>
        <div class="w-4/5 flex flex-col pl-4 justify-center">
            <p class="text-blue-400/90 font-bold"> {{ props.arcanist.Ultimate.Name }}</p>
            <Text :effect="props.arcanist.Ultimate.Effect" />
        </div>
    </div>
</template>

<style scoped>
.ult {
    @apply w-[calc(80%)] absolute bottom-[5%] left-[9%] rounded-t-full;
}
</style>
