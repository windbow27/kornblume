<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { IStage } from '@/types';
import { useGlobalStore } from '@/stores/global';
import StageSelectionIcon from '@/components/stage/StageSelectionIcon.vue';
import StageDisplay from '@/components/stage/StageDisplay.vue';

const buttons = ['Story', 'Hard', 'Resource', 'Insight'];
const selectedStage = ref<IStage>(useGlobalStore().selectedStage);
const selectedButton = ref(useGlobalStore().selectedStage.category);
const stageStore = useDataStore().stages;
const globalStore = useGlobalStore();

const selectStage = (stage: IStage) => {
    selectedStage.value = stage;
};

const filteredStages = computed(() => {
    const filteredStageStore = Object.keys(stageStore).reduce((result, key) => {
        if (stageStore[key].category === selectedButton.value) {
            result[key] = stageStore[key];
        }
        return result;
    }, {});
    return filteredStageStore as Record<string, IStage>;
});

watchEffect(() => {
    const foundStage = Object.values(stageStore).find(stage => stage.id === globalStore.selectedStage.id);
    selectedStage.value = foundStage || Object.values(stageStore)[0];
});

</script>

<template>
    <div class="wrapper">
        <div class="container">

            <!--Item Selection Card-->
            <div class="card custom-border">
                <div class="flex flex-wrap justify-center gap-y-2">
                    <div class="flex flex-wrap justify-center space-x-2 gap-y-2 py-1.5">
                        <button v-for="(button, index) in buttons" :key="index" @click="selectedButton = button"
                            :class="['hover:bg-info rounded-md text-white py-1 px-3', selectedButton === button ? 'border-button' : '']">
                            {{ $t(button) }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="card custom-border h-[calc(40vh)] lg:h-[calc(66vh)] ">
                <div class="custom-item-list">
                    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <StageSelectionIcon v-for="stage in filteredStages" :key="stage.name" :stage="stage"
                            :stageName="stage.name" @click="selectStage(stage)"
                            :class="selectedStage?.name === stage.name ? 'custom-border-white' : 'custom-border-transparent'" />
                    </div>
                </div>
            </div>
        </div>

        <!--Item Display Card-->
        <div class="container">
            <StageDisplay :selectedStage="selectedStage" :stageName="selectedStage.name" />
        </div>

    </div>
</template>

<style scoped>
.container {
    @apply w-full lg:w-1/2 flex flex-col p-4 gap-y-4 max-w-2xl;
}

.card {
    @apply p-4 rounded shadow w-full;
}
</style>
