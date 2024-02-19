<script setup lang="ts">
import { ref, computed } from 'vue';
import { IItem } from '@/types';
import Popper from 'vue3-popper';

const props = defineProps({
    listItems: {
        type: Array as () => IItem[],
        required: true
    },
    categories: {
        type: Array as () => string[],
        required: true
    }
});

const emit = defineEmits(['filtered']);

const searchQuery = ref('');
const activeRarities = ref<number[]>([]);
const activeCategories = ref<string[]>([]);

const selectedRarities = (rarity: number) => {
    if (activeRarities.value.includes(rarity)) {
        activeRarities.value = activeRarities.value.filter(r => r !== rarity);
    } else {
        activeRarities.value.push(rarity);
    }
}

const selectedCategories = (category: string) => {
    if (activeCategories.value.includes(category)) {
        activeCategories.value = activeCategories.value.filter(c => c !== category);
    } else {
        activeCategories.value.push(category);
    }
}

const filteredMaterials = computed(() => {
    let filtered = props.listItems;

    if (searchQuery.value.length > 0) {
        filtered = filtered.filter(item => item.Name.toLowerCase().includes(searchQuery.value.toLowerCase()));
    }

    if (activeRarities.value.length > 0) {
        filtered = filtered.filter(item => activeRarities.value.includes(item.Rarity));
    }

    if (activeCategories.value.length > 0) {
        filtered = filtered.filter(item => activeCategories.value.includes(item.Category));
    }

    return filtered;
});

const filter = () => {
    emit('filtered', filteredMaterials.value);
}

</script>

<template>
    <div class="flex gap-y-2 items-center">
        <input v-model="searchQuery" type="text" :placeholder="$t('search-by-name')" @input="filter"
            class="input input-sm lg:w-auto bg-gray-800 text-white p-2 rounded-md focus:outline-none">
        <Popper arrow placement="bottom" offsetDistance="2">
            <div class="tooltip" :data-tip="$t('filter')"> <button class="btn btn-ghost text-white"> <i
                        class="fa-solid fa-filter"></i></button></div>
            <template #content>
                <div class="flex justify-center space-x-2 pb-2">
                    <button v-for="i in [2, 3, 4, 5, 6]" :key="i"
                        :class="{ 'border-2 border-info': activeRarities.includes(i), 'border-2 border-transparent': !activeRarities.includes(i) }"
                        @click="selectedRarities(i); filter()" class="p-2 rounded-md">
                        <i class="fa-solid fa-star" :class="{
                            'text-orange-300': i === 6,
                            'text-yellow-100': i === 5,
                            'text-purple-400': i === 4,
                            'text-sky-200': i === 3,
                            'text-green-200': i === 2
                        }"></i>
                    </button>
                </div>
                <div class="flex flex-col justify-center flex-wrap gap-x-2 gap-y-1">
                    <div class="grid grid-cols-2 gap-x-2 gap-y-1">
                        <button v-for="(category, index) in categories.slice(0, -1)" :key="category" :class="[
                            { 'border-2 border-info': activeCategories.includes(category), 'border-2 border-transparent': !activeCategories.includes(category) },
                            { 'text-error': index === 0, 'text-info': index === 1, 'text-success': index === 2, 'text-warning': index === 3, 'text-secondary': index === 4 }
                        ]" @click="selectedCategories(category); filter()"
                            class="p-2 rounded-md text-sm">
                            {{ category }}
                        </button>
                    </div>
                    <div class="flex justify-center">
                        <button v-if="categories.length > 0" :key="categories[4]" :class="[
                            { 'border-2 border-info': activeCategories.includes(categories[4]), 'border-2 border-transparent': !activeCategories.includes(categories[4]) },
                        ]" @click="selectedCategories(categories[4]); filter()"
                            class="w-40 p-2 rounded-md text-sm text-secondary">
                            {{ categories[4] }}
                        </button>
                    </div>
                </div>
            </template>
        </Popper>
    </div>
</template>

<style scoped></style>
