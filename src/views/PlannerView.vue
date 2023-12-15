<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';

import { usePlannerStore } from '../stores/PlannerStore';
import { useWildernessStore } from '../stores/WildernessStore';
import { usePlannerSettingsStore } from '../stores/PlannerSettingsStore';
import { useDataStore } from '../stores/DataStore';

import ArcanistList from '../components/arcanist/ArcanistList.vue';
import PlannerEdit from '../components/planner/PlannerEdit.vue';
import PlannerSelector from '../components/planner/PlannerSelector.vue';
import PlannerResult from '../components/planner/PlannerResult.vue';
import PlannerTotal from '../components/planner/PlannerTotal.vue';
import PlannerWilderness from '../components/planner/PlannerWilderness.vue';
import PlannerWarehouse from '../components/planner/PlannerWarehouse.vue';
import PlannerSettings from '../components/planner/PlannerSettings.vue';

const plannerStore = usePlannerStore();
const wildernessStore = useWildernessStore();
const arcanistStore = useDataStore().arcanists.data;
const settingsStore = usePlannerSettingsStore();
const listArcanists = ref([]);

const selectedArcanistIds = computed(() =>
  plannerStore.selectedArcanists.map(arcanist => arcanist.Id)
);

watchEffect(() => {
  listArcanists.value = arcanistStore.filter(arcanist =>
    !selectedArcanistIds.value.includes(arcanist.Id) &&
    (settingsStore.settings.showUnreleased ? true : arcanist.IsReleased)
  );

  listArcanists.value.sort((a, b) => {
    const rarityComparison = b.Rarity - a.Rarity;

    if (rarityComparison !== 0) {
      return rarityComparison;
    }

    // If rarity is the same, compare by name alphabetically
    return a.Name.localeCompare(b.Name);
  });
});

const selectedArcanist = ref([]); // Current working arcanist
const totalActivityAndDays = ref([]); // Total activity and days

const isAddingArcanist = ref(false);
const isEditingArcanist = ref(false);
const isWilderness = ref(false);
const isWarehouse = ref(false);
const isSettings = ref(false);

const arcanistListRef = ref(null); // Ref to close modal
const plannerEditRef = ref(null);
const wildernessRef = ref(null);
const warehouseRef = ref(null);
const settingsRef = ref(null);

const openAddOverlay = () => {
  isAddingArcanist.value = true;
};

const closeAddOverlay = () => {
  isAddingArcanist.value = false;
};

const openEditOverlay = () => {
  isEditingArcanist.value = true;
};

const editEditOverlay = (arcanist) => {
  //console.log(arcanist);
  selectedArcanist.value = arcanist;
  openEditOverlay();
};

const closeEditOverlay = () => {
  isEditingArcanist.value = false;
};

const openWilderness = () => {
  isWilderness.value = true;
};

const closeWilderness = () => {
  isWilderness.value = false;
};

const openWarehouse = () => {
  isWarehouse.value = true;
};

const closeWarehouse = () => {
  isWarehouse.value = false;
};

const openSettings = () => {
  isSettings.value = true;
};

const closeSettings = () => {
  isSettings.value = false;
};

const handleSelectArcanist = (arcanist) => {
  selectedArcanist.value = {
    Id: arcanist.Id,
    isVisible: true,
    currentInsight: 0,
    currentLevel: 1,
    currentResonance: 0,
    goalInsight: 0,
    goalLevel: 1,
    goalResonance: 0,
  };
  //console.log(selectedArcanist.value);
  openEditOverlay();
}

const handleUpdateSelectedArcanists = (updateSelectedArcanists) => {
  plannerStore.selectedArcanists = updateSelectedArcanists;
  //console.log(selectedArcanists.value);
  closeEditOverlay();
};

const handleUpdateListArcanists = (updateListArcanists) => {
  listArcanists.value = updateListArcanists;
};

