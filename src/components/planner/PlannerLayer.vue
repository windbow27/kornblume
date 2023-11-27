<script setup>
import { computed } from 'vue'
import Card from '../common/Card.vue';
import { FwbBadge } from 'flowbite-vue';

const props = defineProps({
    layer: {
        type: Object, // Change type to Object since the layer now has id and cards properties
        required: true
    }
});

const getBadgeType = computed(() => {
    switch (props.layer.id) {
        case 0:
            return 'yellow';
        case 1:
            return 'indigo';
        case 2:
            return 'purple';
        case 3:
            return 'green';
        default:
            return 'red';
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
        <FwbBadge :class="`mt-2 mb-2 w-32`" :size="`sm`" :type="getBadgeType">{{ getBadgeContent }}</FwbBadge>
        <div class="mb-4 gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            <Card v-for="(card, index) in layer.cards" :key="index" :card="card" />
        </div>
    </div>
</template>

<style scoped></style>
