import { useDataStore } from '../stores/dataStore';
import { useGlobalStore } from '../stores/global';
import { levelUpResources } from '../constants';

const calculations = levelUpResources;
const items = useDataStore().items;
const arcanists = useDataStore().arcanists;

const categoryPriority = {
    'Base Item': 0,
    'Resonate Material': 1,
    'Insight Material': 2,
    'Build Material': 2 // insight/build material have same priority, should be arranged according to rarity
}

function sortMaterials (array) {
    array.sort((matA, matB) => {
        // Find corresponding item based on material name
        const itemIndexA = items.findIndex(item => item.Name === matA.Material);
        const itemIndexB = items.findIndex(item => item.Name === matB.Material);
        const itemA = items[itemIndexA];
        const itemB = items[itemIndexB];

        if (itemA && itemB) {
            // Sort by category priority first
            const categoryOrderA = categoryPriority[itemA.Category];
            const categoryOrderB = categoryPriority[itemB.Category];
            if (categoryOrderA !== categoryOrderB) {
                return categoryOrderA - categoryOrderB;
            } else if (itemB.Rarity !== itemA.Rarity) {
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

export function mergeResults (resultsArray) {
    const merged = {};

    resultsArray.forEach((results) => {
        if (results) {
            if (Array.isArray(results)) {
                // If results is an array, flatten it
                const flattenedResults = results.flat();

                // Iterate over flattened results
                flattenedResults.forEach(({ Material, Quantity }) => {
                    if (merged[Material]) {
                        merged[Material] += Quantity;
                    } else {
                        merged[Material] = Quantity;
                    }
                });
            } else if (typeof results === 'object') {
                // If results is an object, iterate over its properties
                Object.entries(results).forEach(([Material, Quantity]) => {
                    if (merged[Material]) {
                        merged[Material] += Quantity;
                    } else {
                        merged[Material] = Quantity;
                    }
                });
            }
        }
    });

    useGlobalStore().updateNeededRawMaterialsMapping(merged);

    const arrayMerged = Object.keys(merged).map((material) => ({
        Material: material,
        Quantity: merged[material]
    }));

    return arrayMerged;
}

export function formatResults (result) {
    sortMaterials(result);

    // Check if Dust and Sharpodonty quantities are both zero
    const dustQuantity = result.find(item => item.Material === 'Dust')?.Quantity || 0;
    const sharpodontyQuantity = result.find(item => item.Material === 'Sharpodonty')?.Quantity || 0;

    if (dustQuantity === 0 && sharpodontyQuantity === 0) {
        // If both 'Dust' and 'Sharpodonty' quantities are zero, remove them from the result
        const filteredResult = result.filter(item => item.Material !== 'Dust' && item.Material !== 'Sharpodonty');
        return filteredResult;
    }

    return result;
}

export function formatResultsWithCasket (result) {
    // Check if Dust and Sharpodonty quantities are both zero
    const dustQuantity = result.find(item => item.Material === 'Dust')?.Quantity || 0;
    const sharpodontyQuantity = result.find(item => item.Material === 'Sharpodonty')?.Quantity || 0;

    if (dustQuantity === 0 && sharpodontyQuantity === 0) {
        // If both 'Dust' and 'Sharpodonty' quantities are zero, remove them from the result
        const filteredResult = result.filter(item => item.Material !== 'Dust' && item.Material !== 'Sharpodonty');
        return filteredResult;
    }

    // count the total of 'Sinuous Howl',
    // 'Interlaced Shudder',
    // 'Hypocritical Murmur',
    // 'Hoarse Echo',

    const sinuousHowlQuantity = result.find(item => item.Material === 'Sinuous Howl')?.Quantity || 0;
    const interlacedShudderQuantity = result.find(item => item.Material === 'Interlaced Shudder')?.Quantity || 0;
    const hypocriticalMurmurQuantity = result.find(item => item.Material === 'Hypocritical Murmur')?.Quantity || 0;
    const hoarseEchoQuantity = result.find(item => item.Material === 'Hoarse Echo')?.Quantity || 0;
    result.push({ Material: 'Crystal Casket', Quantity: sinuousHowlQuantity + interlacedShudderQuantity + hypocriticalMurmurQuantity + hoarseEchoQuantity });
    // remove the 'Sinuous Howl', 'Interlaced Shudder', 'Hypocritical Murmur', 'Hoarse Echo' from the result
    const filteredResult = result.filter(item => item.Material !== 'Sinuous Howl' && item.Material !== 'Interlaced Shudder' && item.Material !== 'Hypocritical Murmur' && item.Material !== 'Hoarse Echo');
    sortMaterials(filteredResult);

    return filteredResult;
}

export function useCalculation (arc) {
    const arcInfo = arcanists.find((arcanist) => arcanist.Id === arc.Id);
    const calculateExp = (arc) => {
        const total = { Dust: 0, Sharpodonty: 0 };

        // Same level insight calculation
        if (arc.currentInsight === arc.goalInsight) {
            const { Dust, Sharpodonty } = sumExp(arc.currentLevel, arc.goalLevel, arc, arc.currentInsight);
            total.Dust += Dust;
            total.Sharpodonty += Sharpodonty;
            return total;
        }

        // Different level insight calculation
        for (let insight = arc.currentInsight; insight <= arc.goalInsight; insight++) {
            if (insight < arc.goalInsight) {
                const currentCalc = getLevelsInfo(arc, insight);
                total.Dust += currentCalc.Total.Dust;
                total.Sharpodonty += currentCalc.Total.Sharpodonty;

                if (insight === arc.currentInsight) {
                    const { Dust, Sharpodonty } = sumExp(1, arc.currentLevel, arc, insight);
                    total.Dust -= Dust;
                    total.Sharpodonty -= Sharpodonty;
                }
            } else {
                const { Dust, Sharpodonty } = sumExp(1, arc.goalLevel, arc, insight);
                total.Dust += Dust;
                total.Sharpodonty += Sharpodonty;
            }
        }

        const result = [
            { Material: 'Dust', Quantity: total.Dust },
            { Material: 'Sharpodonty', Quantity: total.Sharpodonty }
        ];

        return result;
    };

    const calculateMaterials = (currentType, goalType, type) => {
        const materialsCount = {};
        if (currentType === goalType) return null;
        // Iterate over insights between currentInsight and goalInsight (inclusive)
        for (let current = Number(currentType + 1); current <= goalType; current++) {
            const data = type.find(obj => obj.Id === current);
            if (data) {
                data.Material.forEach((material, index) => {
                    const quantity = data.Quantity[index];

                    // Accumulate materials and quantities
                    if (materialsCount[material]) {
                        materialsCount[material] += quantity;
                    } else {
                        materialsCount[material] = quantity;
                    }
                });
            }
        }

        // Convert the accumulated data to the desired format
        const result = Object.keys(materialsCount).map(material => ({
            Material: material,
            Quantity: materialsCount[material]
        }));
        return result;
    };

    const calculateFrequencyMaterials = (frequencyList, type) => {
        const materialsCount = {};

        if (frequencyList) {
            frequencyList.forEach(frequency => {
                const data = type.find(obj => obj.Type === frequency.Type && obj.Id === frequency.Id);
                if (data && data.Material && Array.isArray(data.Material)) {
                    data.Material.forEach((material, index) => {
                        const quantity = data.Quantity[index];

                        // Accumulate materials and quantities
                        if (materialsCount[material]) {
                            materialsCount[material] += quantity;
                        } else {
                            materialsCount[material] = quantity;
                        }
                    });
                }
            });

            // Convert the accumulated data to the desired format
            const result = Object.keys(materialsCount).map(material => ({
                Material: material,
                Quantity: materialsCount[material]
            }));
            return result;
        }
    };

    const getLevelsInfo = (arc, insight) => {
        const currentCalc = calculations.find((calc) =>
            calc.Rarity.includes(arcInfo.Rarity) &&
            calc.Insight === insight
        );
        return currentCalc;
    };

    const sumExp = (startLevel, endlevel, arc, insight) => {
        const total = { Dust: 0, Sharpodonty: 0 };

        for (let level = Number(++startLevel); level <= Number(endlevel); level++) {
            const currentCalc = getLevelsInfo(arc, insight);
            const levelKey = level.toString();
            const material = currentCalc.Levels[levelKey];

            if (material) {
                total.Dust += material.Dust;
                total.Sharpodonty += material.Sharpodonty;
            }
        }

        return total;
    };
    // Get the results from calculateInsight, calculateResonance, and calculateExp
    const insightResults = calculateMaterials(arc.currentInsight, arc.goalInsight, arcInfo.Insight);
    const resonanceResults = calculateMaterials(arc.currentResonance, arc.goalResonance, arcInfo.Resonance);
    const frequencyResults = calculateFrequencyMaterials(arc.frequency, arcInfo.Frequency);
    const expResults = calculateExp(arc);
    // Merge all results into a single object
    const mergedResults = mergeResults([insightResults, resonanceResults, frequencyResults, expResults]);
    // Convert the merged object into the desired format
    const result = formatResults(mergedResults);
    return result;
}
