<script setup>
import { formatQuantity } from '../../composables/ProcessItems';
const props = defineProps({
    totalActivityAndDays: {
        type: Array,
        required: true,
    },
    wildernessSettings: {
        type: Object,
        required: true,
    },
});

</script>

<template>
    <div class="flex custom-gradient-gray-blue-light px-2 py-2 md:px-4 lg:px-6 rounded-md items-center justify-center">
        <i class="fa-solid fa-calculator text-white mr-3"></i>
        <div class="tooltip flex items-center" data-tip="Calculations hasn't been optimized">
            <div class="text">{{ totalActivityAndDays[0] }}</div>
            <div class="avatar">
                <div class="w-8 rounded">
                    <img src="/images/items/common/0.png" alt="avatar" />
                </div>
            </div>
            <div class="text pr-3">
                {{ totalActivityAndDays[1] }} {{ totalActivityAndDays[1] > 1 ? "days" : "day" }}</div>
        </div>
        <div class="tooltip" data-tip="Wilderness Production">
            <div class="text"> {{ formatQuantity(wildernessSettings.wildernessOutput.dust * totalActivityAndDays[1]) }}
            </div>
        </div>
        <div class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/55.png" alt="avatar" />
            </div>
        </div>
        <div class="tooltip" data-tip="Wilderness Production">
            <div class="text"> {{ formatQuantity(wildernessSettings.wildernessOutput.gold * totalActivityAndDays[1]) }}
            </div>
        </div>
        <div class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/54.png" alt="avatar" />
            </div>
        </div>
    </div>
</template>


<style scoped>
.text {
    @apply border-blue-700/90 border-l pl-3 text-sm text-white;
}
</style>