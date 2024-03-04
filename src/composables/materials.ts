import { useDataStore } from '@/stores/dataStore';
import { getItemImagePathByMatl, getBorderImagePathByMatl } from './images'
import { IMaterialUnit, IItem } from '@/types'

export interface INormalizedMaterial {
    material: string,
    quantity: string,
    itemImagePath: string,
    borderImagePath: string,
}

export interface IBaseMaterial {
    material: string,
    itemImagePath: string,
    borderImagePath: string,
}

export function convertToPercentage (value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

export function formatQuantity (quantity: number): string {
    if (!Number.isInteger(quantity)) {
        return convertToPercentage(quantity);
    }
    if (quantity >= 1000000) {
        return `${(quantity / 1000000).toFixed(1)}m`;
    }
    if (quantity >= 10000) {
        return `${(quantity / 1000).toFixed(0)}k`;
    }
    return quantity.toString();
}

export function normalizeDisplayMaterial (unprocessedMaterial: IMaterialUnit): INormalizedMaterial {
    const result = {
        material: unprocessedMaterial.Material,
        quantity: formatQuantity(unprocessedMaterial.Quantity),
        itemImagePath: getItemImagePathByMatl(unprocessedMaterial.Material),
        borderImagePath: getBorderImagePathByMatl(unprocessedMaterial.Material)
    };
    return result;
}

export function baseDisplayMaterial (unprocessedMaterial: IItem): IBaseMaterial {
    const result = {
        material: unprocessedMaterial.Name,
        itemImagePath: getItemImagePathByMatl(unprocessedMaterial.Name),
        borderImagePath: getBorderImagePathByMatl(unprocessedMaterial.Name)
    };
    return result;
}

export function sortCategoryMaterials (materials: IItem[], categories: string | string[]) {
    const itemsData = useDataStore().items;
    // Category
    materials.sort((a: IItem, b: IItem) => {
        const itemIndexA = itemsData.findIndex((item) => item.Name === a.Name);
        const itemIndexB = itemsData.findIndex((item) => item.Name === b.Name);
        const categoryA = categories.indexOf(a.Category);
        const categoryB = categories.indexOf(b.Category);
        if (categoryA !== categoryB) {
            return categoryA - categoryB;
        }

        // Rarity
        const rarityComparison = b.Rarity - a.Rarity
        if (rarityComparison !== 0) {
            return rarityComparison
        }

        return itemIndexA - itemIndexB;
    })
}
