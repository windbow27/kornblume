<script setup lang="ts">
import { ref, watchEffect, computed, onMounted } from 'vue';
import { IArcanist } from '@/types'
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/stores/dataStore'
import { usePullsRecordStore, IPull } from '@/stores/pullsRecordStore'
import ArcanistPortrait from '@/components/arcanist/ArcanistPortrait.vue';

const { locale, t } = useI18n()
const arcanistStore = useDataStore().arcanists;
const listArcanists = ref<IArcanist[]>([]);
const searchQuery = ref('');
const pulls = ref<IPull[]>([]);

const portraitCounts = computed(() => {
    return listArcanists.value.map(arc => ({
        ArcanistName: arc.Name,
        count: pulls.value.filter(pull => pull.ArcanistName === arc.Name).length - 1
    }));
});

const filteredArcanists = computed(() => {
    // Filter arcanists based on the searchQuery
    if (locale.value === 'en-US') {
        return listArcanists.value.filter(arc => arc.Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    } else {
        return listArcanists.value.filter(arc => t(arc.Name).includes(searchQuery.value));
    }
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

    listArcanists.value.sort((a: IArcanist, b: IArcanist) => {
        const rarityComparison = b.Rarity - a.Rarity

        if (rarityComparison !== 0) {
            return rarityComparison
        }

        // If rarity is the same, compare by name alphabetically
        return a.Name.localeCompare(b.Name)
    })
})

</script>

<template>
    <div class="responsive-spacer ">
        <div class="flex pb-4">
            <h2 class="text-2xl text-white font-bold">{{ $t('arcanists') }}</h2>
        </div>
        <div class="flex p-4 gap-x-4">
            <input v-model="searchQuery" type="text" :placeholder="$t('search-arcanists')"
                class="bg-gray-800 text-white p-2 rounded-md focus:outline-none">
            <!-- <div class="form-control">
                <label class="cursor-pointer label justify-center space-x-5">
                    <span class="label-text text-white text-md">{{ $t('show-unreleased-arcanists') }}</span>
                    <input v-model="usePlannerSettingsStore().settings.showUnreleasedArcanists" type="checkbox"
                        class="checkbox checkbox-info" />
                </label>
            </div> -->
        </div>
        <div class="flex flex-wrap items-center justify-center">
            <ArcanistPortrait v-for="arcanist in filteredArcanists" :key="arcanist.Id" :arcanist="arcanist"
                :count="portraitCounts.find(pc => pc.ArcanistName === arcanist.Name)?.count ?? -1" />
        </div>
    </div>
</template>

<style scoped></style>
