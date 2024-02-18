<script setup lang="ts" name="ArcanistIcon">

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const getArcanistImagePath = (id: string) => {
    return `images/arcanists/icon/${id}.png`;
};

</script>

<template>
    <div class="tooltip" :data-tip="$t(props.arcanist.Name)">
        <router-link :to="`/${arcanist.Name}`">
            <div class="rounded-md overflow-hidden">
                <div class="avatar">
                    <div class="w-10 rounded" :class="{
                        'bg-orange-300': props.arcanist.Rarity === 6,
                        'bg-yellow-100': props.arcanist.Rarity === 5,
                        'bg-purple-400': props.arcanist.Rarity === 4,
                        'bg-sky-200': props.arcanist.Rarity === 3,
                        'bg-green-200': props.arcanist.Rarity === 2
                    }">
                        <img :src="getArcanistImagePath(props.arcanist.Id)" :alt="props.arcanist.Name" />
                    </div>
                </div>
            </div>
        </router-link>
    </div>
</template>

<style scoped></style>
