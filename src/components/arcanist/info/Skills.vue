<script setup lang="ts">
import { ref, computed } from 'vue';
import Skill from '@/components/arcanist/img/Skill.vue';
import Ultimate from '@/components/arcanist/img/Ultimate.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const selected = ref('1');
const selectedAsNumber = computed(() => Number(selected.value));

</script>

<template>
    <div class="px-2">
        <h2 class=" text-white text-2xl font-bold">Skills</h2>

        <!--Slider-->
        <div class="px-8 lg:px-16 py-2">
            <div class="w-full text-white flex justify-between text-xs 3xl:text-base">
                <span>✦✧✧</span>
                <span>✦✦✧</span>
                <span>✦✦✦</span>
            </div>
            <input id="level" type="range" min="1" max="3" class="range-slider" step="1" v-model="selected">
        </div>

        <!--Skills-->
        <div class="flex flex-col gap-y-5 p-2">
            <!--Skill 1-->
            <Skill :arcanist="props.arcanist" :id="1" :star="selectedAsNumber"/>
            <!--Skill 2-->
            <Skill :arcanist="props.arcanist" :id="2" :star="selectedAsNumber"/>
            <!--Ultimate-->
            <Ultimate :arcanist="props.arcanist" :number="3" />
        </div>
    </div>
</template>

<style scoped></style>
