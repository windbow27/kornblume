<script setup lang="ts" name="TrackerArcanistIcon">

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    },
    pity: {
        type: Number,
        required: true
    },
    indicator: {
        type: String,
        required: false
    }
});

const getArcanistImagePath = (id: number) => {
    return `images/arcanists/icon/${id}.png`;
};

</script>

<template>
    <div class="tooltip" :data-tip="$t(props.arcanist.Name)">
        <div class="rounded-md">
            <div class="avatar relative flex items-center justify-center mb-4">
                <div class="w-16 rounded">
                    <img :src="getArcanistImagePath(props.arcanist.Id)" :alt="props.arcanist.Name" />
                </div>
                <div class="absolute text-white font-bold w-8 h-6 -right-2 -bottom-2 rounded-md text-sm opacity-95"
                    :class="{
                        'bg-badge-green/80': props.pity < 40,
                        'bg-badge-yellow/90': props.pity >= 40 && props.pity < 60,
                        'bg-badge-red/90': props.pity >= 60
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
