<script setup>
import { ref, computed } from 'vue';
import { FwbBadge } from 'flowbite-vue';
import i from '../../../public/data/items.json';
import s from '../../../public/data/stages.json';
import c from '../../../public/data/crafts.json';
import Card from '../common/Card.vue';

const items = ref(i);
const stages = ref(s);
const crafts = ref(c);

const props = defineProps({
    calcArcanists: {
        type: Array,
        required: true
    }
});

const sortArcanists = (calcArcanists) => {
    let result = calcArcanists.map((matInfo) => ({ ...matInfo }));
    const craftItems = [];

    // Iterate through calcArcanists
    result.forEach((matInfo) => {
        // Find the corresponding craft item in craftJson
        const craftItem = crafts.value.find((item) => item.Name === matInfo.Material);
        //console.log(craftItem);
        // If a matching item is found
        if (craftItem) {
            craftItems.push(craftItem);
            for (let i = 0; i < craftItem.Material.length; i++) {
                const material = craftItem.Material[i];
                const quantity = craftItem.Quantity[i] * matInfo.Quantity;

                // Add or update the quantity in the result object
                if (quantity > 0) {
                    if (result.find((item) => item.Material === material)) {
                        result.find((item) => item.Material === material).Quantity += quantity;
                    } else {
                        result.push({ Material: material, Quantity: quantity });
                    }
                }
            }
        }
    });

    //filter out craft items
    result = result.filter((item) => !craftItems.some((craftItem) => craftItem.Name === item.Material));
    //sort result by material id from items
    result.sort((a, b) => {
        const itemA = items.value.find((item) => item.Name === a.Material);
        const itemB = items.value.find((item) => item.Name === b.Material);
        return itemB.Id - itemA.Id;
    });

    return result;
};

const calculateCards = computed(() => {
    const result = sortArcanists(props.calcArcanists);
    const calculatedCards = [];
    let splittedCards = [];

    result.forEach(matInfo => {
        const currentStage = stages.value.find(stage => stage.Material.includes(matInfo.Material));

        if (currentStage) {
            //Farmable stages
            const runs = Math.ceil((parseFloat(matInfo.Quantity) / parseFloat(currentStage.Quantity)));
            const activity = Math.ceil(runs * currentStage.Activity);
            const days = (activity / 240).toFixed(1);

            const material = matInfo;

            const existingCardIndex = calculatedCards.findIndex(card => card.stage === currentStage.Name);

            if (existingCardIndex !== -1) {
                calculatedCards[existingCardIndex].materials.push(material);
            } else {
                calculatedCards.push(createCard(currentStage.Name, runs, activity, days, [material]));
            }
        } else {
            const findOrCreateCard = (stage) => {
                let card = calculatedCards.find(c => c.stage === stage);
                if (!card) {
                    card = createCard(stage, null, stage === 'Oneiric Shop' ? 0 : null, null, []);
                    calculatedCards.push(card);
                }
                return card;
            };

            const tier3Card = findOrCreateCard('Tier 3');
            const tier2Card = findOrCreateCard('Tier 2');
            const oneiric = findOrCreateCard('Oneiric Shop');
            const unreleased = findOrCreateCard('Unreleased');

            if (items.value.find(item => item.Name === matInfo.Material).Category === 'Resonate Material') {
                oneiric.activity += calculateOneiric(matInfo);
                oneiric.materials.push(matInfo);
            } else {
                const rarity = items.value.find(item => item.Name === matInfo.Material).Rarity;
                const targetCard = rarity === 3 ? tier3Card : (rarity === 2 ? tier2Card : unreleased);
                targetCard.materials.push(matInfo);
            }
        }
    });

    if (Array.isArray(calculatedCards) && calculatedCards.length > 0) {
        /*
        first layer has The Poussiere VI, Mintage Aesthetics VI, Oneiric Shop
        second layer has every stage that ended with II, IV, VI that doens't included on first layer
        third layer are all the stages that aren't Tier 2, Tier 3 or unreleased that doens't included on above layers
        forth layer T2, T3 and unreleased*/

        const stagesFirstLayer = calculatedCards
            .filter(card => ['The Poussiere VI', 'Mintage Aesthetics VI', 'Oneiric Shop'].includes(card.stage) && card.materials.length > 0);
        const stagesSecondLayer = calculatedCards
            .filter(card => (card.stage.endsWith('II') || card.stage.endsWith('IV') || card.stage.endsWith('VI'))
                && !stagesFirstLayer.some(firstLayerCard => firstLayerCard.stage === card.stage) && card.materials.length > 0);
        const stagesThirdLayer = calculatedCards
            .filter(card => !['Tier 2', 'Tier 3', 'Unreleased', ...stagesFirstLayer.map(card => card.stage), ...stagesSecondLayer.map(card => card.stage)].includes(card.stage) && card.materials.length > 0);
        const stagesFourthLayer = calculatedCards
            .filter(card => ['Tier 2', 'Tier 3', 'Unreleased'].includes(card.stage) && card.materials.length > 0);
        splittedCards = [stagesFirstLayer, stagesSecondLayer, stagesThirdLayer, stagesFourthLayer];
    }

    return splittedCards;
});

