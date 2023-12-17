import { defineStore } from 'pinia';

interface IResource {
    Category: string,
    Material: string,
    Quantity: number
}

interface IWarehouse extends Array<IResource>{}

interface IWarehouseStore {
    resource: IWarehouse,
}

export const useWarehouseStore = defineStore('warehouse', {
    state: (): IWarehouseStore => ({
        resource: []
    }),
    // TODO: Review these actions while refactoring related components/composables
    actions: {
        addItem (materialName: string, category: string) {
            this.resource.push({ Material: materialName, Quantity: 0, Category: category });
        },
        removeItem (materialName: string) {
            for (let i = 0; i < this.resource.length; i++) {
                if (this.resource[i].Material === materialName) {
                    this.resource.splice(i, 1);
                }
            }
        },
        addShopItem (materialName: string, quantity: number) {
            for (let i = 0; i < this.resource.length; i++) {
                if (this.resource[i].Material === materialName) {
                    this.resource[i].Quantity += Number(quantity);
                    break;
                }
            }
        },
        updateItem (materialName: string, quantity: number) {
            for (let i = 0; i < this.resource.length; i++) {
                if (this.resource[i].Material === materialName) {
                    this.resource[i].Quantity = Number(quantity);
                    break;
                }
            }
        },
        itemExists (materialName: string) {
            for (let i = 0; i < this.resource.length; i++) {
                if (this.resource[i].Material === materialName) {
                    return true;
                }
            }
            return false;
        },
        resetAll () {
            this.resource = [];
        },
        resetCategory (category: string) {
            for (let i = 0; i < this.resource.length; i++) {
                if (this.resource[i].Category === category) {
                    this.resource[i].Quantity = 0;
                }
            }
        }
    },
    persist: true
});
