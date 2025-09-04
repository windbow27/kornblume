<script lang="ts" setup name="App">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useGlobalStore } from './stores/global';
import { setGlobalLastModifiedTimestamp } from '@/utils/localStorage';
import { removeDuplicateWarehouseItems } from '@/composables/warehouse';

import Navbar from './components/navbar/Navbar.vue';
import LoadingScreen from './components/navbar/LoadingScreen.vue';

const globalStore = useGlobalStore();

function getLocalStorageDataByKey(key) {
    return JSON.parse(localStorage.getItem(key) as string);
}

function setLocalStorageDataByKey(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// PLEASE CAREFULLY MODIFY THE FUNCTION HERE
// otherwise, it may lead to data incompatibility and potentially break users' data
function clearLegacyData() {
    const plannerSettingsStoreKey = 'plannerSettings';
    const plannerSettingsStoreData = getLocalStorageDataByKey(
        plannerSettingsStoreKey
    );
    if (plannerSettingsStoreData) {
        // only do this if there's data already stored in users' devices
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
            settings: {
                // enableGreedyMethod,
                // enabledUnreleasedStages,
                ...restSettings
            }
        } = plannerSettingsStoreData;
        // remove the legacy data keys: enableGreedyMethod and enabledUnreleasedStages
        const newPlannerSettingsStoreData = {
            ...plannerSettingsStoreData,
            settings: restSettings
        };
        setLocalStorageDataByKey(
            plannerSettingsStoreKey,
            newPlannerSettingsStoreData
        );
    }

    const warehouseStoreKey = 'warehouse';
    const warehouseStoreData = getLocalStorageDataByKey(warehouseStoreKey);
    if (warehouseStoreData) {
        // only do this if there's data already stored in users' devices
        const { data: warehouseData } = warehouseStoreData;
        const legacyMatlNameMapping = {
            Caduceus: 'Serpent Scepter',
            'Crimson Gold Compass': 'Golden Compass',
            'Glimmering Mothwing Lamp': 'Glowing Mothwing',
            'Curved Goose Neck': 'Goose Neck',
            'Gold Dust Beetle': 'Golden Beetle',
            'Winged Key': 'Winged Key',
            'Ceaseless Wheel': 'Perpetual Cog',
            'Dried Cicada Wing': 'Cicada Wings',
            'Wheel and Axle Core': 'Watch Core'
        };
        const newWarehouseData = warehouseData.map((matlInfo) => {
            const newMatlName =
                legacyMatlNameMapping[matlInfo.Material] || matlInfo.Material;
            return {
                ...matlInfo,
                Material: newMatlName
            };
        });
        const newWarehouseStoreData = {
            ...warehouseStoreData,
            data: newWarehouseData
        };
        setLocalStorageDataByKey(warehouseStoreKey, newWarehouseStoreData);
    }
}

onMounted(() => {
    clearLegacyData();
    setGlobalLastModifiedTimestamp();
    removeDuplicateWarehouseItems();
});
</script>

<template>
    <div class="bg-gradient-to-r from-gray-900 to-blue-950">
        <header>
            <Navbar />
        </header>
        <main class="z-0 min-h-screen flex flex-col pt-14">
            <LoadingScreen v-if="globalStore.isLoading"></LoadingScreen>
            <RouterView v-else></RouterView>
        </main>
    </div>
</template>

<style scoped>
body,
html {
    margin: 0;
    padding: 0;
}
</style>
