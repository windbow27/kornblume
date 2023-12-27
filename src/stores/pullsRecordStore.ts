import { defineStore } from 'pinia';

export interface IPull {
    PullNumber: number,
    ArcanistName: string,
    Rarity: number,
    BannerType: string,
    Timestamp: number
}

interface IPullsRecord extends Array<IPull>{}

interface IPullsRecordStore {
    keys: number[],
    values: IPullsRecord[]
}

export const usePullsRecordStore = defineStore('pulls', {
    state: (): IPullsRecordStore => ({
        keys: [] as number[],
        values: [] as IPullsRecord[]
    }),
    actions: {
        updatePullsRecord (newData: Map<number, IPull[]>) {
            this.keys = [
                ...newData.keys()
            ].flat()
            this.values = [
                ...newData.values()
            ]
        },
        reset () {
            this.values = []
            this.keys = []
        }
    },
    persist: true
});
