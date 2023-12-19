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
        initWarehouse () {

        },
        initItem (materialName: string, category: string) {
            this.data.push({ Material: materialName, Quantity: 0, Category: category });
        },
        removeItem (materialName: string) {
            this.data = this.data.filter(matl => matl.Material !== materialName)
        },
        addItem (materialName: string, quantity: number) {
            this.data = this.data.map((matl) => {
                if (matl.Material === materialName) {
                    return {
                        ...matl,
                        Quantity: matl.Quantity + quantity
                    }
                } else { return { ...matl } }
            });
        },
        updateItem (materialName: string, quantity: number) {
            this.data = this.data.map((matl) => {
                if (matl.Material === materialName) {
                    return {
                        ...matl,
                        Quantity: quantity
                    }
                } else { return { ...matl } }
            });
        },
        hasItem (materialName: string) {
            return this.data.some((matl) => matl.Material === materialName);
        },
        resetAll () {
            this.data = this.data.map((matl) => ({ ...matl, Quantity: 0 }));
        },
        resetCategory (category: string) {
            this.data = this.data.map((matl) => {
                if (matl.Category === category) {
                    return {
                        ...matl,
                        Quantity: 0
                    }
                } else { return { ...matl } }
            });
        }
    },
    persist: true
});
