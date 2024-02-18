import { useDataStore } from '../stores/dataStore'

const items = useDataStore().items;

const getId = (material) => {
    const item = items.find(item => item.Name === material);
    return item ? item.Id : null;
};

const getRarity = (material) => {
    const item = items.find(item => item.Name === material);
    return item ? item.Rarity : null;
};

const getStageBackGroundId = (id) => {
    if (id <= 22) return 1;
    if (id <= 46) return 2;
    if (id <= 64) return 3;
    if (id <= 86) return 4;
    return 5;
}

export const getItemImagePathByMatl = (material) => {
    const id = getId(material);
    return id ? `images/items/icon/${id}.png` : '';
};

export const getBorderImagePathByMatl = (material) => {
    const rarity = getRarity(material);
    return rarity ? `images/items/border/${rarity}.png` : '';
};

export function getActivityImagePathByStage (stage: string) {
    return `images/items/common/${stage === 'Oneiric Shop' ? 1 : 0}.png`
}

export function getStageImagePathByStage (stage: number | string) {
    return `images/items/stage/${getStageBackGroundId(stage)}.webp`
}
