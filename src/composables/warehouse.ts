import { useDataStore } from '../stores/dataStore';
import { useWarehouseStore } from '../stores/warehouseStore';

export function addEventShopMaterialsToWarehouse (version: string) {
    const shopsData = useDataStore().shops;
    if (version in shopsData) {
        const materials = shopsData[version];

        materials.forEach((material) => {
            const { Material, Quantity } = material;
            useWarehouseStore().addItem(Material, Quantity);
        });
    } else {
        console.error(`Version ${version} not found in shops data.`);
    }
}
