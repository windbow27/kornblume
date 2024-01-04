<script setup lang="ts" name="TrackerSpecialIcon">

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    pity: {
        type: Number,
        required: true
    }
});

const getImagePath = (name: string) => {
    return `images/items/common/${name}.png`;
};

</script>

<template>
    <div class="tooltip" :data-tip="$t(props.name)">
        <div class="rounded-md">
            <div class="avatar relative flex items-center justify-center">
                <div class="w-16 rounded">
                    <img :src="getImagePath(props.name)" :alt="props.name" />
                </div>
                <div class="absolute text-white font-bold w-8 h-6 -right-2 -bottom-2 rounded-md text-sm opacity-90" :class="{
                    'bg-success': props.pity < 40,
                    'bg-warning': props.pity >= 40 && props.pity < 60,
                    'bg-error': props.pity >= 60
                }">
                    <div class="flex items-center justify-center h-full">
                        {{ props.pity }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
