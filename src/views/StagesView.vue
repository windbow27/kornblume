<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { IStage } from '@/types';
import { useGlobalStore } from '@/stores/global';
import StageSelectionIcon from '@/components/stage/StageSelectionIcon.vue';
import StageDisplay from '@/components/stage/StageDisplay.vue';

const buttons = ['Story', 'Hard', 'Resource', 'Insight'];
const selectedButton = ref(buttons[0]);
const selectedStage = ref<IStage | null>();
const selectedStageName = ref<string>('1-1');
const stageStore = useDataStore().stages;
const globalStore = useGlobalStore();

const selectStage = (stage: IStage, stageName: string) => {
    selectedStage.value = stage;
    selectedStageName.value = stageName;
};

const filteredStages = computed(() => {
    const filteredStageStore = Object.keys(stageStore).reduce((result, key) => {
        if (stageStore[key].category === selectedButton.value) {
            result[key] = stageStore[key];
            console.log(result[key])
        }
        return result;
    }, {});
    console.log(filteredStageStore);
    return filteredStageStore;

    // const filteredStageStore = Object.values(stageStore).filter(stage => stage.category === selectedButton.value);
    // console.log(filteredStageStore);
    // return filteredStageStore;
});

watchEffect(() => {
    const foundStage = Object.values(stageStore).find(stage => stage.id === globalStore.selectedStage.id);
    selectedStage.value = foundStage || Object.values(stageStore)[0];
});

</script>

<template>
    <div class="pt-4 sm:px-8 md:px-16 flex flex-wrap justify-center">
        <div class="container">

            <!--Item Selection Card-->
            <div class="card custom-border">
                <div class="flex flex-wrap justify-between pl-2 gap-y-2">
                    <div class="flex space-x-2 gap-y-2 py-1.5">
                        <button v-for="(button, index) in buttons" :key="index" @click="selectedButton = button"
                            :class="['hover:bg-info rounded-md text-white py-1 px-3', selectedButton === button ? 'border-button' : '']">
                            {{ button }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="card custom-border h-[calc(70vh)] ">
                <div class="custom-item-list">
                    <div class="flex flex-wrap justify-center gap-x-5 gap-y-2">
                        <!-- {{ console.log(filteredStages) }} -->
                        <StageSelectionIcon v-for="(stage, stageName) in filteredStages" :key="stage" :stage="stage"
                            :stageName="stageName" @click="selectStage(stage, stageName)" />
                    </div>
                </div>
            </div>
        </div>

        <!--Item Display Card-->
        <div class="container">
            <StageDisplay :selectedStage="selectedStage || {}" :stageName="selectedStageName" />
        </div>

    </div>
</template>

<style scoped>
.container {
    @apply flex flex-col w-1/2 p-4 gap-y-4 max-w-2xl;
}

.card {
    @apply p-4 rounded shadow w-full;
}
</style>
