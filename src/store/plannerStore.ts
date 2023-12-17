import { defineStore } from 'pinia';

interface IPlannerStore {
    // FIXME: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedArcanists: any
}

export const usePlannerStore = defineStore('planner', {
    state: (): IPlannerStore => ({
        selectedArcanists: []
    }),
    persist: true
});
