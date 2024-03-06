<script setup lang="ts">
import { formatQuantity } from '../../composables/materials';
import { useActivityStore } from '../../stores/activityStore';
import { PropType } from 'vue';

const props = defineProps({
    totalActivityAndDays: {
        type: Array as PropType<number[]>,
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
    <div
        class="flex flex-wrap custom-gradient-gray-blue-light px-2 py-2 md:px-4 lg:px-6 rounded-md items-center justify-center">
        <i class="fa-solid fa-calculator text-white mr-3"></i>
        <div class="tooltip flex items-center" :data-tip="$t('estimated-total-activities-and-days')">
            <div class="text">{{ props.totalActivityAndDays?.[0] || 0 }}</div>
            <div class="avatar">
                <div class="w-8 rounded">
                    <img src="/images/items/common/0.webp" alt="avatar" />
                </div>
            </div>
            <div class="text pr-3">
                {{ props.totalActivityAndDays?.[1] || 0 }} {{ props.totalActivityAndDays[1] > 1 ? $t("days") : $t("day") }}</div>
        </div>
        <div v-if="activityStore.settings.cost > 0" class="tooltip" :data-tip="$t('drops-cost')">
            <div class="text"> {{ Number(formatQuantity(activityStore.settings.cost)) * props.totalActivityAndDays[1] }}
            </div>
        </div>
        <div v-if="activityStore.settings.cost > 0" class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/thumbnails/51.webp" alt="avatar" />
            </div>
        </div>
        <div class="tooltip tooltip-left" :data-tip="$t('wilderness-production')">
            <div class="text"> {{ formatQuantity(props.wildernessSettings.wildernessOutput.dust *
                props.totalActivityAndDays[1] || 0) }}
            </div>
        </div>
        <div class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/thumbnails/55.webp" alt="avatar" />
            </div>
        </div>
        <div class="tooltip tooltip-left" :data-tip="$t('wilderness-production')">
            <div class="text"> {{ formatQuantity(props.wildernessSettings.wildernessOutput.gold *
                props.totalActivityAndDays[1] || 0) }}
            </div>
        </div>
        <div class="avatar">
            <div class="w-8 rounded">
                <img src="/images/items/icon/thumbnails/54.webp" alt="avatar" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.text {
    @apply border-blue-700/90 border-l pl-3 text-sm sm:text-base text-white;
}
</style>
