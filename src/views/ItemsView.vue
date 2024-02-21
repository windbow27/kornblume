<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue';
import { IItem } from '@/types';
import { useDataStore } from '@/stores/dataStore';
import { useGlobalStore } from '@/stores/global';
import { sortCategoryMaterials } from '@/composables/materials';
import MaterialSelectionIcon from '@/components/item/material/MaterialSelectionIcon.vue';
import MaterialDisplay from '@/components/item/material/MaterialDisplay.vue';
import MaterialFilter from '@/components/item/material/MaterialFilter.vue';

const categories = ['Base Item', 'Build Material', 'Insight Material', 'Resonate Material', 'Ascension Material'];
const buttons = ['Materials', 'Psychubes'];
const selectedButton = ref(buttons[0]);

const itemStore = useDataStore().items;
const listItems = ref<IItem[]>([]);
const filteredItems = ref<IItem[]>([]);
const globalStore = useGlobalStore();
const selectedMaterial = ref<IItem | null>();

const selectMaterial = (material: IItem) => {
    selectedMaterial.value = material;
};

const handleFilteredMaterials = (filteredMaterials: IItem[]) => {
    filteredItems.value = filteredMaterials;
};

watchEffect(() => {
    const foundMaterial = itemStore.find(item => item.Name === globalStore.selectedMaterial.Material);
    selectedMaterial.value = foundMaterial || itemStore[49];

    listItems.value = itemStore.filter((item: IItem) =>
        item.IsReleased
    )

    sortCategoryMaterials(listItems.value, categories);
})

onMounted(() => {
    filteredItems.value = itemStore.filter((item: IItem) =>
        item.IsReleased
    )
    sortCategoryMaterials(filteredItems.value, categories);
})

// this is so stupid i cant

</script>

<template>
    <div class="wrapper">
        <div class="container">

            <!--Item Selection Card-->
            <div class="card custom-border">
                <div class="flex flex-wrap justify-center sm:justify-between pl-2 gap-y-2">
                    <div class="flex flex-wrap justify-center space-x-2 gap-y-2 py-1.5">
                        <button v-for="(button, index) in buttons" :key="index" @click="selectedButton = button"
                            :class="['hover:bg-info rounded-md text-white py-1 px-3', selectedButton === button ? 'border-button' : '']"
                            :disabled="index !== 0">
                            {{ $t(button) }}
                        </button>
                    </div>
                    <!-- Filters -->
                    <MaterialFilter :listItems="listItems" :categories="categories" @filtered="handleFilteredMaterials" />
                </div>
            </div>
            <div class="card custom-border h-[calc(40vh)] lg:h-[calc(66vh)]">
                <div v-if="selectedButton === 'Materials'" class="custom-item-list">
                    <MaterialSelectionIcon v-for="material in filteredItems" :key="material.Id" :material="material"
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
