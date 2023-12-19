<script setup lang="ts" name="PlannerWarehouse">
import { ref, onMounted, computed } from 'vue';
import { useWarehouseStore } from '../../stores/warehouseStore';
import WarehouseItem from './warehouse/WarehouseItem.vue';
import EventShopButton from './warehouse/EventShopButton.vue'
import { setupWarehouse } from '../../composables/warehouse';

const emit = defineEmits<{(e: 'closeOverlay'): void}>()

const checkedCategories = ref({
    'Base Item': true,
    'Build Material': true,
    'Insight Material': true,
    'Resonate Material': true
});

onMounted(() => {
    setupWarehouse();
});

const updateMaterialQuantity = (materialName, materialQuantity) => {
    useWarehouseStore().updateItem(materialName, Number(materialQuantity));
};

const filterWarehouse = (category) => {
    checkedCategories.value[category] = !checkedCategories.value[category];
};

const filteredWarehouse = computed(() => {
    const anyChecked = Object.values(checkedCategories.value).some((value) => value);

    if (anyChecked) {
        return useWarehouseStore().data.filter(
            (material) => checkedCategories.value[material.Category]
        );
    } else {
        return useWarehouseStore().data;
    }
});

const resetCheckedCategories = () => {
    // if all box are checked, reset all
    if (Object.values(checkedCategories.value).every((value) => value)) {
        useWarehouseStore().resetAll();
    } else {
        Object.keys(checkedCategories.value).forEach((category) => {
            if (checkedCategories.value[category]) {
                useWarehouseStore().resetCategory(category);
            }
        });
    }
    // TODO: close dialog
};

const closeOverlay = () => {
    emit('closeOverlay');
};

</script>

<template>
  <div class="list-overlay">
    <div class="custom-modal-big h-5/6 xl:h-3/4 flex flex-col items-center">
      <!-- Close button -->
      <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
        <i class="fas fa-times"></i>
      </button>
      <p class="text-white text-center font-bold text-lg">Warehouse</p>

      <div>
        <div class="grid grid-cols-2 xl:grid-cols-4 justify-center items-center pb-5 text-center">
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-error text-xs font-bold">Base Item</span>
              <input type="checkbox" checked @change="filterWarehouse('Base Item')" class="checkbox checkbox-error" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-info text-xs font-bold">Build Material</span>
              <input type="checkbox" checked @change="filterWarehouse('Build Material')" class="checkbox checkbox-info" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-success text-xs font-bold">Insight Material</span>
              <input type="checkbox" checked @change="filterWarehouse('Insight Material')"
                class="checkbox checkbox-success" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-warning text-xs font-bold">Resonate Material</span>
              <input type="checkbox" checked @change="filterWarehouse('Resonate Material')"
                class="checkbox checkbox-warning" />
            </label>
          </div>
        </div>
      </div>

      <div class="custom-scrollbar overflow-y-scroll overflow-x-hidden flex-grow mb-5">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10">
          <WarehouseItem v-for="material in filteredWarehouse" :key="material.Material" :material="material"
            @update:quantity="updateMaterialQuantity(material.Material, $event)"/>
        </div>
      </div>

      <!-- modal buttons -->
      <div class="flex space-x-10">
        <!-- shops -->
        <div class="flex space-x-3">
          <EventShopButton version="1.21" />
          <EventShopButton version="1.22" />
        </div>

        <!-- reset -->
        <button class="btn btn-error btn-sm" onclick="my_modal_resetMat.showModal()">Reset</button>
        <dialog id="my_modal_resetMat" class="modal">
          <div class="modal-box bg-slate-700">
            <p class="py-4 text-lg text-white text-center">Reset quantity of <span class="text-error">selected</span>
              categories?</p>
            <p class="py-4 text-md text-white text-center"> Click the buttons at the top to select.</p>
            <div class="flex justify-center">
              <button class="btn btn-success btn-md mr-2" @click="resetCheckedCategories">Yes</button>
              <button class="btn btn-error btn-md" onclick="my_modal_resetMat.close()">No</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>

    </div>
  </div></template>

<style scoped></style>
