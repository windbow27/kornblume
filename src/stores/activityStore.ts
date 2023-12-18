import { defineStore } from 'pinia';

interface IActivityStore {
    settings: {
        roaringMonth: boolean,
        refills: number,
        activity: number,
        cost: number,
    }
}

export const useActivityStore = defineStore('activity', {
    state: (): IActivityStore => ({
        settings: {
            roaringMonth: false,
            refills: 0,
            activity: 240,
            cost: 0
        }
    }),
    persist: true
});
