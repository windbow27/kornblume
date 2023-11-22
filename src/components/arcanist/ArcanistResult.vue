<script setup>
import { ref, computed, defineProps } from 'vue';
import c from '../../../public/data/calculations.json';
import MaterialCard from '../common/MaterialCard.vue';

const calculations = ref(c);

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const calculateArcanist = computed(() => {
    return props.selectedArcanists.map(arc => {
        // Get the results from calculateInsight, calculateResonance, and calculateExp
        const insightResults = calculateMaterials(arc.currentInsight, arc.goalInsight, arc.info.Insight);
        const resonanceResults = calculateMaterials(arc.currentResonance, arc.goalResonance, arc.info.Resonance);
        const expResults = calculateExp(arc);
        //console.log(insightResults, resonanceResults, expResults);
        // Helper function to merge results based on material name
        const mergeResults = (resultsArray) => {
            const merged = {};

            resultsArray.forEach((results) => {
                if (results) {
                    if (Array.isArray(results)) {
                        // If results is an array, flatten it and iterate over its elements
                        results.flat().forEach(({ Material, Quantity }) => {
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

            return merged;
        };


        // Merge all results into a single object
        const mergedResults = mergeResults([insightResults, resonanceResults, expResults]);

        // Convert the merged object into the desired format
        const result = Object.keys(mergedResults).map((material) => ({
            Material: material,
            Quantity: mergedResults[material],
        }));
        //console.log(result);

        return result;
    });
});

const calculateSelectedArcanists = computed(() => {
    const arcanistsResults = calculateArcanist.value;
    const totalMaterials = {};

    arcanistsResults.forEach((arcanistResult) => {
        arcanistResult.forEach(({ Material, Quantity }) => {
            if (totalMaterials[Material]) {
                totalMaterials[Material] += Quantity;
            } else {
                totalMaterials[Material] = Quantity;
            }
        });
    });

    // Convert the accumulated data to the desired format
    const result = Object.keys(totalMaterials).map((material) => ({
        Material: material,
        Quantity: totalMaterials[material],
    }));

    //console.log(result);

    return result;
});


const calculateExp = (arc) => {
    let total = { "Dust": 0, "Sharpodonty": 0 };
    // Same level insight calculation
    if (arc.currentInsight == arc.goalInsight) {
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
            //console.log(total);
            if (insight == arc.currentInsight) {
                const { Dust, Sharpodonty } = sumExp(1, arc.currentLevel, arc, insight);
                total.Dust -= Dust;
                total.Sharpodonty -= Sharpodonty;
                //console.log(total);
            }
        } else {
            const { Dust, Sharpodonty } = sumExp(1, arc.goalLevel, arc, insight);
            total.Dust += Dust;
            total.Sharpodonty += Sharpodonty;
            //console.log(total);
        }
    }
    const result = [
        { Material: 'Dust', Quantity: total.Dust },
        { Material: 'Sharpodonty', Quantity: total.Sharpodonty },
    ];
    return result;
};

const calculateMaterials = (currentType, goalType, type) => {
    const materialsCount = {};
    //console.log(type);
    // Iterate over insights between currentInsight and goalInsight (inclusive)
    for (let current = currentType; current <= goalType; current++) {
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
}

const getLevelsInfo = (arc, insight) => {
    const currentCalc = calculations.value.find((calc) =>
        calc.Rarity.includes(arc.info.Rarity) &&
        calc.Insight == insight
    );
    return currentCalc;
}

const sumExp = (startLevel, endlevel, arc, insight) => {
    let total = { "Dust": 0, "Sharpodonty": 0 };
    for (let level = Number(++startLevel); level <= Number(endlevel); level++) {
        const currentCalc = getLevelsInfo(arc, insight);
        //console.log(currentCalc);
        const levelKey = level.toString();
        const material = currentCalc.Levels[levelKey];
        //console.log(material);
        if (material) {
            total.Dust += material.Dust;
            total.Sharpodonty += material.Sharpodonty;
        }
    }
    return total;
}

</script>

<template>
    <div>
        <MaterialCard :calcArcanists="calculateSelectedArcanists"/>
    </div>
</template>

<style scoped></style>
