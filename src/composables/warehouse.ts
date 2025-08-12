import { useDataStore } from '../stores/dataStore';
import { useWarehouseStore, IItem as IWarehouseItem } from '../stores/warehouseStore';

const categoryPriority = {
    'Base Item': 0,
    'Resonate Material': 1,
    'Reveries Material': 2,
    'Insight Casket': 3,
    'Insight Material': 4,
    'Build Material': 4 // insight/build material have same priority, should be arranged according to rarity
};

export function addEventShopMaterialsToWarehouse(version: string) {
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

export function removeEventShopMaterialsFromWarehouse(version: string) {
    const shopsData = useDataStore().shops;
    if (version in shopsData) {
        const materials = shopsData[version];

        materials.forEach((material) => {
            const { Material, Quantity } = material;
            useWarehouseStore().reduceItem(Material, Quantity);
        });
    } else {
        console.error(`Version ${version} not found in shops data.`);
    }
}

export const initializeWarehouse = () => {
    // NOTE: keep these sample codes for future reference with new materials
    // const unreleasedDropsEnabled = usePlannerSettingsStore().settings.enabledUnreleasedStages_v1_9;
    console.log('Initialize warehouse');
    useDataStore().items.forEach((item) => {
        // const isItemReleasedForUser = item.IsReleased || unreleasedDropsEnabled;
        const isItemReleasedForUser = item.IsReleased;
        if (isItemReleasedForUser) {
            if (isValidWarehouseItem(item)) {
                useWarehouseStore().initItem(item.Name, item.Category);
            }
        }
    });
};

function isValidWarehouseItem(item) {
    if (
        item.Category === 'Build Material' ||
        item.Category === 'Insight Material' ||
        item.Category === 'Reveries Material' ||
        item.Category === 'Insight Casket' ||
        (item.Category === 'Resonate Material' && item.Rarity < 6) ||
        item.Name === 'Dust' ||
        item.Name === 'Sharpodonty' ||
        item.Name === 'Crystal Casket'
    )
        return true;
    return false;
}

export function checkWarehouse() {
    useDataStore().items.forEach((item) => {
        // NOTE: keep these sample codes for future reference with new materials
        // const unreleasedDropsEnabled = usePlannerSettingsStore().settings.enabledUnreleasedStages_v1_9;
        // const isItemReleasedForUser = item.IsReleased || unreleasedDropsEnabled;
        const isItemReleasedForUser = item.IsReleased;
        if (
            !useWarehouseStore().hasItem(item.Name) &&
            (item.Name === 'Crystal Casket' || isItemReleasedForUser) &&
            isValidWarehouseItem(item)
        ) {
            console.log('Adding', item.Name, 'to warehouse');
            useWarehouseStore().initItem(item.Name, item.Category);
        } else if (!isItemReleasedForUser || !isValidWarehouseItem(item)) {
            // console.log('Removing', item.Name, 'from warehouse')
            useWarehouseStore().removeItem(item.Name);
        }
    });
}

export const sortWarehouseMaterials = (array: IWarehouseItem[]) => {
    const itemsData = useDataStore().items;

    array.sort((warehouseMatlA, warehouseMatlB) => {
        // Find corresponding item based on material name
        const itemIndexA = itemsData.findIndex((item) => item.Name === warehouseMatlA.Material);
        const itemIndexB = itemsData.findIndex((item) => item.Name === warehouseMatlB.Material);
        const itemA = itemsData[itemIndexA];
        const itemB = itemsData[itemIndexB];

        if (itemA && itemB) {
            // Sort by category priority first
            const categoryOrderA = categoryPriority[itemA.Category];
            const categoryOrderB = categoryPriority[itemB.Category];
            if (categoryOrderA !== categoryOrderB) {
                return categoryOrderA - categoryOrderB;
            } else if (itemB.Rarity !== itemA.Rarity) {
                return itemB.Rarity - itemA.Rarity;
            }
            //  If there is no difference in rarity and category priority, arrange in the original order in Items
            return itemIndexA - itemIndexB;
        } else {
            // If it does not exist, arrange it towards the back
            return itemIndexB - itemIndexA;
        }
    });
};
