<script setup>
import { ref, watch} from 'vue';
import a from '../../public/data/arcanists.json';
import c from '../../public/data/calculations.json';

const isAddingArcanist = ref(false);
const arcanists = ref(a);
const calculations = ref(c);
const selectedArcanist = ref(null);
const selectedArcanists = ref([]);

// Stats variables
const rarityOption = ref([]);
const insightOptions = ref([]);
const levelOptions = ref([]);
const resonanceOptions = ref([]);

// Selected stat values
const selectedRarity = ref(null);
const selectedCurrentInsight = ref(null);
const selectedCurrentLevel = ref(null);
const selectedCurrentResonance = ref(null);
const selectedGoalInsight = ref(null);
const selectedGoalLevel = ref(null);
const selectedGoalResonance = ref(null);
let arc = ref(null);
let calc = ref(null);

const updateStatsBasedOnArcanist = () => {
  if (selectedArcanist.value) {
    arc = arcanists.value.find((arc) => arc.Id === selectedArcanist.value.Id);
    calc = calculations.value.find((calc) => 
        calc.Rarity.includes(arc.Rarity) &&
        arc.Insight.some(insight => insight.Id === calc.Insight)
        );

    rarityOption.value = arc.Rarity;

    levelOptions.value = [1, ...Object.keys(calc.Levels).map(Number)];

    insightOptions.value = [0, ...arc.Insight.map(insight => insight.Id)]; 

    resonanceOptions.value = [1, ...arc.Resonate.map(resonate => resonate.Id)];

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
  if (compareLevels(selectedCurrentInsight.value, selectedCurrentLevel.value, selectedGoalInsight.value, selectedGoalLevel.value)) {
    selectedGoalInsight.value = selectedCurrentInsight.value;
    selectedGoalLevel.value = selectedCurrentLevel.value;
  }
  if (selectedCurrentResonance.value > selectedGoalResonance.value) {
    selectedGoalResonance.value = selectedCurrentResonance.value;
  }

  // Filter goal options based on current values
  insightOptions.value = [0, ...arc.Insight.map(insight => insight.Id)].filter(insight => insight >= selectedCurrentInsight.value);
  levelOptions.value = [1, ...Object.keys(calc.Levels).map(Number)].filter(level => level >= selectedCurrentLevel.value);
  resonanceOptions.value = [1, ...arc.Resonate.map(resonate => resonate.Id)].filter(resonate => resonate >= selectedCurrentResonance.value);

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
};


watch(selectedArcanist, updateStatsBasedOnArcanist);

watch([selectedCurrentInsight, selectedCurrentLevel, selectedCurrentResonance], updateBasedOnCurrent);


const startAddingArcanist = () => {
  isAddingArcanist.value = true;
  selectedArcanist.value = null; // Reset selected arcanist when adding a new one
};

const cancelAddingArcanist = () => {
    isAddingArcanist.value = false;
    selectedRarity.value = null;
    selectedCurrentInsight.value = null;
    selectedCurrentLevel.value = null;
    selectedCurrentResonance.value = null;
    selectedGoalInsight.value = null;
    selectedGoalLevel.value = null;
    selectedGoalResonance.value = null;
};

const addArcanist = () => {
  // Handle adding arcanist logic here
  selectedArcanists.value.push(selectedArcanist.value);
  //console.log("Add Arcanist", selectedArcanist.value);
  isAddingArcanist.value = false;
};

const getArcanistImagePath = (id) => {
  return `/images/arcanists/icon/${id}.png`;
};

</script>

<template>
  <main>
    <div class="arcanist-container">
      <h2>Planner</h2>
      <div class="components">
        <div v-for="arc in selectedArcanists" :key="arc.Id">
          <img :src="getArcanistImagePath(arc.Id)" alt="Arcanist Image" />
        </div>
      </div>
      <button class="add-arcanist" @click="startAddingArcanist">Add Arcanist</button>
      <button class="add-psychube">Add Psychube</button>
    </div>

    <div v-if="isAddingArcanist" class="add-arcanist-overlay">
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
            <option v-for="insight in (selectedRarity >= 5 ? insightOptions : insightOptions.slice(0, 3))" :key="insight">{{ insight }}</option>
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
  </main>
</template>

<style scoped>
  /* Style for the main container */
  .arcanist-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
  }

  /* Style for the planner section */
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .components {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .components img {
    width: 50px; /* Adjust the width as needed */
    height: 50px; /* Adjust the height as needed */
    border-radius: 50%;
  }

  .add-arcanist,
  .add-psychube {
    background-color: rgb(72, 194, 235);
    color: #fff;
    padding: 10px;
    margin: 10px;
    border: none;
    cursor: pointer;
    font-size: 16px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
  }

  select {
    width: 100%;
    padding: 8px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  button {
    background-color: rgb(72, 194, 235);
    color: #fff;
    padding: 10px;
    margin: 5px;
    border: none;
    cursor: pointer;
    font-size: 14px;
  }

  .add-arcanist-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column; /* Arrange children in a column layout */
    align-items: center; /* Center children horizontally */
    justify-content: center; /* Center children vertically */
  }

  .overlay-header {
    width: 50%;
    background-color: #fff;
    padding: 20px;
    /* border-radius: 8px; */
    text-align: center;
  }

  .overlay-body {
    width: 50%;
    background-color: #fff;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 20px;
  }

  .overlay-body div {
  width: 100%;
  margin-bottom: 10px;
}

.overlay-body div:not(:first-child) {
    width: calc(50% - 5px); /* Set the width to 50% for the other dropdowns with a small margin in between */
  }
</style>


