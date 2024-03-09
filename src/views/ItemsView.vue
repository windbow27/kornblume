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
    selectedMaterial.value = foundMaterial || itemStore.find(item => item.Name === 'Crystal Drop');

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
    <div class="responsive-spacer ">
        <div class="flex pb-4">
            <h2 class="text-2xl text-white font-bold">{{ $t('items') }}</h2>
        </div>

        <!-- Notification -->
        <!-- <div class="pb-4">
            <div role="alert" class="alert alert-info custom-gradient-gray-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm lg:text-base"> 1.4 drop rates have been displayed. </p>
            </div>
        </div> -->

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
                        <MaterialFilter :listItems="listItems" :categories="categories"
                            @filtered="handleFilteredMaterials" />
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
    </div>
</template>

<style scoped>
button:disabled {
    opacity: 0.25;
}

.container {
    @apply w-full lg:w-1/2 flex flex-col p-4 gap-y-4 2xl:px-8 max-w-3xl;
}

.card {
    @apply p-4 rounded shadow w-full;
}
</style>
