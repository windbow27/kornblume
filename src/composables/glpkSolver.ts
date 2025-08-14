import GLPK, { LP as GLPKModel } from 'glpk.js';
import { useDataStore } from '../stores/dataStore';
import { useWarehouseStore } from '../stores/warehouseStore';
import { getDrops } from './planner';
import { useActivityStore } from '../stores/activityStore';
import { useWildernessStore } from '../stores/wildernessStore';
import { IMaterialUnit } from '@/types';
import { useGlobalStore } from '../stores/global';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let glpk = null as any;
let itemRarityMap: Record<string, number> | null = null;

const getGLPKModel = (yalpsModel) => {
    const model = {
        ...yalpsModel,
        binaries: [],
        constraints: Object.keys(yalpsModel.constraints).map((constraintName) => [
            constraintName,
            yalpsModel.constraints[constraintName]
        ]),
        variables: Object.keys(yalpsModel.variables).map((variableName) => [
            variableName,
            Object.keys(yalpsModel.variables[variableName]).map((coefs) => [
                coefs,
                yalpsModel.variables[variableName][coefs]
            ])
        ])
    };

    const constraints = new Map<string, GLPKModel['subjectTo'][0]>();
    for (const [name, { equal, min, max }] of model.constraints) {
        // prettier-ignore
        const bnds =
        equal != null
            ? { type: glpk.GLP_FX, ub: 0.0, lb: equal }
            : min != null && max != null
                ? { type: glpk.GLP_DB, ub: max, lb: min }
                : min != null
                    ? { type: glpk.GLP_LO, ub: 0.0, lb: min }
                    : max != null
                        ? { type: glpk.GLP_UP, ub: max, lb: 0.0 }
                        : { type: glpk.GLP_FR, ub: 0.0, lb: 0.0 }

        constraints.set(name, { name, vars: [], bnds });
    }

    const objective: GLPKModel['objective']['vars'] = [];
    for (const [name, variable] of model.variables) {
        for (const [key, coef] of variable) {
            if (model.objective === key) objective.push({ name, coef });
            constraints.get(key)?.vars.push({ name, coef });
        }
    }

    return {
        name: 'GLPK',
        objective: {
            direction: model.direction === 'minimize' ? glpk.GLP_MIN : glpk.GLP_MAX,
            name: model.objective ?? '',
            vars: objective
        },
        subjectTo: Array.from(constraints.values()),
        binaries: Array.from(model.binaries),
        generals: Array.from(model.integers)
    };
};

const formulas = useDataStore().formulas;

interface ICard {
    stage: string;
    runs: number;
    activity: number;
    days: number;
    materials: IMaterialUnit[];
    activityImagePath: string;
}

function getDaysFromActivity(activity): number {
    const dailyActivity = useActivityStore().settings.activity;
    return Number((activity / dailyActivity).toFixed(1));
}

function getItemRarityMap() {
    if (itemRarityMap) return itemRarityMap;
    itemRarityMap = {};
    try {
        const items = useDataStore().items || [];
        items.forEach((item) => {
            itemRarityMap![item.Name] = item.Rarity;
        });
    } catch (e) {
        itemRarityMap = {};
    }
    return itemRarityMap;
}

function createFlexConversionVariables(constraints, flexCounts, itemRarityMap, flexNames) {
    const flexConversionVars = {};
    const flexConstraints = {};

    for (const rarity in flexCounts) {
        if (flexCounts[rarity] > 0) {
            const flexName = flexNames[rarity];
            flexConstraints[`flex_${flexName}`] = { max: flexCounts[rarity] };
        }
    }

    const items = useDataStore().items || [];
    const itemCategoryMap = {};
    items.forEach((item) => {
        itemCategoryMap[item.Name] = item.Category;
    });

    for (const matlName in constraints) {
        const rarity = itemRarityMap[matlName];
        const category = itemCategoryMap[matlName];
        if (
            rarity &&
            flexCounts[rarity] &&
            flexCounts[rarity] > 0 &&
            category === 'Build Material'
        ) {
            const flexName = flexNames[rarity];
            const conversionVarName = `flex_convert_${matlName}`;

            flexConversionVars[conversionVarName] = {
                [matlName]: 1, // produces 1 unit of the material
                [`flex_${flexName}`]: 1, // consumes 1 unit of the flex item
                cost: 0 // no additional cost for conversion
            };
        }
    }

    return { flexConversionVars, flexConstraints };
}

