<script setup lang="ts">
import Text from '@/components/arcanist/img/Text.vue';

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
    return `images/arcanists/skill/${id}/${skill}.webp`;
};

</script>

<template>
    <div class="flex">
        <div class="relative w-1/5 flex items-end">
            <img class="w-full" src="/images/arcanists/misc/bg-skill.webp" alt="">
            <img class="skill" :src="getArcanistSkillPath(props.arcanist.Id, id)" alt="">
            <img class="attribute" src="/images/arcanists/misc/card-attribute.webp" alt="">
            <img class="attribute" src="/images/arcanists/misc/card-attack.webp" alt="">
        </div>
        <div class="w-4/5 flex flex-col pl-4 justify-center">
            <p class="text-blue-400/90 font-bold"> {{ props.arcanist.Skills[3 * (props.id - 1) + props.star - 1].Name }}</p>
            <Text :effect="props.arcanist.Skills[3 * (props.id - 1) + props.star - 1].Effect"/>
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
</style>
