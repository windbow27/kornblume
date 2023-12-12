import { useDataStore } from '../stores/DataStore'
import { useWarehouseStore } from '../stores/WarehouseStore'
import { solve } from "yalps";

const items = useDataStore().items.data;
const stages = useDataStore().stages.data;
const formulas = useDataStore().formulas.data;
const drops = useDataStore().drops.data;
const warehouse = useWarehouseStore().data;

function calculateOneiric(matInfo) {
    const item = items.find(item => item.Name === matInfo.Material);
    const rarity = item.Rarity;
    const quantity = matInfo.Quantity;

    if (rarity === 3) return quantity * 40;
    if (rarity === 4) return quantity * 100;
    if (rarity === 5) return quantity * 250;
    if (rarity === 6) return quantity * 1500;
    return 0;
}

function getActivityImagePath(stage) {
    if (stage === 'Oneiric Shop') {
        return `images/items/common/1.png`;
    }
    return `images/items/common/0.png`;
}

function createCard(stage, runs, activity, days, materials) {
    return {
        stage,
        runs: isNaN(runs) ? 0 : runs,
        activity: isNaN(activity) ? 0 : activity,
        days: isNaN(days) ? 0 : days,
        materials,
        activityImagePath: getActivityImagePath(stage)
    };
}

function findOrCreateCard(stage, calculatedCards) {
    let card = calculatedCards.find(c => c.stage === stage);
    if (!card) {
        card = createCard(stage, null, stage === 'Oneiric Shop' ? 0 : null, null, []);
        calculatedCards.push(card);
    }
    return card;
}

