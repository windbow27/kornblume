import { defineStore } from 'pinia';

export const useDataStore = defineStore('dataStore', {
    state: () => ({
        arcanists: {
            data: null,
            loaded: false
        },
        calculations: {
            data: null,
            loaded: false
        },
        items: {
            data: null,
            loaded: false
        },
        psychubes: {
            data: null,
            loaded: false
        },
        formulas: {
            data: null,
            loaded: false
        },
        drops: {
            data: null,
            loaded: false
        }, 
        drops1_4: {
            data: null,
            loaded: false
        },
        dynamicDrops: {
            data: null,
            loaded: true
        },
        shops: {
            data: null,
            loaded: false
        },
    }),
    actions: {
        async fetchData(module) {
            if (this[module].loaded !== true) {
                console.log('DataStore', `fetching ${module}...`);
                return fetch(`./data/${module}.json`)
                    .then((response) => response.json())
                    .then((json) => {
                        this[module].data = json;
                        this[module].loaded = true;
                    });
            } else {
                return Promise.resolve();
            }
        },
        async ensureData(...modules) {
            return Promise.all(modules.map((module) => this.fetchData(module)));
        }
    },
});