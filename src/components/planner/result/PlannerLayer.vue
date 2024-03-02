<script setup lang="ts" name="PlannerLayer">
import { computed } from 'vue'
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

const toggleHideLowRunCards = () => {
    plannerSettingsStore.settings.enableLowRunCards = !plannerSettingsStore.settings.enableLowRunCards;
};

const toggleWilderness = () => {
    plannerSettingsStore.settings.enableWilderness = !plannerSettingsStore.settings.enableWilderness;
};

const isEnabledLowRunCards = computed(() => plannerSettingsStore.settings.enableLowRunCards)

const isBadge = computed(() => {
    return props.layer.cards && props.layer.cards.length > 0;
});

const filteredCards = computed(() => {
    if (!isEnabledLowRunCards.value) {
        return props.layer.cards.filter((card) => card.runs > 5);
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
        <div class="flex flex-warp items-center">
            <div v-if="isBadge" class="badge badge-lg badge-ghost mt-2 mb-2 w-32" :class="getBadgeType">{{ getBadgeContent
            }}
            </div>
            <div v-if="props.layer.id === 0 && isBadge">
                <div class="tooltip"
                    :data-tip="plannerSettingsStore.settings.enableWilderness ? $t('disable-wilderness'): $t('enable-wilderness')">
                    <button class=" btn btn-xs btn-warning bg-yellow-100 text-yellow-800"
                        :class="plannerSettingsStore.settings.enableWilderness ? '  ' : ' opacity-50'"
                        @click="toggleWilderness">
                        <i class="fa-solid fa-tree" :class="plannerSettingsStore.settings.enableWilderness"></i>
                    </button>
                </div>
            </div>
            <div v-if="props.layer.id === 2 && isBadge">
                <div class="tooltip"
                    :data-tip="isEnabledLowRunCards ? $t('hide-cards'): $t('show-cards')">
                    <button
                        class="btn btn-xs bg-purple-100 text-purple-800 border-purple-800 border hover:bg-purple-400 hover:border-purple-800"
                        :class="isEnabledLowRunCards ? '' : 'opacity-50'"
                        @click="toggleHideLowRunCards">
                        <!-- {{ isEnabledLowRunCards ? $t('enabled-minor-cards'): $t('disabled-minor-cards') }} -->
                        <i :class="isEnabledLowRunCards ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'"></i>
                        <i
                            :class="isEnabledLowRunCards ? 'fa-solid fa-chevron-down': 'fa-solid fa-chevron-up'"></i>
                    </button>
                </div>
            </div>
        </div>
        <div :class="getContainerClass">
            <PlannerCard v-for="( card, index ) in  (props.layer.id === 2 ? filteredCards : props.layer.cards) "
                :key="index" :card="card" :layerId="props.layer.id" />
        </div>
    </div>
</template>

<style scoped></style>
