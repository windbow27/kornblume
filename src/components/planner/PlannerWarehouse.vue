<script setup lang="ts" name="PlannerWarehouse">
import { ref, onMounted, computed } from 'vue';
import { useWarehouseStore } from '../../stores/warehouseStore';
import Popper from 'vue3-popper';
import {
    initializeWarehouse,
    checkWarehouse,
    sortWarehouseMaterials
} from '../../composables/warehouse';
import { useGlobalStore } from '../../stores/global';
import WarehouseItem from './warehouse/WarehouseItem.vue';
import EventShopButton from './warehouse/EventShopButton.vue';

const emit = defineEmits<{ (e: 'closeOverlay'): void }>();

const dialog = ref<HTMLDialogElement>();

const categories = [
    'Base Item',
    'Build Material',
    'Insight Material',
    'Resonate Material',
    'Reveries Material'
];

const activeCategories = ref([] as string[]);

const resetActiveCategories = () => {
    // if active categories are empty or full, reset all, else reset active categories
    if (
        activeCategories.value.length === 0 ||
        activeCategories.value.length === categories.length
    ) {
        useWarehouseStore().resetAll();
    } else {
        for (const category of categories) {
            if (!activeCategories.value.includes(category)) {
                useWarehouseStore().resetCategory(category);
            }
        }
    }
    closeDialog();
};

const selectedCategories = (category: string) => {
    if (activeCategories.value.includes(category)) {
        activeCategories.value = activeCategories.value.filter((c) => c !== category);
    } else {
        activeCategories.value.push(category);
    }
};

const setupWarehouse = () => {
    if (useWarehouseStore().data.length === 0) {
        initializeWarehouse();
    } else {
        // else statement to be updated for seamless addition of new warehouse items
        checkWarehouse();
    }
    sortWarehouseMaterials(useWarehouseStore().data);
};

const updateMaterialQuantity = (materialName: string, materialQuantity: number) => {
    useWarehouseStore().updateItem(materialName, Number(materialQuantity));
};

const closeWarehouseOverlay = () => {
    useGlobalStore().setIsEditingPlanner(false);
    emit('closeOverlay');
};

const showDialog = () => dialog.value?.showModal();

const closeDialog = () => dialog.value?.close();

const filteredWarehouse = computed(() => {
    if (activeCategories.value.length === 0) {
        return useWarehouseStore().data;
    }
    return useWarehouseStore().data.filter((item) => {
        // console.log('');
        return activeCategories.value.includes(item.Category);
    });
});

onMounted(() => {
    useGlobalStore().setIsEditingPlanner(true);
    setupWarehouse();
});
</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-big h-5/6 xl:h-3/4 flex flex-col items-center">
            <!-- Close button -->
            <button @click="closeWarehouseOverlay" class="absolute top-2 right-4 text-white">
                <i class="fas fa-times"></i>
            </button>
            <p class="text-white text-center font-bold text-lg">{{ $t('warehouse-auto-save') }}</p>

            <div class="flex gap-y-2 items-center">
                <Popper arrow placement="bottom" offsetDistance="2">
                    <div class="tooltip" :data-tip="$t('filter')">
                        <button class="btn btn-ghost text-white">
                            <i class="fa-solid fa-filter"></i>
                        </button>
                    </div>
                    <template #content>
                        <div class="flex flex-col justify-center flex-wrap gap-x-2 gap-y-1">
                            <div class="grid grid-cols-2 gap-x-2 gap-y-1">
                                <button
                                    v-for="(category, index) in categories"
                                    :key="category"
                                    :class="[
                                        {
                                            'border-2 border-warning':
                                                activeCategories.includes(category),
                                            'border-2 border-transparent':
                                                !activeCategories.includes(category)
                                        },
                                        {
                                            'text-error': index === 0,
                                            'text-warning': index === 1,
                                            'text-success': index === 2,
                                            'text-info': index === 3,
                                            'text-green-300': index === 4
                                        }
                                    ]"
                                    @click="selectedCategories(category)"
                                    class="p-2 rounded-md text-sm">
                                    {{ $t(category) }}
                                </button>
                            </div>
                        </div>
                    </template>
                </Popper>
            </div>

            <div class="custom-item-list mb-5">
                <WarehouseItem
                    v-for="material in filteredWarehouse"
                    :key="material.Material"
                    :material="material"
                    @update:quantity="updateMaterialQuantity(material.Material, $event)"
                    class="" />
            </div>

            <div class="flex space-x-10">
                <!-- shops -->
                <div class="flex space-x-3">
                    <button class="green-button-small" onclick="shop_container.showModal()">
                        {{ $t('event-materials') }}
                    </button>
                    <dialog id="shop_container" class="modal">
                        <div class="modal-box custom-gradient-gray-blue custom-border">
                            <form method="dialog">
                                <button
                                    class="btn btn-sm btn-circle btn-ghost text-white absolute right-2 top-2">
                                    ✕
                                </button>
                            </form>
                            <p class="py-4 text-base text-white text-center">
                                {{
                                    $t(
                                        'you-can-quickly-add-materials-from-jukeboxes-and-events-here'
                                    )
                                }}
                            </p>
                            <div class="grid grid-cols-2 gap-2 p-2">
                                <EventShopButton
                                    version="jb1"
                                    :text="$t('jukebox-normal')"
                                    :type="$t('jukebox')" />
                                <EventShopButton
                                    version="jb2"
                                    :text="$t('jukebox-collector')"
                                    :type="$t('jukebox')" />
                            </div>
                            <form method="dialog" class="flex justify-center">
                                <button class="red-button-small">{{ $t('close') }}</button>
                            </form>
                        </div>
                        <form method="dialog" class="modal-backdrop">
                            <button></button>
                        </form>
                    </dialog>
                </div>

                <!-- reset -->
                <button class="red-button-small" @click="showDialog">{{ $t('reset') }}</button>
                <dialog ref="dialog" class="modal">
                    <div class="modal-box custom-gradient-gray-blue custom-border">
                        <p class="py-4 text-lg text-white text-center">
                            <i18n-t keypath="reset-quantity-of-selected-categories">
                                <template #highlight>
                                    <span class="text-error">{{ $t('selected') }}</span>
                                </template>
                            </i18n-t>
                        </p>
                        <p class="py-4 text-md text-white text-center">
                            {{ $t('click-the-buttons-at-the-top-to-select') }}
                        </p>
                        <div class="flex justify-center space-x-5">
                            <button class="green-button" @click="resetActiveCategories">
                                {{ $t('yes') }}
                            </button>
                            <button class="red-button" @click="closeDialog">{{ $t('no') }}</button>
                        </div>
                    </div>
                    <form method="dialog" class="modal-backdrop">
                        <button></button>
                    </form>
                </dialog>
            </div>
        </div>
    </div>
</template>
