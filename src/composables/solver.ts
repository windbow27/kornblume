import { useDataStore } from '../stores/dataStore'
import { useWarehouseStore } from '../stores/warehouseStore'
import { solve, Model } from 'yalps';
import { getDrops } from './planner';

const formulas = useDataStore().formulas;

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
    const integers : string[] = [];

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
