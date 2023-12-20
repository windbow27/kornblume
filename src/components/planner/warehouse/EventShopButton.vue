<script setup lang="ts" name="EventShopButton">
import { ref, computed } from 'vue'
import { addEventShopMaterialsToWarehouse } from '../../../composables/warehouse'

const dialog = ref<HTMLDialogElement>()

const emit = defineEmits<{(e: 'closeOverlay'): void}>()

const props = defineProps<{
    version: string
}>()

const addItems = () => {
    addEventShopMaterialsToWarehouse(props.version);
    emit('closeOverlay');
    closeDialog();
};

const majorVersion = computed(() => {
    const { version } = props
    return version.substring(0, version.length - 1)
})

const minorVersion = computed(() => {
    const { version } = props
    return version[version.length - 1]
})

const showDialog = () => dialog.value?.showModal()

const closeDialog = () => dialog.value?.close()

</script>

<template>
    <div class="tooltip" data-tip="Event Shop">
        <button class="btn btn-success btn-sm" @click="showDialog">{{ majorVersion }} pt.{{ minorVersion }}</button>
    </div>
    <dialog ref="dialog" class="modal">
        <div class="modal-box bg-slate-700">
            <p class="py-4 text-lg text-white text-center">Add materials from<span class="text-error">{{ majorVersion }} part {{ minorVersion }}</span>event shop?</p>
            <p class="py-4 text-md text-white text-center"> You should add once only.</p>
            <div class="flex justify-center">
                <button class="btn btn-success btn-md mr-2" @click="addItems">Yes</button>
                <button class="btn btn-error btn-md" @click="closeDialog">No</button>
            </div>
        </div>
        <form method="dialog" class="modal-backdrop">
            <button>close</button>
        </form>
    </dialog>
</template>

<style scoped></style>
