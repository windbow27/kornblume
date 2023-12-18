<!-- eslint-disable no-unused-vars -->
<script setup>
import { formatQuantity } from '../../composables/ProcessItems';
import { useActivityStore } from '../../stores/activityStore';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
    totalActivityAndDays: {
        type: Array,
        required: true
    },
    wildernessSettings: {
        type: Object,
        required: true
    }
});

const activityStore = useActivityStore();

</script>

<template>
    <div class="flex flex-wrap custom-gradient-gray-blue-light px-2 py-2 md:px-4 lg:px-6 rounded-md items-center justify-center">
        <i class="fa-solid fa-calculator text-white mr-3"></i>
        <div class="tooltip flex items-center" data-tip="Estimated total Activities and Days">
            <div class="text">{{ totalActivityAndDays?.[0] }}</div>
            <div class="avatar">
                <div class="w-8 rounded">
                    <img src="/images/items/common/0.png" alt="avatar" />
                </div>
            </div>
            <div class="text pr-3">
                {{ totalActivityAndDays?.[1] }} {{ totalActivityAndDays?.[1] > 1 ? "days" : "day" }}</div>
        </div>
        <div v-if="activityStore.settings.cost > 0" class="tooltip" data-tip="Drops Cost">
            <div class="text"> {{ formatQuantity(activityStore.settings.cost) * totalActivityAndDays[1] }}
            </div>
        </div>
        <div v-if="activityStore.settings.cost > 0" class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/51.png" alt="avatar" />
            </div>
        </div>
        <div class="tooltip tooltip-left" data-tip="Wilderness Production">
            <div class="text"> {{ formatQuantity(wildernessSettings.wildernessOutput.dust * totalActivityAndDays[1]) }}
            </div>
        </div>
        <div class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/55.png" alt="avatar" />
            </div>
        </div>
        <div class="tooltip tooltip-left" data-tip="Wilderness Production">
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
    @apply border-blue-700/90 border-l pl-3 text-sm sm:text-base text-white;
}
</style>
