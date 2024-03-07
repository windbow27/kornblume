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

const enabledUnreleasedStages_v1_7 = ref(props.settings.enabledUnreleasedStages_v1_7);

const closeOverlay = () => {
    emit('closeOverlay');
};

const saveSettings = () => {
    const updatedSettings = {
        showUnreleasedArcanists: props.settings.showUnreleasedArcanists,
        enabledUnreleasedStages_v1_7: enabledUnreleasedStages_v1_7.value,
        enableWilderness: props.settings.enableWilderness,
        enableLowRunCards: props.settings.enableLowRunCards
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
            <!-- TODO: only allow user to change enabledUnreleasedStages_v1_7 value when we ready -->
            <!-- <div class="form-control">
                <label class="cursor-pointer label justify-center space-x-5 text-center">
                    <span class="label-text text-white text-md whitespace-nowrap">{{ $t('use-1-4-stage-data-experimental') }}</span>
                    <input v-model="enabledUnreleasedStages_v1_7" type="checkbox" class="checkbox checkbox-info" />
                </label>
            </div> -->
            <div class="flex justify-center">
                <button @click="saveSettings" class="green-button">{{ $t('save') }}</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
