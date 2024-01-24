<script setup lang="ts">

const props = defineProps({
    psychube: {
        type: Object,
        required: true
    }
});

const getArcanistPsychubePath = (id: number) => {
    return `images/psychubes/icons/${id}.png`;
};

</script>

<template>
    <div class="tooltip" :data-tip="psychube.Name">
        <img class="w-40" :src="getArcanistPsychubePath(props.psychube?.Id ?? 1)" alt="">
    </div>
</template>

<style scoped>
</style>
