<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '@/stores/dataStore';
import { IArcanist } from '@/types'
import { getArcanistI2ImagePath, getArcanistAfflatusPath, getArcanistDmgTypePath } from '@/composables/images';
import ArcanistIconDisplay from '@/components/arcanist/ArcanistIconDisplay.vue';
import Stats from '@/components/arcanist/info/Stats.vue';
import Upgrades from '@/components/arcanist/info/Upgrades.vue';
import Skills from '@/components/arcanist/info/Skills.vue';
import Builds from '@/components/arcanist/info/Builds.vue';

const route = useRoute();
const arcanistStore = useDataStore().arcanists;
const arcanist = ref<IArcanist>(arcanistStore[0]);
const buttons = ['Stats', 'Upgrades', 'Skills'];
const selectedButton = ref(buttons[0]);

onBeforeMount(() => {
    arcanist.value = arcanistStore.find(arc => arc.Id === Number(route.params.id)) || arcanistStore[0];
});

</script>

<template>
    <div class="sm:pt-4 sm:px-8 md:px-16 flex flex-wrap justify-center">
        <!--I2 Portrait-->
        <div class="w-full lg:w-[calc(45%)] relative p-4">
            <img class="w-full lg:h-[80vh] object-cover object-center text-2xl text-white font-bold"
                :src="getArcanistI2ImagePath(arcanist?.Id.toString() ?? '')" alt="Work in progress">
        </div>

        <!--Infomation-->
        <div class="flex flex-col lg:w-1/2 gap-y-4 max-w-xl 2xl:max-w-2xl p-4">
            <!--Name and Selectors-->
            <div class="p-4 rounded shadow custom-border w-full">
                <div class="flex flex-wrap items-center space-x-2">
                    <ArcanistIconDisplay :arcanist="arcanist" />
                    <h2 class="text-white text-xl lg:text-3xl font-bold"> {{ arcanist?.Name }} </h2>
                    <p class="pt-1" :class="{
                        'text-orange-300': arcanist?.Rarity === 6,
                        'text-yellow-100': arcanist?.Rarity === 5,
                        'text-purple-400': arcanist?.Rarity === 4,
                        'text-sky-200': arcanist?.Rarity === 3,
                        'text-green-200': arcanist?.Rarity === 2
                    }"> {{ arcanist?.Rarity }} <i class="fa-solid fa-star"></i> </p>
                    <img class="inline-block w-10" :src="getArcanistAfflatusPath(arcanist?.Afflatus ?? '')" alt="">
                    <img class="inline-block w-8 pb-2" :src="getArcanistDmgTypePath('1')" alt="">
                </div>
                <div class="flex flex-wrap gap-x-2 gap-y-2 pt-2">
                    <button v-for="(button, index) in buttons" :key="index" @click="selectedButton = button"
                        :class="['hover:bg-info rounded-md text-white py-1 px-3', selectedButton === button ? 'border-button' : '']"
                        :disabled="index !== 0">
                        {{ $t(button) }}
                    </button>
                </div>
            </div>
            <!--Info Cards-->
            <div class="p-4 rounded shadow custom-border w-full">
                <Stats :arcanist="arcanist ?? {}" v-if="selectedButton === 'Stats'" />
                <Upgrades :arcanist="arcanist ?? {}" v-if="selectedButton === 'Upgrades'" />
                <Skills :arcanist="arcanist ?? {}" v-else-if="selectedButton === 'Skills'" />
                <Builds :arcanist="arcanist ?? {}" v-else-if="selectedButton === 'Builds'" />
            </div>
        </div>
    </div>
</template>

<style scoped>
button:disabled {
    opacity: 0.25;
}
</style>
