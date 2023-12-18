import { defineStore } from 'pinia';
import { ISelectedArcanist } from '@/types';

interface IPlannerStore {
    selectedArcanists: ISelectedArcanist[]
}

export const usePlannerStore = defineStore('planner', {
    state: (): IPlannerStore => ({
        selectedArcanists: []
    }),
    persist: true
});
