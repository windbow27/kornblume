<script setup lang="ts" name="PlannerSetting">
import { ref } from 'vue';
import { IPlannerSettings } from '../../stores/plannerSettingsStore'

const props = defineProps({
    settings: {
        type: Object,
        required: true
    }
});

const emit = defineEmits<{(e: 'closeOverlay' | 'saveSettings', updatedSettings?: IPlannerSettings): void }>()

const enabledUnreleasedStages = ref(props.settings.enabledUnreleasedStages);

const enableGreedyMethod = ref(props.settings.enableGreedyMethod);

const closeOverlay = () => {
    emit('closeOverlay');
};

const saveSettings = () => {
    const updatedSettings = {
        showUnreleasedArcanists: props.settings.showUnreleasedArcanists,
        enabledUnreleasedStages: enabledUnreleasedStages.value,
        enableGreedyMethod: enableGreedyMethod.value
    };
    emit('saveSettings', updatedSettings);
    closeOverlay();
};
</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-small h-auto space-y-5">
            <!-- Close button -->
            <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-control">
                <div class="tooltip" :data-tip="'Prioritize Purple Materials when farming'">
                    <label class="cursor-pointer label justify-center space-x-5 text-center">
                        <span class="label-text text-white text-md">{{ $t('enable-greedy-method') }}</span>
                        <input v-model="enableGreedyMethod" type="checkbox" class="checkbox checkbox-info" />
                    </label>
                </div>
            </div>
            <div class="form-control">
                <label class="cursor-pointer label justify-center space-x-5 text-center">
                    <span class="label-text text-white text-md">{{ $t('use-1-4-stage-data-experimental') }}</span>
                    <input v-model="enabledUnreleasedStages" type="checkbox" class="checkbox checkbox-info" />
                </label>
            </div>
            <div class="flex justify-center">
                <button @click="saveSettings" class="btn btn-success">{{ $t('save') }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
