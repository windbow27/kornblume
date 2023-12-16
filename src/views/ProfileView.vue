<template>
    <div class="responsive-spacer">
        <h2 class="text-2xl text-white font-bold mb-4 lg:mb-6">Profile</h2>
        <p class="text-white"> You can export or import your data here.</p>
        <div class="flex justify-center items-center p-2">
            <button @click="exportStores" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Export Data
            </button>

            <input type="file" ref="fileInput" @change="importStores" accept=".json" class="ml-4" style="display: none;" />
            <button @click="triggerFileInput"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2">
                Import Data
            </button>
        </div>

        <h2 class="text-2xl text-white font-bold my-4 lg:my-6">Danger Zone</h2>
        <p class="text-white">If you encounter any unexpected issues with the site, you can reset your data. Sorry for the
            inconvenience.</p>
        <div class="flex justify-center items-center p-2">
            <button onclick="my_modal_2.showModal()"
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                Reset Data
            </button>
        </div>

        <dialog id="my_modal_2" class="modal">
            <div class="modal-box custom-gradient-gray-blue flex flex-col justify-center items-center">
                <p class="pb-4 text-white text-center">Once you delete your data, there is no going back.</p>
                <p class="pb-4 text-white text-center">Please be certain.</p>
                <button @click="resetStores"
                    class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2">
                    Reset
                </button>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </div>
</template>

  
<script setup lang="ts" name="ProfileView">
import { ref, Ref } from 'vue';
import { exportLocalStorageToJson, importLocalStorageFromJson } from '../stores/ProfileStore.js';

const fileInput = ref(null);

const exportStores = () => {
    exportLocalStorageToJson();
}

const triggerFileInput = () => {
    // Trigger the file input programmatically
    (fileInput as Ref<HTMLElement | null>).value?.click();
}

const importStores = (event) => {
    const file = event.target.files[0];
    if (file) {
        importLocalStorageFromJson(file);
    }
}

const resetStores = () => {
    const storeKeys = ['plannerSettings', 'planner', 'wilderness', 'warehouse'];
    storeKeys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
}

</script>
  
<style scoped></style>
  