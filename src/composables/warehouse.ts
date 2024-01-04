import { useDataStore } from '../stores/dataStore';
import { useWarehouseStore, IItem as IWarehouseItem } from '../stores/warehouseStore';
import { usePlannerSettingsStore } from '../stores/plannerSettingsStore';

const categoryPriority = {
    'Base Item': 0,
    'Resonate Material': 1,
    'Insight Material': 2,
    'Build Material': 2 // insight/build material have same priority, should be arranged according to rarity
}

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

export const initializeWarehouse = () => {
    const unreleasedDropsEnabled = usePlannerSettingsStore().settings.enabledUnreleasedStages;
    console.log('Initialize warehouse');
    useDataStore().items.forEach((item) => {
        if (item.IsReleased || unreleasedDropsEnabled) {
            if (
                item.Category === 'Build Material' ||
                item.Category === 'Insight Material' ||
                (item.Category === 'Resonate Material' && item.Rarity < 6) ||
                item.Name === 'Dust' ||
                item.Name === 'Sharpodonty' ||
                item.Name === 'Crystal Casket'
            ) {
                useWarehouseStore().initItem(item.Name, item.Category);
            }
        }
    });
}

export const checkWarehouse = () => {
    const unreleasedDropsEnabled = usePlannerSettingsStore().settings.enabledUnreleasedStages;
    useDataStore().items.forEach((item) => {
        if (
            !useWarehouseStore().hasItem(item.Name) &&
            (item.Name === 'Crystal Casket' || (!item.IsReleased && unreleasedDropsEnabled))
        ) {
            useWarehouseStore().initItem(item.Name, item.Category);
        } else if (!item.IsReleased && !unreleasedDropsEnabled) {
            useWarehouseStore().removeItem(item.Name);
        }
    });
}

export const sortWarehouseMaterials = (array: IWarehouseItem[]) => {
    const itemsData = useDataStore().items;

    array.sort((warehouseMatlA, warehouseMatlB) => {
        // Find corresponding item based on material name
        const itemIndexA = itemsData.findIndex(item => item.Name === warehouseMatlA.Material);
        const itemIndexB = itemsData.findIndex(item => item.Name === warehouseMatlB.Material);
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
}
