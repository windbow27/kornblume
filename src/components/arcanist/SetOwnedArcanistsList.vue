<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDataStore } from '@/stores/dataStore';
import { useArcanistOwnershipStore } from '@/stores/arcanistOwnershipStore';
import { getAfflatusList } from '@/composables/images';
import { formatArcanists } from '@/composables/arcanists';
import type { IArcanist } from '@/types';
import ArcanistIconDisplay from '@/components/arcanist/ArcanistIconDisplay.vue';

type ownedFilter = 'all' | 'owned' | 'unowned';

const { locale, t } = useI18n();
const dataStore = useDataStore();
const ownershipStore = useArcanistOwnershipStore();

const searchQuery = ref('');
const sortMode = ref<'id' | 'name'>('id');
const activeRarities = ref<number[]>([]);
const activeAfflatus = ref<string[]>([]);
const ownershipFilter = ref<ownedFilter>('all');

const listArcanists = computed<IArcanist[]>(() => dataStore.arcanists);

const selectedRarities = (rarity: number) => {
  if (activeRarities.value.includes(rarity)) {
    activeRarities.value = activeRarities.value.filter((r) => r !== rarity);
  } else {
    activeRarities.value.push(rarity);
  }
};

const selectedAfflatus = (afflatus: string) => {
  if (activeAfflatus.value.includes(afflatus)) {
    activeAfflatus.value = activeAfflatus.value.filter((a) => a !== afflatus);
  } else {
    activeAfflatus.value.push(afflatus);
  }
};

const getOwnershipSource = (id: number) => ownershipStore.getEffectiveEntry(id)?.source ?? 'none';
const isOwned = (id: number) => !!ownershipStore.getEffectiveEntry(id);
const isManualOwned = (id: number) => getOwnershipSource(id) === 'manual';
const hasTrackerOwnership = (id: number) => !!ownershipStore.getTrackerEntry(id);

const getOwnershipSourceLabel = (id: number) => {
  const source = getOwnershipSource(id);
  if (source === 'manual') {
    return 'Manual';
  }
  if (source === 'tracker') {
    return 'Tracker';
  }
  return 'None';
};

const getPortraitValue = (id: number) => ownershipStore.getEffectiveEntry(id)?.portrait ?? 0;
const isPortraitDisabled = (id: number) => ownershipStore.getEffectiveEntry(id)?.source !== 'manual';
const getOwnershipToggleLabel = (id: number) => (hasTrackerOwnership(id) ? 'Overwrite' : 'Owned');

const getSourceBadgeClass = (id: number) => {
  const source = getOwnershipSource(id);
  if (source === 'manual') {
    return 'border-amber-400/50 bg-amber-400/12 text-amber-100';
  }
  if (source === 'tracker') {
    return 'border-cyan-400/50 bg-cyan-400/12 text-cyan-100';
  }
  return 'border-slate-500/40 bg-slate-500/10 text-slate-300';
};

const getSourceDotClass = (id: number) => {
  const source = getOwnershipSource(id);
  if (source === 'manual') {
    return 'bg-amber-300';
  }
  if (source === 'tracker') {
    return 'bg-cyan-300';
  }
  return 'bg-slate-400';
};

const getRowClass = (id: number) => {
  const source = getOwnershipSource(id);
  if (source === 'manual') {
    return 'border-l-4 border-l-amber-400/90';
  }
  if (source === 'tracker') {
    return 'border-l-4 border-l-cyan-400/90';
  }
  return 'border-l-4 border-l-slate-500/35';
};

const setOwned = (arc: IArcanist, value: boolean) => {
  if (!value) {
    ownershipStore.removeEntry(arc.Id);
    return;
  }

  ownershipStore.setOwned(arc.Id, arc.Name);
};

const setCurrentPortrait = (arc: IArcanist, value: number) => {
  ownershipStore.updateEntry(arc.Id, {
    Id: arc.Id,
    Name: arc.Name,
    portrait: value,
  });
};

