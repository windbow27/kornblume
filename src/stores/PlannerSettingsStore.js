import { defineStore } from 'pinia';

export const usePlannerSettingsStore = defineStore('plannerSettings', {
    state: () => ({
        settings: {
            showUnreleased: false,
            unreleasedDrops: false
        }
    }),
    persist: true
});
