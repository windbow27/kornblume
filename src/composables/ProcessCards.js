import { useDataStore } from '../stores/dataStore'
import { useWarehouseStore } from '../stores/warehouseStore'
import { useActivityStore } from '../stores/activityStore';
import { usePlannerSettingsStore } from '../stores/plannerSettingsStore'
import { solve } from 'yalps';

const items = useDataStore().items;
const formulas = useDataStore().formulas;

function calculateOneiric (matInfo) {
    const item = items.find(item => item.Name === matInfo.Material);
    const rarity = item.Rarity;
    const quantity = matInfo.Quantity;

    if (rarity === 3) return quantity * 40;
    if (rarity === 4) return quantity * 100;
    if (rarity === 5) return quantity * 250;
    if (rarity === 6) return quantity * 1500;
    return 0;
}

function getActivityImagePath (stage) {
    if (stage === 'Oneiric Shop') {
        return 'images/items/common/1.png';
    }
    return 'images/items/common/0.png';
}

function createCard (stage, runs, activity, days, materials) {
    return {
        stage,
        runs: isNaN(runs) ? 0 : runs,
        activity: isNaN(activity) ? 0 : activity,
        days: isNaN(days) ? 0 : days,
        materials,
        activityImagePath: getActivityImagePath(stage)
    };
}

function findOrCreateCard (stage, calculatedCards) {
    let card = calculatedCards.find(c => c.stage === stage);
    if (!card) {
        card = createCard(stage, null, stage === 'Oneiric Shop' ? 0 : null, null, []);
        calculatedCards.push(card);
    }
    return card;
}

function sortLayer (layer, drops) {
    return layer.sort((a, b) => {
        const stageA = Object.values(drops).find(stage => stage === a.stage);
        const stageB = Object.values(drops).find(stage => stage === b.stage);

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

function sortRunCount (layer) {
    return layer.sort((a, b) => b.runs - a.runs);
}

function subtractResonateMaterials (materials) {
    const warehouse = useWarehouseStore().data;

    materials.forEach((matInfo) => {
        const subtractItem = warehouse.find((item) => item.Category === 'Resonate Material' && item.Material === matInfo.Material);
        if (subtractItem) {
            matInfo.Quantity -= subtractItem.Quantity;
        }
    });
    // console.log(materials);
    return materials;
}

function getDrops () {
    if (usePlannerSettingsStore().settings.enableGreedyMethod) {
        return usePlannerSettingsStore().settings.enabledUnreleasedStages
            ? useDataStore().stages1_4_greedy
            : useDataStore().stages_greedy;
    }
    return usePlannerSettingsStore().settings.enabledUnreleasedStages
        ? useDataStore().stages1_4
        : useDataStore().stages;
}

function getSolve (materials, drops) {
    const warehouse = useWarehouseStore().data;

    // prepare constraints
    const materialConstraints = {};
    const neededConstraints = {};

    // the LP currently doesn't account for the oneiric shop
    // since it's not really related to activity or farming routes
    const resonanceMaterial = [
        'Sinuous Howl',
        'Interlaced Shudder',
        'Hypocritical Murmur',
        'Hoarse Echo',
        'Sonorous Knell',
        'Brief Cacophony',
        'Moment of Dissonance',
        'Crystal Casket'
    ];
    materials.forEach(({ Material: matlName, Quantity: quantity }) => {
        if (!resonanceMaterial.includes(matlName)) { // filters out the materials from the oneiric shop
            neededConstraints[matlName] = { min: quantity };
        }
    });

    // prepare craft mappings
    const craftMapping = {};
    // restrict crafting materials number to integers
    const integers = [];

    for (const { Name: name, Material: matl, Quantity: quantity } of formulas) {
        materialConstraints[name] = { min: 0 };
        if (matl.length === 0) continue;

        const craftMaterials = {};
        matl.forEach((matName, idx) => {
            craftMaterials[matName] = -quantity[idx];
        });

        const strategyName = `Wilderness Wishing Spring - ${name}`;
        craftMapping[strategyName] = {
            [name]: 1,
            ...craftMaterials,
            cost: 0
        };

        if (!integers.includes(strategyName)) { integers.push(strategyName); }
    }

    // prepare drop mappings
    const dropMapping = {};
    for (const stage in drops) {
        const stageInfo = drops[stage];
        const { count: times, cost, drops: dropCount } = stageInfo;
        dropMapping[stage] = { cost };
        for (const matlName in dropCount) {
            dropMapping[stage][matlName] = dropCount[matlName] / times;
        }
    }

    const constraints = {
        ...materialConstraints,
        ...neededConstraints
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
            } else {
                constraints[matlName] = {
                    min: -matlQuant
                }
            }
        }
    })

    // define LP solver
    const variables = Object.assign({}, craftMapping, dropMapping);

    const model = {
        objective: 'cost',
        direction: 'minimize',
        constraints,
        variables,
        integers
    };

    const options = {
        maxIterations: 1048576,
        tolerance: 0.25
    }

    const solver = solve(model, options)
    if (solver.status !== 'optimal') {
        console.log(`%cStatus: ${solver.status}`, 'background-color: yellow; color: black;');
        console.log('constraints: ', constraints)
        console.log('variables: ', variables)
    }
    return solver
}

