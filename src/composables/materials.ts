import { useDataStore } from '../stores/dataStore';

const items = useDataStore().items;

export function formatQuantity (quantity: number): string {
    if (quantity > 1000000) {
        return `${(quantity / 1000000).toFixed(1)}m`;
    }
    if (quantity > 10000) {
        return `${(quantity / 1000).toFixed(0)}k`;
    }
    return quantity.toString();
}

const getId = (material) => {
    const item = items.find(item => item.Name === material);
    return item ? item.Id : null;
};

const getRarity = (material) => {
    const item = items.find(item => item.Name === material);
    return item ? item.Rarity : null;
};

const getItemImagePath = (material) => {
    const id = getId(material);
    return id ? `images/items/icon/${id}.png` : '';
};

const getBorderImagePath = (material) => {
    const rarity = getRarity(material);
    return rarity ? `images/items/border/${rarity}.png` : '';
};

export interface INormalizedMaterial {
    material: string,
    quantity: string,
    itemImagePath: string,
    borderImagePath: string,
}

export function normalizeDisplayMaterial (unprocessedMaterial): INormalizedMaterial {
    const result = {
        material: unprocessedMaterial.Material,
        quantity: formatQuantity(unprocessedMaterial.Quantity),
        itemImagePath: getItemImagePath(unprocessedMaterial.Material),
        borderImagePath: getBorderImagePath(unprocessedMaterial.Material)
    };
    return result;
}
