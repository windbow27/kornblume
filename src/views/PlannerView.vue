<script setup lang="ts" name="PlannerView">
import { ref, computed, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'

import { usePlannerStore } from '../stores/PlannerStore'
import { useActivityStore } from '../stores/ActivityStore'
import { useWildernessStore } from '../stores/WildernessStore'
import { usePlannerSettingsStore } from '../stores/PlannerSettingsStore'
import { useDataStore } from '../stores/DataStore'

import ArcanistList from '../components/arcanist/ArcanistList.vue'
import PlannerEdit from '../components/planner/PlannerEdit.vue'
import PlannerSelector from '../components/planner/PlannerSelector.vue'
import PlannerResult from '../components/planner/PlannerResult.vue'
import PlannerTotal from '../components/planner/PlannerTotal.vue'
import PlannerActivity from '../components/planner/PlannerActivity.vue'
import PlannerWilderness from '../components/planner/PlannerWilderness.vue'
import PlannerWarehouse from '../components/planner/PlannerWarehouse.vue'
import PlannerSettings from '../components/planner/PlannerSettings.vue'

const plannerStore = usePlannerStore()
const activityStore = useActivityStore()
const wildernessStore = useWildernessStore()
const arcanistStore = useDataStore().arcanists.data || []
const settingsStore = usePlannerSettingsStore()
const listArcanists = ref([])

interface IMaterialNeeds {
  Id: number,
  Material: string[],
  Quantity: number[],
}

interface IArcanist {
  Afflatus: string,
  Id: number,
  Insight: IMaterialNeeds[],
  IsReleased: boolean,
  Name: string,
  Rarity: number,
  Resonance: IMaterialNeeds[],
}

interface ISelectedArcanist {
  Id: number,
  isVisible: boolean,
  currentInsight: number,
  currentLevel: number,
  currentResonance: number,
  goalInsight: number,
  goalLevel: number,
  goalResonance: number,
}

const selectedArcanistIds = computed(() =>
    plannerStore.selectedArcanists.map((arcanist: IArcanist) => arcanist.Id)
)

watchEffect(() => {
    listArcanists.value = arcanistStore.filter((arcanist: IArcanist) =>
        !selectedArcanistIds.value.includes(arcanist.Id) &&
    (settingsStore.settings.showUnreleased ? true : arcanist.IsReleased)
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

// TODO: need to add the type definition for these refs
const selectedArcanist = ref<ISelectedArcanist | null>(null) // Current working arcanist
const totalActivityAndDays = ref([]) // Total activity and days

const isAddingArcanist = ref(false)
const isEditingArcanist = ref(false)
const isActivity = ref(false)
const isWilderness = ref(false)
const isWarehouse = ref(false)
const isSettings = ref(false)

const activityRef = ref(null) // Ref to close modal
const arcanistListRef = ref(null)
const plannerEditRef = ref(null)
const wildernessRef = ref(null)
const warehouseRef = ref(null)
const settingsRef = ref(null)

const openAddOverlay = () => {
    isAddingArcanist.value = true
}

const closeAddOverlay = () => {
    isAddingArcanist.value = false
}

const openEditOverlay = () => {
    isEditingArcanist.value = true
}

const editEditOverlay = (arcanist) => {
    // console.log(arcanist);
    selectedArcanist.value = arcanist
    openEditOverlay()
}

const closeEditOverlay = () => {
    isEditingArcanist.value = false
}

const openActivity = () => {
    isActivity.value = true
}

const closeActivity = () => {
    isActivity.value = false
}

const openWilderness = () => {
    isWilderness.value = true
}

const closeWilderness = () => {
    isWilderness.value = false
}

const openWarehouse = () => {
    isWarehouse.value = true
}

const closeWarehouse = () => {
    isWarehouse.value = false
}

const openSettings = () => {
    isSettings.value = true
}

const closeSettings = () => {
    isSettings.value = false
}

const handleSelectArcanist = (arcanist: IArcanist) => {
    selectedArcanist.value = {
        Id: arcanist.Id,
        isVisible: true,
        currentInsight: 0,
        currentLevel: 1,
        currentResonance: 0,
        goalInsight: 0,
        goalLevel: 1,
        goalResonance: 0
    }
    // console.log(selectedArcanist.value);
    openEditOverlay()
}

const handleUpdateSelectedArcanists = (updateSelectedArcanists) => {
    plannerStore.selectedArcanists = updateSelectedArcanists
    // console.log(selectedArcanists.value);
    closeEditOverlay()
}

const handleUpdateListArcanists = (updateListArcanists) => {
    listArcanists.value = updateListArcanists
}

const handleUpdateTotalActivityAndDays = (result) => {
    totalActivityAndDays.value = result
}

const handleSaveActivitySettings = (result) => {
    activityStore.settings = result
    // console.log(activitySettings.value);
}

const handleSaveWildernessSettings = (result) => {
    wildernessStore.settings = result
    // console.log(wildernessSettings.value);
}

const handleSaveSettings = (result) => {
    settingsStore.settings = result
    // console.log(result);
}

onClickOutside(activityRef, closeActivity)
onClickOutside(arcanistListRef, closeAddOverlay)
onClickOutside(plannerEditRef, closeEditOverlay)
onClickOutside(wildernessRef, closeWilderness)
onClickOutside(warehouseRef, closeWarehouse)
onClickOutside(settingsRef, closeSettings)

</script>

<template>
  <div class="responsive-spacer">
    <!-- Selector -->
    <h2 class="text-2xl text-white font-bold lg:mb-6">Planner</h2>
    <button class="text-info text-sm opacity-80 pb-5" onclick="oldusers_explaination.showModal()">Returning users, please
      click this if the site is not working.</button>
    <dialog id="oldusers_explaination" class="modal">
      <div class="modal-box custom-gradient-gray-blue">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
        </form>
        <h3 class="font-bold text-lg text-white">Howdy!</h3>
        <p class="text-slate-300 text-sm pb-4">
          Due to a significant data change, the information for existing users has been corrupted. Please proceed to your
          <router-link class=" text-info text-lg" to="/profile">Profile</router-link>
          and reset your data. We apologize for any inconvenience this may cause and appreciate your understanding.
        </p>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
    <PlannerSelector :selectedArcanists="plannerStore.selectedArcanists" @open-edit-overlay="editEditOverlay" />

    <div class="flex justify-between items-center mb-2 mt-2">
      <button @click="openAddOverlay" class="btn btn-ghost btn-sm custom-gradient-button"><i
          class="fa-solid fa-wand-magic-sparkles"></i> Add Arcanist</button>
      <div class="flex space-x-2">
        <div class="tooltip" data-tip="Activity Settings">
          <button @click="openActivity" class="btn btn-ghost btn-sm custom-gradient-button"><i
            class="fa-solid fa-bolt"></i></button>
        </div>
        <div class="tooltip" data-tip="Wilderness Settings">
          <button @click="openWilderness" class="btn btn-ghost btn-sm custom-gradient-button"><i
              class="fa-solid fa-tree"></i></button>
        </div>
        <div class="tooltip" data-tip="Manage Warehouse">
          <button @click="openWarehouse" class="btn btn-ghost btn-sm custom-gradient-button"><i
              class="fa-solid fa-box-archive"></i></button>
        </div>
        <div class="tooltip" data-tip="CN Data">
          <button @click="openSettings" class="btn btn-ghost btn-sm custom-gradient-button">雷</button>
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
      <PlannerEdit ref="plannerEditRef" v-if="selectedArcanist" :selectedArcanist="selectedArcanist"
        :selectedArcanists="plannerStore.selectedArcanists" :listArcanists="listArcanists"
        @closeOverlay="closeEditOverlay" @updateSelectedArcanists="handleUpdateSelectedArcanists"
        @updateListArcanists="handleUpdateListArcanists" />
    </div>

    <!-- Activity Overlay -->
    <div v-if="isActivity" class="overlay">
      <PlannerActivity ref="activityRef" :settings="activityStore.settings" @closeOverlay="closeActivity"
      @saveActivitySettings="handleSaveActivitySettings" />
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

<style scoped>
/* * {
  border: 1px solid red !important;
} */
</style>
