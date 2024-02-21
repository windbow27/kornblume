<!--Reusing ArcanistIcon with router-link causes TypeError: Failed to fetch dynamically imported module.
    I don't know fucking why. -->
<script setup lang="ts">
import { getArcanistIconImagePath } from '@/composables/images';
import { IArcanist } from '@/types';

const props = defineProps({
    arcanist: {
        type: Object as () => IArcanist,
        required: true
    }
});

</script>

<template>
    <div class="tooltip" :data-tip="$t(props.arcanist.Name)">
        <div class="rounded-md overflow-hidden">
            <div class="avatar">
                <div class="w-10 rounded" :class="{
                    'bg-orange-300': props.arcanist.Rarity === 6,
                    'bg-yellow-100': props.arcanist.Rarity === 5,
                    'bg-purple-400': props.arcanist.Rarity === 4,
                    'bg-sky-200': props.arcanist.Rarity === 3,
                    'bg-green-200': props.arcanist.Rarity === 2
                }">
                    <img :src="getArcanistIconImagePath(props.arcanist.Id)" :alt="props.arcanist.Name" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
