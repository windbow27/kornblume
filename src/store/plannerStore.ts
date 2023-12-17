import { defineStore } from 'pinia';

interface IPlannerStore {
    // FIXME: give selectedArcanists a type definition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedArcanists: any
}

export const usePlannerStore = defineStore('planner', {
    state: (): IPlannerStore => ({
        selectedArcanists: []
    }),
    persist: true
});
