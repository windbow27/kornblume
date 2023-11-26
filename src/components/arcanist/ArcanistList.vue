<script setup>
import { ref, computed } from 'vue';
import ArcanistIcon from './ArcanistIcon.vue';

const props = defineProps({
  arcanists: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits({
  closeOverlay: {
    type: Function,
    required: true,
  },
  selectArcanist: {
    type: Function,
    required: true,
  },
});

const selectArcanist = (arc) => {
  emit('selectArcanist', arc);
  closeOverlay();
};

const closeOverlay = () => {
  emit('closeOverlay');
};

const searchQuery = ref('');

const filteredArcanists = computed(() => {
  // Filter arcanists based on the searchQuery
  return props.arcanists.filter(arc => arc.Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

</script>

<template>
  <div class="list-overlay">
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
      bg-gradient-to-r from-gray-800 to-blue-950
      p-8 border-2 border-gray-500 rounded-md 
      w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 h-1/2">

      <!-- Search bar -->
      <div class="relative mb-4">
        <input v-model="searchQuery" type="text" placeholder="Search Arcanists"
          class="bg-gray-800 text-white p-2 rounded-md w-11/12 focus:outline-none">
        <!-- Close button aligned with the right edge of the search bar -->
        <button @click="closeOverlay" class="absolute top-2 right-0 text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Arcanist list with scrollbar -->
      <div class="p-2 overflow-y-auto h-5/6">
        <div v-for="arc in filteredArcanists" :key="arc.Id" @click="selectArcanist(arc)"
          class="p-4 flex items-center cursor-pointer hover:bg-gray-700 transition-colors">
          <ArcanistIcon :arcanist="arc" />
          <span class="text-white ml-8">{{ arc.Name }} </span>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
</style>

