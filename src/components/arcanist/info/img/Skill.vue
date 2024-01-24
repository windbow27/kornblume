<script setup lang="ts">
const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    },
    id: {
        type: Number,
        required: true
    },
    star: {
        type: Number,
        required: true
    }
});

const getArcanistSkillPath = (id: string, skill: number) => {
    return `images/arcanists/skill/${id}/${skill}.png`;
};

const getSkillEffect = () => {
    return props.arcanist.Skills[3 * (props.id - 1) + props.star - 1].Effect;
};
</script>

<template>
    <div class="flex">
        <div class="relative w-1/5 flex items-end">
            <img class="w-full" src="/images/arcanists/misc/bg-skill.png" alt="">
            <img class="skill" :src="getArcanistSkillPath(props.arcanist.Id, id)" alt="">
            <img class="attribute" src="/images/arcanists/misc/card-attribute.png" alt="">
            <img class="attribute" src="/images/arcanists/misc/card-attack.png" alt="">
        </div>
        <div class="w-4/5 flex items-center">
            <p class="skill-text">
                {{ getSkillEffect() }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.skill {
    @apply w-[calc(97.5%)] bottom-[2.25%] left-[1%] absolute;
}
.attribute {
    @apply w-[calc(98.5%)] bottom-[1.5%] absolute;
}
.skill-text {
    @apply pl-4 text-white text-xs sm:text-sm xl:text-base;
}
</style>
