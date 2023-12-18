<script setup>
import { ref, onMounted, computed } from 'vue';
import { useWarehouseStore } from '../../stores/warehouseStore';
import { useDataStore } from '../../stores/dataStore';
import { usePlannerSettingsStore } from '../../stores/plannerSettingsStore';
import { sortMaterials } from '../../composables/CalculateMaterials';
import { addMaterialsToWarehouse } from '../../composables/ShopMaterials';
import ItemWarehouse from '../item/ItemWarehouse.vue';

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    }
});

const checkedCategories = ref({
    'Base Item': true,
    'Build Material': true,
    'Insight Material': true,
    'Resonate Material': true
});

onMounted(() => {
    const unreleasedDropsEnabled = usePlannerSettingsStore().settings.enabledUnreleasedStages;
    if (useWarehouseStore().data.length === 0) {
        console.log('Setting up warehouse');
        useDataStore().items.forEach((item) => {
            if (item.IsReleased || unreleasedDropsEnabled) {
                if (
                    item.Category === 'Build Material' ||
          item.Category === 'Insight Material' ||
          (item.Category === 'Resonate Material' && item.Rarity < 6) ||
          item.Name === 'Dust' ||
          item.Name === 'Sharpodonty' ||
          item.Name === 'Crystal Casket'
                ) {
                    useWarehouseStore().addItem(item.Name, item.Category);
                }
            }
        });
    } else { // else statement to be updated for seamless addition of new warehouse items
        useDataStore().items.forEach((item) => {
            if (!useWarehouseStore().itemExists(item.Name) &&
          (item.Name === 'Crystal Casket' || (!item.IsReleased && unreleasedDropsEnabled))) {
                useWarehouseStore().addItem(item.Name, item.Category);
            } else if (!item.IsReleased && !unreleasedDropsEnabled) {
                useWarehouseStore().removeItem(item.Name);
            }
        });
    }

    sortMaterials(useWarehouseStore().data);
});

const handleUpdateQuantity = (materialName, updatedQuantity) => {
    useWarehouseStore().updateItem(materialName, Number(updatedQuantity));
};

const filterWarehouse = (category) => {
    checkedCategories.value[category] = !checkedCategories.value[category];
};

const filteredWarehouse = computed(() => {
    const anyChecked = Object.values(checkedCategories.value).some((value) => value);

    if (anyChecked) {
        return useWarehouseStore().data.filter((material) => {
            return checkedCategories.value[material.Category];
        });
    } else {
        return useWarehouseStore().data;
    }
});

const resetCheckedCategories = () => {
    // if all box are checked, reset all
    if (Object.values(checkedCategories.value).every((value) => value)) {
    // console.log('reset all');
        useWarehouseStore().resetAll();
        window.location.reload();
    } else {
        Object.keys(checkedCategories.value).forEach((category) => {
            if (checkedCategories.value[category]) {
                useWarehouseStore().resetCategory(category);
            }
        });
    }
    emit('closeOverlay');
};

const addShopItems = (version) => {
    addMaterialsToWarehouse(version);
    emit('closeOverlay');
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
      <p class="text-white text-center font-bold text-lg"> Warehouse </p>

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
          <ItemWarehouse v-for="material in filteredWarehouse" :key="material.Material" :material="material"
            @update:quantity="handleUpdateQuantity(material.Material, $event)"/>
        </div>
      </div>

      <!-- modal buttons -->
      <div class="flex space-x-10">
        <!-- shops -->
        <div class="flex space-x-3">
          <div class="tooltip" data-tip="Event Shop"><button class="btn btn-success btn-sm" onclick="my_modal_shop1.showModal()">1.2 pt.1</button></div>
          <dialog id="my_modal_shop1" class="modal">
            <div class="modal-box bg-slate-700">
              <p class="py-4 text-lg text-white text-center">Add materials from <span class="text-error">1.2 part 1</span>
                event shop?</p>
              <p class="py-4 text-md text-white text-center"> You should add once only.</p>
              <div class="flex justify-center">
                <button class="btn btn-success btn-md mr-2" @click="addShopItems('1.21')">Yes</button>
                <button class="btn btn-error btn-md" onclick="my_modal_shop1.close()">No</button>
              </div>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>

          <div class="tooltip" data-tip="Event Shop"><button class="btn btn-success btn-sm" onclick="my_modal_shop2.showModal()">1.2 pt.2</button></div>
          <dialog id="my_modal_shop2" class="modal">
            <div class="modal-box bg-slate-700">
              <p class="py-4 text-lg text-white text-center">Add materials from <span class="text-error">1.2 part 2</span>
                event shop?</p>
              <p class="py-4 text-md text-white text-center"> You should add once only.</p>
              <div class="flex justify-center">
                <button class="btn btn-success btn-md mr-2" @click="addShopItems('1.22')">Yes</button>
                <button class="btn btn-error btn-md" onclick="my_modal_shop2.close()">No</button>
              </div>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
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
