<script setup>
import { onMounted, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { FwbButton } from 'flowbite-vue';

import a from '../../public/data/arcanists.json';
import ArcanistList from '../components/arcanist/ArcanistList.vue';
import PlannerEdit from '../components/planner/PlannerEdit.vue';
import PlannerSelector from '../components/planner/PlannerSelector.vue';
import PlannerResult from '../components/planner/PlannerResult.vue';
import PlannerTotal from '../components/planner/PlannerTotal.vue';
import PlannerWilderness from '../components/planner/PlannerWilderness.vue';
import PlannerWarehouse from '../components/planner/PlannerWarehouse.vue';

const selectedArcanist = ref([]); // Current working arcanist
const selectedArcanists = ref([]); // All arcanists chosen by user
const totalActivityAndDays = ref([]); // Total activity and days
const inventory = ref([]); // Inventory
const wildernessSettings = ref([]); // Wilderness settings
const listArcanists = ref(a); // List of all arcanists available

const isAddingArcanist = ref(false);
const isEditingArcanist = ref(false);
const isWilderness = ref(false);
const isWarehouse = ref(false);

const arcanistListRef = ref(null); // Ref to close modal
const plannerEditRef = ref(null);
const wildernessRef = ref(null);
const warehouseRef = ref(null);

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

const handleSelectArcanist = (arcanist) => {
  selectedArcanist.value = {
    info: arcanist,
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
  selectedArcanists.value = updateSelectedArcanists;
  //console.log(selectedArcanists.value);
  closeEditOverlay();
};

const handleUpdateListArcanists = (updateListArcanists) => {
  listArcanists.value = updateListArcanists;
};

const handleUpdateTotalActivityAndDays = (result) => {
  totalActivityAndDays.value = result;
};

onMounted(() => {
  listArcanists.value.sort((a, b) => {
    const rarityComparison = b.Rarity - a.Rarity;

    if (rarityComparison !== 0) {
      return rarityComparison;
    }

    // If rarity is the same, compare by name alphabetically
    return a.Name.localeCompare(b.Name);
  });
});

onClickOutside(arcanistListRef, closeAddOverlay);
onClickOutside(plannerEditRef, closeEditOverlay);
onClickOutside(wildernessRef, closeWilderness);
onClickOutside(warehouseRef, closeWarehouse);

</script>

<template>
  <div
    class=" pt-2 pb-2 pr-4 pl-4 sm:pr-8 sm:pl-8 sm:pt-4 sm:pb-4 md:pt-8 md:pb-8 md:pr-16 md:pl-16 lg:pr-32 lg:pl-32 xl:pr-64 xl:pl-64">
    <!-- Selector -->
    <h2 class="text-2xl text-white font-bold mb-6">Planner</h2>
    <PlannerSelector :selectedArcanists="selectedArcanists" @open-edit-overlay="editEditOverlay" />

    <div class="flex justify-between items-center mb-2 mt-2">
      <FwbButton gradient="cyan-blue" class="mt-2" @click="openAddOverlay">
        <template #prefix>
          <i class="fa-solid fa-wand-magic-sparkles"></i>
        </template>
        Add Arcanist
      </FwbButton>
      <div class="flex mt-2 sm:mt-0 space-x-2">
        <FwbButton @click="openWilderness" gradient="cyan-blue" size="sm" class="setting-button">
          <!-- <template #suffix>
            <p class="">Wilderness</p>
          </template> -->
          <i class="fa-solid fa-tree"></i>
        </FwbButton>
        <FwbButton @click="openWarehouse" gradient="cyan-blue" size="sm" class="setting-button">
          <!-- <template #suffix>
            <p class="">Warehouse</p>
          </template> -->
          <i class="fa-solid fa-box-archive"></i>
        </FwbButton>
        <FwbButton gradient="cyan-blue" size="sm" class="setting-button">
          <!-- <template #suffix>
            <p class="">Settings</p>
          </template> -->
          <i class="fa-solid fa-gear"></i>
        </FwbButton>

      </div>
    </div>

    <div class="custom-line"></div>

    <PlannerTotal :totalActivityAndDays="totalActivityAndDays" />

    <div class="custom-line"></div>

    <!-- Add Arcanist Overlay -->
    <div v-if="isAddingArcanist" class="overlay">
      <ArcanistList ref="arcanistListRef" :arcanists="listArcanists" @closeOverlay="closeAddOverlay"
        @selectArcanist="handleSelectArcanist" />
    </div>

    <!-- Edit Arcanist Overlay -->
    <div v-if="isEditingArcanist" class="overlay">
      <PlannerEdit ref="plannerEditRef" :selectedArcanist="selectedArcanist" :selectedArcanists="selectedArcanists"
        :listArcanists="listArcanists" @closeOverlay="closeEditOverlay"
        @updateSelectedArcanists="handleUpdateSelectedArcanists" @updateListArcanists="handleUpdateListArcanists" />
    </div>

    <!-- Wilderness Overlay -->
    <div v-if="isWilderness" class="overlay">
      <PlannerWilderness ref="wildernessRef" @closeOverlay="closeWilderness" />
    </div>

    <!-- Warehouse Overlay -->
    <div v-if="isWarehouse" class="overlay">
      <PlannerWarehouse ref="warehouseRef" @closeOverlay="closeWarehouse" />
    </div>

    <!-- Result -->
    <PlannerResult :selectedArcanists="selectedArcanists"
      @update:totalActivityAndDays="handleUpdateTotalActivityAndDays" />
  </div>
</template>


<style scoped>
.setting-button {
  @apply mx-1 flex items-center justify-center
}
</style>