const filteredArcanists = computed(() => {
  let filtered = listArcanists.value.filter((arc) => arc.IsReleased);

  if (locale.value === 'en-US') {
    filtered = filtered.filter((arc) =>
      arc.Name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  } else {
    filtered = filtered.filter((arc) => t(arc.Name).includes(searchQuery.value));
  }

  if (activeRarities.value.length > 0) {
    filtered = filtered.filter((arc) => activeRarities.value.includes(arc.Rarity));
  }

  if (activeAfflatus.value.length > 0) {
    filtered = filtered.filter((arc) =>
      getAfflatusList(arc.Afflatus).some((afflatus) =>
        activeAfflatus.value.some((active) => active.toLowerCase() === afflatus.toLowerCase())
      )
    );
  }

  if (ownershipFilter.value === 'owned') {
    filtered = filtered.filter((arc) => isOwned(arc.Id));
  }

  if (ownershipFilter.value === 'unowned') {
    filtered = filtered.filter((arc) => !isOwned(arc.Id));
  }

  filtered = formatArcanists(filtered);

  if (sortMode.value === 'id') {
    return [...filtered].sort((a, b) => b.Id - a.Id);
  }

  return [...filtered].sort((a, b) => a.Name.localeCompare(b.Name));
});
</script>

<template>
  <div class="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
    <div class="flex flex-wrap items-center gap-3 pb-4">
      <label class="flex items-center gap-2 text-white">
        <span>Sort by:</span>
        <select v-model="sortMode" class="select select-sm bg-gray-800 text-white">
          <option value="id">ID (High → Low)</option>
          <option value="name">Name (A → Z)</option>
        </select>
      </label>

      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('search-arcanists')"
        class="input input-sm w-full sm:w-64 bg-gray-800 text-white" />

      <label class="flex items-center gap-2 text-white">
        <span>Ownership</span>
        <select v-model="ownershipFilter" class="select select-sm bg-gray-800 text-white">
          <option value="all">All</option>
          <option value="owned">Owned</option>
          <option value="unowned">Not Owned</option>
        </select>
      </label>
    </div>

    <div class="flex flex-wrap gap-x-10 gap-y-3 pb-4">
      <div class="rounded-lg border border-slate-700/90 bg-slate-900/50 px-3 py-2">
        <p class="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">Rarity</p>
        <div class="flex justify-center space-x-2">
          <button
            v-for="i in [2, 3, 4, 5, 6]"
            :key="i"
            :class="{
              'border-2 border-info': activeRarities.includes(i),
              'border-2 border-transparent': !activeRarities.includes(i)
            }"
            :title="`${i}-star`"
            @click="selectedRarities(i)"
            class="p-2 rounded-md">
            <i
              class="fa-solid fa-star"
              :class="{
                'text-orange-300': i === 6,
                'text-yellow-100': i === 5,
                'text-purple-400': i === 4,
                'text-sky-200': i === 3,
                'text-green-200': i === 2
              }"></i>
          </button>
        </div>
      </div>

      <div class="rounded-lg border border-slate-700/90 bg-slate-900/50 px-3 py-2">
        <p class="pb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">Afflatus</p>
        <div class="flex justify-center gap-1.5">
          <button
            v-for="afflatus in ['Beast', 'Mineral', 'Plant', 'Star', 'Intellect', 'Spirit']"
            :key="afflatus"
            :class="{
              'border-2 border-info': activeAfflatus.includes(afflatus),
              'border-2 border-transparent': !activeAfflatus.includes(afflatus)
            }"
            :title="afflatus"
            @click="selectedAfflatus(afflatus)"
            class="h-10 w-10 rounded-md p-1 flex items-center justify-center">
            <img class="h-9 w-9 object-contain" :src="`images/arcanists/misc/${afflatus.toLowerCase()}.webp`" alt="" />
          </button>
        </div>
      </div>
    </div>

    <div class="max-h-[65vh] overflow-y-auto rounded-md border border-slate-700">
      <div
        v-for="arc in filteredArcanists"
        :key="arc.Id"
        class="grid grid-cols-1 items-center gap-3 border-b border-slate-700/70 bg-slate-900/30 p-3 lg:grid-cols-[1fr_auto_auto_auto]"
        :class="getRowClass(arc.Id)">
        <div class="flex items-center gap-3">
          <ArcanistIconDisplay :arcanist="arc" />
          <div>
            <router-link :to="`/arcanist-${arc.Id}`" class="text-white hover:text-info">
              {{ $t(arc.Name) }}
            </router-link>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-300">Source:</span>
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
            :class="getSourceBadgeClass(arc.Id)">
            <span class="inline-block h-1.5 w-1.5 rounded-full" :class="getSourceDotClass(arc.Id)"></span>
            {{ getOwnershipSourceLabel(arc.Id) }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-info checkbox-sm"
            :checked="isManualOwned(arc.Id)"
            @change="setOwned(arc, ($event.target as HTMLInputElement).checked)" />
          <span class="text-xs text-slate-300">{{ getOwnershipToggleLabel(arc.Id) }}</span>
        </div>

        <label class="flex items-center gap-2">
          <span class="text-xs text-slate-300">Portrait</span>
          <select
            class="select select-sm w-20 bg-slate-800 text-white"
            :disabled="isPortraitDisabled(arc.Id)"
            :value="getPortraitValue(arc.Id)"
            @change="setCurrentPortrait(arc, Number(($event.target as HTMLSelectElement).value))">
            <option :value="0">0</option>
            <option :value="1">1</option>
            <option :value="2">2</option>
            <option :value="3">3</option>
            <option :value="4">4</option>
            <option :value="5">5</option>
          </select>
        </label>
      </div>
      <div v-if="filteredArcanists.length === 0" class="p-4 text-center text-slate-400">
        No arcanists match your filters.
      </div>
    </div>
  </div>
</template>

<style scoped></style>
