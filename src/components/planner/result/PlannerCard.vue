<script setup lang="ts" name="PlannerCard">
import { computed, ref, watch } from 'vue';
import { useGlobalStore } from '@/stores/global';
import { useI18n } from 'vue-i18n';
import MaterialItem from './MaterialItem.vue';

const props = defineProps({
    card: {
        type: Object,
        required: true
    },
    layerId: {
        type: Number,
        required: true
    }
});

const { t } = useI18n()
const scrollDiv = ref<HTMLDivElement | null>(null);

const shouldHideScrollbar = computed(() => {
    return props.card.materials.length < 4;
});

const toolTipText = computed(() => {
    if (props.layerId === 3 || props.card.stage === 'Unreleased') {
        return undefined;
    } else if (props.card.stage === 'Oneiric Shop') {
        return t('number-of-oneiric-fluid')
    }
    return t('number-of-runs') + ' | ' + t('activities') + ' | ' + t('uppercase-days')
})

watch(shouldHideScrollbar, (newVal) => {
    if (newVal && scrollDiv.value) {
        scrollDiv.value.scrollLeft = 0;
    }
});

</script>

<template>
    <div class="bg-gray-700/40 shadow rounded flex flex-col items-center justify-between relative">
        <div class="stage text-white p-2">
            <p>{{ $t(card.stage) }}</p>
        </div>

        <div class="tooltip w-full" :data-tip="toolTipText">
            <div
                class="calculations flex justify-center items-center bg-gradient-to-r from-blue-800/70 to-blue-900/90 text-white p-2 rounded-md">
                <p v-if="card.stage !== 'Unreleased'" class="border-blue-700/90 border-r pr-3">
                    <span v-show="card.runs > 0">
                        <i class="fa-solid fa-xmark text-xs mr-0.5" />{{ card.runs }}
                    </span>
                </p>
                <p v-else>
                    {{ $t('available-after-1-4-version-update') }} </p>

                <p class="pl-2" v-if="card.activity !== 0">{{ card.activity }}</p>
                <p v-else-if="layerId === 3">
                    <span class="border-blue-700/90 border-r pr-3">{{ $t('crafted-from-available-materials') }}</span>
                    <span class="pl-3">{{ $t('list-includes-dependencies') }}</span>
                </p>

                <img v-show="card.activity" :src="card.activityImagePath" alt="Activity Image"
                    class="inline-block w-8 h-8" />

                <p class="border-blue-700/90 border-l pl-3">
                    <span v-show="card.days > 0">
                        {{ card.days }} {{ card.days === 0 ? '' : card.days > 1 ? $t('days') : $t('day') }}
                    </span>
                </p>
            </div>
        </div>

        <div v-if="card.stage === 'Unreleased'" ref="scrollDiv" :class="{ 'hidden-scrollbar': shouldHideScrollbar }"
            class="flex overflow-y-hidden overflow-x-auto m-auto">
            <div v-for="(material, materialIndex) in card.materials.filter((matl) => useGlobalStore().neededRawMaterialsMapping[matl.Material] > 0)"
                :key="materialIndex" class="flex-shrink-0">
                <MaterialItem :material="{ ...material, Quantity: 0 }" :layerId="layerId" />
            </div>
        </div>
        <div v-else ref="scrollDiv" :class="{ 'hidden-scrollbar': shouldHideScrollbar }"
            class="flex overflow-y-hidden overflow-x-auto m-auto scrollbar">
            <div v-for="(material, materialIndex) in card.materials" :key="materialIndex" class="flex-shrink-0">
                <MaterialItem :material="material" :layerId="layerId" />
            </div>
        </div>

    </div>
</template>

<style scoped>
.hidden-scrollbar::-webkit-scrollbar {
    height: 6px;
}
.scrollbar::-webkit-scrollbar {
    height: 6px;
}
</style>
