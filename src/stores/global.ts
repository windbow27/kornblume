import { defineStore } from 'pinia'

interface IGlobalStore {
  isEditingWarehouse: boolean
}

// can set some global state here, but never let it persist
export const useGlobalStore = defineStore('global', {
    state: (): IGlobalStore => ({
        isEditingWarehouse: false
    }),
    actions: {
        setIsEditingWarehouse (isEditing: boolean) {
            this.isEditingWarehouse = isEditing
        }
    }
})
