import { useDataStore } from '../stores/dataStore'

export function getActivityImagePathByStage (stage: string) {
    return `images/items/common/${stage === 'Oneiric Shop' ? 1 : 0}.png`
}

const items = useDataStore().items;

const getId = (material) => {
    const item = items.find(item => item.Name === material);
    return item ? item.Id : null;
};

const getRarity = (material) => {
    const item = items.find(item => item.Name === material);
    return item ? item.Rarity : null;
};

export const getItemImagePathByMatl = (material) => {
    const id = getId(material);
    return id ? `images/items/icon/${id}.png` : '';
};

export const getBorderImagePathByMatl = (material) => {
    const rarity = getRarity(material);
    return rarity ? `images/items/border/${rarity}.png` : '';
};
