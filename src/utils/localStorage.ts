import { watch } from 'vue';
import { usePlannerSettingsStore } from '@/stores/plannerSettingsStore';
import { usePlannerStore } from '@/stores/plannerStore';
import { useWildernessStore } from '@/stores/wildernessStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { usePullsRecordStore } from '@/stores/pullsRecordStore';
import { useActivityStore } from '@/stores/activityStore';

const localStorageKeys = [
    'plannerSettings',
    'planner',
    'wilderness',
    'warehouse',
    'pulls',
    'activity',
    'changelogs',
    'locale'
];

export function setGlobalLastModifiedTimestamp () {
    const plannerStore = usePlannerStore();
    const plannerSettingsStore = usePlannerSettingsStore();
    const wildernessStore = useWildernessStore();
    const warehouseStore = useWarehouseStore();
    const pullsStore = usePullsRecordStore();
    const activityStore = useActivityStore();

    const updateTimestamp = () => {
        localStorage.setItem('lastModified', new Date().toISOString());
    };

    watch(() => plannerStore.$state, updateTimestamp, { deep: true });
    watch(() => plannerSettingsStore.$state, updateTimestamp, { deep: true });
    watch(() => wildernessStore.$state, updateTimestamp, { deep: true });
    watch(() => warehouseStore.$state, updateTimestamp, { deep: true });
    watch(() => pullsStore.$state, updateTimestamp, { deep: true });
    watch(() => activityStore.$state, updateTimestamp, { deep: true });
}

export function getGlobalLastModifiedTimestamp () {
    return localStorage.getItem('lastModified');
}

function getDateTimeString (): {
    date: string,
    time: string,
    } {
    const now = new Date();

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const dateString = `${day}${month}${year}`;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}${minutes}`;

    return {
        date: dateString,
        time: timeString
    }
}

function triggerJsonDataDownload (jsonDataString: string): void {
    const blob = new Blob([jsonDataString], { type: 'application/json' });

    const { date: dateString, time: timeString } = getDateTimeString();
    const jsonFileName = `kornblume_data_${dateString}_${timeString}.json`;

    // Create a <a> element with download attribute that points to the file to download
    const anchor = document.createElement('a');
    anchor.download = jsonFileName;
    anchor.href = URL.createObjectURL(blob);

    document.body.appendChild(anchor);
    anchor.click();

    // Ensure to remove the element from DOM eventually
    setTimeout(() => document.body.removeChild(anchor));
}

export function getKornblumeData () {
    const exportingData: { [key: string]: string } = {};
    localStorageKeys.forEach((localStorageKey: string) => {
        exportingData[localStorageKey] = localStorage.getItem(localStorageKey) ?? '';
    });
    try {
        return exportingData;
    } catch (error) {
        console.error('Error exporting data:', error);
        return {};
    }
}

export function exportKornblumeData () {
    const exportingData = {};
    localStorageKeys.forEach((localStorageKey: string) => {
        exportingData[localStorageKey] = localStorage.getItem(localStorageKey)
    })

    try {
        const jsonDataString = JSON.stringify(exportingData, null, 2)
        triggerJsonDataDownload(jsonDataString)
    } catch (error) {
        console.error('Error exporting data:', error);
    }
}

export function setKornblumeData (fileData: object) {
    try {
        localStorageKeys.forEach((localStorageKey: string) => {
            if (fileData[localStorageKey]) {
                localStorage.setItem(localStorageKey, fileData[localStorageKey]);
            }
        });
        // setTimeout(() => window.location.reload());
    } catch (error) {
        console.error('Error setting data:', error);
    }
}

export function importKornblumeData (jsonFile) {
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const importedData = JSON.parse(event.target?.result as string);

            // Assume importedData has the same structure as localStorageData
            localStorageKeys.forEach((localStorageKey: string) => {
                localStorage.setItem(localStorageKey, importedData?.[localStorageKey])
            })

            console.log('Import successful!');
            // Ensure to reload eventually
            setTimeout(() => window.location.reload());
        } catch (error) {
            console.error('Error importing data:', error);
        }
    };

    reader.readAsText(jsonFile);
}

export function resetKornblumeData () {
    localStorageKeys.forEach((localStorageKey) => localStorage.removeItem(localStorageKey))
    // Ensure to reload eventually
    setTimeout(() => window.location.reload());
}
