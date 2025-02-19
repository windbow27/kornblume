import { useDataStore } from '@/stores/dataStore';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { useActivityStore } from '@/stores/activityStore';
// import { usePlannerSettingsStore } from '@/stores/plannerSettingsStore';
import { IMaterialUnit, IStages } from '@/types';
import { useGlobalStore } from '@/stores/global';
import { getSolve, processSharpoAndDust } from './glpkSolver';
import { getActivityImagePathByStage } from './images';

const items = useDataStore().items;
const formulas = useDataStore().formulas;

interface ICard {
    stage: string;
    runs: number;
    activity: number;
    days: number;
    materials: IMaterialUnit[];
    activityImagePath: string;
}

interface IPlanCard {
    id: number;
    cards: ICard[];
}

function sortMaterials(array: IMaterialUnit[]) {
    array.sort((matA, matB) => {
        // Find corresponding item based on material name
        const itemIndexA = items.findIndex((item) => item.Name === matA.Material);
        const itemIndexB = items.findIndex((item) => item.Name === matB.Material);
        const itemA = items[itemIndexA];
        const itemB = items[itemIndexB];

        if (itemA && itemB) {
            if (itemB.Rarity !== itemA.Rarity) {
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

function calculateOneiric(matlInfo: IMaterialUnit) {
    const item = items.find((item) => item.Name === matlInfo.Material);
    if (item) {
        const rarity = item.Rarity;
        const quantity = matlInfo.Quantity;

        if (rarity === 3) return quantity * 40;
        if (rarity === 4) return quantity * 100;
        if (rarity === 5) return quantity * 250;
        if (rarity === 6) return quantity * 1500;
    }
    return 0;
}

function processOneiric(matlInfo: IMaterialUnit, generatedCards: ICard[]) {
    if (matlInfo.Quantity <= 0) return;
    const matlCategory = items.find((item) => item.Name === matlInfo.Material)?.Category;
    if (matlCategory !== 'Resonate Material') return;
    const oneiricCard = getCardByStage('Oneiric Shop', generatedCards);
    oneiricCard.materials.push(matlInfo);
    oneiricCard.activity += calculateOneiric(matlInfo);
}

function processReveries(matlInfo: IMaterialUnit, generatedCards: ICard[]) {
    if (matlInfo.Quantity <= 0) return;
    const matlCategory = items.find((item) => item.Name === matlInfo.Material)?.Category;
    if (matlCategory !== 'Reveries Material') return;
    const reveriesCard = getCardByStage('Reveries', generatedCards);
    reveriesCard.materials.push(matlInfo);
}

function subtractResonanceMaterials(materials: IMaterialUnit[]) {
    const warehouse = useWarehouseStore().data;

    materials.forEach((matlInfo) => {
        const subtractItem = warehouse.find(
            (item) => item.Category === 'Resonate Material' && item.Material === matlInfo.Material
        );
        if (subtractItem) {
            matlInfo.Quantity -= subtractItem.Quantity;
        }
    });
    return materials;
}

function subtractReveriesMaterials(materials: IMaterialUnit[]) {
    const warehouse = useWarehouseStore().data;

    materials.forEach((matlInfo) => {
        const subtractItem = warehouse.find(
            (item) => item.Category === 'Reveries Material' && item.Material === matlInfo.Material
        );
        if (subtractItem) {
            matlInfo.Quantity -= subtractItem.Quantity;
        }
    });
    return materials;
}

function processResonanceMaterials(materials: IMaterialUnit[], generatedCards: ICard[]) {
    let casketCount = 0;

    materials.forEach((matlInfo) => {
        const matl = items.find((item) => item.Name === matlInfo.Material);
        if (matl?.Category !== 'Resonate Material' || matl?.Rarity !== 6) return;
        casketCount += matlInfo.Quantity;
        matlInfo.Quantity = 0;
    });

    // add casket materials
    if (casketCount > 0) {
        const material = {
            Material: 'Crystal Casket',
            Quantity: casketCount
        };
        materials.unshift(material);
    }

    subtractResonanceMaterials(materials);

    materials.forEach((matlInfo) => {
        processOneiric(matlInfo, generatedCards);
    });
}

function processReveriesMaterials(materials: IMaterialUnit[], generatedCards: ICard[]) {
    subtractReveriesMaterials(materials);

    materials.forEach((matlInfo) => {
        processReveries(matlInfo, generatedCards);
    });
}

function generateCard(
    stage: string,
    runs: number | null,
    activity: number | null,
    days: number | null,
    materials: IMaterialUnit[]
): ICard {
    return {
        stage,
        runs: runs || 0,
        activity: activity || 0,
        days: days || 0,
        materials,
        activityImagePath: getActivityImagePathByStage(stage)
    };
}

function getCardByStage(stage: string, generatedCards: ICard[]): ICard {
    let card = generatedCards.find((c) => c.stage === stage);
    if (!card) {
        card = generateCard(
            stage,
            null,
            stage === 'Oneiric Shop' ? 0 : stage === 'Reveries' ? 0 : null,
            null,
            []
        );
        generatedCards.push(card);
    }
    return card;
}

function sortLayer(cards: ICard[], drops: IStages) {
    return cards.sort((a, b) => {
        if (a.stage === 'Oneiric Shop') {
            return -1;
        } else if (b.stage === 'Oneiric Shop') {
            return 1;
        }

        if (a.stage === 'Reveries') {
            return -1;
        } else if (b.stage === 'Reveries') {
            return 1;
        }

        const stageA = drops[a.stage];
        const stageB = drops[b.stage];
        if (stageA && stageB) {
            // If both stages have an id, sort based on id
            return stageA.id - stageB.id;
        }
        if (stageA) {
            // If only stageA has an id, place it before stageB
            return -1;
        }
        if (stageB) {
            // If only stageB has an id, place it before stageA
            return 1;
        }

        // If neither stage has an id, maintain the original order
        return 0;
    });
}

function sortHardStage(cards: ICard[]) {
    return cards.sort((a, b) => {
        // always place unreleased card at the end of the list
        if (a.stage === 'Unreleased') {
            return 1;
        }
        if (b.stage === 'Unreleased') {
            return -1;
        }
        return b.runs - a.runs;
    });
}

function updateCraftingMaterialsForGlobalStore(stages) {
    const neededMaterialsMapping = { ...useGlobalStore().neededRawMaterialsMapping };
    stages
        .filter(([stageName]) => stageName.startsWith('Wilderness Wishing Spring'))
        .forEach(([craftingName, craftingCount]) => {
            const matlName = craftingName.split('-')[1].trim();
            const formula = formulas.find((matl) => matl.Name === matlName);
            if (formula?.Material.length) {
                formula?.Material.forEach((matlName, matlIndex) => {
                    const matlQuant = formula?.Quantity[matlIndex];
                    if (neededMaterialsMapping[matlName]) {
                        neededMaterialsMapping[matlName] += matlQuant * craftingCount;
                    } else {
                        neededMaterialsMapping[matlName] = matlQuant * craftingCount;
                    }
                });
            }
        });
    useGlobalStore().updateNeededMaterialsMapping(neededMaterialsMapping);
}

export interface IPlanCards extends Array<IPlanCard> {}

export function getDrops() {
    const dataStore = useDataStore();

    // NOTE: keep these sample codes for future reference with toggle
    // const {
    //     enabledUnreleasedStages_v1_9
    // } = usePlannerSettingsStore().settings;
    // if (enabledUnreleasedStages_v1_9) {
    //     return dataStore.stages1_9_greedy || {}
    // }

    return dataStore.stages2_2_greedy || {};
}

export async function getPlan(
    materials: IMaterialUnit[],
    isEnableWilderness: boolean
): Promise<IPlanCards> {
    const generatedCards: ICard[] = [];
    const drops = getDrops();

    processResonanceMaterials(materials, generatedCards);
    processReveriesMaterials(materials, generatedCards);

    const plan = await getSolve(materials);

    updateCraftingMaterialsForGlobalStore(plan.variables);

    plan.variables.forEach((stage) => {
        const stageInfo = drops[stage[0]];
        if (stageInfo) {
            const runs = Math.ceil(Number(stage[1]));
            const activity = Math.ceil(runs * stageInfo.cost);
            const days = Number((activity / useActivityStore().settings.activity).toFixed(1));
            let materials = Object.entries(stageInfo.drops).map(([matlName, count]) => {
                const times: number = stageInfo?.count; // migrating data between kdoc and shiroi
                let quantity: number = times ? (count / times) * runs : count * runs;
                quantity = quantity % 1 >= 0.9 ? Math.ceil(quantity) : Math.floor(quantity);
                return {
                    Material: matlName,
                    Quantity: quantity
                };
            });
            materials = materials.filter((matl) => matl.Quantity > 0);
            const card = generateCard(stage[0] as string, runs, activity, days, materials);
            generatedCards.push(card);
        } else {
            // handle crafting
            const splitString = (stage[0] as string).split('-');
            const matName = splitString[1].trim();
            const material = {
                Material: matName,
                Quantity: stage[1]
            };
            const crafting = getCardByStage('Wilderness Wishing Spring', generatedCards);
            crafting.materials.push(material as IMaterialUnit);
        }
    });

    const generatedCardsConsideringWilderness = isEnableWilderness
        ? await processSharpoAndDust(generatedCards)
        : generatedCards;

    // console.log(generatedCardsConsideringWilderness);

    const cardsFirstLayer = generatedCardsConsideringWilderness.filter(
        (card) =>
            ['The Poussiere VI', 'Mintage Aesthetics VI', 'Oneiric Shop', 'Reveries'].includes(
                card.stage
            ) && card.materials.length > 0
    );

    const cardsSecondLayer = generatedCardsConsideringWilderness.filter(
        (card) =>
            (card.stage.endsWith('II') || card.stage.endsWith('IV') || card.stage.endsWith('VI')) &&
            !cardsFirstLayer.some((firstLayerCard) => firstLayerCard.stage === card.stage) &&
            card.materials.length > 0
    );
    const cardsThirdLayer = generatedCardsConsideringWilderness.filter(
        (card) =>
            ![
                'Wilderness Wishing Spring',
                ...cardsFirstLayer.map((card) => card.stage),
                ...cardsSecondLayer.map((card) => card.stage)
            ].includes(card.stage) && card.materials.length > 0
    );
    // the rest of the stages are in the fourth layer
    const cardsFourthLayer = generatedCardsConsideringWilderness.filter(
        (card) => ['Wilderness Wishing Spring'].includes(card.stage) && card.materials.length > 0
    );

    if (cardsFourthLayer.length > 0) sortMaterials(cardsFourthLayer[0].materials);
    const cardLayers = [
        { id: 0, cards: sortLayer(cardsFirstLayer, drops) },
        { id: 1, cards: sortLayer(cardsSecondLayer, drops) },
        { id: 2, cards: sortHardStage(cardsThirdLayer) },
        { id: 3, cards: cardsFourthLayer }
    ];
    return cardLayers;
}

export function getTotalActivityAndDays(cardLayers: { cards: ICard[] }[]) {
    let totalActivity = 0;
    let totalDays = 0;

    cardLayers.forEach((layer: { cards: ICard[] }) => {
        layer.cards.forEach((card: { days: string | number; activity: number }) => {
            if (card.days !== 0) {
                totalActivity += card.activity;
                totalDays += parseFloat(card.days.toString());
            }
        });
    });
    return [totalActivity, totalDays.toFixed(0)];
}
