<script setup lang="ts" name="ArcanistIcon">

const props = defineProps({
    name: {
        type: String,
        required: true
    }
});

const getImagePath = (name: string) => {
    return `images/items/common/${name}.webp`;
};

</script>

<template>
    <div class="tooltip" :data-tip="$t(props.name)">
        <div class="rounded-md overflow-hidden">
            <div class="avatar">
                <div class="w-10 rounded bg-orange-300">
                    <img :src="getImagePath(props.name)" :alt="props.name" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
