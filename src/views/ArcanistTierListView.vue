<script setup lang="ts">
import { computed, ref } from "vue";
import { useDataStore } from "@/stores/dataStore";
import { useArcanistOwnershipStore } from "@/stores/arcanistOwnershipStore";
import { getArcanistI0ImagePath } from "@/composables/images";
import { resolveCharacterTiers } from "@/composables/characterTiers";

const dataStore = useDataStore();
const ownershipStore = useArcanistOwnershipStore();
const onlyOwned = ref(false);

const tierGroups = computed(() => {
  return resolveCharacterTiers(
    dataStore.characterTiers?.characters ?? [],
    dataStore.arcanists,
    (id) => !!ownershipStore.getEffectiveEntry(id),
    onlyOwned.value,
  );
});

const scrapedDate = computed(() =>
  dataStore.characterTiers
    ? new Date(dataStore.characterTiers.scrapedAt).toLocaleDateString()
    : "",
);
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
      <p class="text-sm opacity-80">
        {{ $t("character-tier-list-description") }}
        <span v-if="dataStore.characterTiers">
          ({{ dataStore.characterTiers.version }})
        </span>
      </p>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="onlyOwned" type="checkbox" class="checkbox" />
        {{ $t("character-tier-list-only-owned") }}
      </label>
      <div v-if="dataStore.characterTiers" class="text-sm opacity-70">
        {{ $t("character-tier-list-last-updated", { date: scrapedDate }) }} ·
        <a
          :href="dataStore.characterTiers.source"
          target="_blank"
          rel="noopener"
          class="link"
          >{{ $t("teams-source") }}</a
        >
      </div>
    </div>

    <p v-if="tierGroups.length === 0" class="opacity-70">
      {{ $t("character-tier-list-no-characters") }}
    </p>

    <section
      v-for="group in tierGroups"
      :key="group.tier"
      class="mb-8 pt-5 border-t-2 border-white/40 first:border-t-0 first:pt-0"
    >
      <h2 class="text-2xl font-bold mb-3">{{ group.tier }}</h2>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <section
          v-for="roleGroup in group.roles"
          :key="roleGroup.role"
          class="rounded-lg p-3 bg-base-200"
        >
          <h3 class="font-semibold mb-3">
            {{ $t(`character-tier-role-${roleGroup.role}`) }}
          </h3>
          <div class="grid gap-2 grid-cols-2">
            <div
              v-for="entry in roleGroup.characters"
              :key="entry.character.slug"
              class="flex items-center gap-2 rounded-md p-2 border-2 min-w-0"
              :class="
                entry.owned
                  ? 'border-success'
                  : 'border-transparent opacity-70 grayscale'
              "
              :title="entry.character.name"
            >
              <img
                v-if="entry.arcanistId !== null"
                :src="getArcanistI0ImagePath(entry.arcanistId)"
                :alt="entry.character.name"
                class="w-12 h-12 rounded-full object-cover object-top shrink-0"
              />
              <div
                v-else
                class="w-12 h-12 rounded-full bg-base-300 shrink-0"
              ></div>
              <div class="min-w-0">
                <div class="text-sm font-medium truncate">
                  {{ entry.character.name }}
                </div>
                <div
                  v-if="entry.character.tags"
                  class="text-xs opacity-70 truncate"
                >
                  {{ entry.character.tags }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
