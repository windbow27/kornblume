<script setup lang="ts" name="PlannerLayer">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n';
import PlannerCard from './PlannerCard.vue';

const props = defineProps({
    layer: {
        type: Object,
        required: true
    }
});

const { t } = useI18n()

const isBadge = computed(() => {
    return props.layer.cards && props.layer.cards.length > 0;
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
        return 'green-badge';
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
        <div v-if="isBadge" class="badge badge-lg badge-ghost mt-2 mb-2 w-32" :class="getBadgeType">{{ getBadgeContent }}
        </div>
        <div :class="getContainerClass">
            <PlannerCard v-for="(card, index) in layer.cards" :key="index" :card="card" :layerId="props.layer.id" />
        </div>
    </div>
</template>

<style scoped></style>
