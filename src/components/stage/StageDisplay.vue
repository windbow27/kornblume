<script setup lang="ts">

const props = defineProps({
    selectedStage: {
        type: Object,
        required: true
    },
    stageName: {
        type: String,
        required: true
    }
});
</script>

<template>
    <!-- {{ console.log(props.selectedStage) }} -->
    {{ console.log(props.stageName) }}
    <div v-if="props.selectedStage" class="custom-box custom-border">
        <div class="space-y-1">
            <h2 class="text-white text-2xl font-bold py-1">{{ props.stageName }}</h2>
            <p class="" :class="{
                'text-error': props.selectedStage.category === 'Story',
                'text-purple-400': props.selectedStage.category === 'Hard',
                'text-indigo-400': props.selectedStage.category === 'Insight',
                'text-yellow-400': props.selectedStage.category === 'Resource',
            }"> {{ props.selectedStage.category }} </p>
            <div class="flex items-center">
                <p class="text-white"> {{ $t('cost') }}: {{ props.selectedStage.cost }} </p>
                <div class="w-8 rounded">
                    <img src="/images/items/common/0.png" alt="avatar" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
