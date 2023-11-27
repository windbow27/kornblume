import { ref } from 'vue'
import i from '../../public/data/items.json';
import s from '../../public/data/stages.json';
import c from '../../public/data/crafts.json';

const items = ref(i);
const stages = ref(s);
const crafts = ref(c);

export function useProcessCards(materials) {
    const calculatedCards = [];
    let cardLayers = [];

    const sortArcanists = (materials) => {
        let result = materials.map((matInfo) => ({ ...matInfo }));
        const craftItems = [];

        // Iterate through materials
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

    /*Create cards through stages*/
    const sortedMaterials = sortArcanists(materials);
    sortedMaterials.forEach(matInfo => {
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

    /*Turn cards into 4 layers*/
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

        const cardLayers = [
            { id: 0, cards: stagesFirstLayer },
            { id: 1, cards: stagesSecondLayer },
            { id: 2, cards: stagesThirdLayer },
            { id: 3, cards: stagesFourthLayer }
        ];

        return cardLayers;
    }

    return cardLayers;
}