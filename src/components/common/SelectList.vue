<!-- eslint-disable no-unused-vars -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted, PropType } from 'vue';
import { onClickOutside } from '@vueuse/core';
import Popper from 'vue3-popper';

const props = defineProps({
    label: { // Label for the selected on the button
        type: String,
        required: true
    },
    options: { // List of options
        type: Array as PropType<number[]>,
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
        selected.value = props.options[0] as number;
        emits('update:selected', props.options[0], props.label);
    } else {
        selected.value = props.selected;
        emits('update:selected', props.selected, props.label);
    }
});
</script>

<template>
    <Popper arrow placement="top" offsetDistance="2">
        <button class="btn btn-sm btn-ghost gradient-blue w-24">
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
        <template #content>
            <div class="grid grid-cols-5 gap-2">
                <button v-for="option in options" :key="option" class="" @click="selectOption(option)">
                    <div
                        class="flex items-center justify-center font-semibold rounded-full w-8 h-8 leading-none flex-col bg-blue-500 text-white">
                        <template v-if="label === 'Current Insight' || label === 'Goal Insight'">
                            <div v-if="option === 0">
                                <i class="fa-regular fa-circle text-white"></i>
                            </div>
                            <div v-else>
                                <img class="avatar w-6" :src="getImageSource(option)" :alt="'Option ' + option" />
                            </div>
                        </template>
                        <template v-else>
                            {{ option }}
                        </template>
                    </div>
                </button>
            </div>
        </template>
    </Popper>
</template>

<style scoped></style>
