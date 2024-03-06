<script setup lang="ts" name="ProfileView">
import { ref } from 'vue'
import { exportKornblumeData, importKornblumeData, resetKornblumeData, setKornblumeData, getKornblumeData } from '@/utils';
import { usePullsRecordStore } from '@/stores/pullsRecordStore';
import { GApiSvc } from '@/composables/gApi';

const fileInput = ref<HTMLElement>(null!);
const isGapiReady = ref(false);

// const isSignedIn = ref(GApiSvc.isSignedIn);

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

const loginGoogleDrive = async () => {
    // Login to Google Drive
    await GApiSvc.signIn();
    console.log(GApiSvc.isSignedIn());
    const files = await GApiSvc.getFiles();
    const file = files.find((file: { name: string; }) => file.name === 'kornblume.json');

    if (!file) {
        // If 'kornblume.json' doesn't exist, create it with the data from localStorage
        await GApiSvc.createFile('kornblume.json', JSON.stringify(localStorage));
        console.log('kornblume.json created');
    } else {
        // If 'kornblume.json' does exist, download it
        console.log('kornblume.json exists. importing data...')
        const fileData = await GApiSvc.downloadFile(file.id);
        setKornblumeData(fileData);
    }
}

const signOutGoogleDrive = () => {
    GApiSvc.signOut();
}

GApiSvc.init().then(async () => {
    isGapiReady.value = true;
    if (GApiSvc.isLogged()) {
        console.log(GApiSvc.isSignedIn());
        const files = await GApiSvc.getFiles();
        console.log(files);
        const file = files.find((file: { name: string; }) => file.name === 'kornblume.json');
        if (!file) {
        // If 'kornblume.json' doesn't exist, create it with the data from localStorage
            GApiSvc.createFile('kornblume.json', JSON.stringify(localStorage));
        } else {
        // If 'kornblume.json' does exist, download it
            const localData = getKornblumeData();
            const driveData = GApiSvc.downloadFile(file.id);
            const actualDriveData = await driveData;
            if (localData.lastModified < actualDriveData.lastModified) {
                console.log('drive is newer. updating local data')
                setKornblumeData(driveData);
            } else {
                console.log('local is newer. updating drive data')
                GApiSvc.updateFile(file.id, JSON.stringify(localStorage));
            }
        }
    }
});

</script>

<template>
    <div class="responsive-spacer">
        <div class="pb-6">
            <h2 class="text-2xl text-white font-bold mb-2 lg:mb-4">{{ $t('profile') }}</h2>
            <p class="text-white"> {{ $t('you-can-export-or-import-your-data-here') }}</p>
            <div class="flex justify-center items-center p-2 space-x-5">
                <button @click="exportStores"
                    class="btn btn-info hover:bg-gradient-to-bl bg-gradient-to-br from-info to-blue-400 text-black font-bold py-2 px-4 rounded">
                    {{ $t('export-data') }} </button>

                <input type="file" ref="fileInput" @change="importStores" accept=".json" class="ml-4"
                    style="display: none;" />
                <button @click="triggerFileInput"
                    class="btn btn-success hover:bg-gradient-to-bl bg-gradient-to-br from-success to-green-600 text-black font-bold py-2 px-4 rounded ml-2">
                    {{ $t('import-data') }} </button>
            </div>
        </div>

        <div class="pb-6">
            <h2 class="text-2xl text-white font-bold mb-2 lg:mb-4"> Google Drive Save </h2>
            <p class="text-white"> You can use Google Drive and let Kornblume save and sync data between devices. We
                only read and write files that Kornblume created.</p>
            <div class="flex justify-center items-center p-2 space-x-5">
                <button :disabled="!isGapiReady"
                    class="btn btn-success hover:bg-gradient-to-bl bg-gradient-to-br from-success to-green-600 text-black font-bold py-2 px-4 rounded ml-2"
                    @click="loginGoogleDrive">Login Google Drive <i class="fa-brands fa-google-drive"></i> </button>
                <button :disabled="!isGapiReady"
                    class="btn btn-info hover:bg-gradient-to-bl bg-gradient-to-br from-info to-blue-400 text-black font-bold py-2 px-4 rounded"
                    @click="signOutGoogleDrive">Sign out Google Drive <i class="fa-brands fa-google-drive"></i></button>
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
                <button onclick="resetAll.showModal()"
                    class="btn btn-error custom-button-error text-black font-bold py-2 px-4 rounded ml-2">
                    {{ $t('reset-data') }} </button>
            </div>

            <dialog id="resetTracker" class="modal">
                <div
                    class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">{{
                $t('once-you-delete-your-summon-tracker-data-there-is-no-going-back') }}</p>
                    <p class="pb-4 text-white text-center">{{ $t('please-be-certain') }}</p>
                    <button @click="resetTracker"
                        class="btn btn-error custom-button-error text-black font-bold py-2 px-4 rounded ml-2">
                        {{ $t('reset-tracker') }} </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="resetAll" class="modal">
                <div
                    class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">{{ $t('once-you-delete-your-data-there-is-no-going-back') }}
                    </p>
                    <p class="pb-4 text-white text-center">{{ $t('please-be-certain') }}</p>
                    <button @click="resetStores"
                        class="btn btn-error custom-button-error text-black font-bold py-2 px-4 rounded ml-2">
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