export async function getSolve(materials) {
    if (!glpk) {
        glpk = await GLPK();
    }

    const drops = getDrops();
    const warehouse = useWarehouseStore().data;

    // prepare constraints
    const materialConstraints = {};
    const neededConstraints = {};
    // the LP currently doesn't account for the oneiric shop
    // since it's not really related to activity or farming routes

    // i dont want to add new variable so i added reverie materials here too
    // it shouldnt matter
    const resonanceMaterial = [
        'Sinuous Howl',
        'Interlaced Shudder',
        'Hypocritical Murmur',
        'Hoarse Echo',
        'Sonorous Knell',
        'Brief Cacophony',
        'Moment of Dissonance',
        'Crystal Casket',
        'Key of Reverie',
        'Sprout of Reverie',
        'Seed of Insight',
        'Key of New Sprout'
    ];

    materials.forEach(({ Material: matlName, Quantity: quantity }) => {
        if (!resonanceMaterial.includes(matlName)) {
            // filters out the materials from the oneiric shop
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
            dropMapping[stage][matlName] = times
                ? dropCount[matlName] / times
                : dropCount[matlName];
        }
    }

    const constraints = {
        ...materialConstraints,
        ...neededConstraints
    };

    // consider warehouse and flex build materials by rarity
    const flexNames = {
        2: 'Simple Insight Casket',
        3: 'Fine Insight Casket',
        4: 'Delicate Insight Casket',
        5: 'Exquisite Insight Casket',
        6: 'Mystical Insight Casket'
    };

    const flexCounts = {
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    };

    warehouse.forEach((matlInfo) => {
        const { Material: matlName, Quantity: quantity } = matlInfo;
        for (const rarity in flexNames) {
            if (matlName === flexNames[rarity]) {
                flexCounts[rarity] += quantity;
                return;
            }
        }
        const matlQuant = quantity;
        if (matlQuant > 0) {
            if (constraints[matlName]) {
                constraints[matlName] = {
                    min: constraints[matlName].min - matlQuant
                };
            } else {
                constraints[matlName] = {
                    min: -matlQuant
                };
            }
        }
    });

    const itemRarityMap = getItemRarityMap();

    const { flexConversionVars, flexConstraints } = createFlexConversionVariables(
        constraints,
        flexCounts,
        itemRarityMap,
        flexNames
    );

    const allConstraints = {
        ...constraints,
        ...flexConstraints
    };

    const variables = {
        ...craftMapping,
        ...dropMapping,
        ...flexConversionVars
    };

    const model = {
        objective: 'cost',
        direction: 'minimize',
        constraints: allConstraints,
        variables,
        integers
    };

    const glpkModel = getGLPKModel(model);
    const glpkSolver = await glpk.solve(glpkModel as GLPKModel);

    if (glpkSolver.result.status !== 5) {
        console.log(
            `%cStatus: ${glpkSolver.result.status}`,
            'background-color: yellow; color: black;'
        );
        console.log('constraints: ', allConstraints);
        console.log('variables: ', variables);
    }

    const flexUsage = {};
    const resultVariables = Object.keys(glpkSolver.result.vars)
        .map((variableName) => [variableName, glpkSolver.result.vars[variableName]])
        .filter((variable) => variable[1] !== 0);

    resultVariables.forEach(([varName, value]) => {
        if (varName.startsWith('flex_convert_')) {
            const materialName = varName.replace('flex_convert_', '');
            const rarity = itemRarityMap[materialName];
            if (rarity) {
                // round to nearest integer and filter out near-zero values
                const roundedValue = Math.round(value);
                if (roundedValue > 0) {
                    flexUsage[materialName] = {
                        rarity,
                        used: roundedValue,
                        flexName: flexNames[rarity]
                    };
                }
            }
        }
    });

    const glpkResult = {
        status: glpkSolver.result.status,
        variables: resultVariables.filter(
            ([varName]) => !varName.startsWith('flex_convert_') && !varName.startsWith('flex_')
        ),
        flexUsage
    };

    return glpkResult;
}

export async function processSharpoAndDust(generatedCards: ICard[]) {
    let sharpoForCrafting = 0;
    const craftingCard = generatedCards.find((card) => card.stage === 'Wilderness Wishing Spring');
    if (craftingCard) {
        craftingCard.materials.forEach(({ Material: matlName, Quantity: matlQuant }) => {
            const formula = formulas.find((matl) => matl.Name === matlName);
            if (formula?.Quantity.length) {
                sharpoForCrafting += formula?.Quantity[formula?.Quantity.length - 1] * matlQuant;
            }
        });
    }
    const sharpoForGoal =
        useGlobalStore().getNeededMaterialsQuantity('Sharpodonty') + sharpoForCrafting;
    const dustForGoal = useGlobalStore().getNeededMaterialsQuantity('Dust');

    let activityForOthers = 0;
    const otherStageCards = generatedCards.filter(
        (card) => card.stage !== 'The Poussiere VI' && card.stage !== 'Mintage Aesthetics VI'
    );
    otherStageCards.forEach((card) => {
        if (card.stage !== 'Oneiric Shop') {
            activityForOthers += card.activity;
        }
    });
    const dailyActivity = useActivityStore().settings.activity;
    const daysForOthers = getDaysFromActivity(activityForOthers);

    const warehouseSharpo =
        useWarehouseStore().data.find((matl) => matl.Material === 'Sharpodonty')?.Quantity || 0;
    const warehouseDust =
        useWarehouseStore().data.find((matl) => matl.Material === 'Dust')?.Quantity || 0;

    const wildernessDailyProduct = useWildernessStore().settings.wildernessOutput;
    const remainingSharpo = Math.max(
        sharpoForGoal - wildernessDailyProduct.gold * daysForOthers - warehouseSharpo,
        0
    );
    const remainingDust = Math.max(
        dustForGoal - wildernessDailyProduct.dust * daysForOthers - warehouseDust,
        0
    );

    const variables = {
        'The Poussiere VI': {
            Dust: 12500 + Number(((wildernessDailyProduct.dust * 25) / dailyActivity).toFixed(1)),
            Sharpodonty:
                250 + Number(((wildernessDailyProduct.gold * 25) / dailyActivity).toFixed(1)),
            Cost: 25
        },
        'Mintage Aesthetics VI': {
            Dust: 0 + Number(((wildernessDailyProduct.dust * 25) / dailyActivity).toFixed(1)),
            Sharpodonty:
                9000 + Number(((wildernessDailyProduct.gold * 25) / dailyActivity).toFixed(1)),
            Cost: 25
        }
    };
    const constraints = {
        Sharpodonty: { min: remainingSharpo },
        Dust: { min: remainingDust }
    };

    const model = {
        objective: 'Cost',
        direction: 'minimize',
        constraints,
        variables,
        integers: Object.keys(variables)
    };

    const glpkModel = getGLPKModel(model);
    const glpkSolver = await glpk.solve(glpkModel as GLPKModel);
    const glpkResult = {
        status: glpkSolver.result.status,
        variables: Object.keys(glpkSolver.result.vars)
            .map((variableName) => [variableName, glpkSolver.result.vars[variableName]])
            .filter((variable) => variable[1] !== 0)
    };

    let sharpoRuns = 0;
    let dustRuns = 0;
    glpkResult.variables.forEach(([stage, run]) => {
        if (stage === 'Mintage Aesthetics VI') {
            sharpoRuns = Number(run);
        } else {
            dustRuns = Number(run);
        }
    });

    const sharpoCard = {
        stage: 'Mintage Aesthetics VI',
        activityImagePath: 'images/items/common/0.webp',
        runs: sharpoRuns,
        activity: 25 * sharpoRuns,
        days: getDaysFromActivity(25 * sharpoRuns),
        materials: [
            {
                Material: 'Sharpodonty',
                Quantity: 9000 * sharpoRuns
            }
        ]
    };
    const dustCard = {
        stage: 'The Poussiere VI',
        activityImagePath: 'images/items/common/0.webp',
        runs: dustRuns,
        activity: 25 * dustRuns,
        days: getDaysFromActivity(25 * dustRuns),
        materials: [
            {
                Material: 'Dust',
                Quantity: 12500 * dustRuns
            },
            {
                Material: 'Sharpodonty',
                Quantity: 250 * dustRuns
            }
        ]
    };

    const newGeneratedCards = [...otherStageCards];
    if (dustRuns > 0) {
        newGeneratedCards.push(dustCard as ICard);
    }
    if (sharpoRuns > 0) {
        newGeneratedCards.push(sharpoCard as ICard);
    }

    return newGeneratedCards;
}
