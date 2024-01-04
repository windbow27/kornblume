<script setup lang="ts" name="EventShopButton">
import { ref } from 'vue'
import { addEventShopMaterialsToWarehouse, removeEventShopMaterialsFromWarehouse } from '../../../composables/warehouse'

const props = defineProps<{
    version: string,
    text: string,
    type: string
}>()

const emit = defineEmits<{(e: 'closeOverlay'): void }>()

const dialog = ref<HTMLDialogElement>()

const addItems = () => {
    addEventShopMaterialsToWarehouse(props.version);
    emit('closeOverlay');
    closeDialog();
};

const removeItems = () => {
    removeEventShopMaterialsFromWarehouse(props.version);
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
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
            </form>
            <p class="py-4 text-lg text-white text-center">{{ $t('add-materials-from-text', [text]) }}</p>
            <p class="py-4 text-md text-white text-center"> {{ $t('you-should-add-once-only') }}</p>
            <div class="flex justify-center space-x-5">
                <button class="btn btn-success btn-md mr-2" @click="addItems">{{ $t('add') }}</button>
                <button class="btn btn-error btn-md" @click="removeItems">{{ $t('remove') }}</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button></button>
        </form>
    </dialog>
</template>

<style scoped></style>
