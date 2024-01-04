<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlannerSettingsStore } from '../../stores/plannerSettingsStore';
import ArcanistIcon from './ArcanistIcon.vue';

const props = defineProps({
    arcanists: {
        type: Array,
        required: true
    }
});

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    },
    selectArcanist: {
        type: Function,
        required: true
    }
});

const { locale, t } = useI18n()
const searchQuery = ref('');

const selectArcanist = (arc) => {
    emit('selectArcanist', arc);
    closeOverlay();
};

const closeOverlay = () => {
    emit('closeOverlay');
};

const filteredArcanists = computed(() => {
    // Filter arcanists based on the searchQuery
    if (locale.value === 'en-US') {
        return props.arcanists.filter(arc => arc.Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    } else {
        return props.arcanists.filter(arc => t(arc.Name).includes(searchQuery.value));
    }
});

</script>

<template>
  <div class="list-overlay">
    <div class="custom-modal-small h-5/6 lg:h-3/4">

      <!-- Search bar -->
      <div class="relative">
        <input v-model="searchQuery" type="text" :placeholder="$t('search-arcanists')"
          class="bg-gray-800 text-white p-2 rounded-md w-11/12 focus:outline-none">
        <!-- Close button aligned with the right edge of the search bar -->
        <button @click="closeOverlay" class="absolute top-2 right-0 text-white">
          <i class="fas fa-times"></i>
        </button>
        <div class="form-control">
          <label class="cursor-pointer label justify-center space-x-5">
            <span class="label-text text-white text-md">{{ $t('show-unreleased-arcanists') }}</span>
            <input v-model="usePlannerSettingsStore().settings.showUnreleasedArcanists" type="checkbox" class="checkbox checkbox-info" />
          </label>
        </div>
      </div>

      <!-- Arcanist list with scrollbar -->
      <div class="p-2 overflow-y-auto h-5/6">
        <div v-for="arc in filteredArcanists" :key="arc.Id" @click="selectArcanist(arc)"
          class="p-4 flex items-center cursor-pointer hover:bg-gray-700 transition-colors">
          <ArcanistIcon :arcanist="arc" />
          <span class="text-white ml-8">{{ $t(arc.Name) }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
