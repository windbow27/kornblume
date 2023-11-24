<script setup>
import { ref, computed } from 'vue';
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

            const material = processMaterial(matInfo);

            const existingCardIndex = calculatedCards.findIndex(card => card.stage === currentStage.Name);

            if (existingCardIndex !== -1) {
                calculatedCards[existingCardIndex].materials.push(material);
            } else {
                calculatedCards.push(createCard(currentStage.Name, runs, activity, days, [material]));
            }
        } else {
            let tier3Card = calculatedCards.find(card => card.stage === 'Tier 3');
            let tier2Card = calculatedCards.find(card => card.stage === 'Tier 2');
            let oneiric = calculatedCards.find(card => card.stage === 'Oneiric Shop');

            if (!tier3Card) {
                tier3Card = createCard('Tier 3', null, null, null, []);
                calculatedCards.push(tier3Card);
            }

            if (!tier2Card) {
                tier2Card = createCard('Tier 2', null, null, null, []);
                calculatedCards.push(tier2Card);
            }

            if (!oneiric) {
                oneiric = createCard('Oneiric Shop', null, 0, null, []);
                calculatedCards.push(oneiric);
            }

            if (items.value.find(item => item.Name === matInfo.Material).Category === 'Resonate Material') {
                oneiric.activity += calculateOneiric(matInfo);
                oneiric.materials.push(processMaterial(matInfo));
            } else if (items.value.find(item => item.Name === matInfo.Material).Rarity === 3) {
                tier3Card.materials.push(processMaterial(matInfo));
            } else {
                tier2Card.materials.push(processMaterial(matInfo));
            }
        }
    });

    if (Array.isArray(calculatedCards) && calculatedCards.length > 0) {
        splittedCards = [
            calculatedCards.filter((card) => card.stage === 'The Poussiere VI' || card.stage === 'Mintage Aesthetics VI' || card.stage === 'Oneiric Shop'),
            calculatedCards.filter((card) => (card.stage.endsWith('II') || card.stage.endsWith('IV') || card.stage.endsWith('VI'))
                && card.stage !== 'The Poussiere VI' && card.stage !== 'Mintage Aesthetics VI'),
            calculatedCards.filter((card) => !['The Poussiere VI', 'Mintage Aesthetics VI', 'Oneiric Shop', 'Tier 2', 'Tier 3'].includes(card.stage)
                && !card.stage.endsWith('II') && !card.stage.endsWith('IV') && !card.stage.endsWith('VI')),
            calculatedCards.filter((card) => card.stage === 'Tier 2' || card.stage === 'Tier 3')
        ];
        console.log(splittedCards);
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
const processMaterial = (matInfo) => {
    return {
        material: matInfo.Material,
        quantity: matInfo.Quantity,
        itemImagePath: getItemImagePath(matInfo.Material),
        borderImagePath: getBorderImagePath(matInfo.Material),
    };
}

const createCard = (stage, runs, activity, days, materials) => {
    return {
        stage,
        runs: isNaN(runs) ? 0 : runs,
        activity: isNaN(activity) ? 0 : activity,
        days: isNaN(days) ? 0 : days,
        materials,
    };
}

const getId = (material) => {
    const item = items.value.find(item => item.Name == material);
    return item ? item.Id : null;
};

const getRarity = (material) => {
    const item = items.value.find(item => item.Name == material);
    return item ? item.Rarity : null;
};

const getItemImagePath = (material) => {
    const id = getId(material);
    return id ? `/images/items/icon/${id}.png` : null;
};

const getBorderImagePath = (material) => {
    const rarity = getRarity(material);
    return rarity ? `/images/items/border/${rarity}.png` : null;
};

const getActivityImagePath = (stage) => {
    if (stage === 'Oneiric Shop') {
        return '/images/items/border/1.png';
    }
    return '/images/items/border/0.png';
};

</script>

<template>
    <div class="cards-container">
      <!-- Part 1: The Poussiere VI, Mintage Aesthetics VI, Oneiric Shop -->
      <Card v-for="(card, index) in calculateCards[0]" :key="index" :card="card" :getActivityImagePath="getActivityImagePath" />
  
      <!-- Part 2: Insight -->
      <Card v-for="(card, index) in calculateCards[1]" :key="index" :card="card" :getActivityImagePath="getActivityImagePath" />
  
      <!-- Part 3: Hard stages -->
      <Card v-for="(card, index) in calculateCards[2]" :key="index" :card="card" :getActivityImagePath="getActivityImagePath" />
  
      <!-- Part 4: Tier 2 and Tier 3 -->
      <Card v-for="(card, index) in calculateCards[3]" :key="index" :card="card" :getActivityImagePath="getActivityImagePath" />
    </div>
  </template>

<style scoped>
.cards-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;

}
</style>
