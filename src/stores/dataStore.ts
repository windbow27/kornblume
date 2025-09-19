import { defineStore } from 'pinia';
import { IArcanists, IFormulas, IItems, IPsychubes, IShops, IStages } from '@/types';

interface IDataStore {
  arcanists: IArcanists;
  stages: IStages;
  stages1_4_greedy: IStages;
  stages1_7_greedy: IStages;
  stages1_9_greedy: IStages;
  stages2_8_greedy: IStages;
  formulas: IFormulas;
  items: IItems;
  psychubes: IPsychubes;
  shops: IShops;
}

const getDataSize = (data) => {
  if (!data) {
    return 0;
  }
  return data.constructor === Object ? Object.keys(data).length : data.length || 0;
};

export const useDataStore = defineStore('dataStore', {
  state: (): IDataStore => ({
    arcanists: [],
    stages: {},
    stages1_4_greedy: {},
    stages1_7_greedy: {},
    stages1_9_greedy: {},
    stages2_8_greedy: {},
    formulas: [],
    items: [],
    psychubes: [],
    shops: []
  }),
  actions: {
    async loadJsonData(module: string) {
      console.log('DataStore', `fetching ${module}...`);
      return fetch(`./data/${module}.json`)
        .then((response) => response.json())
        .then((json) => {
          this[module] = json;
        });
    },
    async checkAndLoadJsonData(module: string) {
      if (getDataSize(this[module]) === 0) {
        return this.loadJsonData(module);
      } else {
        return Promise.resolve();
      }
    },
    async checkDataLoaded(modules: string[]) {
      return Promise.all(modules.map((module) => this.checkAndLoadJsonData(module)));
    }
  }
});