function sortLayer(layer) {
    return layer.sort((a, b) => {
        const stageA = stages.find((stage) => stage.Name === a.stage);
        const stageB = stages.find((stage) => stage.Name === b.stage);

        if (stageA && stageB) {
            // If both stages have an id, sort based on id
            return stageA.Id - stageB.Id;
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

export function getPlan(materials) {
    const calculatedCards = [];

    //placeholder Oneiric Shop for now
    function processOneiric(matInfo) {
        const oneiric = findOrCreateCard('Oneiric Shop', calculatedCards);
        if (items.find((item) => item.Name === matInfo.Material).Category === 'Resonate Material') {
            oneiric.activity += calculateOneiric(matInfo);
            oneiric.materials.push(matInfo);
        }
    }

    materials.forEach((matInfo) => {
        if (matInfo.Quantity <= 0) return;
        matInfo.Quantity = parseFloat(matInfo.Quantity);
        const currentStage = stages.find((stage) => stage.Material.includes(matInfo.Material));
        if (!currentStage) processOneiric(matInfo);
    });
    //

    const plan = getSolve(materials);
    plan.variables.forEach((stage) => {
        const stageInfo = drops[stage[0]];
        if (stageInfo) {
            const runs = Math.ceil(stage[1]);
            const activity = Math.ceil(runs * stageInfo.cost);
            const days = (activity / 240).toFixed(1);
            let materials = Object.entries(stageInfo.drops).map(([matlName, count]) => {
                let quantity = (count / stageInfo.count) * runs;
                quantity = (quantity % 1 >= 0.99) ? Math.ceil(quantity) : Math.floor(quantity); //flooring, takes 0.99 for now
                return {
                    Material: matlName,
                    Quantity: quantity,
                };
            });
            materials = materials.filter((matl) => matl.Quantity > 0);
            const card = createCard(stage[0], runs, activity, days, materials);
            calculatedCards.push(card);
        } else {
            const splitString = stage[0].split('-');
            const matName = splitString[1].trim();
            const material = {
                Material: matName,
                Quantity: stage[1],
            }
            const crafting = findOrCreateCard('Wilderness Crafting', calculatedCards);
            crafting.materials.push(material);
            // const card = createCard('Wilderness Crafting', null, null, null, [material]);
            // calculatedCards.push(card);
        }
    });

    //console.log(calculatedCards);

    const stagesFirstLayer = calculatedCards.filter(
        (card) =>
            ['The Poussiere VI', 'Mintage Aesthetics VI', 'Oneiric Shop'].includes(card.stage) &&
            card.materials.length > 0
    );

    const stagesSecondLayer = calculatedCards.filter(
        (card) =>
            (card.stage.endsWith('II') || card.stage.endsWith('IV') || card.stage.endsWith('VI')) &&
            !stagesFirstLayer.some((firstLayerCard) => firstLayerCard.stage === card.stage) &&
            card.materials.length > 0
    );
    const stagesThirdLayer = calculatedCards.filter(
        (card) =>
            !['Wilderness Crafting', ...stagesFirstLayer.map((card) => card.stage), ...stagesSecondLayer.map((card) => card.stage)].includes(
                card.stage
            ) && card.materials.length > 0
    );
    //the rest of the stages are in the fourth layer
    const stagesFourthLayer = calculatedCards.filter(
        (card) =>
            ['Wilderness Crafting'].includes(card.stage) && card.materials.length > 0
    );

    //console.log(stagesFourthLayer);
    const cardLayers = [
        { id: 0, cards: sortLayer(stagesFirstLayer) },
        { id: 1, cards: sortLayer(stagesSecondLayer) },
        { id: 2, cards: sortLayer(stagesThirdLayer) },
        { id: 3, cards: sortLayer(stagesFourthLayer) },
    ];
    return cardLayers;
}


function getSolve(materials) {

    // prepare constraints
    const materialConstraints = {};
    const neededConstraints = {};
    const resonateMaterial = [
        "Sinuous Howl", "Interlaced Shudder", "Hypocritical Murmur", "Hoarse Echo", "Sonorous Knell", "Brief Cacophony", "Moment of Dissonance"
    ];
    materials.forEach(({ Material: matlName, Quantity: quantity }) => {
        // NOTE: not handle RESONANCE material in this function
        if (!resonateMaterial.includes(matlName))
            neededConstraints[matlName] = { min: quantity };
    });

    // prepare craft mappings
    const craftMapping = {};
    // restrict crafting materials number to integers
    const integers = [];

    for (let { Name: name, Material: matl, Quantity: quantity } of formulas) {
        materialConstraints[name] = { min: 0 };
        if (matl.length === 0) continue;

        const craftMaterials = {};
        matl.forEach((matName, idx) => {
            craftMaterials[matName] = -quantity[idx];
        });

        const strategyName = `Wilderness Crafting - ${name}`;
        craftMapping[strategyName] = {
            [name]: 1,
            ...craftMaterials,
            cost: 0,
        };

        if (!integers.includes(strategyName))
            integers.push(strategyName);
    }

    // prepare drop mappings
    const dropMapping = {};
    for (let stage in drops) {
        const stageInfo = drops[stage];
        const { count: times, cost, drops: dropCount } = stageInfo;
        dropMapping[stage] = { cost };
        for (let matlName in dropCount) {
            dropMapping[stage][matlName] = dropCount[matlName] / times;
        }
    }

    const constraints = {
        ...materialConstraints,
        ...neededConstraints,
    };

    // consider warehouse
    warehouse.forEach((matlInfo) => {
        const {
            Material: matlName,
            Quantity: quantity
        } = matlInfo;
        const matlQuant = parseInt(quantity);
        if (matlQuant > 0) {
            if (constraints[matlName]) {
                constraints[matlName] = {
                    min: constraints[matlName].min - matlQuant
                }
            }
            else {
                constraints[matlName] = {
                    min: - matlQuant
                }
            }
        }
    })

    // define LP solver
    const variables = Object.assign({}, craftMapping, dropMapping);

    const model = {
        objective: "cost",
        direction: "minimize",
        constraints,
        variables,
        integers, // TODO: we need to manually round up the level count for stages in the solve result 
    };

    const options = {
        precision: 0.01,
        tolerance: 0.1
    }

    return solve(model, options);
}

export function getCardLayers(materials) {
    const { cardLayers } = useProcessCards(materials);
    return cardLayers;
}

export function getTotalActivityAndDays(cardLayers) {
    let totalActivity = 0;
    let totalDays = 0;

    cardLayers.forEach((layer) => {
        layer.cards.forEach((card) => {
            if (card.days !== null) {
                totalActivity += card.activity;
                totalDays += parseFloat(card.days);
            }
        });
    });
    //console.log(totalActivity, totalDays);
    return [totalActivity, totalDays.toFixed(0)];
}