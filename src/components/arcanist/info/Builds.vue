<script setup lang="ts">
import { useDataStore } from '@/stores/dataStore';
import Psychube from '@/components/arcanist/info/img/Psychube.vue';
import Resonance from '@/components/arcanist/info/img/Resonance.vue';

const psychubes = useDataStore().psychubes;

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const psychube1 = psychubes.find((p) => p.Name === props.arcanist.Psychube1);
const psychube2 = psychubes.find((p) => p.Name === props.arcanist.Psychube2);

</script>

<template>
    <div class="px-2">
        <h2 class=" text-white text-2xl font-bold">Builds</h2>
        <p class=" text-white px-2 pt-2">Recommended Psychubes</p>
        <div class="grid grid-cols-2">
            <div class="flex justify-center items-center">
                <Psychube :psychube="psychube1 ?? {}" />
            </div>
            <div class="flex justify-center items-center">
                <Psychube :psychube="psychube2 ?? {}" />
            </div>
        </div>
        <p class=" text-white px-2 pt-2">Recommended Resonance 10 builds</p>
        <div class="grid grid-cols-2 gap-x-8 p-5">
            <div class="flex justify-center items-center">
                <Resonance :arcanist="arcanist ?? {}" :number="1" />
            </div>
            <div class="flex justify-center items-center">
                <Resonance :arcanist="arcanist ?? {}" :number="2" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