const calculateOneiric = (matInfo) => {
    const item = items.value.find(item => item.Name === matInfo.Material);
    const rarity = item.Rarity;
    const quantity = matInfo.Quantity;

    if (rarity === 3) return quantity * 40;
    if (rarity === 4) return quantity * 100;
    if (rarity === 5) return quantity * 250;
    if (rarity === 6) return quantity * 1500;
    return 0;
}

const getActivityImagePath = (stage) => {
    if (stage === 'Oneiric Shop') {
        return '/images/items/border/1.png';
    }
    return '/images/items/border/0.png';
};

const createCard = (stage, runs, activity, days, materials) => {
    return {
        stage,
        runs: isNaN(runs) ? 0 : runs,
        activity: isNaN(activity) ? 0 : activity,
        days: isNaN(days) ? 0 : days,
        materials,
        activityImagePath: getActivityImagePath(stage)
    };
};

const isCardListEmpty = (cardList) => {
    console.log(cardList);
    if (cardList === undefined || cardList === null) {
        return true;
    }
    if (Array.isArray(cardList) && cardList.length === 0) {
        return true;
    }
    return false;
};

</script>

<template>
    <div class="flex flex-wrap">
      <!-- Part 1: The Poussiere VI, Mintage Aesthetics VI, Oneiric Shop -->
      <div class="w-full mb-4">
        <FwbBadge class="mt-2 mb-2 w-24" v-if="calculateCards[0].length > 0" size="sm" type="yellow"> Resources </FwbBadge>
        <div class="flex flex-wrap space-x-3">
          <Card v-for="(card, index) in calculateCards[0]" :key="index" :card="card"/>
        </div>
      </div>
  
      <!-- Part 2: Insight -->
      <div class="w-full mb-4">
        <FwbBadge v-if="calculateCards[1].length > 0" size="sm" type="red"> Insight </FwbBadge>
        <div class="flex flex-wrap">
          <Card v-for="(card, index) in calculateCards[1]" :key="index" :card="card" class="mr-4 mb-4" />
        </div>
      </div>
  
      <!-- Part 3: Hard stages -->
      <div class="w-full mb-4">
        <FwbBadge v-if="calculateCards[2].length > 0" size="sm" type="indigo"> Hard Stages </FwbBadge>
        <div class="flex flex-wrap">
          <Card v-for="(card, index) in calculateCards[2]" :key="index" :card="card" class="mr-4 mb-4" />
        </div>
      </div>
  
      <!-- Part 4: Tier 2, Tier 3, unreleased -->
      <div class="w-full mb-4">
        <FwbBadge v-if="calculateCards[3].length > 0" size="sm" type="green"> Miscs </FwbBadge>
        <div class="flex flex-wrap">
          <Card v-for="(card, index) in calculateCards[3]" :key="index" :card="card" class="mr-4 mb-4" />
        </div>
      </div>
    </div>
  </template>
  
  

<style scoped>
</style>
