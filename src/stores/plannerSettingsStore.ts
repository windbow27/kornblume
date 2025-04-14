import { defineStore } from 'pinia';

export interface IPlannerSettings {
    showUnreleasedArcanists: boolean;
    showOwnedArcanists: boolean;
    enableWilderness: boolean;
    enableLowRunCards: boolean;
}

interface IPlannerSettingsStore {
    settings: IPlannerSettings;
}

// NOTE: if we need to add new version drops data, please check the getDrops, initializeWarehouse and checkWarehouse functions
// refer to keyword: enabledUnreleasedStages_v1_7

export const usePlannerSettingsStore = defineStore('plannerSettings', {
    state: (): IPlannerSettingsStore => ({
        settings: {
            showUnreleasedArcanists: false,
            showOwnedArcanists: false,
            enableWilderness: true,
            enableLowRunCards: true
        }
    }),
    persist: true
});
