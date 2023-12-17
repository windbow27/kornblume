import { defineStore } from 'pinia';

interface IResource {
    Category: string,
    Material: string,
    Quantity: number
}

interface IWarehouse extends Array<IResource>{}

interface IWarehouseStore {
    data: IWarehouse,
}

export const useWarehouseStore = defineStore('warehouse', {
    state: (): IWarehouseStore => ({
        data: []
    }),
    actions: {
        addItem (materialName: string, category: string) {
            this.data.push({ Material: materialName, Quantity: 0, Category: category });
        },
        removeItem (materialName: string) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === materialName) {
                    this.data.splice(i, 1);
                }
            }
        },
        addShopItem (materialName: string, quantity: number) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === materialName) {
                    this.data[i].Quantity += Number(quantity);
                    break;
                }
            }
        },
        updateItem (materialName: string, quantity: number) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === materialName) {
                    this.data[i].Quantity = Number(quantity);
                    break;
                }
            }
        },
        itemExists (materialName: string) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Material === materialName) {
                    return true;
                }
            }
            return false;
        },
        resetAll () {
            this.data = [];
        },
        resetCategory (category: string) {
            for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].Category === category) {
                    this.data[i].Quantity = 0;
                }
            }
        }
    },
    persist: true
});
