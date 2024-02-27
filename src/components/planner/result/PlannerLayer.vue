<script setup lang="ts" name="PlannerLayer">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { usePlannerSettingsStore } from '@/stores/plannerSettingsStore';
import PlannerCard from './PlannerCard.vue';

const props = defineProps({
    layer: {
        type: Object,
        required: true
    }
});

const { t } = useI18n();
const plannerSettingsStore = usePlannerSettingsStore();
const hideLowRunCards = ref(true);

const toggleHideLowRunCards = () => {
    hideLowRunCards.value = !hideLowRunCards.value;
};

const toggleWilderness = () => {
    plannerSettingsStore.settings.enableWilderness = !plannerSettingsStore.settings.enableWilderness;
};

const isBadge = computed(() => {
    return props.layer.cards && props.layer.cards.length > 0;
});

const filteredCards = computed(() => {
    if (hideLowRunCards.value) {
        return props.layer.cards.filter((card) => card.runs > 10);
    }
    return props.layer.cards;
});

const getBadgeType = computed(() => {
    switch (props.layer.id) {
    case 0:
        return 'yellow-badge';
    case 1:
        return 'indigo-badge';
    case 2:
        return 'purple-badge';
    case 3:
        return 'orange-badge';
    default:
        return 'red-badge';
    }
});

const getBadgeContent = computed(() => {
    switch (props.layer.id) {
    case 0:
        return t('resources');
    case 1:
        return t('insight');
    case 2:
        return t('hard-stages');
    case 3:
        return t('crafting');
    default:
        return 'Undefined';
    }
});

const getContainerClass = computed(() => {
    switch (props.layer.id) {
    case 2: // Hard Stages
        return 'mb-2 gap-5 grid grid-cols-1 lg:grid-cols-2';
    case 3: // Crafting
        return 'mb-2 gap-5 grid grid-cols-1';
    default:
        return 'mb-2 gap-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';
    }
});

</script>

<template>
    <div class="w-full mb-4 flex flex-col">
        <div class="flex flex-warp gap-x-2 items-center">
            <div v-if="isBadge" class="badge badge-lg badge-ghost mt-2 mb-2 w-32" :class="getBadgeType">{{ getBadgeContent
            }}
            </div>
            <div v-if="props.layer.id === 0">
                <div class="tooltip" :data-tip="plannerSettingsStore.settings.enableWilderness ? $t('enabled-wilderness') : $t('disabled-wilderness')">
                    <button class=" btn btn-xs"
                    :class=" plannerSettingsStore.settings.enableWilderness ? ' btn-success bg-green-100' : 'btn-error bg-red-100' "
                    @click=" toggleWilderness ">
                    <i class="fa-solid fa-tree"
                        :class=" plannerSettingsStore.settings.enableWilderness ? 'text-green-800' : 'text-red-800' "></i>
                    </button>
                </div>
            </div>
            <div v-if=" props.layer.id === 2 ">
                <button class="btn btn-xs" :class=" hideLowRunCards ? 'btn-success bg-green-100 text-green-800' : 'btn-error bg-red-100 text-red-800' "
                    @click=" toggleHideLowRunCards ">
                    {{ hideLowRunCards ? $t('show-cards') : $t('hide-cards') }}
                    <i :class=" hideLowRunCards ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up' "></i>

                </button>
            </div>
        </div>
        <div :class=" getContainerClass ">
            <PlannerCard v-for="( card, index ) in  (props.layer.id === 2 ? filteredCards : props.layer.cards) " :key=" index "
                :card=" card " :layerId=" props.layer.id " />
        </div>
    </div>
</template>

<style scoped></style>
