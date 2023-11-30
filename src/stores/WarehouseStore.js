import { defineStore } from 'pinia';

export const useWarehouseStore = defineStore('warehouse', {
    state: () => ({
        isActive: false,
        data: [],
        loaded: false,
    }),
    actions: {
        toggle() {
            this.isActive = !this.isActive;
        },
        setData(data) {
            this.data = data;
        },
        setLoaded() {
            this.loaded = true;
        },
        addItem(material, category) {
            this.data.push({Material: material, Quantity: 0, Category: category});
        },
        updateItem(material, quantity) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === material) {
                    this.data[i].Quantity = quantity;
                    break;
                }
            }
        },
        reset() {
            this.data = [];
            this.loaded = false;
        },
    },
    persist: true,
});