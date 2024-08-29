<script setup lang="ts">
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

const selected = ref(props.arcanist.Rarity >= 5 ? 4 : 3);

const nodesHighRarity = ref([
    { insight: 0, level: 1 },
    { insight: 0, level: 30 },
    { insight: 1, level: 40 },
    { insight: 2, level: 50 },
    { insight: 3, level: 60 }
]);

const nodesLowRarity = ref([
    { insight: 0, level: 1 },
    { insight: 0, level: 30 },
    { insight: 1, level: 40 },
    { insight: 2, level: 50 }
]);

const editingArcanist = computed(() => ({
    Id: props.arcanist.Id,
    isVisible: true,
    currentInsight: 0,
    currentLevel: 1,
    goalInsight: (props.arcanist.Rarity >= 5 ? nodesHighRarity : nodesLowRarity).value[selected.value].insight,
    goalLevel: (props.arcanist.Rarity >= 5 ? nodesHighRarity : nodesLowRarity).value[selected.value].level,
    currentResonance: 0,
    goalResonance: 0,
    frequency: []
}))

</script>

<template>
    <div class="px-2">
        <h2 class=" text-white text-2xl font-bold">{{ $t('Stats') }}</h2>
        <div class="px-8 lg:px-16 py-2">
            <div class="w-full text-white flex justify-between text-xs 3xl:text-base">
                <span class="pl-1"><i class="fa-solid fa-o"></i></span>
                <span class="w-7 pl-3"><i class="fa-solid fa-o"></i></span>
                <span><img class="w-5" src="/images/items/common/insight1.webp"></span>
                <span><img class="w-5" src="/images/items/common/insight2.webp"></span>
                <span v-if="props.arcanist.Rarity >= 5"><img class="w-5" src="/images/items/common/insight3.webp"></span>
            </div>
            <input id="level" type="range" min="0" :max="props.arcanist.Rarity >= 5 ? 4 : 3" class="range-slider" step="1"
                v-model="selected">
            <div class="w-full text-white flex justify-between text-xs 3xl:text-base">
                <span>&nbsp;Lv. 1&nbsp;</span>
                <span>Lv. 30</span>
                <span>Lv. 40</span>
                <span>Lv. 50</span>
                <span v-if="props.arcanist.Rarity >= 5">Lv. 60</span>
            </div>
        </div>
        <div class="pt-2.5">
            <table class="table table-xs">
                <tr v-for="(attribute, index) in attributes" :key="index">
                    <td class="text-white text-center">{{ attribute }}</td>
                    <td class="text-white"> {{ props.arcanist.Stats[editingArcanist.goalInsight + "-" + editingArcanist.goalLevel][index] + (index >=5 ? "%" : "") }} </td>
                </tr>
            </table>
        </div>
        <ArcanistCalculate :arcanist="editingArcanist" />
    </div>
</template>

<style scoped></style>
