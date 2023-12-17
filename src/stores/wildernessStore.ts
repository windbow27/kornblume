import { defineStore } from 'pinia';

// TODO: Reorganize the data structure
interface IWildernessStore {
    settings: {
        dust1: number,
        dust2: number,
        dust3: number,
        gold1: number,
        gold2: number,
        gold3: number,
        vigor: number,
        lazyModo: boolean,
        wildernessOutput: {
            dust: number,
            gold: number,
        }
    }
}

export const useWildernessStore = defineStore('wilderness', {
    state: (): IWildernessStore => ({
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
