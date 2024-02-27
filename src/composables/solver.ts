import { useDataStore } from '../stores/dataStore'
import { useWarehouseStore } from '../stores/warehouseStore'
import { solve, Model } from 'yalps';
import { getDrops } from './planner';
import { useActivityStore } from '../stores/activityStore';
import { useWildernessStore } from '../stores/wildernessStore';
import { IMaterialUnit } from '@/types';
import { useGlobalStore } from '../stores/global';
import { usePlannerSettingsStore } from '@/stores/plannerSettingsStore';

const formulas = useDataStore().formulas;

interface ICard {
    stage: string,
    runs: number,
    activity: number,
    days: number,
    materials: IMaterialUnit[],
    activityImagePath: string,
}

function getDaysFromActivity (activity): number {
    const dailyActivity = useActivityStore().settings.activity;
    return Number((activity / dailyActivity).toFixed(1));
}

export function getSolve (materials) {
    const drops = getDrops();
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
    const integers: string[] = [];

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

        if (!integers.includes(strategyName)) {
            integers.push(strategyName);
        }
    }

    // prepare drop mappings
    const dropMapping = {};
    for (const stage in drops) {
        const stageInfo = drops[stage];
        const { cost, drops: dropCount, count: times } = stageInfo;
        dropMapping[stage] = { cost };
        for (const matlName in dropCount) {
            // migrating data between kdoc and shiroi
            dropMapping[stage][matlName] = times ? (dropCount[matlName] / times) : dropCount[matlName];
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
        const matlQuant = quantity;
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

    const solver = solve(model as Model, options)
    if (solver.status !== 'optimal') {
        console.log(`%cStatus: ${solver.status}`, 'background-color: yellow; color: black;');
        console.log('constraints: ', constraints)
        console.log('variables: ', variables)
    }
    return solver
}

export function processSharpoAndDust (generatedCards: ICard[]) {
    let sharpoForCrafting = 0
    const craftingCard = generatedCards.find((card) => card.stage === 'Wilderness Wishing Spring')
    if (craftingCard) {
        craftingCard.materials.forEach(({ Material: matlName, Quantity: matlQuant }) => {
            const formula = formulas.find((matl) => matl.Name === matlName);
            if (formula?.Quantity.length) {
                sharpoForCrafting += formula?.Quantity[formula?.Quantity.length - 1] * matlQuant
            }
        })
    }
    const sharpoForGoal = useGlobalStore().getNeededMaterialsQuantity('Sharpodonty') + sharpoForCrafting
    const dustForGoal = useGlobalStore().getNeededMaterialsQuantity('Dust')

    let activityForOthers = 0
    const otherStageCards = generatedCards.filter((card) => card.stage !== 'The Poussiere VI' && card.stage !== 'Mintage Aesthetics VI')
    otherStageCards.forEach((card) => {
        if (card.stage !== 'Oneiric Shop') {
            activityForOthers += card.activity
        }
    })
    const dailyActivity = useActivityStore().settings.activity;
    const daysForOthers = getDaysFromActivity(activityForOthers);

    const warehouseSharpo = useWarehouseStore().data.find((matl) => matl.Material === 'Sharpodonty')?.Quantity || 0
    const warehouseDust = useWarehouseStore().data.find((matl) => matl.Material === 'Dust')?.Quantity || 0

    const wildernessDailyProduct = usePlannerSettingsStore().settings.enableWilderness ? useWildernessStore().settings.wildernessOutput : { dust: 0, gold: 0 };
    const remainingSharpo = Math.max(sharpoForGoal - wildernessDailyProduct.gold * daysForOthers - warehouseSharpo, 0);
    const remainingDust = Math.max(dustForGoal - wildernessDailyProduct.dust * daysForOthers - warehouseDust, 0);

    const variables = {
        'The Poussiere VI': {
            Dust: 12000 + Number((wildernessDailyProduct.dust * 25 / dailyActivity).toFixed(1)),
            Sharpodonty: 250 + Number((wildernessDailyProduct.gold * 25 / dailyActivity).toFixed(1)),
            Cost: 25
        },
        'Mintage Aesthetics VI': {
            Dust: 0 + Number((wildernessDailyProduct.dust * 25 / dailyActivity).toFixed(1)),
            Sharpodonty: 9000 + Number((wildernessDailyProduct.gold * 25 / dailyActivity).toFixed(1)),
            Cost: 25
        }
    }
    const constraints = {
        Sharpodonty: { min: remainingSharpo },
        Dust: { min: remainingDust }
    }

    const model = {
        objective: 'Cost',
        direction: 'minimize',
        constraints,
        variables,
        integers: true
    };

    const solver = solve(model as Model)
    let sharpoRuns = 0
    let dustRuns = 0
    solver.variables.forEach(([stage, run]) => {
        if (stage === 'Mintage Aesthetics VI') {
            sharpoRuns = run
        } else {
            dustRuns = run
        }
    })

    const sharpoCard = {
        stage: 'Mintage Aesthetics VI',
        activityImagePath: 'images/items/common/0.webp',
        runs: sharpoRuns,
        activity: 25 * sharpoRuns,
        days: getDaysFromActivity(25 * sharpoRuns),
        materials: [{
            Material: 'Sharpodonty',
            Quantity: 9000 * sharpoRuns
        }]
    }
    const dustCard = {
        stage: 'The Poussiere VI',
        activityImagePath: 'images/items/common/0.webp',
        runs: dustRuns,
        activity: 25 * dustRuns,
        days: getDaysFromActivity(25 * dustRuns),
        materials: [
            {
                Material: 'Dust',
                Quantity: 12000 * dustRuns
            },
            {
                Material: 'Sharpodonty',
                Quantity: 250 * dustRuns
            }
        ]
    }

    const newGeneratedCards = [...otherStageCards]
    if (dustRuns > 0) {
        newGeneratedCards.push(dustCard as ICard)
    }
    if (sharpoRuns > 0) {
        newGeneratedCards.push(sharpoCard as ICard)
    }

    return newGeneratedCards
}