export function getPlan (materials) {
    const calculatedCards = [];
    const drops = getDrops();
    let casketCount = 0;

    function processOneiric (matInfo) {
        if (matInfo.Quantity <= 0) return;
        if (items.find((item) => item.Name === matInfo.Material).Category !== 'Resonate Material') return;
        const oneiricCard = findOrCreateCard('Oneiric Shop', calculatedCards);
        oneiricCard.materials.push(matInfo);
        oneiricCard.activity += calculateOneiric(matInfo);
    }

    materials.forEach((matInfo) => {
        if (items.find((item) => item.Name === matInfo.Material).Category !== 'Resonate Material' ||
        items.find((item) => item.Name === matInfo.Material).Rarity !== 6) return;
        casketCount += matInfo.Quantity;
        matInfo.Quantity = 0;
    });

    // add casket materials
    if (casketCount > 0) {
        const material = {
            Material: 'Crystal Casket',
            Quantity: casketCount
        }
        materials.unshift(material);
    }

    subtractResonateMaterials(materials);

    materials.forEach((matInfo) => {
        processOneiric(matInfo);
    });

    const plan = getSolve(materials, drops);

    plan.variables.forEach((stage) => {
        const stageInfo = drops[stage[0]];
        if (stageInfo) {
            const runs = Math.ceil(stage[1]);
            const activity = Math.ceil(runs * stageInfo.cost);
            const days = (activity / useActivityStore().settings.activity).toFixed(1);
            let materials = Object.entries(stageInfo.drops).map(([matlName, count]) => {
                let quantity = (count / stageInfo.count) * runs;
                quantity = (quantity % 1 >= 0.9) ? Math.ceil(quantity) : Math.floor(quantity); // flooring, takes 0.99 for now
                return {
                    Material: matlName,
                    Quantity: quantity
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
                Quantity: stage[1]
            }
            const crafting = findOrCreateCard('Wilderness Wishing Spring', calculatedCards);
            crafting.materials.push(material);
            // const card = createCard('Wilderness Wishing Spring', null, null, null, [material]);
            // calculatedCards.push(card);
        }
    });

    // console.log(calculatedCards);

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
            !['Wilderness Wishing Spring', ...stagesFirstLayer.map((card) => card.stage), ...stagesSecondLayer.map((card) => card.stage)].includes(
                card.stage
            ) && card.materials.length > 0
    );
    // the rest of the stages are in the fourth layer
    const stagesFourthLayer = calculatedCards.filter(
        (card) =>
            ['Wilderness Wishing Spring'].includes(card.stage) && card.materials.length > 0
    );

    // console.log(stagesFourthLayer);
    const cardLayers = [
        { id: 0, cards: sortLayer(stagesFirstLayer, drops) },
        { id: 1, cards: sortLayer(stagesSecondLayer, drops) },
        { id: 2, cards: sortRunCount(stagesThirdLayer) },
        { id: 3, cards: sortLayer(stagesFourthLayer, drops) }
    ];
    return cardLayers;
}

export function getCardLayers (materials) {
    const { cardLayers } = getPlan(materials);
    return cardLayers;
}

export function getTotalActivityAndDays (cardLayers) {
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
    // console.log(totalActivity, totalDays);
    return [totalActivity, totalDays.toFixed(0)];
}
