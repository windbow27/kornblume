import { defineStore } from 'pinia';

export interface IPlannerSettings {
    showUnreleasedArcanists: boolean,
    enabledUnreleasedStages: boolean,
    enableGreedyMethod: boolean,
    enableWilderness: boolean,
    enableLowRunCards: boolean
}

interface IPlannerSettingsStore {
    settings: IPlannerSettings
}

export const usePlannerSettingsStore = defineStore('plannerSettings', {
    state: (): IPlannerSettingsStore => ({
        settings: {
            showUnreleasedArcanists: false,
            enabledUnreleasedStages: false,
            enableGreedyMethod: true,
            enableWilderness: true,
            enableLowRunCards: true
        }
    }),
    persist: true
});
