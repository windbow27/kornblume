<script setup lang="ts">
import { computed, ref } from "vue";
import { useDataStore } from "@/stores/dataStore";
import { useArcanistOwnershipStore } from "@/stores/arcanistOwnershipStore";
import { resolveTeam } from "@/composables/teams";
import { getArcanistI0ImagePath } from "@/composables/images";

const dataStore = useDataStore();
const ownershipStore = useArcanistOwnershipStore();
const onlyBuildable = ref(false);

const resolved = computed(() => {
  const teams = dataStore.teams?.teams ?? [];
  return teams.map((team) =>
    resolveTeam(
      team,
      dataStore.arcanists,
      (id) => !!ownershipStore.getEffectiveEntry(id),
    ),
  );
});

const tiers = computed(() => {
  const groups = new Map<string, typeof resolved.value>();
  for (const r of resolved.value) {
    if (onlyBuildable.value && r.ownedCount < r.total) continue;
    if (!groups.has(r.team.tier)) groups.set(r.team.tier, []);
    groups.get(r.team.tier)!.push(r);
  }
  return [...groups.entries()];
});

const scrapedDate = computed(() =>
  dataStore.teams
    ? new Date(dataStore.teams.scrapedAt).toLocaleDateString()
    : "",
);
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <p class="text-sm opacity-80">
        {{ $t("teams-role-help") }}
      </p>
      <label class="flex items-center gap-2 cursor-pointer">
        <input v-model="onlyBuildable" type="checkbox" class="checkbox" />
        {{ $t("teams-only-buildable") }}
      </label>
      <div v-if="dataStore.teams" class="text-sm opacity-70">
        {{ $t("teams-last-updated", { date: scrapedDate }) }} ·
        <a
          :href="dataStore.teams.source"
          target="_blank"
          rel="noopener"
          class="link"
          >{{ $t("teams-source") }}</a
        >
      </div>
    </div>

    <p v-if="tiers.length === 0" class="opacity-70">
      {{ $t("teams-no-teams") }}
    </p>

    <section
      v-for="[tier, teams] in tiers"
      :key="tier"
      class="mb-8 pt-5 border-t-2 border-white/40 first:border-t-0 first:pt-0"
    >
      <h2 class="text-2xl font-bold mb-3">{{ tier }}</h2>
      <div class="grid gap-3 grid-cols-1 lg:grid-cols-2">
        <div
          v-for="r in teams"
          :key="r.team.name"
          class="rounded-lg p-3 bg-base-200 border-2"
          :class="
            r.ownedCount === r.total ? 'border-success' : 'border-transparent'
          "
        >
          <div class="flex justify-between gap-2 mb-2">
            <span class="font-semibold">{{ r.team.name }}</span>
            <span
              class="badge whitespace-nowrap"
              :class="
                r.ownedCount === r.total ? 'badge-success' : 'badge-ghost'
              "
              >{{
                $t("teams-owned-count", { owned: r.ownedCount, total: r.total })
              }}</span
            >
          </div>
          <div class="flex flex-wrap gap-2">
            <div v-for="(slot, i) in r.slots" :key="i" class="flex gap-1">
              <div class="rounded-md border-2 border-white/30 p-1">
                <div class="flex gap-1">
                  <div
                    v-for="opt in slot.options"
                    :key="opt.name"
                    class="text-center w-16"
                    :class="{ 'opacity-30 grayscale': !opt.owned }"
                    :title="
                      opt.owned
                        ? opt.name
                        : `${opt.name} (${$t('teams-missing')})`
                    "
                  >
                    <img
                      v-if="opt.arcanistId !== null"
                      :src="getArcanistI0ImagePath(opt.arcanistId)"
                      :alt="opt.name"
                      class="w-16 h-16 rounded-full object-cover object-top"
                    />
                    <div
                      v-else
                      class="w-16 h-16 rounded-full bg-base-300"
                    ></div>
                    <div class="text-xs truncate">{{ opt.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
