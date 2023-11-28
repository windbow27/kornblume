<script setup>
import ItemIcon from '../item/ItemIcon.vue';

const props = defineProps({
    materialList: {
        type: Array,
        required: true
    }
});

</script>

<template>
    <div class="custom-scrollbar max-h-48 pt-10 flex flex-wrap justify-center overflow-y-scroll overflow-x-hidden">
        <ItemIcon v-for="material in props.materialList" :key="material" :material="material" />
    </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: transparent transparent; /* Firefox */
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: transparent;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
