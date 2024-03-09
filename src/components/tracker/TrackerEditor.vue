<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable no-unused-vars -->
<script setup lang="ts">
import { ref, reactive } from 'vue';
import { IPullNumber, IPull, usePullsRecordStore } from '@/stores/pullsRecordStore';
import { IArcanist } from '@/types';
import { useDataStore } from '@/stores/dataStore';
import { formatNoSpoilerArcanists } from '@/composables/arcanists';
import Popper from 'vue3-popper';
import ArcanistIcon from '../arcanist/ArcanistIcon.vue';
import SpecialIcon from '../common/SpecialIcon.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import { bannerList } from '@/utils/bannerData';
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
    pulls: {
        type: Array as () => IPullNumber[],
        required: true
    }
});

const pullsRecordStore = usePullsRecordStore();
const arcanists = formatNoSpoilerArcanists(useDataStore().arcanists);
const localPulls = reactive(props.pulls.map(pull => ({ ...pull })));
const arcanistNames = reactive(localPulls.map(pull => pull.ArcanistName));
const bannerTypes = reactive(localPulls.map(pull => pull.BannerType));
const localPullDates = reactive(props.pulls.map(pull => new Date(pull.Timestamp))); // create a new date object because datepicker convert number back to Date
const newArcanistName = ref('');
const newBannerType = ref('');
const newPullDate = ref(new Date());

const addPull = () => {
    const newPull: IPullNumber = {
        PullNumber: localPulls.length + 1,
        ArcanistName: newArcanistName.value,
        Rarity: arcanists.find(a => a.Name === newArcanistName.value)?.Rarity || 0,
        BannerType: newBannerType.value,
        Timestamp: newPullDate.value.getTime()
    };
    localPulls.push(newPull);
    arcanistNames.push(newArcanistName.value);
    bannerTypes.push(newBannerType.value);
    localPullDates.push(newPullDate.value);
    newArcanistName.value = '';
    newBannerType.value = '';
    newPullDate.value = new Date();
};

const savePulls = () => {
    const pullsToSave: IPull[] = localPulls
        .filter(pull => pull.ArcanistName && pull.Rarity && pull.BannerType && !isNaN(pull.Timestamp)) // filter out empty pulls
        .map((pull, index) => {
            const selectedArcanist = arcanists.find(a => a.Name === pull.ArcanistName);
            let rarity = pull.Rarity;
            if (selectedArcanist) {
                rarity = selectedArcanist.Rarity;
            }

            return {
                ArcanistName: pull.ArcanistName,
                Rarity: rarity,
                BannerType: pull.BannerType,
                Timestamp: isNaN(pull.Timestamp) ? localPullDates[index].getTime() : pull.Timestamp
            };
        });
    pullsRecordStore.updatePullsRecord(pullsToSave);
    setTimeout(() => window.location.reload());
};

const reload = () => {
    window.location.reload();
};

</script>

<template>
    <!-- {{ console.log(pullsRecordStore.data) }} -->
    <div class="flex justify-center space-x-5 pb-4">
        <button class="blue-button" onclick="addPull.showModal()">{{ $t('add-pull') }}</button>
        <dialog id="addPull" class="modal">
            <div
                class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center overflow-hidden">
                <form method="dialog">
                    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                </form>
                <h2 class="text-white text-lg pb-4 font-bold">{{ $t('add-pull') }}</h2>
                <div class="flex flex-col gap-y-4">
                    <Popper arrow placement="bottom" offsetDistance="2">
                        <input class="custom-input w-64 text-white" type="text" v-model="newArcanistName" />
                        <template #content>
                            <div class="custom-item-list"
                                v-for="(arcanist, i) in arcanists.filter(a => a.Name.includes(newArcanistName))"
                                :key="i" @click="newArcanistName = arcanist.Name">
                                {{ arcanist.Name }}
                            </div>
                        </template>
                    </Popper>
                    <Popper arrow placement="bottom" offsetDistance="2">
                        <input class="custom-input w-64 text-white" type="text" v-model="newBannerType" />
                        <template #content>
                            <div class="custom-item-list"
                                v-for="(banner, i) in bannerList.filter(b => b.includes(newBannerType))" :key="i"
                                @click="newBannerType = banner">
                                {{ banner }}
                            </div>
                        </template>
                    </Popper>
                    <VueDatePicker v-model="newPullDate" enable-seconds />
                   <div class="flex justify-center space-x-5">
                        <form method="dialog">
                            <button class="green-button" @click="addPull">{{ $t('add') }}</button>
                        </form>
                        <form method="dialog">
                            <button class="red-button" onclick="addPull.close()">{{ $t('cancel') }}</button>
                        </form>
                   </div>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>

        <button class="green-button" @click="savePulls">{{ $t('save') }}</button>
        <button class="red-button" @click="reload">{{ $t('cancel') }}</button>
    </div>
    <div class="flex flex-col overflow-x-auto hidden-scrollbar">
        <table class="table-auto w-auto text-white lg:mx-auto">
            <thead>
                <tr>
                    <th class="text-center">{{ $t('pull') }}</th>
                    <th class="text-center">{{ $t('arcanist') }}</th>
                    <th class="text-center whitespace-nowrap">{{ $t('banner') }}</th>
                    <th class="text-center whitespace-nowrap px-16">{{ $t('date') }}</th>
                    <th class="text-center">{{ $t('remove') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(pull, index) in localPulls" :key="`${pull.Timestamp}-${pull.ArcanistName}-${index}`" :class="{
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

                        <Popper arrow placement="bottom" offsetDistance="2">
                            <input class="custom-input w-52" type="text" v-model="arcanistNames[index]" />
                            <template #content>
                                <div class="custom-item-list"
                                    v-for="(arcanist, i) in arcanists.filter(a => a.Name.includes(arcanistNames[index]))"
                                    :key="i" @click="arcanistNames[index] = pull.ArcanistName = arcanist.Name">
                                    {{ arcanist.Name }}
                                </div>
                            </template>
                        </Popper>

                    </td>
                    <td class="text-center whitespace-nowrap px-2">
                        <Popper arrow placement="bottom" offsetDistance="2">
                            <input class="custom-input w-52" type="text" v-model="bannerTypes[index]" />
                            <template #content>
                                <div class="custom-item-list"
                                    v-for="(banner, i) in bannerList.filter(b => b.includes(bannerTypes[index]))"
                                    :key="i" @click="bannerTypes[index] = pull.BannerType = banner">
                                    {{ banner }}
                                </div>
                            </template>
                        </Popper>
                    </td>
                    <td class="text-center whitespace-nowrap px-2">
                        <VueDatePicker v-model="localPullDates[index]" enable-seconds />
                    </td>
                    <td class="text-center whitespace-nowrap px-2">
                        <button class="btn btn-sm btn-circle btn-ghost" @click="localPulls.splice(index, 1)">✕</button>
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
