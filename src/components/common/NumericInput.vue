<script setup lang="ts" name="NumericInput">
import { ref, watch } from 'vue';


/*
 * Abstracts the logic for a numeric input.
 * The custom input has the following properties:
 *   - Input can be temporarily empty during editing
 *   - If tapping/clicking into the input while the value is 0, it will automatically be an empty text box. This way you don't need to avoid tapping into the wrong side.
 *   - Arrow keys still work to increment or decrement the value.
 *   - Supports k,m,b suffixes and scientific notation (2.5e4)
 *
 * Possible future enhancement: support thousands separators, using Intl.NumberFormat. This would ideally work both when editing and when viewing. Note that this likely could not rely solely on language, as Mexico & Spain and Canada & France have different separators for the same language.
 *
 * I considered adding scroll wheel or +/- support, but decided those might just be confusing, so I didn't add them. If someone requests enhancements like this, it's probably fine to add these kinds of small things, though I think they wouldn't benefit many people.
 */

const props = defineProps<{
    modelValue: number;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void;
}>();

const displayValue = ref<number | string>(props.modelValue);

const parse = (val: string | number): number => {
    if (typeof val === 'number') {
        return Math.round(Math.max(0, val));
    }
    if (val === '') return 0;

    let str = String(val).toLowerCase().trim();
    let multiplier = 1;

    if (str.endsWith('k')) {
        multiplier = 1000;
        str = str.slice(0, -1);
    } else if (str.endsWith('m')) {
        multiplier = 1_000_000;
        str = str.slice(0, -1);
    } else if (str.endsWith('b')) {
        multiplier = 1_000_000_000;
        str = str.slice(0, -1);
    }

    const num = Number(str);

    if (isNaN(num)) {
        // If parsing fails, revert to the original modelValue
        return props.modelValue;
    }

    const result = num * multiplier;
    return Math.round(Math.max(0, result));
}

watch(() => props.modelValue, (newValue) => {
    const currentValue = parse(displayValue.value);
    if (currentValue !== newValue) {
        displayValue.value = newValue;
    }
});

const handleInput = () => {
    // Basic sanitization on input to prevent most invalid characters.
    // Main parsing is handled on blur.
    const value = String(displayValue.value);
    const sanitizedValue = value.replace(/[^0-9.ekmb]/gi, '');
    if (value !== sanitizedValue) {
        displayValue.value = sanitizedValue;
    }
};

const handleFocus = () => {
    if (displayValue.value === 0) {
        displayValue.value = '';
    }
};

const handleBlur = () => {
    const parsedValue = parse(displayValue.value);
    displayValue.value = parsedValue; // Show the parsed value, e.g. 1000 for 1k
    updateModel(parsedValue);
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        const newValue = parse(displayValue.value) + 1;
        displayValue.value = newValue;
        updateModel(newValue);
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const newValue = parse(displayValue.value) - 1;
        displayValue.value = newValue;
        updateModel(newValue);
    }
};

const updateModel = (value: number) => {
    const newQuantity = Math.max(0, value); // Ensure it's non-negative
    if (newQuantity !== props.modelValue) {
        emit('update:modelValue', newQuantity);
    }
};
</script>

<template>
    <input
        v-model="displayValue"
        type="text"
        inputmode="numeric"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
    />
</template>
