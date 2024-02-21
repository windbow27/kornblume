<script setup lang="ts">

const props = defineProps({
    effect: {
        type: String,
        required: true
    }
});

const getEffectParts = () => {
    const parts = props.effect.split(/(\[.*?\]|[\d]+%|\+[\d]+%|-[\d]+%|\d+\/\d+\/\d+%?)/);
    // console.log(parts.filter(part => part));
    return parts.filter(part => part);
};

</script>

<template>
    <div class="skill-text">
        <span class="" v-for="(part, index) in getEffectParts()" :key="index"
            :class="{ 'text-blue-400/90': part.startsWith('['), 'text-orange-300': /^(\+|-)\d+|%|\d+\/\d+\/\d+%?/.test(part) }">
            {{ part }}
        </span>
    </div>
</template>

<style scoped>
.skill-text {
    @apply text-white text-xs sm:text-sm xl:text-base;
}
</style>
