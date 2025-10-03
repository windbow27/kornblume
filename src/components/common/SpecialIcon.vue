<script setup lang="ts" name="SpecialIcon">

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
    <div v-if="props.name" class="tooltip" :data-tip="$t(props.name)">
        <div class="rounded-md overflow-hidden">
            <div class="avatar flex">
                <div class="w-10 rounded bg-orange-300">
                    <img :src="getImagePath(props.name)" :alt="props.name" />
                </div>
            </div>
        </div>
    </div>
    <div v-else >
        <div class="rounded-md overflow-hidden">
            <div class="avatar placeholder">
                <div class="w-10 rounded bg-gray-600">
                    <i class="fa-solid fa-question text-white fa-2xl"></i>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
