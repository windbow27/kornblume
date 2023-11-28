<script setup>
import SelectList from '../common/SelectList.vue';

const emit = defineEmits({
  closeOverlay: {
    type: Function,
    required: true,
  }
});

const closeOverlay = () => {
  emit('closeOverlay');
};

</script>

<template>
    <div class="list-overlay">
      <div class="custom-modal-small">
        <!-- Close button aligned with the right edge of the search bar -->
        <button @click="closeOverlay" class="absolute top-2 right-0 text-white">
          <i class="fas fa-times"></i>
        </button>
        <div class="p-2 overflow-y-auto h-5/6">
        </div>
      </div>
    </div>
  </template>

<style scoped>

</style>