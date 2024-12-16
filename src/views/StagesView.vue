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
const stageStore = useDataStore().stages1_9_greedy;
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
    <div class="container ">
        <div class="flex pb-4">
            <h2 class="text-2xl text-white font-bold">{{ $t('stages') }}</h2>
        </div>

        <!-- Notification -->
        <!-- <div class="pb-4">
            <div role="alert" class="alert alert-info custom-gradient-gray-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-sm lg:text-base"> 1.4 drop rates have been displayed. </p>
            </div>
        </div> -->

        <div class="flex flex-col gap-y-4 lg:grid lg:grid-cols-2 lg:gap-4">
            <div class="flex flex-col gap-y-4">

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
            <div class="flex flex-col gap-y-4">
                <StageDisplay :selectedStage="selectedStage" :stageName="selectedStage.name" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.card {
    @apply p-4 rounded shadow w-full;
}
</style>
