<script setup>
import { ref, onMounted } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { FwbButton } from 'flowbite-vue';

const props = defineProps({
    label: { // Label for the selected on the button
        type: String,
        required: true,
    },
    options: { // List of options
        type: Array,
        required: true,
    },
    selected: { // Selected option
        type: Number,
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
        <FwbButton gradient="blue" @click="openOptions" class="w-full m-4">
            <template v-if="selected !== null">
                {{ selected }}
            </template>
            <template v-else >
                {{  props.options[0]}}
            </template>
        </FwbButton>

        <!-- Options box -->
        <div v-if="isOptionsVisible" ref="containerRef" class="absolute mt-14 w-64 z-50">
            <!-- Caret-up icon -->
            <div class="flex items-center justify-center">
                <i class="fa-solid fa-caret-up text-blue-300"></i>
            </div>
            <div class="grid grid-cols-4 gap-1 p-3 border border-blue-300 rounded-md shadow-lg options-box custom-gradient-gray-blue">
                <!-- Options go here -->
                <button v-for="option in options" :key="option" class="m-1" @click="selectOption(option)">
                    <div
                        class="flex items-center justify-center font-semibold rounded-full w-8 h-8 leading-none flex-col bg-blue-300">
                        <div>{{ option }}</div>
                    </div>
                </button>
            </div>
        </div>


    </div>
</template>

<style scoped></style>
