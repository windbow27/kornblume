<script setup>

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    }
});

const closeOverlay = () => {
    emit('closeOverlay');
};

</script>

<template>
  <div class="list-overlay">
    <div class="custom-modal-small h-auto">
      <!-- Close button -->
      <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<style scoped></style>
