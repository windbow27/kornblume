<script setup>
import { ref, onMounted } from 'vue';
import { useWarehouseStore } from '../../stores/WarehouseStore';
import { useDataStore } from '../../stores/DataStore';
import { sortMaterials } from '../../composables/CalculateMaterials';
import ItemWarehouse from '../item/ItemWarehouse.vue';

const emit = defineEmits({
  closeOverlay: {
    type: Function,
    required: true,
  },
});

let warehouseStore = ref(null);
let originalData = ref([]);

// Create an object to store filter states
let filterStates = ref({
  'Base Item': true,
  'Build Material': true,
  'Insight Material': true,
  'Resonate Material': true,
});

onMounted(() => {
  const warehouseData = useWarehouseStore().data;

  if (warehouseData.length === 0) {
    console.log('Setting up warehouse');
    useDataStore().items.data.forEach((item) => {
      if (item.IsReleased == true) {
        if (
          item.Category === 'Build Material' ||
          item.Category === 'Insight Material' ||
          item.Category === 'Resonate Material' ||
          item.Name === 'Dust' ||
          item.Name === 'Sharpodonty'
        ) {
          useWarehouseStore().addItem(item.Name, item.Category);
        }
      }
    });
  }

  originalData.value = warehouseData.slice(); // Copy the original data
  sortMaterials(originalData.value);
  warehouseStore.value = originalData.value;
});

const filterWarehouse = (category) => {
  // Toggle the filter state
  filterStates.value[category] = !filterStates.value[category];

  const activeFilters = Object.keys(filterStates.value).filter(
    (filter) => filterStates.value[filter]
  );

  // Filter based on the active filters
  warehouseStore.value = originalData.value.filter((item) =>
    activeFilters.includes(item.Category) && filterStates.value[item.Category]
  );
};

const handleUpdateQuantity = (materialIndex, updatedQuantity) => {
  warehouseStore.value[materialIndex].Quantity = updatedQuantity;
  useWarehouseStore().updateItem(
    warehouseStore.value[materialIndex].Name,
    updatedQuantity
  );
};

const closeOverlay = () => {
  emit('closeOverlay');
};

</script>

<template>
  <div class="list-overlay">
    <div class="custom-modal-big h-5/6 lg:h-2/3 flex flex-col items-center">
      <!-- Close button -->
      <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
        <i class="fas fa-times"></i>
      </button>
      <p class="text-white text-center font-bold"> Warehouse </p>
      <div>
        <div class="grid grid-cols-2 xl:grid-cols-4 justify-center items-center pb-5 text-center">
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-error text-xs font-bold">Base Item</span>
              <input type="checkbox" @change="filterWarehouse('Base Item')" checked="checked"
                class="checkbox checkbox-error" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-info text-xs font-bold">Build Material</span>
              <input type="checkbox" @change="filterWarehouse('Build Material')" checked="checked"
                class="checkbox checkbox-info" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-success text-xs font-bold">Insight Material</span>
              <input type="checkbox" @change="filterWarehouse('Insight Material')" checked="checked"
                class="checkbox checkbox-success" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-warning text-xs font-bold">Resonate Material</span>
              <input type="checkbox" @change="filterWarehouse('Resonate Material')" checked="checked"
                class="checkbox checkbox-warning" />
            </label>
          </div>
        </div>
      </div>

      <div class="custom-scrollbar overflow-y-scroll overflow-x-hidden flex-grow">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 ">
          <ItemWarehouse class="" v-for="(material, index) in warehouseStore" :key="index" :material="material"
            @update:quantity="handleUpdateQuantity(index, $event)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
