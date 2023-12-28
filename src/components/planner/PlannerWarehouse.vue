<script setup lang="ts" name="PlannerWarehouse">
import { ref, onMounted, computed } from 'vue';
import { useWarehouseStore } from '../../stores/warehouseStore';
import WarehouseItem from './warehouse/WarehouseItem.vue';
import EventShopButton from './warehouse/EventShopButton.vue'
import { initializeWarehouse, checkWarehouse, sortWarehouseMaterials } from '../../composables/warehouse';
import { useGlobalStore } from '../../stores/global';

const dialog = ref<HTMLDialogElement>()

const emit = defineEmits<{(e: 'closeOverlay'): void }>()

const checkedCategories = ref({
    'Base Item': true,
    'Build Material': true,
    'Insight Material': true,
    'Resonate Material': true
});

const setupWarehouse = () => {
    if (useWarehouseStore().data.length === 0) {
        initializeWarehouse();
    } else { // else statement to be updated for seamless addition of new warehouse items
        checkWarehouse();
    }
    sortWarehouseMaterials(useWarehouseStore().data);
}

onMounted(() => {
    useGlobalStore().setIsEditingWarehouse(true);
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
    closeDialog();
};

const closeWarehouseOverlay = () => {
    useGlobalStore().setIsEditingWarehouse(false);
    emit('closeOverlay');
};

const showDialog = () => dialog.value?.showModal()

const closeDialog = () => dialog.value?.close()

</script>

<template>
  <div class="list-overlay">
    <div class="custom-modal-big h-5/6 xl:h-3/4 flex flex-col items-center">
      <!-- Close button -->
      <button @click="closeWarehouseOverlay" class="absolute top-2 right-4 text-white">
        <i class="fas fa-times"></i>
      </button>
      <p class="text-white text-center font-bold text-lg">Warehouse (Auto-save)</p>

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

      <div class="custom-item-list mb-5">
        <WarehouseItem v-for="material in filteredWarehouse" :key="material.Material" :material="material"
          @update:quantity="updateMaterialQuantity(material.Material, $event)" class="" />
      </div>

      <div class="flex space-x-10">
        <!-- shops -->
        <div class="flex space-x-3">
          <button class="btn btn-sm btn-success" onclick="shop_container.showModal()">Event Materials</button>
          <dialog id="shop_container" class="modal">
            <div class="modal-box custom-gradient-gray-blue custom-border">
              <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost text-white absolute right-2 top-2 ">✕</button>
              </form>
              <p class="py-4 text-base text-white text-center">You can quickly add Materials from Jukeboxes and Events
                here.</p>
              <div class="grid grid-cols-2 gap-2 p-2">
                <EventShopButton version="jb1" text="Jukebox Normal" type="Jukebox" />
                <EventShopButton version="jb2" text="Jukebox Collector" type="Jukebox" />
                <EventShopButton version="1.21" text="1.2 part 1" type="Event Shop" />
                <EventShopButton version="1.22" text="1.2 part 2" type="Event Shop" />
                <EventShopButton version="1.31" text="1.3 part 1" type="Event Shop" />
                <EventShopButton version="1.32" text="1.3 part 2" type="Event Shop" />
              </div>
              <form method="dialog" class="flex justify-center">
                <button class="btn btn-sm btn-success text-black">Close</button>
              </form>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>

        <!-- reset -->
        <button class="btn btn-error btn-sm" @click="showDialog">Reset</button>
        <dialog ref="dialog" class="modal">
          <div class="modal-box custom-gradient-gray-blue custom-border">
            <p class="py-4 text-lg text-white text-center">Reset quantity of <span class="text-error">selected</span>
              categories?</p>
            <p class="py-4 text-md text-white text-center"> Click the buttons at the top to select.</p>
            <div class="flex justify-center">
              <button class="btn btn-success btn-md mr-2" @click="resetCheckedCategories">Yes</button>
              <button class="btn btn-error btn-md" @click="closeDialog">No</button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>

    </div>
  </div>
</template>
