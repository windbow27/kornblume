<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useDataStore } from "@/stores/dataStore";
import { useArcanistOwnershipStore } from "@/stores/arcanistOwnershipStore";
import { getArcanistI0ImagePath } from "@/composables/images";
import { resolveCharacterTiers } from "@/composables/characterTiers";
import { findTeamsWithCharacter, resolveTeam } from "@/composables/teams";
import type { ITeam } from "@/types";

const dataStore = useDataStore();
const ownershipStore = useArcanistOwnershipStore();
const onlyOwned = ref(false);
const selectedName = ref<string | null>(null);
const hoveredTeam = ref<ITeam | null>(null);
const root = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);

// Card clicks are handled by selectCharacter, so only other clicks close the panel
function closeOnOutsideClick(event: MouseEvent) {
  const target = event.target as Element;
  if (
    selectedName.value &&
    !panel.value?.contains(target) &&
    !target.closest("[data-character-card]")
  ) {
    selectedName.value = null;
    hoveredTeam.value = null;
  }
}

onMounted(() => document.addEventListener("click", closeOnOutsideClick));
onBeforeUnmount(() =>
  document.removeEventListener("click", closeOnOutsideClick),
);
const panelStyle = ref<Record<string, string>>({});
const flyoutStyle = ref<Record<string, string>>({});

// Opens toward whichever side of the element has more room
function sidePosition(rect: DOMRect) {
  const openRight = window.innerWidth - rect.right >= rect.left;
  return {
    openRight,
    x: openRight ? rect.right : rect.left,
    transform: openRight
      ? "translateX(8px)"
      : "translateX(calc(-100% - 8px))",
  };
}

const isOwned = (id: number) => !!ownershipStore.getEffectiveEntry(id);

const selectedTeams = computed(() =>
  selectedName.value
    ? findTeamsWithCharacter(
        dataStore.teams?.teams ?? [],
        selectedName.value,
      ).map((team) => {
        const resolved = resolveTeam(team, dataStore.arcanists, isOwned);
        return { team, buildable: resolved.ownedCount === resolved.total };
      })
    : [],
);

const resolvedHoveredTeam = computed(() =>
  hoveredTeam.value
    ? resolveTeam(hoveredTeam.value, dataStore.arcanists, isOwned)
    : null,
);

function selectCharacter(name: string, event: MouseEvent) {
  hoveredTeam.value = null;
  if (selectedName.value === name) {
    selectedName.value = null;
    return;
  }

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const rootRect = root.value!.getBoundingClientRect();
  const { x, transform } = sidePosition(rect);
  panelStyle.value = {
    top: `${rect.top - rootRect.top}px`,
    left: `${x - rootRect.left}px`,
    transform,
  };
  selectedName.value = name;
}

function showFlyout(team: ITeam, event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const { x, transform } = sidePosition(rect);
  flyoutStyle.value = {
    top: `${Math.max(8, Math.min(rect.top, window.innerHeight - 220))}px`,
    left: `${x}px`,
    transform,
  };
  hoveredTeam.value = team;
}

const tierGroups = computed(() => {
  return resolveCharacterTiers(
    dataStore.characterTiers?.characters ?? [],
    dataStore.arcanists,
    isOwned,
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
  <div ref="root" class="container mx-auto px-4 py-6 relative">
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
              data-character-card
              class="flex items-center gap-2 rounded-md p-2 border-2 min-w-0 cursor-pointer hover:bg-base-300"
              :class="[
                entry.owned
                  ? 'border-success'
                  : 'border-transparent opacity-70 grayscale',
                { 'bg-base-300': selectedName === entry.character.name },
              ]"
              :title="entry.character.name"
              @click="selectCharacter(entry.character.name, $event)"
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

    <aside
      v-if="selectedName"
      ref="panel"
      class="absolute z-40 w-max max-w-xs rounded-lg bg-base-200 shadow-xl border-2 border-white/30 p-3"
      :style="panelStyle"
    >
      <p v-if="selectedTeams.length === 0" class="text-sm opacity-70">
        {{ $t("character-tier-list-no-teams") }}
      </p>
      <ul v-else class="flex flex-col gap-1">
        <li
          v-for="{ team, buildable } in selectedTeams"
          :key="team.name"
          class="rounded-md px-3 py-2 bg-base-300 cursor-default hover:bg-base-100 border-2"
          :class="buildable ? 'border-success/60' : 'border-transparent'"
          @mouseenter="showFlyout(team, $event)"
          @mouseleave="hoveredTeam = null"
        >
          {{ team.name }}
        </li>
      </ul>
    </aside>

    <div
      v-if="resolvedHoveredTeam"
      class="fixed z-50 pointer-events-none rounded-lg p-3 bg-base-200 border-2 border-white/40 shadow-2xl max-w-[90vw]"
      :style="flyoutStyle"
    >
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(slot, i) in resolvedHoveredTeam.slots"
          :key="i"
          class="rounded-md border-2 border-white/30 p-1 flex gap-1"
        >
          <div
            v-for="opt in slot.options"
            :key="opt.name"
            class="text-center w-16"
            :class="{ 'opacity-30 grayscale': !opt.owned }"
          >
            <img
              v-if="opt.arcanistId !== null"
              :src="getArcanistI0ImagePath(opt.arcanistId)"
              :alt="opt.name"
              class="w-16 h-16 rounded-full object-cover object-top"
            />
            <div v-else class="w-16 h-16 rounded-full bg-base-300"></div>
            <div class="text-xs truncate">{{ opt.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
