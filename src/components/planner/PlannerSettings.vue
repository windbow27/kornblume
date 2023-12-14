<script setup>
import { ref } from 'vue';

const props = defineProps({
    settings: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true,
    },
    saveSettings: {
        type: Function,
        required: true,
    },
});

const isShowUnreleased = ref(props.settings.showUnreleased);
const isFutureData = ref(props.settings.futureData);

const closeOverlay = () => {
    emit('closeOverlay');
};

const saveSettings = () => {
    const updatedSettings = {
        showUnreleased: isShowUnreleased.value,
        futureData: isFutureData.value,
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
                <label class="cursor-pointer label justify-center space-x-5">
                    <span class="label-text text-white text-md">Show unreleased</span>
                    <input v-model="isShowUnreleased" type="checkbox" class="checkbox checkbox-info" />
                </label>
            </div>
            <div class="form-control">
                <label class="cursor-pointer label justify-center space-x-5">
                    <span class="label-text text-white text-md">Use 1.4 stage data</span>
                    <input v-model="isFutureData" type="checkbox" class="checkbox checkbox-info" />
                </label>
            </div>
            <div class="flex justify-center">
                <button @click="saveSettings" class="btn btn-success">Save</button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
