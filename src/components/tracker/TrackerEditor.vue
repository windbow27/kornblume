<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { IPullNumber, IPull, usePullsRecordStore } from '@/stores/pullsRecordStore';
import { IArcanist } from '@/types';
import { useDataStore } from '@/stores/dataStore';
import { formatNoSpoilerArcanists } from '@/composables/arcanists';
import { bannerList } from '@/utils/bannerData';
import ArcanistIcon from '../arcanist/ArcanistIcon.vue';
import SpecialIcon from '../common/SpecialIcon.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps({
  pulls: {
    type: Array as () => IPullNumber[],
    required: true
  }
});

const pullsRecordStore = usePullsRecordStore();
const arcanists = formatNoSpoilerArcanists(useDataStore().arcanists);
const localPulls = reactive(props.pulls.map((pull) => ({ ...pull })));
const arcanistNames = reactive(localPulls.map((pull) => pull.ArcanistName));
const bannerTypes = reactive(localPulls.map((pull) => pull.BannerType));
const localPullDates = reactive(props.pulls.map((pull) => new Date(pull.Timestamp)));
const newArcanistName = ref('');
const newBannerType = ref('');
const newPullDate = ref(new Date());

const itemsPerPage = 10;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(localPulls.length / itemsPerPage));
const paginatedPulls = computed(() =>
  localPulls.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage)
);

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

function jumpToPage(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  if (!isNaN(value) && value >= 1 && value <= totalPages.value) {
    currentPage.value = value;
  }
}

function getPagination() {
  const pages: (number | string)[] = [];
  if (totalPages.value <= 6) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage.value <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages.value - 1, totalPages.value);
    } else if (currentPage.value >= totalPages.value - 2) {
      pages.push(
        1,
        2,
        '...',
        totalPages.value - 3,
        totalPages.value - 2,
        totalPages.value - 1,
        totalPages.value
      );
    } else {
      pages.push(
        1,
        '...',
        currentPage.value - 1,
        currentPage.value,
        currentPage.value + 1,
        '...',
        totalPages.value
      );
    }
  }
  return pages;
}

const addPull = () => {
  const newPull: IPullNumber = {
    PullNumber: localPulls.length + 1,
    ArcanistName: newArcanistName.value,
    Rarity: arcanists.find((a) => a.Name === newArcanistName.value)?.Rarity || 0,
    BannerType: newBannerType.value,
    Timestamp: newPullDate.value.getTime()
  };
  localPulls.unshift(newPull);
  arcanistNames.unshift(newArcanistName.value);
  bannerTypes.unshift(newBannerType.value);
  localPullDates.unshift(newPullDate.value);
  newArcanistName.value = '';
  newBannerType.value = '';
  newPullDate.value = new Date();
};

const savePulls = () => {
  const filteredIndices = localPulls
    .map((pull, index) =>
      pull.ArcanistName && pull.BannerType && !isNaN(pull.Timestamp) ? index : -1
    )
    .filter((index) => index !== -1);

  const pullsToSave: IPull[] = filteredIndices.map((index) => {
    const pull = localPulls[index];
    const selectedArcanist = arcanists.find((a) => a.Name === pull.ArcanistName);
    let rarity = pull.Rarity;
    if (selectedArcanist) {
      rarity = selectedArcanist.Rarity;
    }

    return {
      ArcanistName: pull.ArcanistName,
      Rarity: rarity,
      BannerType: pull.BannerType,
      Timestamp: localPullDates[index].getTime()
    };
  });

  pullsRecordStore.updatePullsRecord(pullsToSave);
  setTimeout(() => window.location.reload());
};

const reload = () => {
  window.location.reload();
};

const format = (date) => {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();

  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
</script>

<template>
  <div class="flex justify-center space-x-5 pb-4">
    <button class="blue-button" @click="addPull">{{ $t('add-pull') }}</button>
    <button class="green-button" @click="savePulls">{{ $t('save') }}</button>
    <button class="red-button" @click="reload">{{ $t('cancel') }}</button>
  </div>
  <div v-if="props.pulls.length > 0" class="flex flex-col overflow-x-auto hidden-scrollbar">
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
        <tr
          v-for="(pull, index) in paginatedPulls"
          :key="`${pull.Timestamp}-${pull.ArcanistName}-${
            index + (currentPage - 1) * itemsPerPage
          }`"
          :class="{
            'text-orange-300': pull.Rarity === 6,
            'text-yellow-100': pull.Rarity === 5,
            'text-purple-400': pull.Rarity === 4,
            'text-sky-200': pull.Rarity === 3,
            'text-green-200': pull.Rarity === 2
          }">
          <td class="text-center whitespace-nowrap px-2">{{ pull.PullNumber }}</td>
          <td class="flex items-center gap-x-3 whitespace-nowrap px-2">
            <ArcanistIcon
              v-if="arcanists.find((a) => a.Name === pull.ArcanistName)"
              :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) as IArcanist" />
            <SpecialIcon v-else :name="pull.ArcanistName" />

            <div class="relative w-36">
              <select
                class="select select-sm select-bordered w-full"
                v-model="arcanistNames[index + (currentPage - 1) * itemsPerPage]"
                @change="
                  pull.ArcanistName = arcanistNames[index + (currentPage - 1) * itemsPerPage]
                ">
                <option v-for="(arcanist, i) in arcanists" :key="i" :value="arcanist.Name">
                  {{ arcanist.Name }}
                </option>
              </select>
            </div>
          </td>
          <td class="text-center whitespace-nowrap px-2">
            <div class="relative">
              <select
                class="select select-sm select-bordered w-56 pl-3 pr-8"
                v-model="bannerTypes[index + (currentPage - 1) * itemsPerPage]">
                <option v-for="(banner, i) in bannerList" :key="i" :value="banner">
                  {{ banner }}
                </option>
              </select>
            </div>
          </td>
          <td class="text-center whitespace-nowrap w-56 px-2">
            <VueDatePicker
              v-model="localPullDates[index + (currentPage - 1) * itemsPerPage]"
              enable-seconds
              :format="format"
              :is-24="true" />
          </td>
          <td class="text-center whitespace-nowrap px-2">
            <button
              class="btn btn-sm btn-circle btn-ghost"
              @click="
                localPulls.splice(index + (currentPage - 1) * itemsPerPage, 1);
                localPullDates.splice(index + (currentPage - 1) * itemsPerPage, 1);
              ">
              ✕
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex justify-center items-center mt-4 space-x-2">
      <button class="btn btn-sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
        Prev
      </button>
      <template v-for="(page, idx) in getPagination()" :key="`page-${page}-${idx}`">
        <span v-if="page === '...'" class="px-2">...</span>
        <button
          v-else
          class="btn btn-sm"
          :class="{ 'btn-active': page === currentPage }"
          @click="typeof page === 'number' && goToPage(page)">
          {{ page }}
        </button>
      </template>
      <button
        class="btn btn-sm"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)">
        Next
      </button>
      <span class="ml-4">Jump to page:</span>
      <input
        type="number"
        min="1"
        :max="totalPages"
        :value="currentPage"
        @change="jumpToPage"
        class="input input-sm w-16 ml-2" />
    </div>
  </div>
</template>

<style scoped>
.custom-input {
  @apply input input-sm input-ghost input-bordered hover:border hover:border-white;
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
