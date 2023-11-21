<script setup>
import { ref, watch, computed } from 'vue';
import a from '../../../public/data/arcanists.json';
import c from '../../../public/data/calculations.json';

const arcanists = ref(a);
const calculations = ref(c);

const props = defineProps(['selectedArcanists']);
const emit = defineEmits(['closeOverlay']);

// Stats variables
const rarityOption = ref([]);
const insightOptions = ref([]);
const levelOptions = ref([]);
const resonanceOptions = ref([]);

const selectedArcanist = ref([]);
// Selected stat values
const selectedRarity = ref(null);
const selectedCurrentInsight = ref(null);
const selectedCurrentLevel = ref(null);
const selectedGoalInsight = ref(null);
const selectedGoalLevel = ref(null);
const selectedCurrentResonance = ref(null);
const selectedGoalResonance = ref(null);

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
  return arcanists.value.find((arcanist) => arcanist.Id === selectedArcanist.value.Id);
});

const calc = computed(() => {
  const currentArc = arc.value;

  if (currentArc) {
    return calculations.value.find((calc) =>
      calc.Rarity.includes(currentArc.Rarity) &&
      currentArc.Insight.some(insight => insight.Id === calc.Insight)
    );
  } else {
    return null;
  }
});

const updateStatsBasedOnArcanist = () => {
  if (selectedArcanist.value && arc.value && calc.value) {
    rarityOption.value = arc.value.Rarity;

    levelOptions.value = [1, ...Object.keys(calc.value.Levels).map(Number)];

    insightOptions.value = [0, ...arc.value.Insight.map(insight => insight.Id)];

    resonanceOptions.value = [1, ...arc.value.Resonate.map(resonate => resonate.Id)];

    selectedRarity.value = rarityOption.value;
    selectedCurrentInsight.value = insightOptions.value[0];
    selectedCurrentLevel.value = levelOptions.value[0];
    selectedCurrentResonance.value = resonanceOptions.value[0];
    selectedGoalInsight.value = insightOptions.value[0];
    selectedGoalLevel.value = levelOptions.value[0];
    selectedGoalResonance.value = resonanceOptions.value[0];
  }
};


const compareLevels = (currentInsightSelect, currentLevelSelect, goalInsightSelect, goalLevelSelect) => {
    if (currentInsightSelect > goalInsightSelect) {
        // If current insight is higher, consider it as "lower" regardless of levels
        return true;
    } else if (currentInsightSelect < goalInsightSelect) {
        // If current insight is lower, consider it as "higher" regardless of levels
        return false;
    } else {
        // If insights are equal, compare levels
        return currentLevelSelect > goalLevelSelect;
    }
};

const updateBasedOnCurrent = () => {
  const currentArc = arc.value;
  const currentCalc = calc.value;

  if (!currentArc || !currentCalc) {
    // Handle the case where arc or calc is not defined
    return;
  }

  if (compareLevels(selectedCurrentInsight.value, selectedCurrentLevel.value, selectedGoalInsight.value, selectedGoalLevel.value)) {
    selectedGoalInsight.value = selectedCurrentInsight.value;
    selectedGoalLevel.value = selectedCurrentLevel.value;
  }

  if (selectedCurrentResonance.value > selectedGoalResonance.value) {
    selectedGoalResonance.value = selectedCurrentResonance.value;
  }

  // Filter goal options based on current values
  insightOptions.value = [0, ...currentArc.Insight.map(insight => insight.Id)].filter(insight => insight >= selectedGoalInsight.value);
  levelOptions.value = [1, ...Object.keys(currentCalc.Levels).map(Number)].filter(level => level >= selectedGoalLevel.value);
  resonanceOptions.value = [1, ...currentArc.Resonate.map(resonate => resonate.Id)].filter(resonate => resonate >= selectedGoalResonance.value);

  // Adjust selected goal values if they are now lower than the filtered options
  if (!insightOptions.value.includes(selectedGoalInsight.value)) {
    selectedGoalInsight.value = insightOptions.value[0];
  }
  if (!levelOptions.value.includes(selectedGoalLevel.value)) {
    selectedGoalLevel.value = levelOptions.value[0];
  }
  if (!resonanceOptions.value.includes(selectedGoalResonance.value)) {
    selectedGoalResonance.value = resonanceOptions.value[0];
  }

  // Filter current options based on current values
  insightOptions.value = [0, ...currentArc.Insight.map(insight => insight.Id)].filter(insight => insight >= selectedCurrentInsight.value);
};


const addArcanist = () => {
    if (selectedArcanist.value.length === 0) {
        emit('closeOverlay');
        return;
    }
    // console.log(newArcanist.value)
    props.selectedArcanists.push(newArcanist.value);
    emit('closeOverlay');
};

const cancelAddingArcanist = () => {
    // Close the overlay without adding
    emit('closeOverlay');
};

watch(selectedArcanist, updateStatsBasedOnArcanist);

watch([selectedCurrentInsight, selectedCurrentLevel, selectedCurrentResonance], updateBasedOnCurrent);

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
                <label for="raritySelect">Rarity: {{ selectedRarity }} ✦ </label>
            </div>
            <div>
                <label for="currentInsightSelect">Current Insight:</label>
                <select id="currentInsightSelect" v-model="selectedCurrentInsight">
                    <option v-for="insight in (selectedRarity >= 5 ? insightOptions : insightOptions.slice(0, 3))"
                        :key="insight">{{ insight }}</option>
                </select>
            </div>
            <div>
                <label for="currentLevelSelect">Current Level:</label>
                <select id="currentLevelSelect" v-model="selectedCurrentLevel">
                    <option v-for="level in levelOptions" :key="level">{{ level }}</option>
                </select>
            </div>
            <div>
                <label for="goalInsightSelect">Goal Insight:</label>
                <select id="goalInsightSelect" v-model="selectedGoalInsight">
                    <option v-for="insight in insightOptions" :key="insight">{{ insight }}</option>
                </select>
            </div>
            <div>
                <label for="goalLevelSelect">Goal Level:</label>
                <select id="goalLevelSelect" v-model="selectedGoalLevel">
                    <option v-for="level in levelOptions" :key="level">{{ level }}</option>
                </select>
            </div>
            <div>
                <label for="currentResonanceSelect">Current Resonance:</label>
                <select id="currentResonanceSelect" v-model="selectedCurrentResonance">
                    <option v-for="resonance in resonanceOptions" :key="resonance">{{ resonance }}</option>
                </select>
            </div>
            <div>
                <label for="goalResonanceSelect">Goal Resonance:</label>
                <select id="goalResonanceSelect" v-model="selectedGoalResonance">
                    <option v-for="resonance in resonanceOptions" :key="resonance">{{ resonance }}</option>
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
