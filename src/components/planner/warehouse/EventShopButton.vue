<script setup lang="ts" name="EventShopButton">
import { ref } from 'vue'
import { addEventShopMaterialsToWarehouse } from '../../../composables/warehouse'

const dialog = ref<HTMLDialogElement>()

const emit = defineEmits<{(e: 'closeOverlay'): void }>()

const props = defineProps<{
    version: string,
    text: string,
    type: string
}>()

const addItems = () => {
    addEventShopMaterialsToWarehouse(props.version);
    emit('closeOverlay');
    closeDialog();
};

const showDialog = () => dialog.value?.showModal()

const closeDialog = () => dialog.value?.close()

</script>

<template>
    <div class="tooltip" :data-tip="type">
        <button class="btn btn-info btn-sm" @click="showDialog"> {{ text }} </button>
    </div>
    <dialog ref="dialog" class="modal">
        <div class="modal-box custom-gradient-gray-blue custom-border">
            <p class="py-4 text-lg text-white text-center">{{ $t('add-materials-from-text', [text]) }}</p>
            <p class="py-4 text-md text-white text-center"> {{ $t('you-should-add-once-only') }}</p>
            <div class="flex justify-center">
                <button class="btn btn-success btn-md mr-2" @click="addItems">{{ $t('yes') }}</button>
                <button class="btn btn-error btn-md" @click="closeDialog">{{ $t('no') }}</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button></button>
        </form>
    </dialog>
</template>

<style scoped></style>
