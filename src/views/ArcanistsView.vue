<script setup lang="ts">
import { ref } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import ArcanistIcon from '@/components/arcanist/ArcanistIcon.vue';
import Stats from '@/components/arcanist/info/Stats.vue';
import Upgrades from '@/components/arcanist/info/Upgrades.vue';
import Skills from '@/components/arcanist/info/Skills.vue';
import Builds from '@/components/arcanist/info/Builds.vue';

const { arcanists } = useDataStore();

const arcanist = arcanists.find((a) => a.Name === 'Bkornblume');

const getArcanistImagePath = (id: string) => {
    return `images/arcanists/i2/${id}.png`;
};

const getArcanistAfflatusPath = (afflatus: string) => {
    afflatus = afflatus.toLowerCase();
    return `images/arcanists/misc/logo-${afflatus}.png`;
};

const getArcanistDmgTypePath = (dmgType: string) => {
    return `images/arcanists/misc/dmg-type-${dmgType}.png`;
};

const buttons = ['Stats', 'Upgrades', 'Skills', 'Builds'];
const selectedButton = ref(buttons[0]);

</script>

<template>
    <div class="flex flex-wrap">
        <!--I2 Portrait-->
        <div class="w-full md:w-1/2">
            <img class="pt-5" :src="getArcanistImagePath(arcanist?.Id.toString() ?? '')" alt="">
        </div>

        <!--Infomation-->
        <div class="flex flex-col md:w-1/2 p-4 gap-y-4 max-w-xl 2xl:max-w-2xl">
            <!--Name and Selectors-->
            <div class="p-4 rounded shadow custom-border w-full">
                <div class="flex flex-wrap items-center space-x-2">
                    <ArcanistIcon :arcanist="arcanist ?? {}" />
                    <h2 class="text text-xl lg:text-3xl font-bold"> {{ arcanist?.Name }} </h2>
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
                <div class="flex flex-wrap sm:gap-x-2 gap-y-2 pt-2">
                    <button v-for="(button, index) in buttons" :key="index" @click="selectedButton = button"
                        :class="['hover:bg-info rounded-md text py-1 px-3', selectedButton === button ? 'border-button' : '']">
                        {{ button }}
                    </button>
                </div>
            </div>
            <!--Info Cards-->
            <div class="p-4 rounded shadow custom-border w-full">
                <Stats :arcanist="arcanist" v-if="selectedButton === 'Stats'" />
                <Upgrades :arcanist="arcanist ?? {}" v-else-if="selectedButton === 'Upgrades'" />
                <Skills :arcanist="arcanist ?? {}" v-else-if="selectedButton === 'Skills'" />
                <Builds :arcanist="arcanist ?? {}" v-else-if="selectedButton === 'Builds'" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.text {
    @apply text-white
}
</style>
