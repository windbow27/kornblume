<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable no-unused-vars -->
<script setup lang="ts">
import { ref } from 'vue';
import { IPullNumber } from '@/stores/pullsRecordStore';
import { IArcanist } from '@/types';
import { useDataStore } from '@/stores/dataStore';
import { formatDate } from '@/composables/editor';
import ArcanistIcon from '../arcanist/ArcanistIcon.vue';
import SpecialIcon from '../common/SpecialIcon.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
    pulls: {
        type: Array as () => IPullNumber[],
        required: true
    }
});

const arcanists = useDataStore().arcanists;

</script>

<template>
    <div class="flex justify-center space-x-5 pb-4">
        <button class="blue-button">Add Pull</button>
        <button class="green-button">{{ $t('save') }}</button>
    </div>
    <div class="flex flex-col overflow-x-auto hidden-scrollbar">
        <table class="table-auto w-auto text-white lg:mx-auto">
            <thead>
                <tr>
                    <th class="text-center">{{ $t('pull') }}</th>
                    <th class="text-center">{{ $t('arcanist') }}</th>
                    <th class="text-center whitespace-nowrap">{{ $t('banner') }}</th>
                    <th class="text-center whitespace-nowrap px-16">{{ $t('date') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(pull, index) in props.pulls" :key="`${pull.Timestamp}-${pull.ArcanistName}-${index}`"
                    :class="{
            'text-orange-300': pull.Rarity === 6,
            'text-yellow-100': pull.Rarity === 5,
            'text-purple-400': pull.Rarity === 4,
            'text-sky-200': pull.Rarity === 3,
            'text-green-200': pull.Rarity === 2
        }">
                    <td class="text-center whitespace-nowrap px-2">{{ pull.PullNumber }}</td>
                    <td class="flex items-center gap-x-3 whitespace-nowrap px-2">
                        <ArcanistIcon v-if="arcanists.find(a => a.Name === pull.ArcanistName)"
                            :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) as IArcanist" />
                        <SpecialIcon v-else :name="pull.ArcanistName" />
                        <input class="custom-input w-32" type="text" v-model="pull.ArcanistName" />
                    </td>
                    <td class="text-center whitespace-nowrap px-2">
                        <input class="custom-input w-52" type="text" v-model="pull.BannerType" />
                    </td>
                    <td class="text-center whitespace-nowrap px-2">
                        <VueDatePicker v-model="pull.Timestamp" enable-seconds />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.custom-input {
    @apply input input-sm input-ghost input-bordered hover:border hover:border-white
}

.dp__theme_light {
    --dp-background-color: #202941;
    --dp-text-color: #fff;
    --dp-border-color: #202941;
}

.dp__theme_dark {
    --dp-background-color: #202941;
    --dp-text-color: #fff;
    --dp-border-color: #202941;
}
</style>
