<script setup>
import { ref, computed } from 'vue';
import SelectList from '../common/SelectList.vue';

const props = defineProps({
    settings: {
        type: Object,
        required: true
    }
});

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    },
    saveActivitySettings: {
        type: Function,
        required: true
    }
});

const options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const dailyRefillsCost = [0, 60, 90, 120, 120, 150, 150, 200, 200];

const hasRoaringMonth = ref(props.settings.hasRoaringMonth);
const dailyRefills = ref(props.settings.dailyRefills);

const activity = computed(() => {
    let result = 240;
    if (hasRoaringMonth.value) {
        result += 90;
    }
    result += dailyRefills.value * 100;
    // console.log(result);
    // console.log(dailyRefills.value);
    return result;
});

const cost = computed(() => {
    let result = 0;
    for (let i = 0; i <= dailyRefills.value; i++) {
        result += dailyRefillsCost[i];
    }
    // console.log(result);
    return result;
});

const handleSelected = (value) => {
    dailyRefills.value = value;
};

const saveActivitySettings = () => {
    const settings = {
        hasRoaringMonth: hasRoaringMonth.value,
        dailyRefills: dailyRefills.value,
        activity: activity.value,
        cost: cost.value
    };
    emit('saveActivitySettings', settings);
    closeOverlay();
};

const closeOverlay = () => {
    emit('closeOverlay');
};
</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-small h-auto">
            <!-- Close button -->
            <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
                <i class="fas fa-times"></i>
            </button>

            <!-- Selectors -->
            <div class="form-control">
                <label class="cursor-pointer label justify-center">
                    <span class="label-text text-white mr-3">Roaring Month</span>
                    <input v-model="hasRoaringMonth" type="checkbox" :checked="hasRoaringMonth" class="checkbox checkbox-info" />
                </label>
            </div>

            <div class="grid grid-cols-2 items-center translate-x-4 pt-3">
                <span class="label-text text-white mr-3 justify-self-end">Daily Refill</span>
                <SelectList class="w-50 justify-self-start" :options="options" :selected="dailyRefills" label="Refills"
                    v-on:update:selected="handleSelected" />
            </div>

            <div class="flex justify-center pt-3">
                <button @click="saveActivitySettings" class="btn btn-success">Save</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>
