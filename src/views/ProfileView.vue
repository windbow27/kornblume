<!-- eslint-disable no-unused-vars -->
<script setup lang="ts" name="ProfileView">
import { ref } from 'vue'
import { exportKornblumeData, importKornblumeData, resetKornblumeData } from '@/utils';
import { usePullsRecordStore } from '@/stores/pullsRecordStore';
import {
    useTokenClient,
    type AuthCodeFlowSuccessResponse,
    type AuthCodeFlowErrorResponse
} from 'vue3-google-signin';
import { GApiSvc } from '@/composables/gApi';

const fileInput = ref<HTMLElement>(null!)

const exportStores = () => {
    exportKornblumeData()
}

const triggerFileInput = () => {
    // Trigger the file input programmatically
    fileInput.value.click()
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

const isGapiReady = ref(false);
GApiSvc.init().then(() => {
    isGapiReady.value = true;
});

const handleOnSuccess = async (response: AuthCodeFlowSuccessResponse) => {
    console.log('Access Token: ' + response.access_token);

    const result = await GApiSvc.listFiles();
    console.log(result)
};

const handleOnError = (errorResponse: AuthCodeFlowErrorResponse) => {
    console.log('Error: ', errorResponse);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { isReady, login } = useTokenClient({
    scope: 'https://www.googleapis.com/auth/drive',
    onSuccess: handleOnSuccess,
    onError: handleOnError
});

const syncDataFromGoogleDrive = async () => {
    // Login to Google Drive
    login();

    // Check if 'kornblume.json' exists
    const files = await GApiSvc.listFiles();
    const file = files.find(file => file.name === 'kornblume.json');
    console.log(file)

    if (!file) {
    // If 'kornblume.json' doesn't exist, create it with the data from localStorage
        await GApiSvc.createFile('kornblume.json', JSON.stringify(localStorage));
        console.log('File created');
    } else {
    // If 'kornblume.json' does exist, download it
        console.log('File exists')
        const fileData = await GApiSvc.downloadFile(file.id);

        // Compare the timestamp with the data in localStorage
        const localData = JSON.parse(localStorage.getItem('kornblume'));
        if (new Date(fileData.timestamp) > new Date(localData.timestamp)) {
            // If the Google Drive data is newer, update localStorage
            localStorage.setItem('kornblume', JSON.stringify(fileData));
        } else {
            // If the localStorage data is newer, update the file in Google Drive
            await GApiSvc.updateFile(file.id, JSON.stringify(localData));
        }
    }
}

</script>

<template>
    <div class="responsive-spacer">
        <div class="pb-6">
            <h2 class="text-2xl text-white font-bold mb-2 lg:mb-4">{{ $t('profile') }}</h2>
            <p class="text-white"> {{ $t('you-can-export-or-import-your-data-here') }}</p>
            <div class="flex justify-center items-center p-2 space-x-5">
                <button @click="exportStores" class="btn btn-info hover:bg-gradient-to-bl bg-gradient-to-br from-info to-blue-400 text-black font-bold py-2 px-4 rounded">
                    {{ $t('export-data') }} </button>
                <!-- <button @click="exportDataToGoogleDrive" class="btn btn-info hover:bg-gradient-to-bl bg-gradient-to-br from-info to-blue-400 text-black font-bold py-2 px-4 rounded">
                    Export Data from Google Drive </button> -->

                <input type="file" ref="fileInput" @change="importStores" accept=".json" class="ml-4"
                    style="display: none;" />
                <button @click="triggerFileInput" class="btn btn-success hover:bg-gradient-to-bl bg-gradient-to-br from-success to-green-600 text-black font-bold py-2 px-4 rounded ml-2">
                    {{ $t('import-data') }} </button>

                <!-- <button :disabled="!isReady"  @click="importDataFromGoogleDrive" class="btn btn-success hover:bg-gradient-to-bl bg-gradient-to-br from-success to-green-600 text-black font-bold py-2 px-4 rounded ml-2">
                    Import Data From Google Drive </button> -->
                <button :disabled="!isGapiReady" @click="syncDataFromGoogleDrive" class="btn btn-success hover:bg-gradient-to-bl bg-gradient-to-br from-success to-green-600 text-black font-bold py-2 px-4 rounded ml-2">
                    Sync Data From Google Drive </button>
            </div>
        </div>

        <div class="pb-6">
            <h2 class="text-2xl text-white font-bold mb-2 lg:mb-4">{{ $t('danger-zone') }}</h2>
            <p class="text-white">{{
                $t('if-you-encounter-any-unexpected-issues-with-the-site-you-can-reset-your-data-sorry-for-the-inconvenience')
            }}</p>
            <div class="flex flex-wrap justify-center items-center p-2 space-x-5 gap-y-5">
                <button onclick="resetTracker.showModal()"
                    class="btn btn-error bg-gradient-to-br hover:bg-gradient-to-bl from-error to-red-500/50 text-black font-bold py-2 px-4 rounded ml-2">
                    {{ $t('reset-tracker') }} </button>
                <button onclick="resetAll.showModal()" class="btn btn-error custom-button-error text-black font-bold py-2 px-4 rounded ml-2">
                    {{ $t('reset-data') }} </button>
            </div>

            <dialog id="resetTracker" class="modal">
                <div class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">{{
                        $t('once-you-delete-your-summon-tracker-data-there-is-no-going-back') }}</p>
                    <p class="pb-4 text-white text-center">{{ $t('please-be-certain') }}</p>
                    <button @click="resetTracker" class="btn btn-error custom-button-error text-black font-bold py-2 px-4 rounded ml-2">
                        {{ $t('reset-tracker') }} </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="resetAll" class="modal">
                <div class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">{{ $t('once-you-delete-your-data-there-is-no-going-back') }}</p>
                    <p class="pb-4 text-white text-center">{{ $t('please-be-certain') }}</p>
                    <button @click="resetStores" class="btn btn-error custom-button-error text-black font-bold py-2 px-4 rounded ml-2">
                        {{ $t('reset-all') }} </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button> close </button>
                </form>
            </dialog>
        </div>
    </div>
</template>

<style scoped></style>
