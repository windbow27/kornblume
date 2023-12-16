import { defineStore } from 'pinia';

export const useActivityStore = defineStore('activity', {
    state: () => ({
        settings: {
            roaringMonth: false,
            refills: 0,
            activity: 240,
            cost: 0,
        },
    }),
    persist: true,
});