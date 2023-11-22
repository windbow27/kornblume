<script setup>
import { ref, computed, defineProps } from 'vue';
import c from '../../../public/data/calculations.json';

const calculations = ref(c);

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const calculateUpgrades = computed(() => {
    return props.selectedArcanists.map(arc => {
        const insightMaterials = calculateMaterials(arc.currentInsight, arc.goalInsight, arc.info.Insight);
        const resonanceMaterials = calculateMaterials(arc.currentResonance, arc.goalResonance, arc.info.Resonance);
        return `${insightMaterials}${resonanceMaterials}`;
    });
});



const calculateExp = computed(() => {
    return props.selectedArcanists.map(arc => {
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
        return total;
    });
});

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

        const formattedResult = result.map(item => `${item.Material} ${item.Quantity}`).join('<br>');

        return formattedResult;
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
        <p v-for="(arc, index) in selectedArcanists" :key="index">
            Total Dust for {{ arc.info.Name }}: {{ calculateExp[index].Dust }}
        </p>
        <p v-for="(arc, index) in selectedArcanists" :key="index">
            Total Sharpodonty for {{ arc.info.Name }}: {{ calculateExp[index].Sharpodonty }}
        </p>
        <p v-for="(arc, index) in selectedArcanists" :key="index">
            <span v-html="`Total materials for ${arc.info.Name}:<br>${calculateUpgrades[index]}`"></span>
        </p>
    </div>
</template>

<style scoped></style>
