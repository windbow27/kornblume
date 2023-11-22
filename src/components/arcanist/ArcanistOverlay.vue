<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import a from '../../../public/data/arcanists.json';
import c from '../../../public/data/calculations.json';

const arcanists = ref(a);
const calculations = ref(c);


const selectedArcanist = ref([]);
const selectedCurrentInsight = ref(null);
const selectedCurrentLevel = ref(null);
const selectedCurrentResonance = ref(null);
const selectedGoalInsight = ref(null);
const selectedGoalLevel = ref(null);
const selectedGoalResonance = ref(null);

const props = defineProps(['selectedArcanists']);
const emit = defineEmits(['closeOverlay']);

const newArcanist = computed(() => ({
  info: selectedArcanist.value,
  currentInsight: selectedCurrentInsight.value,
  currentLevel: selectedCurrentLevel.value,
  goalInsight: selectedGoalInsight.value,
  goalLevel: selectedGoalLevel.value,
  currentResonance: selectedCurrentResonance.value,
  goalResonance: selectedGoalResonance.value
}));

const arc = computed(() => {
    if (selectedArcanist.value.length === 0) {
        return null;
    }
    return arcanists.value.find((arc) => arc.Id === selectedArcanist.value.Id);
});

const rarity = computed(() => {
    if (!arc.value) return null;
    return arc.value.Rarity;
});

const currentInsightOptions = computed(() => {
    if (!arc.value) return null;
    return [0, ...arc.value.Insight.map((insight) => insight.Id)];
});

const goalInsightOptions = computed(() => {
    if (!arc.value) return null;
    return currentInsightOptions.value.filter(insight => insight >= selectedCurrentInsight.value);
});

const currentLevelOptions = computed(() => {
    if (!arc.value || !selectedCurrentInsight.value) return null;
    const calc = calculations.value.find((calc) =>
        calc.Rarity.includes(arc.value.Rarity) &&
        calc.Insight == selectedCurrentInsight.value
    );
    return [1, ...Object.keys(calc.Levels).map(Number)];
});

const goalLevelOptions = computed(() => {
    if (!arc.value || !selectedGoalInsight.value) return null;
    const calc = calculations.value.find((calc) =>
        calc.Rarity.includes(arc.value.Rarity) &&
        calc.Insight == selectedGoalInsight.value
    );
    if (selectedGoalInsight.value === selectedCurrentInsight.value) {
        return [1, ...Object.keys(calc.Levels).map(Number)].filter(level => level >= selectedCurrentLevel.value);
    }
    return [1, ...Object.keys(calc.Levels).map(Number)];
});

const currentResonanceOptions = computed(() => {
    if (!arc.value) return null;
    const insightValue = Number(selectedCurrentInsight.value);
    if (insightValue === 0) {
        selectedCurrentResonance.value = null;
        return null;
    }
    const upperLimit = insightValue * 5;
    return Array.from({ length: upperLimit }, (_, index) => Number(index + 1));
});

const goalResonanceOptions = computed(() => {
    if (!arc.value) return null;
    const insightValue = Number(selectedGoalInsight.value);
    const currentResonance = Number(selectedCurrentResonance.value);
    if (insightValue === 0) {
        selectedGoalResonance.value = null;
        return null;
    }
    const lowerLimit = currentResonance || 1; // Start from selectedCurrentResonance or 1 if not set
    const upperLimit = insightValue * 5;
    return Array.from({ length: upperLimit - lowerLimit + 1 }, (_, index) => Number(lowerLimit + index));
});


const compareLevels = (currentInsightSelect, currentLevelSelect, goalInsightSelect, goalLevelSelect) => {
    if (Number(currentInsightSelect) > Number(goalInsightSelect)) {
        // If current insight is higher, consider it as "lower" regardless of levels
        return true;
    } else if (Number(currentInsightSelect) < Number(goalInsightSelect)) {
        // If current insight is lower, consider it as "higher" regardless of levels
        return false;
    } else {
        // If insights are equal, compare levels
        return Number(currentLevelSelect) > Number(goalLevelSelect);
    }
};

