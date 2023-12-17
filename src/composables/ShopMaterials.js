import { useDataStore } from '../stores/dataStore';
import { useWarehouseStore } from '../stores/warehouseStore';

export function addMaterialsToWarehouse (version) {
    const shopsData = useDataStore().shops;
    if (version in shopsData) {
        const materials = shopsData[version];
        // console.log(materials);

        materials.forEach((material) => {
            const { Material, Quantity } = material;
            useWarehouseStore().addShopItem(Material, Quantity);
        });
    } else {
        console.error(`Version ${version} not found in shops data.`);
    }
}
