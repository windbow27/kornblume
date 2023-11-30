import { defineStore } from 'pinia';

export const useWarehouseStore = defineStore('warehouse', {
    state: () => ({
        isActive: false,
        data: [],
    }),
    persist: true,
});