watch([selectedCurrentInsight, selectedCurrentLevel, selectedCurrentResonance], () => {
    if (compareLevels(selectedCurrentInsight.value, selectedCurrentLevel.value, selectedGoalInsight.value, selectedGoalLevel.value)) {
        //console.log('Current is higher than goal');
        selectedGoalInsight.value = selectedCurrentInsight.value;
        selectedGoalLevel.value = selectedCurrentLevel.value;
    }
    if (Number(selectedCurrentResonance.value) > Number(selectedGoalResonance.value)) {
        selectedGoalResonance.value = selectedCurrentResonance.value;
    }
});

const addArcanist = () => {
    //find a better check
    if (selectedArcanist.value.length === 0
    || !selectedCurrentInsight.value
    || !selectedCurrentLevel.value
    || !selectedGoalInsight.value
    || !selectedGoalLevel.value
    ) {
        emit('closeOverlay');
        return;
    }
    props.selectedArcanists.push(newArcanist.value);
    emit('closeOverlay');
};

const cancelAddingArcanist = () => {
    emit('closeOverlay');
};

</script>

<template>
    <div class="add-arcanist-overlay">
        <div class="overlay-header">
            <label for="arcanistSelect">Select an Arcanist:</label>
            <select id="arcanistSelect" v-model="selectedArcanist">
                <option v-for="arc in arcanists" :key="arc.Id" :value="arc">
                    {{ arc.Name }}
                </option>
            </select>
            <button @click="addArcanist">Add Arcanist</button>
            <button @click="cancelAddingArcanist">Cancel</button>
        </div>
        <div class="overlay-body">
            <div>
                <label for="raritySelect">Rarity: {{ rarity }} ✦ </label>
            </div>
            <div>
                <label for="currentInsightSelect">Current Insight:</label>
                <select id="currentInsightSelect" v-model="selectedCurrentInsight">
                    <option v-for="insight in currentInsightOptions" :key="insight">{{ insight }}</option>
                </select>
            </div>
            <div>
                <label for="currentLevelSelect">Current Level:</label>
                <select id="currentLevelSelect" v-model="selectedCurrentLevel">
                    <option v-for="level in currentLevelOptions" :key="level">{{ level }}</option>
                </select>
            </div>
            <div>
                <label for="goalInsightSelect">Goal Insight:</label>
                <select id="goalInsightSelect" v-model="selectedGoalInsight">
                    <option v-for="insight in goalInsightOptions" :key="insight">{{ insight }}</option>
                </select>
            </div>
            <div>
                <label for="goalLevelSelect">Goal Level:</label>
                <select id="goalLevelSelect" v-model="selectedGoalLevel">
                    <option v-for="level in goalLevelOptions" :key="level">{{ level }}</option>
                </select>
            </div>
            <div>
                <label for="currentResonanceSelect">Current Resonance:</label>
                <select id="currentResonanceSelect" v-model="selectedCurrentResonance">
                    <option v-for="resonance in currentResonanceOptions" :key="resonance">{{ resonance }}</option>
                </select>
            </div>
            <div>
                <label for="goalResonanceSelect">Goal Resonance:</label>
                <select id="goalResonanceSelect" v-model="selectedGoalResonance">
                    <option v-for="resonance in goalResonanceOptions" :key="resonance">{{ resonance }}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<style scoped>
label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

select {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1.6rem;
    border: 1px solid #ccc;
    border-radius: 0.4rem;
    box-sizing: border-box;
}

button {
    background-color: rgb(72, 194, 235);
    width: 30%;
    color: #fff;
    padding: 2.5%;
    margin: 2.5%;
    border: none;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.add-arcanist-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.overlay-header {
    width: 50%;
    background-color: #fff;
    padding: 3rem 3rem 1rem;
    text-align: center;
}

.overlay-body {
    width: 50%;
    background-color: #fff;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0rem 3rem 3rem;
}

.overlay-body div {
    width: 100%;
    margin-bottom: 2.5%;
}

.overlay-body div:not(:first-child) {
    width: calc(50% - 0.5rem);
}
</style>
