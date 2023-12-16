import { defineStore } from 'pinia';

export const useWildernessStore = defineStore('wilderness', {
    state: () => ({
        settings: {
            dust1: 6,
            dust2: 6,
            dust3: 6,
            gold1: 6,
            gold2: 6,
            gold3: 6,
            vigor: 0,
            lazyModo: false,
            wildernessOutput: {
                dust: 19440,
                gold: 8640
            }
        }
    }),
    persist: true
});
