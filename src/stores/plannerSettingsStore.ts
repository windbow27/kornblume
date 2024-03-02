import { defineStore } from 'pinia';

export interface IPlannerSettings {
    showUnreleasedArcanists: boolean,
    enableWilderness: boolean,
    enableLowRunCards: boolean
}

interface IPlannerSettingsStore {
    settings: IPlannerSettings
}

// NOTE: if we need to add new version drops data, just modify the getDrops, initializeWarehouse and checkWarehouse functions
// refer to keyword: enabledUnreleasedStages

export const usePlannerSettingsStore = defineStore('plannerSettings', {
    state: (): IPlannerSettingsStore => ({
        settings: {
            showUnreleasedArcanists: false,
            // enabledUnreleasedStages: false,
            // enableGreedyMethod: true,
            enableWilderness: true,
            enableLowRunCards: true
        }
    }),
    persist: true
});
