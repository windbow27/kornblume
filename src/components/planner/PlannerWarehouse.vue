<script setup>
import { ref, onMounted, computed } from 'vue';
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

const checkedCategories = ref({
  'Base Item': false,
  'Build Material': false,
  'Insight Material': false,
  'Resonate Material': false,
});

onMounted(() => {
  if (useWarehouseStore().data.length === 0) {
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

  sortMaterials(useWarehouseStore().data);
});

const handleUpdateQuantity = (materialName, updatedQuantity) => {
  useWarehouseStore().updateItem(materialName, updatedQuantity);
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
      <p class="text-white text-center font-bold text-lg"> Warehouse </p>

      <div>
        <div class="grid grid-cols-2 xl:grid-cols-4 justify-center items-center pb-5 text-center">
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-error text-xs font-bold">Base Item</span>
              <input type="checkbox" @change="filterWarehouse('Base Item')" 
                class="checkbox checkbox-error" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-info text-xs font-bold">Build Material</span>
              <input type="checkbox" @change="filterWarehouse('Build Material')" 
                class="checkbox checkbox-info" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-success text-xs font-bold">Insight Material</span>
              <input type="checkbox" @change="filterWarehouse('Insight Material')"
                class="checkbox checkbox-success" />
            </label>
          </div>
          <div class="form-control items-center">
            <label class="label cursor-pointer space-x-2">
              <span class="label-text text-warning text-xs font-bold">Resonate Material</span>
              <input type="checkbox" @change="filterWarehouse('Resonate Material')" 
                class="checkbox checkbox-warning" />
            </label>
          </div>
        </div>
      </div>

      <div class="custom-scrollbar overflow-y-scroll overflow-x-hidden flex-grow">
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8">
          <ItemWarehouse class="" v-for="material in filteredWarehouse" :key="material.Material"
            :material="material" @update:quantity="handleUpdateQuantity(material.Material, $event)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
