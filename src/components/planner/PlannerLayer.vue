<script setup>
import { computed } from 'vue'
import Card from '../common/Card.vue';

const props = defineProps({
    layer: {
        type: Object, 
        required: true
    }
});

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
            return 'Resources';
        case 1:
            return 'Insight';
        case 2:
            return 'Hard Stages';
        case 3:
            return 'Miscs';
        default:
            return 'Undefined';
    }
});

</script>

<template>
    <div class="w-full mb-4 flex flex-col">
        <div v-if="isBadge" class="badge badge-lg badge-ghost mt-2 mb-2 w-32" :class="getBadgeType">{{ getBadgeContent }}</div>
        <div class="mb-4 gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            <Card v-for="(card, index) in layer.cards" :key="index" :card="card" />
        </div>
    </div>
</template>

<style scoped></style>
