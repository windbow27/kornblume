import { watchEffect } from 'vue';
import { useDataStore } from '../stores/dataStore';
import { IStage } from '@/types';

const items = useDataStore().items;

watchEffect(() => {
  if (items.length === 0) {
    location.reload();
  }
});

const getId = (material: string) => {
  const item = items.find((item) => item.Name === material);
  if (!item) {
    console.warn("Material not found when locating image", material);
  }
  return item ? item.Id : 1;
};

const getRarity = (material: string) => {
  const item = items.find((item) => item.Name === material);
  return item ? item.Rarity : 6;
};

// 1.0
// const getStageBackgroundId = (id: number) => {
//     if (id <= 21) return 1;
//     if (id <= 45) return 2;
//     if (id <= 63) return 3;
//     if (id <= 85) return 4;
//     if (id === 86) return 5;
//     if (id === 87) return 6;
//     if (id <= 90) return 7;
//     if (id <= 93) return 8;
//     if (id <= 96) return 9;
//     if (id <= 99) return 10;
//     return 1;
// }

const getStageBackgroundId = (stage: IStage) => {
  const {id: stageId, name: stageName} = stage;

  if (stageId) {
    const stageBackgroundId = getStageBackgroundIdByStageId(stageId);
    if (stageBackgroundId) {
      return stageBackgroundId;
    }
  }
  if (stageName) {
    const stageCode = stageName.split('-')[0];
    const stageBackgroundId = getStageBackgroundIdByChapterCode(stageCode);
    if (stageBackgroundId) {
      return stageBackgroundId;
    }
  }
};

// 1.7
// so unorganized
const getStageBackgroundIdByStageId = (id: number) => {
  if (id <= 21) return 1;
  if (id <= 45) return 2;
  if (id <= 63) return 3;
  if (id <= 86) return 4;
  if (id <= 114) return 11;
  if (id === 115) return 5;
  if (id === 116) return 6;
  if (id <= 119) return 7;
  if (id <= 122) return 8;
  if (id <= 125) return 9;
  if (id <= 128) return 10;
  if (id === 404) return 4; // special case for 4-4
  if (id <= 699 && id >= 600) return 12;
  if (id <= 799 && id > 700) return 13;
  if (id <= 899 && id > 800) return 14;
  if (id <= 999 && id > 900) return 15;
  if (id < 1100 && id > 1000) return 16;
};

const getStageBackgroundIdByChapterCode = (chapterCode: string) => {
  if (isFinite(Number(chapterCode))) {
    const chapterNum = Number(chapterCode);
    if (chapterNum === 1) return 1;
    if (chapterNum === 2) return 2;
    if (chapterNum === 3) return 3;
    if (chapterNum === 4) return 4;
    if (chapterNum === 5) return 11;
    if (chapterNum === 6) return 12;
    if (chapterNum === 7) return 13;
    if (chapterNum === 8) return 14;
    if (chapterNum === 9) return 15;
    if (chapterNum === 10) return 16;
    if (chapterNum === 11) return 17;
  }
  if (chapterCode === 'LP') return 5; // The/Le Poussiere: Dust
  if (chapterCode === 'MA') return 6; // Mintage Aesthetics: Sharpodonty
  if (chapterCode === 'ME') return 7; // Mountain Echoes: Mineral insight
  if (chapterCode === 'SL') return 8; // Starfall Locale: Star insight
  if (chapterCode === 'SS') return 9; // Sylvanus Shape: Plant insight
  if (chapterCode === 'BW') return 10; // Brutes Wilds: Beast insight
  if (chapterCode === 'HP') return undefined; // Harvest Prime
  if (chapterCode === 'PA') return undefined; // Pneuma Analysis
}

export const getItemImagePathByMatl = (material: string) => {
  const id = getId(material);
  return id ? `images/items/icon/${id}.webp` : '';
};

export const getItemImageIconPathByMatl = (material: string) => {
  const id = getId(material);
  return id ? `images/items/icon/thumbnails/${id}.webp` : '';
};

export const getBorderImageIconPathByMatl = (material: string) => {
  const rarity = getRarity(material);
  return rarity ? `images/items/border/thumbnails/${rarity}.webp` : '';
};

export function getActivityImagePathByStage(stage: string) {
  return `images/items/common/${stage === 'Oneiric Shop' ? 1 : 0}.webp`;
}

export function getStageImagePathByStage(stage: IStage) {
  return `images/items/stage/thumbnails/${getStageBackgroundId(stage)}.webp`;
}

export function getArcanistImagePath(id: number | string) {
  return `images/arcanists/icon/${id}.webp`;
}

export function getArcanistIconImagePath(id: number | string) {
  return `images/arcanists/icon/thumbnails/${id}.webp`;
}

export function getArcanistI0ImagePath(id: number | string) {
  return `images/arcanists/i0/thumbnails/${id}.webp`;
}

export function getArcanistI2ImagePath(id: number | string) {
  return `images/arcanists/i2/${id}.webp`;
}

export function getArcanistAfflatusPath(afflatus: string) {
  afflatus = afflatus.toLowerCase();
  return `images/arcanists/misc/logo-${afflatus}.webp`;
}

export function getArcanistAfflatusIconPath(afflatus: string) {
  afflatus = afflatus.toLowerCase();
  return `images/arcanists/misc/${afflatus}.webp`;
}

export function getArcanistDmgTypePath(dmgType: string) {
  return `images/arcanists/misc/dmg-type-${dmgType}.webp`;
}

export function getArcanistFramePath(rarity: number) {
  return `images/arcanists/misc/bg${rarity}.webp`;
}

export function getArcanistFrequencyPath(type: string, id: number) {
  return `images/arcanists/misc/frequency/${type}_${id}.webp`;
}

export function getArcanistEuphoriaPath(id: number, type: number) {
  return `images/arcanists/euphoria/${id}_${type}.webp`;
}
