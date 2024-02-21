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

const getArcanistResonancePath = (id: number) => {
    return `images/arcanists/resonance/${props.arcanist.Id}/${id}.webp`;
};

</script>

<template>
    <div>
        <img class="w-40" :src="getArcanistResonancePath(props.number)" alt="">
        <p class="text-white text-center p-1"> {{ props.arcanist['Resonance' + props.number] }}</p>
    </div>
</template>

<style scoped></style>
