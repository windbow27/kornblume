import { defineStore } from 'pinia'
import { IArcanists, IFormulas, IItems, IPsychubes, IShops, IStages } from '@/types';

const getDataSize = data => {
    if (!data) {
        return 0;
    }
    return data.constructor === Object ? Object.keys(data).length : data.length || 0;
}

interface IDataStore {
  arcanists: IArcanists,
  stages: IStages | null,
  stages1_4: IStages| null,
  formulas: IFormulas,
  items: IItems,
  psychubes: IPsychubes,
  shops: IShops,
}

export const useDataStore = defineStore('dataStore', {
    state: (): IDataStore => ({
        arcanists: [],
        stages: null,
        stages1_4: null,
        formulas: [],
        items: [],
        psychubes: [],
        shops: []
    }),
    actions: {
        async loadJsonData (module: string) {
            console.log('DataStore', `fetching ${module}...`);
            return fetch(`./data/${module}.json`)
                .then((response) => response.json())
                .then((json) => {
                    this[module] = json;
                });
        },
        async checkAndLoadJsonData (module: string) {
            if (getDataSize(this[module]) === 0) {
                return this.loadJsonData(module);
            } else {
                return Promise.resolve();
            }
        },
        async checkDataLoaded (modules: string[]) {
            return Promise.all(
                modules.map(
                    (module) => this.checkAndLoadJsonData(module)
                )
            );
        }
    }
})