const handleUpdateTotalActivityAndDays = (result) => {
  totalActivityAndDays.value = result;
};

const handleSaveWildernessSettings = (result) => {
  wildernessStore.settings = result;
  //console.log(wildernessSettings.value);
};

const handleSaveSettings = (result) => {
  settingsStore.settings = result;
  //console.log(result);
};

onClickOutside(arcanistListRef, closeAddOverlay);
onClickOutside(plannerEditRef, closeEditOverlay);
onClickOutside(wildernessRef, closeWilderness);
onClickOutside(warehouseRef, closeWarehouse);
onClickOutside(settingsRef, closeSettings);

</script>

<template>
  <div class="responsive-spacer">
    <!-- Selector -->
    <h2 class="text-2xl text-white font-bold mb-4 lg:mb-6">Planner</h2>
    <PlannerSelector :selectedArcanists="plannerStore.selectedArcanists" @open-edit-overlay="editEditOverlay" />

    <div class="flex justify-between items-center mb-2 mt-2">
      <button @click="openAddOverlay" class="btn btn-ghost btn-sm custom-gradient-button"><i
          class="fa-solid fa-wand-magic-sparkles"></i> Add Arcanist</button>
      <div class="flex space-x-2">
        <div class="tooltip" data-tip="Wilderness Settings">
          <button @click="openWilderness" class="btn btn-ghost btn-sm custom-gradient-button"><i
              class="fa-solid fa-tree"></i></button>
        </div>
        <div class="tooltip" data-tip="Manage Warehouse">
          <button @click="openWarehouse" class="btn btn-ghost btn-sm custom-gradient-button"><i
              class="fa-solid fa-box-archive"></i></button>
        </div>
        <div class="tooltip" data-tip="Settings">
          <button @click="openSettings" class="btn btn-ghost btn-sm custom-gradient-button"><i
              class="fa-solid fa-gear"></i></button>
        </div>
      </div>
    </div>

    <div class="custom-line"></div>

    <PlannerTotal :totalActivityAndDays="totalActivityAndDays" :wildernessSettings="wildernessStore.settings" />

    <div class="custom-line"></div>

    <!-- Add Arcanist Overlay -->
    <div v-if="isAddingArcanist" class="overlay">
      <ArcanistList ref="arcanistListRef" :arcanists="listArcanists" @closeOverlay="closeAddOverlay"
        @selectArcanist="handleSelectArcanist" />
    </div>

    <!-- Edit Arcanist Overlay -->
    <div v-if="isEditingArcanist" class="overlay">
      <PlannerEdit ref="plannerEditRef" :selectedArcanist="selectedArcanist"
        :selectedArcanists="plannerStore.selectedArcanists" :listArcanists="listArcanists"
        @closeOverlay="closeEditOverlay" @updateSelectedArcanists="handleUpdateSelectedArcanists"
        @updateListArcanists="handleUpdateListArcanists" />
    </div>

    <!-- Wilderness Overlay -->
    <div v-if="isWilderness" class="overlay">
      <PlannerWilderness ref="wildernessRef" :settings="wildernessStore.settings" @closeOverlay="closeWilderness"
        @saveWildernessSettings="handleSaveWildernessSettings" />
    </div>

    <!-- Warehouse Overlay -->
    <div v-if="isWarehouse" class="overlay">
      <PlannerWarehouse ref="warehouseRef" @closeOverlay="closeWarehouse" />
    </div>

    <!-- Settings Overlay -->
    <div v-if="isSettings" class="overlay">
      <PlannerSettings ref="settingsRef" :settings="settingsStore.settings" @closeOverlay="closeSettings"
        @saveSettings="handleSaveSettings" />
    </div>

    <!-- Result -->
    <PlannerResult :selectedArcanists="plannerStore.selectedArcanists"
      @update:totalActivityAndDays="handleUpdateTotalActivityAndDays" />
  </div>
</template>


<style scoped></style>