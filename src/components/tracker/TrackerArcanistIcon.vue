<!-- eslint-disable no-unused-vars -->
<script setup>
// FIXME:
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    },
    pity: {
        type: Number,
        required: true
    }
});
const getArcanistImagePath = (id) => {
    return `images/arcanists/icon/${id}.png`;
};
</script>

<template>
    <div class="tooltip" :data-tip="$t(arcanist.Name)">
        <div class="rounded-md">
            <div class="avatar relative flex items-center justify-center">
                <div class="w-16 rounded">
                    <img :src="getArcanistImagePath(arcanist.Id)" :alt="arcanist.Name" />
                </div>
                <div class="absolute text-white font-bold w-8 h-6 -right-2 -bottom-2 rounded-md text-sm opacity-90" :class="{
                    'bg-success': pity < 40,
                    'bg-warning': pity >= 40 && pity < 60,
                    'bg-error': pity >= 60
                }">
                    <div class="flex items-center justify-center h-full">
                        {{ pity }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
