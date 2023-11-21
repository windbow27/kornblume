<script setup>
import { ref, computed, defineProps } from 'vue';
import c from '../../../public/data/calculations.json';

const calculations = ref(c);

const calc = computed(() => (arc) => {
    // Find the calculation based on arc's rarity and insight
    return calculations.value.find((calculation) =>
        calculation.Rarity.includes(arc.info.Rarity)
    );
});

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const calculateMaterial = computed(() => {
    return props.selectedArcanists.map(arc => {
        const currentCalc = calc.value(arc);
        //console.log(currentCalc);
        let totalMaterial = { "Dust": 0, "Coin": 0 };

        if (currentCalc) {
            for (let level = ++(arc.currentLevel); level <= arc.goalLevel; level++) {
                console.log(`Level ${level}`);
                const levelKey = (level).toString(); // Convert level to a string
                console.log(levelKey);
                const material = currentCalc.Levels[levelKey];

                if (material && 'Dust' in material && 'Coin' in material) {
                    console.log(`Level ${level}: Dust - ${material.Dust}, Coin - ${material.Coin}`);
                    totalMaterial.Dust += material.Dust;
                    totalMaterial.Coin += material.Coin;
                } else {
                    console.log(`Material for Level ${level} is incomplete or not found.`);
                }
            }

        }

        return totalMaterial;
    });
});
</script>

<template>
    <div>
        <p v-for="(arc, index) in selectedArcanists" :key="index">
            Total Dust for {{ arc.info.Name }}: {{ calculateMaterial[index].Dust }}
        </p>
        <p v-for="(arc, index) in selectedArcanists" :key="index">
            Total Coin for {{ arc.info.Name }}: {{ calculateMaterial[index].Coin }}
        </p>
    </div>
</template>

<style scoped></style>
