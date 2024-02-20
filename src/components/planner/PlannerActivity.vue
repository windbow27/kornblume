<script setup lang="ts">
import { ref, computed } from 'vue';
import SelectList from '../common/SelectList.vue';

const props = defineProps({
    settings: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['closeOverlay', 'saveActivitySettings']);

const options = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const refillsCost = [0, 60, 90, 120, 120, 150, 150, 200, 200];

const roaringMonth = ref(props.settings.roaringMonth);
const lazyModo = ref(props.settings.lazyModo);
const weeklyActivity = ref(props.settings.weeklyActivity);
const refills = ref(props.settings.refills);

const handleSelected = (value) => {
    refills.value = value;
};

const saveActivitySettings = () => {
    const settings = {
        roaringMonth: roaringMonth.value,
        lazyModo: lazyModo.value,
        weeklyActivity: weeklyActivity.value,
        refills: refills.value,
        activity: activity.value,
        cost: cost.value
    };
    emit('saveActivitySettings', settings);
    closeOverlay();
};

const closeOverlay = () => {
    emit('closeOverlay');
};

const activity = computed(() => {
    let result = lazyModo.value ? 190 : 240;
    if (roaringMonth.value) {
        result += 60;
    }
    result += refills.value * 100;
    if (weeklyActivity.value) {
        result += Math.floor(240 / 7);
    }
    return result;
});

const cost = computed(() => {
    let result = 0;
    for (let i = 0; i <= refills.value; i++) {
        result += refillsCost[i];
    }
    // console.log(result);
    return result;
});

</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-small h-auto">
            <!-- Close button -->
            <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
                <i class="fas fa-times"></i>
            </button>

            <p class="text-white text-center text-lg font-bold">{{ $t('activity-settings') }}</p>
            <p class="text-info text-center pb-5">{{ $t('current-per-day') }} <span class="font-bold">{{ activity }}</span>
            </p>

            <!-- Selectors -->
            <div class="grid grid-cols-1 space-y-3">
                <div class="form-control">
                    <label class="cursor-pointer label justify-center">
                        <span class="label-text text-white mr-3">{{ $t('roaring-month') }}</span>
                        <input v-model="roaringMonth" type="checkbox" :checked="roaringMonth"
                            class="checkbox checkbox-info" />
                    </label>
                </div>

                <div class="tooltip" :data-tip="$t('240-activities-per-week')">
                    <div class="form-control">
                        <label class="cursor-pointer label justify-center">
                            <span class="label-text text-white mr-3">{{ $t('weekly-activeness') }}</span>
                            <input v-model="weeklyActivity" type="checkbox" :checked="weeklyActivity"
                                class="checkbox checkbox-info" />
                        </label>
                    </div>
                </div>

                <div class="tooltip" :data-tip="$t('login-once-per-day-for-base-190-activities')">
                    <div class="form-control">
                        <label class="cursor-pointer label justify-center">
                            <span class="label-text text-white mr-3">{{ $t('lazy-modo') }}</span>
                            <input v-model="lazyModo" type="checkbox" :checked="lazyModo" class="checkbox checkbox-info" />
                        </label>
                    </div>
                </div>

                <div class="flex items-center justify-center translate-x-4">
                    <span class="label-text text-white">{{ $t('daily-refill') }}</span>
                    <SelectList class="w-1/3" :options="options" :selected="refills" label="refills"
                        v-on:update:selected="handleSelected" />
                </div>
            </div>

            <div class="flex justify-center pt-3">
                <button @click="saveActivitySettings" class="btn btn-success">{{ $t('save') }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
