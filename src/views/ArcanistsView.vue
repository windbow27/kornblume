<script setup lang="ts">
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IArcanist } from '@/types'
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/stores/dataStore'
import { usePullsRecordStore, IPull } from '@/stores/pullsRecordStore'
import { sortArcanists } from '@/composables/arcanists';
import ArcanistPortrait from '@/components/arcanist/ArcanistPortrait.vue';

const { locale, t } = useI18n()
const arcanistStore = useDataStore().arcanists;
const listArcanists = ref<IArcanist[]>([]);
const searchQuery = ref('');
const pulls = ref<IPull[]>([]);
const activeRarities = ref<number[]>([]);
const activeAfflatus = ref<string[]>([]);

const selectedRarities = (rarity: number) => {
    if (activeRarities.value.includes(rarity)) {
        activeRarities.value = activeRarities.value.filter(r => r !== rarity);
    } else {
        activeRarities.value.push(rarity);
    }
}

const selectedAfflatus = (afflatus: string) => {
    if (activeAfflatus.value.includes(afflatus)) {
        activeAfflatus.value = activeAfflatus.value.filter(a => a !== afflatus);
    } else {
        activeAfflatus.value.push(afflatus);
    }
}

const portraitCounts = computed(() => {
    return listArcanists.value.map(arc => ({
        ArcanistName: arc.Name,
        count: pulls.value.filter(pull => pull.ArcanistName === arc.Name).length - 1
    }));
});

const filteredArcanists = computed(() => {
    // Filter arcanists based on the searchQuery and the selected rarities
    let filtered = listArcanists.value;

    if (locale.value === 'en-US') {
        filtered = filtered.filter(arc => arc.Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    } else {
        filtered = filtered.filter(arc => t(arc.Name).includes(searchQuery.value));
    }

    if (activeRarities.value.length > 0) {
        filtered = filtered.filter(arc => activeRarities.value.includes(arc.Rarity));
    }

    if (activeAfflatus.value.length > 0) {
        filtered = filtered.filter(arc => activeAfflatus.value.includes(arc.Afflatus));
    }

    return filtered;
});

onMounted(() => {
    if (usePullsRecordStore().data.length > 0) {
        pulls.value = [...usePullsRecordStore().data]
    }
})

watchEffect(() => {
    listArcanists.value = arcanistStore.filter((arcanist: IArcanist) =>
        arcanist.IsReleased
    )

    sortArcanists(listArcanists.value)
})

</script>

<template>
    <div class="responsive-spacer ">
        <div class="flex pb-4">
            <h2 class="text-2xl text-white font-bold">{{ $t('arcanists') }}</h2>
        </div>
        <div class="flex flex-wrap p-4 gap-x-4 justify-center items-center">
            <input v-model="searchQuery" type="text" :placeholder="$t('search-arcanists')"
                class="input input-sm w-full lg:w-auto bg-gray-800 text-white p-2 rounded-md focus:outline-none">
            <!-- Rarity select -->
            <div class="flex justify-center space-x-2">
                <button v-for="i in [2, 3, 4, 5, 6]" :key="i"
                    :class="{ 'border-2 border-info': activeRarities.includes(i), 'border-2 border-transparent': !activeRarities.includes(i) }"
                    @click="selectedRarities(i)" class="p-2 rounded-md">
                    <i class="fa-solid fa-star" :class="{
                        'text-orange-300': i === 6,
                        'text-yellow-100': i === 5,
                        'text-purple-400': i === 4,
                        'text-sky-200': i === 3,
                        'text-green-200': i === 2
                    }"></i>
                </button>
            </div>
            <!-- Afflatus select -->
            <div class="flex justify-center space-x-2">
                <button v-for="afflatus in ['Beast', 'Mineral', 'Plant', 'Star', 'Intellect', 'Spirit']" :key="afflatus"
                    :class="{ 'border-2 border-info': activeAfflatus.includes(afflatus), 'border-2 border-transparent': !activeAfflatus.includes(afflatus) }"
                    @click="selectedAfflatus(afflatus)" class="p-2 rounded-md">
                    <img class="w-4" :src="`images/arcanists/misc/${afflatus.toLowerCase()}.webp`" alt="">
                </button>
            </div>
        </div>
        <div class="flex flex-wrap items-center justify-center">
            <router-link v-for="arcanist in filteredArcanists" :key="arcanist.Id" :to="`/${arcanist.Name}`">
                <ArcanistPortrait :arcanist="arcanist"
                    :count="portraitCounts.find(pc => pc.ArcanistName === arcanist.Name)?.count ?? -1" />
            </router-link>
        </div>
    </div>
</template>

<style scoped></style>
