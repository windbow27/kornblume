<script setup>
import { ref, computed } from 'vue';
import ArcanistCalculate from '@/components/arcanist/ArcanistCalculate.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

const attributes = ref([
    'Attack',
    'Health',
    'Reality DEF',
    'Mental DEF',
    'Technique',
    'Crit. Rate',
    'Crit. DMG'
]);

const selected = ref(0);

const nodes = ref([
    { insight: 0, level: 1 },
    { insight: 0, level: 30 },
    { insight: 1, level: 40 },
    { insight: 2, level: 50 },
    { insight: 3, level: 60 }
]);

const editingArcanist = computed(() => ({
    Id: props.arcanist.Id,
    isVisible: true,
    currentInsight: 0,
    currentLevel: 1,
    goalInsight: nodes.value[selected.value].insight,
    goalLevel: nodes.value[selected.value].level,
    currentResonance: 0,
    goalResonance: 0
}))

</script>

<template>
    <div class="px-2">
        <h2 class=" text-white text-2xl font-bold">Stats</h2>
        <div class="px-8 py-2">
            <div class="w-full text-white flex justify-between text-xs 3xl:text-base">
                <span class="pl-1"><i class="fa-solid fa-o"></i></span>
                <span class="w-7 pl-3"><i class="fa-solid fa-o"></i></span>
                <span><img class="w-5" src="/images/items/common/insight1.png"></span>
                <span><img class="w-5" src="/images/items/common/insight2.png"></span>
                <span><img class="w-5" src="/images/items/common/insight3.png"></span>
            </div>
            <input id="level" type="range" min="0" max="4" class="range-slider" step="1" v-model="selected">
            <div class="w-full text-white flex justify-between text-xs 3xl:text-base">
                <span>&nbsp;Lv 1&nbsp;</span>
                <span>Lv 30</span>
                <span>Lv 40</span>
                <span>Lv 50</span>
                <span>Lv 60</span>
            </div>
        </div>
        <div class="pt-2.5">
            <table class="table table-xs">
                <tr v-for="(attribute, index) in attributes" :key="index">
                    <td class="text-white text-center">{{ attribute }}</td>
                    <td class="text-white"> 69 </td>
                </tr>
            </table>
        </div>
        <ArcanistCalculate :arcanist="editingArcanist"/>
    </div>
</template>

<style scoped></style>
