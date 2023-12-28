import { getItemImagePathByMatl, getBorderImagePathByMatl } from './images'

export function formatQuantity (quantity: number): string {
    if (quantity >= 1000000) {
        return `${(quantity / 1000000).toFixed(1)}m`;
    }
    if (quantity >= 10000) {
        return `${(quantity / 1000).toFixed(0)}k`;
    }
    return quantity.toString();
}

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
        itemImagePath: getItemImagePathByMatl(unprocessedMaterial.Material),
        borderImagePath: getBorderImagePathByMatl(unprocessedMaterial.Material)
    };
    return result;
}
