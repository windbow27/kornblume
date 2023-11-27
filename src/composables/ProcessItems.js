import {ref} from 'vue';
import i from '../../public/data/items.json';

const items = ref(i);

export function useProcessMaterial(unprocessedMaterial) {
    const getId = (material) => {
        const item = items.value.find(item => item.Name == material);
        return item ? item.Id : null;
    };
    
    const getRarity = (material) => {
        const item = items.value.find(item => item.Name == material);
        return item ? item.Rarity : null;
    };
    
    const getItemImagePath = (material) => {
        const id = getId(material);
        return id ? `/images/items/icon/${id}.png` : null;
    };
    
    const getBorderImagePath = (material) => {
        const rarity = getRarity(material);
        return rarity ? `/images/items/border/${rarity}.png` : null;
    };
    
    const formatQuantity = (quantity) => {
        if (quantity > 10000) {
            return `${(quantity / 1000).toFixed(0)}k`;
        } else {
            return quantity.toString();
        }
    };

    const result = {
        material: unprocessedMaterial.Material,
        quantity: formatQuantity(unprocessedMaterial.Quantity),
        itemImagePath: getItemImagePath(unprocessedMaterial.Material),
        borderImagePath: getBorderImagePath(unprocessedMaterial.Material),
    };
    return result;
}

