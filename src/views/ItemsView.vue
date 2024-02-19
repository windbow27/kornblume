<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { IItem } from '@/types';
import { useDataStore } from '@/stores/dataStore';
import { useGlobalStore } from '@/stores/global';
import MaterialSelectionIcon from '@/components/item/material/MaterialSelectionIcon.vue';
import MaterialDisplay from '@/components/item/material/MaterialDisplay.vue';

const categories = ['Base Item', 'Build Material', 'Insight Material', 'Resonate Material', 'Ascension Material'];
const buttons = ['Materials', 'Psychubes'];
const selectedButton = ref(buttons[0]);
const searchQuery = ref('');
const itemStore = useDataStore().items;
const listItems = ref<IItem[]>([]);
const globalStore = useGlobalStore();
const selectedMaterial = ref<IItem | null>();

const selectMaterial = (material: IItem) => {
    selectedMaterial.value = material;
};

const filteredMaterials = computed(() => {
    let filtered = listItems.value;

    if (searchQuery.value.length > 0) {
        filtered = filtered.filter(item => item.Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    }

    return filtered;
});

watchEffect(() => {
    const foundMaterial = itemStore.find(item => item.Name === globalStore.selectedMaterial.Material);
    selectedMaterial.value = foundMaterial || itemStore[49];

    listItems.value = itemStore.filter((arcanist: IItem) =>
        arcanist.IsReleased
    )

    listItems.value.sort((a: IItem, b: IItem) => {
        // Category
        const categoryA = categories.indexOf(a.Category);
        const categoryB = categories.indexOf(b.Category);
        if (categoryA !== categoryB) {
            return categoryA - categoryB;
        }

        // Rarity
        const rarityComparison = b.Rarity - a.Rarity
        if (rarityComparison !== 0) {
            return rarityComparison
        }

        return a.Id - b.Id;
    })
})

</script>

<template>
    <div class="wrapper">
        <div class="container">

            <!--Item Selection Card-->
            <div class="card custom-border">
                <div class="flex flex-wrap justify-center lg:justify-between pl-2 gap-y-2">
                    <div class="flex space-x-2 gap-y-2 py-1.5">
                        <button v-for="(button, index) in buttons" :key="index" @click="selectedButton = button"
                            :class="['hover:bg-info rounded-md text-white py-1 px-3', selectedButton === button ? 'border-button' : '']"
                            :disabled="index !== 0">
                            {{ button }}
                        </button>
                    </div>
                    <div class="flex gap-y-2 items-center">
                        <input v-model="searchQuery" type="text" :placeholder="$t('search-by-name')"
                            class="input input-sm w-full lg:w-auto bg-gray-800 text-white p-2 rounded-md focus:outline-none">
                        <button class="btn btn-ghost text-white"> <i class="fa-solid fa-filter"></i></button>
                    </div>
                </div>
            </div>
            <div class="card custom-border h-[calc(40vh)] lg:h-[calc(66vh)]">
                <div v-if="selectedButton === 'Materials'" class="custom-item-list">
                    <MaterialSelectionIcon v-for="material in filteredMaterials" :key="material.Id" :material="material"
                        @click="selectMaterial(material)"
                        :class="selectedMaterial?.Name === material.Name ? 'custom-border-white' : 'custom-border-transparent'" />
                </div>
            </div>
        </div>

        <!--Item Display Card-->
        <div class="container">
            <MaterialDisplay :selectedMaterial="selectedMaterial || {}" :categories="categories" />
        </div>

    </div>
</template>

<style scoped>
button:disabled {
    opacity: 0.25;
}

.container {
    @apply w-full lg:w-1/2 flex flex-col p-4 gap-y-4 max-w-2xl;
}

.card {
    @apply p-4 rounded shadow w-full;
}
</style>
