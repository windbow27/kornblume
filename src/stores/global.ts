import { defineStore } from 'pinia'

interface INeededMaterialsMapping {
    [materialName: string]: number,
}

interface IGlobalStore {
    isEditingWarehouse: boolean,
    isEditingMaterial: string,
    neededMaterialsMapping: INeededMaterialsMapping
}

// can set some global state here, but never let it persist
export const useGlobalStore = defineStore('global', {
    state: (): IGlobalStore => ({
        isEditingWarehouse: false,
        isEditingMaterial: '',
        neededMaterialsMapping: {}
    }),
    actions: {
        setIsEditingWarehouse (isEditing: boolean) {
            this.isEditingWarehouse = isEditing
        },
        getNeededMaterialsQuantity (materialName) {
            return this.neededMaterialsMapping[materialName] || 0
        },
        updateNeededMaterialsMapping (mapping) {
            this.neededMaterialsMapping = {
                ...mapping
            }
        },
        setIsEditingMaterial (editingMaterial?: string) {
            this.isEditingMaterial = editingMaterial || ''
        }
    }
})
