<template>
    <div class="responsive-spacer">
        <div class="pb-6">
            <h2 class="text-2xl text-white font-bold mb-2 lg:mb-4">Profile</h2>
            <p class="text-white"> You can export or import your data here.</p>
            <div class="flex justify-center items-center p-2 space-x-5">
                <button @click="exportStores" class="btn btn-info text-black font-bold py-2 px-4 rounded">
                    Export Data
                </button>

                <input type="file" ref="fileInput" @change="importStores" accept=".json" class="ml-4" style="display: none;" />
                <button @click="triggerFileInput"
                    class="btn btn-success text-black font-bold py-2 px-4 rounded ml-2">
                    Import Data
                </button>
            </div>
        </div>

        <div class="pb-6">
            <h2 class="text-2xl text-white font-bold mb-2 lg:mb-4">Danger Zone</h2>
            <p class="text-white">If you encounter any unexpected issues with the site, you can reset your data. Sorry for the
                inconvenience.</p>
            <div class="flex justify-center items-center p-2 space-x-5">
                <button onclick="resetTracker.showModal()"
                    class="btn btn-error text-black font-bold py-2 px-4 rounded ml-2">
                    Reset Tracker
                </button>
                <button onclick="resetAll.showModal()"
                    class="btn btn-error text-black font-bold py-2 px-4 rounded ml-2">
                    Reset Data
                </button>
            </div>

            <dialog id="resetTracker" class="modal">
                <div class="modal-box custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">Once you delete your Summon Tracker data, there is no going back.</p>
                    <p class="pb-4 text-white text-center">Please be certain.</p>
                    <button @click="resetTracker"
                        class="btn btn-error text-black font-bold py-2 px-4 rounded ml-2">
                        Reset Tracker
                    </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="resetAll" class="modal">
                <div class="modal-box custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">Once you delete your data, there is no going back.</p>
                    <p class="pb-4 text-white text-center">Please be certain.</p>
                    <button @click="resetStores"
                        class="btn btn-error text-black font-bold py-2 px-4 rounded ml-2">
                        Reset All
                    </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
        </div>
</template>

<script setup lang="ts" name="ProfileView">
import { ref, Ref } from 'vue'
import { exportKornblumeData, importKornblumeData, resetKornblumeData } from '@/utils';
import { usePullsRecordStore } from '@/stores/pullsRecordStore';

const fileInput = ref(null)

const exportStores = () => {
    exportKornblumeData()
}

const triggerFileInput = () => {
    // Trigger the file input programmatically
    (fileInput as Ref<HTMLElement | null>).value?.click()
}

const importStores = (event) => {
    const file = event.target.files[0]
    if (file) {
        importKornblumeData(file)
    }
}

const resetStores = () => {
    resetKornblumeData()
}

const resetTracker = () => {
    usePullsRecordStore().reset()
    window.location.reload()
}
</script>

<style scoped></style>
