<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useDataStore } from '@/stores/dataStore';
import { IArcanist } from '@/types'
import ArcanistIcon from '@/components/arcanist/ArcanistIcon.vue';
import Stats from '@/components/arcanist/info/Stats.vue';
import Upgrades from '@/components/arcanist/info/Upgrades.vue';
import Skills from '@/components/arcanist/info/Skills.vue';
import Builds from '@/components/arcanist/info/Builds.vue';

const route = useRoute();
const arcanistStore = useDataStore().arcanists;
const arcanist = ref<IArcanist>();
const buttons = ['Stats', 'Upgrades', 'Skills'];
const selectedButton = ref(buttons[0]);

const getArcanistImagePath = (id: string) => {
    return `images/arcanists/i2/${id}.webp`;
};

const getArcanistAfflatusPath = (afflatus: string) => {
    afflatus = afflatus.toLowerCase();
    return `images/arcanists/misc/logo-${afflatus}.webp`;
};

const getArcanistDmgTypePath = (dmgType: string) => {
    return `images/arcanists/misc/dmg-type-${dmgType}.webp`;
};

onBeforeMount(() => {
    arcanist.value = arcanistStore.find(arc => arc.Name === route.params.name) ?? undefined;
});

</script>

<template>
    <div class="pt-4 sm:px-8 md:px-16 flex flex-wrap justify-center">
        <!--I2 Portrait-->
        <div class="w-full md:w-[calc(45%)] relative">
            <img class="h-[80vh] object-cover object-right" :src="getArcanistImagePath(arcanist?.Id.toString() ?? '')"
                alt="">
        </div>

        <!--Infomation-->
        <div class="flex flex-col md:w-1/2 p-4 gap-y-4 max-w-xl 2xl:max-w-2xl">
            <!--Name and Selectors-->
            <div class="p-4 rounded shadow custom-border w-full">
                <div class="flex flex-wrap items-center space-x-2">
                    <ArcanistIcon :arcanist="arcanist ?? {}" />
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
                        {{ button }}
                    </button>
                </div>
            </div>
            <!--Info Cards-->
            <div class="p-4 rounded shadow custom-border w-full">
                <Stats :arcanist="arcanist ?? {}" v-if="selectedButton === 'Stats'" />
                <Upgrades :arcanist="arcanist ?? {}" v-else-if="selectedButton === 'Upgrades'" />
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
