<script setup>
import { onMounted, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { FwbButton } from 'flowbite-vue';

import a from '../../public/data/arcanists.json';
import ArcanistList from '../components/arcanist/ArcanistList.vue';
import PlannerEdit from '../components/planner/PlannerEdit.vue';
import PlannerSelector from '../components/planner/PlannerSelector.vue';
import PlannerResult from '../components/planner/PlannerResult.vue';
import ArcanistResult from '../components/arcanist/ArcanistResult.vue';

const selectedArcanist = ref([]);
const selectedArcanists = ref([]);
const listArcanists = ref(a);
const isAddingArcanist = ref(false);
const isEditingArcanist = ref(false);

const arcanistListRef = ref(null); // Ref to close modal
const plannerEditRef = ref(null);

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

</script>

<template>
  <div class="p-8">
    <!-- Selector -->
    <h2 class="text-3xl text-white font-bold mb-6">Planner</h2>
    <PlannerSelector :selectedArcanists="selectedArcanists" @open-edit-overlay="editEditOverlay" />
    <div class="flex space-x-4">
      <FwbButton gradient="cyan-blue" class="mt-2" @click="openAddOverlay">
        Add Arcanist
      </FwbButton>
    </div>

    <div class="custom-line"></div>

    <!-- Add Arcanist Overlay -->
    <div v-if="isAddingArcanist" class="overlay">
      <ArcanistList ref="arcanistListRef" :arcanists="listArcanists" @closeOverlay="closeAddOverlay" @selectArcanist="handleSelectArcanist" />
    </div>

    <!-- Edit Arcanist Overlay -->
    <div v-if="isEditingArcanist" class="overlay">
      <PlannerEdit ref="plannerEditRef" :selectedArcanist="selectedArcanist" :selectedArcanists="selectedArcanists"
        :listArcanists="listArcanists" @closeOverlay="closeEditOverlay"
        @updateSelectedArcanists="handleUpdateSelectedArcanists" @updateListArcanists="handleUpdateListArcanists" />
    </div>

    <!-- Result -->
  </div>
</template>


<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
</style>