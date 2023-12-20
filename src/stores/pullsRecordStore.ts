import { defineStore } from 'pinia';

export interface IPull {
    ArcanistName: string,
    Rarity: number,
    BannerType: string,
    SummonTime: Date
}

interface IPullsRecord extends Array<IPull>{}

interface IPullsRecordStore {
    data: IPullsRecord,
}

export const usePullsRecordStore = defineStore('pulls', {
    state: (): IPullsRecordStore => ({
        data: []
    }),
    actions: {
        updatePullsRecord (newData) {
            this.data = [
                ...newData
            ]
        }
    },
    persist: true
});
