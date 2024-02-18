<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import StageIcon from '@/components/stage/StageIcon.vue';

const buttons = ['Story', 'Hard', 'Resource', 'Insight'];
const selectedButton = ref(buttons[0]);
const stageStore = useDataStore().stages;

// const selectMaterial = (material: IStage) => {
//     selectedMaterial.value = material;
// };

const filteredStages = computed(() => {
    const filteredStageStore = Object.keys(stageStore).reduce((result, key) => {
        if (stageStore[key].category === selectedButton.value) {
            result[key] = stageStore[key];
        }
        return result;
    }, {});
    return filteredStageStore;
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
                        {{ console.log(filteredStages) }}
                        <StageIcon v-for="(stage, stageName) in filteredStages" :key="stage" :stage="stage"
                            :stageName="stageName" />
                    </div>
                </div>
            </div>
        </div>

        <!--Item Display Card-->
        <div class="container">
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
