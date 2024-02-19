import { defineStore } from 'pinia'
import { IMaterialUnit, IStage } from '@/types'

interface INeededMaterialsMapping {
    [materialName: string]: number,
}

interface IGlobalStore {
    isEditingWarehouse: boolean,
    isEditingMaterial: string,
    neededRawMaterialsMapping: INeededMaterialsMapping,
    neededMaterialsMapping: INeededMaterialsMapping,
    isLoading: boolean, // added isLoading state
    isChangelogsShown: boolean,
    selectedMaterial: IMaterialUnit,
    selectedStage: IStage
}

interface IChangelogsStore {
    lastChangelogs: string,
    isOpenTutorial: boolean
}

export const useChangelogsStore = defineStore('changelogs', {
    state: (): IChangelogsStore => ({
        lastChangelogs: '',
        isOpenTutorial: false // i don't know where to put this
    }),
    actions: {
        setLastChangelogs (lastChangelogs: string) {
            this.lastChangelogs = lastChangelogs
        },
        setIsOpenTutorial (isOpenTutorial: boolean) {
            this.isOpenTutorial = isOpenTutorial
        }
    },
    persist: true
})

// can set some global state here, but never let it persist
export const useGlobalStore = defineStore('global', {
    state: (): IGlobalStore => ({
        isEditingWarehouse: false,
        isEditingMaterial: '',
        neededRawMaterialsMapping: {}, // return quantity for raw materials
        neededMaterialsMapping: {}, // consider in-process crafting needs
        isLoading: false, // loading screen
        isChangelogsShown: false, // changelogs
        selectedMaterial: { Material: '', Quantity: 0 },
        selectedStage: {
            id: 0,
            category: '',
            cost: 0,
            count: 0,
            drops: {}
        }
    }),
    actions: {
        setIsEditingWarehouse (isEditing: boolean) {
            this.isEditingWarehouse = isEditing
        },
        setIsEditingMaterial (editingMaterial?: string) {
            this.isEditingMaterial = editingMaterial || ''
        },
        getNeededRawMaterialsQuantity (materialName: string) {
            return this.neededRawMaterialsMapping[materialName] || 0
        },
        updateNeededRawMaterialsMapping (mapping: INeededMaterialsMapping) {
            this.neededRawMaterialsMapping = {
                ...mapping
            }
        },
        getNeededMaterialsQuantity (materialName: string) {
            return this.neededMaterialsMapping[materialName] || 0
        },
        updateNeededMaterialsMapping (mapping: INeededMaterialsMapping) {
            this.neededMaterialsMapping = {
                ...mapping
            }
        },
        setLoading (isLoading: boolean) {
            this.isLoading = isLoading
        },
        startLoading () {
            this.setLoading(true)
        },
        finishLoading () {
            this.setLoading(false)
        },
        setSelectedMaterial (material: IMaterialUnit) {
            this.selectedMaterial = material
        },
        setSelectedStage (stage: IStage) {
            this.selectedStage = stage
        }
    }
})
