import { defineStore } from 'pinia';

interface IPlannerSettingsStore {
    settings: {
        showUnreleasedArcanists: boolean,
        enabledUnreleasedStages: boolean
    }
}

export const usePlannerSettingsStore = defineStore('plannerSettings', {
    state: (): IPlannerSettingsStore => ({
        settings: {
            showUnreleasedArcanists: false,
            enabledUnreleasedStages: false
        }
    }),
    persist: true
});
