<script setup>
import { ref, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
    label: { // Label for the selected on the button
        type: String,
        required: true
    },
    options: { // List of options
        type: Array,
        required: true
    },
    selected: { // Selected option
        type: Number
    }
});

const emits = defineEmits(['update:selected']);

const isOptionsVisible = ref(false);
const selected = ref(props.selected);
const containerRef = ref(null);

const openOptions = () => {
    isOptionsVisible.value = true;
};

const closeOptions = () => {
    isOptionsVisible.value = false;
};

const selectOption = (option) => {
    selected.value = option;
    emits('update:selected', option, props.label);
    isOptionsVisible.value = false;
};

const getImageSource = (option) => `images/items/common/insight${option}.webp`;

onClickOutside(containerRef, closeOptions);

onMounted(() => {
    if (props.selected === undefined) {
        selected.value = props.options[0];
        emits('update:selected', props.options[0], props.label);
    } else {
        selected.value = props.selected;
        emits('update:selected', props.selected, props.label);
    }
});
</script>

<template>
    <div class="relative w-2/3 md:w-1/3 flex justify-center">
        <!-- Button to open the options box -->
        <button @click="openOptions" class="btn btn-sm btn-ghost gradient-blue w-1/2 m-2">
            <template v-if="label === 'Current Insight' || label === 'Goal Insight'">
                <div v-if="selected === 0">
                    <i class="fa-regular fa-circle text-white"></i>
                </div>
                <div v-else>
                    <img class="avatar w-6" :src="getImageSource(selected)" :alt="'Option ' + selected" />
                </div>
            </template>
            <template v-else>
                {{ selected }}
            </template>
        </button>

        <!-- Options box -->
        <div v-if="isOptionsVisible" ref="containerRef" class="absolute mt-14 w-48 lg:w-64 z-50">
            <!-- Caret-up icon -->
            <div class="flex items-center justify-center">
                <i class="fa-solid fa-caret-up text-blue-500"></i>
            </div>
            <div
                class="grid grid-cols-4 gap-1 p-3 border border-blue-300 rounded-md shadow-lg options-box custom-gradient-gray-blue">
                <!-- Options go here -->
                <button v-for="option in options" :key="option" class="m-1" @click="selectOption(option)">
                    <div
                        class="flex items-center justify-center font-semibold rounded-full w-8 h-8 leading-none flex-col bg-blue-500 text-white">
                        <template v-if="label === 'Current Insight' || label === 'Goal Insight'">
                            <div v-if="option === 0">
                                <i class="fa-regular fa-circle text-white"></i>
                            </div>
                            <div v-else>
                                <img :src="getImageSource(option)" :alt="'Option ' + option" />
                            </div>
                        </template>
                        <template v-else>
                            {{ option }}
                        </template>
                    </div>
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped></style>
