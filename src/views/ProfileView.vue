<template>
    <div class="responsive-spacer">
        <h2 class="text-2xl text-white font-bold mb-4 lg:mb-6">Profile</h2>
        <p class="text-white"> You can export or import your data here. Multiple profiles is WIP.</p>
        <div class="flex justify-center items-center p-2">
            <button @click="exportStores" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Export Stores
            </button>
    
            <input type="file" ref="fileInput" @change="importStores" accept=".json" class="ml-4" style="display: none;" />
            <button @click="triggerFileInput"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2">
                Import Stores
            </button>
        </div>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { exportLocalStorageToJson, importLocalStorageFromJson } from '../stores/ProfileStore.js';

const fileInput = ref(null);

const exportStores = () => {
    exportLocalStorageToJson();
}

const triggerFileInput = () => {
    // Trigger the file input programmatically
    fileInput.value.click();
}

const importStores = (event) => {
    const file = event.target.files[0];
    if (file) {
        importLocalStorageFromJson(file);
    }
}
</script>
  
<style scoped></style>
  