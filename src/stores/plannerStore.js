import { defineStore } from 'pinia';

export const usePlannerStore = defineStore('planner', {
    state: () => ({
        selectedArcanists: []
    }),
    persist: true
});
