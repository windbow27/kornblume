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
        addShopItem(material, quantity) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === material) {
                    this.data[i].Quantity += quantity;
                    break;
                }
            }
        },
        updateItem(material, quantity) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === material) {
                    this.data[i].Quantity = quantity;
                    break;
                }
            }
        },
        resetAll() {
            for (let i = 0; i < this.data.length; i++) {
                this.data[i].Quantity = 0;
            }
        },
        resetCategory(category) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Category === category) {
                    this.data[i].Quantity = 0;
                }
            }
        }
    },
    persist: true,
});