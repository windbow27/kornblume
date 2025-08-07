<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { IPull, usePullsRecordStore } from '@/stores/pullsRecordStore';
import { bannerList, specialArcanists } from '@/utils/bannerData';
import { useChangelogsStore } from '@/stores/global';
import {
  convertGoldenThreadString,
  preprocess,
  preprocess1,
  preprocess2
} from '@/composables/preprocess';
import { GApiSvc, syncDrive } from '@/composables/gApi';
import Tesseract, { createWorker } from 'tesseract.js';
import Fuse, { FuseResult } from 'fuse.js';
import TrackerBoard from '@/components/tracker/TrackerBoard.vue';
import TrackerTutorial from '@/components/tracker/TrackerTutorial.vue';

const fileInput = ref<HTMLElement>(null!);
const isImporting = ref(false);
const currentFileIndex = ref(0);
const totalFiles = ref(0);
const text = ref('');
const arcanists = useDataStore().arcanists;
const isError = ref(false);
const wrongTimestamps = ref<number[]>([]);
// const selectedBannerType = ref('Limited');
const selectedBannerType = ref('A Prophet Guided by Time');
const pulls = ref<IPull[]>([]);
const changelogsStore = useChangelogsStore();
const tutorialButton = ref<HTMLButtonElement>(null!);
const currentPreprocess = ref('Default');

const triggerFileInput = (version: string) => {
  // Trigger the file input programmatically
  // check the clicked button id and set the currentPreprocess
  currentPreprocess.value = version;
  fileInput.value.click();
};

const isEqualPull = (pull1, pull2) => {
  return (
    pull1.ArcanistName === pull2.ArcanistName &&
    pull1.BannerType === pull2.BannerType &&
    pull1.Rarity === pull2.Rarity
  );
};

const isEqualPulls = (pulls1, pulls2) => {
  return JSON.stringify(pulls1) === JSON.stringify(pulls2);
};

const resetTracker = () => {
  usePullsRecordStore().reset();
  window.location.reload();
};

const sortedPulls = computed(() => {
  return pulls.value.slice().sort((a, b) => b.Timestamp - a.Timestamp);
});

const allPulls = computed(() => {
  return sortedPulls.value.map((pull, index) => {
    return {
      PullNumber: sortedPulls.value.length - index,
      ArcanistName: pull.ArcanistName,
      Rarity: pull.Rarity,
      BannerType: pull.BannerType,
      Timestamp: pull.Timestamp
    };
  });
});

function createPullsByBannerType(bannerType) {
  return computed(() => {
    const filteredPulls = sortedPulls.value.filter((pull) => pull.BannerType === bannerType);
    return filteredPulls.map((pull, index) => {
      return {
        PullNumber: filteredPulls.length - index,
        ArcanistName: pull.ArcanistName,
        Rarity: pull.Rarity,
        BannerType: pull.BannerType,
        Timestamp: pull.Timestamp
      };
    });
  });
}

const standardPulls = createPullsByBannerType('Amongst the Lake');
const threadPulls = createPullsByBannerType('Invitation From the Water');
const abundancePulls = createPullsByBannerType('Abundance of the Water');
const yearningPulls = createPullsByBannerType('Yearning of the Water');
const revelationPulls = createPullsByBannerType('Revelation of the Water');
const promisePulls = createPullsByBannerType('Promise of the Water');
const boonPulls = createPullsByBannerType('Boon of the Water');
const goldenSpindlePulls = createPullsByBannerType('Golden Spindle');
const ripplesPulls = createPullsByBannerType('Ripples on the Water');

const jiuNiangziPulls = createPullsByBannerType('Till the Last Drop');
const lucyPulls = createPullsByBannerType('Thoughts in Cylinder');
const anjoNalaPulls = createPullsByBannerType('Longing for Innocence');
const liangPulls = createPullsByBannerType('Moonbeam Guardian');
const ezioPulls = createPullsByBannerType('A Prophet Guided by Time');

const limitedPulls = computed(() => {
  const filteredPulls = sortedPulls.value.filter(
    (pull) =>
      pull.BannerType !== 'Amongst the Lake' &&
      pull.BannerType !== 'Invitation From the Water' &&
      pull.BannerType !== 'Abundance of the Water' &&
      pull.BannerType !== 'Yearning of the Water' &&
      pull.BannerType !== 'Till the Last Drop' &&
      pull.BannerType !== 'Revelation of the Water' &&
      pull.BannerType !== 'Thoughts in Cylinder' &&
      pull.BannerType !== 'Promise of the Water' &&
      pull.BannerType !== 'Longing for Innocence' &&
      pull.BannerType !== 'Moonbeam Guardian' &&
      pull.BannerType !== 'Boon of the Water' &&
      pull.BannerType !== 'Golden Spindle' &&
      pull.BannerType !== 'Ripples on the Water' &&
      pull.BannerType !== 'A Prophet Guided by Time'
  );
  return filteredPulls.map((pull, index) => {
    return {
      PullNumber: filteredPulls.length - index,
      ArcanistName: pull.ArcanistName,
      Rarity: pull.Rarity,
      BannerType: pull.BannerType,
      Timestamp: pull.Timestamp
    };
  });
});

watch(sortedPulls, (newVal) => {
  const timestampCounts = newVal.reduce((counts, pull) => {
    counts[pull.Timestamp] = (counts[pull.Timestamp] || 0) + 1;
    return counts;
  }, {});

  wrongTimestamps.value = Object.entries(timestampCounts)
    .filter(([, count]) => count !== 1 && count !== 10)
    .map(([timestamp]) => Number(timestamp));

  isError.value = wrongTimestamps.value.length > 0;
});

async function preprocessImage(file: File, version: string): Promise<File> {
  switch (version) {
    case 'Default':
      return preprocess(file);
    case 'Version1':
      return preprocess1(file);
    case 'Version2':
      return preprocess2(file);
    default:
      throw new Error('Unknown button clicked');
  }
}

type clickHandler = (payload: Event) => void | undefined;
const ocr: clickHandler = (payload: Event): void => {
  const fileList: FileList | null = (payload.target as HTMLInputElement).files;
  const timestampMapping = pulls.value.reduce((prev, curr) => {
    const { Timestamp } = curr;
    if (prev[Timestamp] && prev[Timestamp][0]) {
      prev[Timestamp][0].push(curr);
    } else {
      prev[Timestamp] = [[curr]];
    }
    return prev;
  }, {});

  const bannerFuse: Fuse<string> = new Fuse(bannerList);

  const arcanistList = arcanists.map((arcanist) =>
    arcanist.Name === 'Зима' ? '3uma' : arcanist.Name
  );
  const arcanistFuse: Fuse<string> = new Fuse(arcanistList);
  specialArcanists.forEach((arcanist) => arcanistFuse.add(arcanist));

  if (fileList) {
    isImporting.value = true;
    (async (): Promise<void> => {
      // const startTime = performance.now();
      const worker: Tesseract.Worker = await createWorker('eng');
      for (let i: number = 0; i < fileList.length; i++) {
        const file: File = fileList[i];
        currentFileIndex.value = i + 1;
        totalFiles.value = fileList.length;
        if (file) {
          const modifiedImage: File = await preprocessImage(file, currentPreprocess.value);
          const ret: Tesseract.RecognizeResult = await worker.recognize(modifiedImage);
          text.value = ret.data.text;
          console.log(text.value);
          // (document.getElementById('testing') as HTMLImageElement).src = modifiedImage.toDataURL(); /* if modifiedImage is canvas */
          // (document.getElementById('testing') as HTMLImageElement).src = URL.createObjectURL(modifiedImage); /* if modifiedImage is file */

          const arcanistNameGroup: string =
            /^\W*(?<ArcanistName>\d*[376A-Za-z.,-]+(?:\s[A-Za-z.,1-]+)*)/.source;
          const parenGroup: string = /.*(?:\(?.*\)?)?.*/.source;
          const bannerGroup = `(?<BannerType>${bannerList
            .map(
              (banner) =>
                banner
                  .replace(/Fledgling.*?First Flight/, 'Fledgling[\\s\\S]*?First\\s*Flight') // Handle Fledgling ... First Flight variations
                  .replace(/Clash.*?Slash/, 'Clash[\\s\\S]*?Slash')
                  // Handle Clash n Slash variations
                  .replace(
                    /The Mirror.*?Lonely Watcher/,
                    `The\\s*Mirror[\\s\\S]*?Lonely\\s*Watcher` // Handle The Mirror ... Lonely Watcher variations
                  ) // Handle The Mirror's ... Lonely Watcher variations
                  .replace(/\s/g, '\\s*') // Handle spaces
                  .replace(/['’"]/g, '[\'"’\\s]*') // Handle single/double quotes
            )
            .join('|')}).*`;
          // console.log(bannerGroup);
          const dateGroup: string =
            /(?<Date>\d{4}[-\s]?\d{2}[-\s]?\d{2}\s*\d{2}[:\s]?\d{2}[:\s]?\d{2})/.source;

          const pattern = new RegExp(arcanistNameGroup + parenGroup + bannerGroup + dateGroup, 'i');
          const currentPulls: {
            ArcanistName: string;
            Rarity: number;
            BannerType: string;
            Timestamp: number;
          }[] = [];
          const currentPullsMapping = {};

          // Extract information from each line
          const excludeLineInfo = /(?:<\s*)?(\d+)\s*\/\s*(\d+)(?:\s*>)?|(Name\sType\sSummon\sTime)/;
          text.value
            .trim()
            .split('\n')
            .forEach((line) => {
              const match = line.match(pattern);
              if (!match && line.length !== 0 && !line.match(excludeLineInfo)) {
                console.log('Error reading: ', line);
              }
              if (match) {
                let arcanistName: string = match.groups?.ArcanistName.trim() || '';
                // console.log(arcanistName);

                /* change roman numeral to digit for better fuzzy string matching */
                if (arcanistName.includes('Golden')) {
                  arcanistName = convertGoldenThreadString(arcanistName, 'digit');
                }

                let fuseResult: FuseResult<string>[] = arcanistFuse.search(arcanistName, {
                  limit: 1
                });
                if (fuseResult.length === 0) {
                  console.log(`could not match fuzzy string ${arcanistName}`);
                  return;
                }
                const isGoldenThread: boolean = fuseResult[0].item.includes('The Golden Thread');

                /* change digit back to roman numeral for proper display */
                if (isGoldenThread) {
                  fuseResult[0].item = convertGoldenThreadString(
                    fuseResult[0].item,
                    'romanNumeral'
                  );
                }
                if (fuseResult[0].item === '3uma') {
                  fuseResult[0].item = 'Зима';
                }

                // Create an object for each pull
                const dateString: string = (match.groups?.Date || '').replace(
                  /(\d{4})[-\s]?(\d{2})[-\s](\d{2})\s*(\d{2})[:\s]?(\d{2})[:\s]?(\d{2})/,
                  '$1-$2-$3 $4:$5:$6'
                );
                const timestamp: number = new Date(dateString).getTime();
                const pull: IPull = {
                  ArcanistName: fuseResult[0].item,
                  Rarity: 0,
                  BannerType: '',
                  Timestamp: timestamp
                };
                pull.Rarity = isGoldenThread ? 6 : arcanists[fuseResult[0].refIndex].Rarity;

                /* fuzzy match banner capture */
                fuseResult = bannerFuse.search(match.groups?.BannerType.trim() || '', { limit: 1 });
                pull.BannerType = fuseResult[0] ? bannerList[fuseResult[0].refIndex] : '';

                currentPulls.push(pull);

                if (currentPullsMapping[timestamp]) {
                  currentPullsMapping[timestamp].push(pull);
                } else {
                  currentPullsMapping[timestamp] = [pull];
                }
              }
            });

          Object.keys(currentPullsMapping).forEach((ts) => {
            const pullsArray = currentPullsMapping[ts];
            if (!timestampMapping[ts]) {
              timestampMapping[ts] = [pullsArray];
            } else {
              // has repeated timestamp
              const isExistComplete10Pulls = timestampMapping[ts].some((ary) => ary.length === 10);
              if (!isExistComplete10Pulls) {
                // is not complete yet
                if (
                  isEqualPull(pullsArray[0], currentPulls[0]) &&
                  isEqualPull(
                    pullsArray[pullsArray.length - 1],
                    currentPulls[pullsArray.length - 1]
                  )
                ) {
                  // assume this array is the second half of the 10-pulls
                  timestampMapping[ts].push(pullsArray);
                } else if (
                  isEqualPull(
                    pullsArray[pullsArray.length - 1],
                    currentPulls[currentPulls.length - 1]
                  ) &&
                  isEqualPull(pullsArray[0], currentPulls[currentPulls.length - pullsArray.length])
                ) {
                  // assume this array is the first half of the 10-pulls
                  timestampMapping[ts].unshift(pullsArray);
                }
              }
            }
          });
        }
      }

      const flattenPullsArrayByTimestamp = {};
      Object.keys(timestampMapping)
        .sort((a, b) => Number(b) - Number(a))
        .forEach((timestamp) => {
          if (timestampMapping[timestamp].length === 1) {
            flattenPullsArrayByTimestamp[timestamp] = timestampMapping[timestamp][0];
          } else if (timestampMapping[timestamp].length === 2) {
            const firstHalf = timestampMapping[timestamp][0];
            const secondHalf = timestampMapping[timestamp][1];
            const fullLengh = firstHalf.length + secondHalf.length;
            if (!isEqualPulls(firstHalf, secondHalf)) {
              if (fullLengh <= 10) {
                flattenPullsArrayByTimestamp[timestamp] = [...firstHalf, ...secondHalf];
              } else {
                // has overlap
                flattenPullsArrayByTimestamp[timestamp] = [
                  ...firstHalf.slice(0, 10 - fullLengh),
                  ...secondHalf
                ];
              }
            } else {
              flattenPullsArrayByTimestamp[timestamp] = [...firstHalf];
            }
          } else if (timestampMapping[timestamp].length > 2) {
            // screenshots from different times?
            // idk, just take the top and bottom
            const firstHalf = timestampMapping[timestamp][0];
            const secondHalf = timestampMapping[timestamp][timestampMapping[timestamp].length - 1];
            const fullLengh = firstHalf.length + secondHalf.length;
            if (!isEqualPulls(firstHalf, secondHalf)) {
              if (fullLengh <= 10) {
                flattenPullsArrayByTimestamp[timestamp] = [...firstHalf, ...secondHalf];
              } else {
                // has overlap
                flattenPullsArrayByTimestamp[timestamp] = [
                  ...firstHalf.slice(0, 10 - fullLengh),
                  ...secondHalf
                ];
              }
            } else {
              flattenPullsArrayByTimestamp[timestamp] = [...firstHalf];
            }
          }
        });
      let result: IPull[] = [];
      Object.keys(flattenPullsArrayByTimestamp)
        .sort((a, b) => Number(b) - Number(a))
        .forEach((ts) => {
          result = [...result, ...flattenPullsArrayByTimestamp[ts]];
        });
      await worker.terminate();
      pulls.value = result;
      isImporting.value = false;
      if (pulls.value.length > 0) {
        usePullsRecordStore().updatePullsRecord(pulls.value);
      }
      syncDrive();
    })();
  }
};

onMounted(() => {
  if (usePullsRecordStore().data.length > 0) {
    pulls.value = [...usePullsRecordStore().data];
  }
  if (!changelogsStore.isOpenTutorial) {
    if (tutorialButton.value) {
      tutorialButton.value.click();
    }
    changelogsStore.setIsOpenTutorial(true);
  }
});

GApiSvc.init().then(async () => {
  syncDrive();
});

const selectBannerType = (bannerType: string) => {
  selectedBannerType.value = bannerType;
};
</script>

<template>
  <div class="container">
    <div class="flex pb-4">
      <h2 class="text-2xl text-white font-bold">
        {{ $t('summon-tracker') }}
        <span class="text-info text-sm">{{ $t('please-read-tutorial') }}</span>
      </h2>
    </div>

    <!-- Notification -->
    <!-- <div class="pb-4">
            <div role="alert" class="alert alert-info custom-gradient-gray-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <p class="text-sm lg:text-base"><span class="">The Tracker is really bad at recognizing J. If you encounter errors, please
                        use the Tracker Editor. Thank you.</span></p>
                </div>
            </div>
        </div> -->

    <div
      class="flex flex-wrap space-x-2 sm:space-x-3 gap-y-3 items-center justify-center sm:justify-start">
      <input
        type="file"
        ref="fileInput"
        @change="ocr"
        accept="image/*"
        class="ml-4"
        style="display: none"
        multiple />
      <button
        @click="triggerFileInput('Default')"
        :disabled="isImporting"
        class="bg-gradient-to-br from-success to-green-600 focus:ring-2 focus:outline-none focus:ring-green-200 hover:bg-gradient-to-bl text-white/90 font-bold py-2 px-4 rounded ml-2">
        {{ $t('ocr-import') }}
      </button>

      <div class="space-x-1.5 sm:space-x-2">
        <button
          id="tutorial-button"
          ref="tutorialButton"
          class="btn btn-ghost custom-gradient-button btn-sm text-white"
          onclick="tutorial.showModal()">
          <i class="fa-solid fa-book"></i> {{ $t('tutorial') }}
        </button>
        <button
          onclick="legacyButtons.showModal()"
          class="btn btn-ghost custom-gradient-button btn-sm text-white">
          <i class="fa-solid fa-lightbulb"></i> {{ $t('legacy') }}
        </button>
        <button
          onclick="resetTracker.showModal()"
          class="btn btn-ghost custom-gradient-button btn-sm text-white">
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ $t('reset') }}
        </button>
      </div>
    </div>

    <TrackerTutorial />

    <dialog id="legacyButtons" class="modal">
      <div
        class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">
            ✕
          </button>
        </form>
        <p class="p-2 text-white text-center">
          {{ $t('legacy-notice') }}
        </p>
        <div class="flex flex-wrap gap-x-10 gap-y-6 p-2 justify-center items-center">
          <form method="dialog">
            <div class="tooltip" data-tip="Stable. Works on all OS.">
              <button
                @click="triggerFileInput('Version1')"
                :disabled="isImporting"
                class="bg-gradient-to-br from-success to-green-600 focus:ring-2 focus:outline-none focus:ring-green-200 hover:bg-gradient-to-bl text-white/90 font-bold py-2 px-4 rounded">
                Version 1
              </button>
            </div>
          </form>
          <form method="dialog">
            <div class="tooltip" data-tip="Better. Doesn't support iOS.">
              <button
                @click="triggerFileInput('Version2')"
                :disabled="isImporting"
                class="bg-gradient-to-br from-success to-green-600 focus:ring-2 focus:outline-none focus:ring-green-200 hover:bg-gradient-to-bl text-white/90 font-bold py-2 px-4 rounded">
                Version 2
              </button>
            </div>
          </form>
          <div class="tooltip" :data-tip="$t('exploshe')">
            <a
              href="https://timekeeper.top"
              target="_blank"
              class="bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-padding hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-purple-200 py-2 px-4 rounded text-white">
              timekeeper
            </a>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <dialog id="resetTracker" class="modal">
      <div
        class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">
            ✕
          </button>
        </form>
        <p class="p-2 text-white text-center">
          {{ $t('once-you-delete-your-summon-tracker-data-there-is-no-going-back') }}
        </p>
        <p class="pb-4 text-white text-center">
          {{ $t('please-be-certain') }}
        </p>
        <button @click="resetTracker" class="red-button">
          {{ $t('reset-tracker') }}
        </button>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <div class="p-3 flex items-center">
      <a :href="'https://weibo.com/1851315674/N36YRc9zw?pagetype=viewer'">
        <img
          v-show="isImporting"
          src="/images/items/common/vertin-wheel.apng"
          alt="Loading"
          class="w-12"
      /></a>
      <span v-show="isImporting" class="text-white text-base pl-1">
        <i18n-t keypath="processing-file-number-out-of-numbers-please-wait">
          <template #current>
            <span class="text-info">{{ currentFileIndex }}</span>
          </template>
          <template #total>
            <span class="text-info">{{ totalFiles }}</span>
          </template>
        </i18n-t>
      </span>
    </div>

    <div class="flex flex-wrap justify-center space-x-5 pb-5 gap-y-5">
      <!-- Limited Placeholder -->
      <button
        v-bind:class="{
          'border-button': selectedBannerType === 'A Prophet Guided by Time'
        }"
        class="text-white py-1 px-3 hover:bg-info rounded-md"
        @click="selectBannerType('A Prophet Guided by Time')">
        {{ $t('ezio-auditore') }}
      </button>

      <button
        v-bind:class="{
          'border-button': selectedBannerType === 'Limited'
        }"
        class="text-white py-1 px-3 hover:bg-info rounded-md"
        @click="selectBannerType('Limited')">
        {{ $t('limited') }}
      </button>
      <button
        v-bind:class="{
          'border-button': selectedBannerType === 'Standard'
        }"
        class="text-white py-1 px-3 hover:bg-info rounded-md"
        @click="selectBannerType('Standard')">
        {{ $t('standard') }}
      </button>
      <div class="dropdown dropdown-bottom dropdown-end">
        <div tabindex="0" role="button">
          <button
            v-bind:class="{
              'border-button':
                selectedBannerType === 'Invitation From the Water' ||
                selectedBannerType === 'Abundance of the Water' ||
                selectedBannerType === 'Yearning of the Water' ||
                selectedBannerType === 'Revelation of the Water' ||
                selectedBannerType === 'Promise of the Water' ||
                selectedBannerType === 'Boon of the Water' ||
                selectedBannerType === 'Golden Spindle' ||
                selectedBannerType === 'Ripples on the Water' ||
                selectedBannerType === 'Till the Last Drop' ||
                selectedBannerType === 'Thoughts in Cylinder' ||
                selectedBannerType === 'Longing for Innocence' ||
                selectedBannerType === 'Moonbeam Guardian' ||
                selectedBannerType === 'A Prophet Guided by Time'
            }"
            class="text-white py-1 px-3 hover:bg-info rounded-md">
            {{ $t('special') }}
          </button>
        </div>
        <!-- Special banners -->
        <ul
          tabindex="0"
          class="dropdown-content z-[1] shadow bg-blue-950 custom-border-light rounded-box space-y-2 p-4 mt-2">
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Invitation From the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Invitation From the Water')">
              {{ $t('thread') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Abundance of the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Abundance of the Water')">
              {{ $t('abundance') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Yearning of the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Yearning of the Water')">
              {{ $t('yearning') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Revelation of the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Revelation of the Water')">
              {{ $t('revelation') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Promise of the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Promise of the Water')">
              {{ $t('promise') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Boon of the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Boon of the Water')">
              {{ $t('boon') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Golden Spindle'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Golden Spindle')">
              {{ $t('golden-spindle') }}
            </button>
          </li>
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Ripples on the Water'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Ripples on the Water')">
              {{ $t('ripples') }}
            </button>
          </li>

          <!-- Line separator -->
          <hr class="border-t border-gray-300 m-2" />

          <!-- Jiu Niangzi banner -->
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Till the Last Drop'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Till the Last Drop')">
              {{ $t('jiu-niangzi') }}
            </button>
          </li>
          <!-- Lucy banner -->
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Thoughts in Cylinder'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Thoughts in Cylinder')">
              {{ $t('lucy') }}
            </button>
          </li>
          <!-- Anjo Nala banner -->
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Longing for Innocence'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Longing for Innocence')">
              {{ $t('anjo-nala') }}
            </button>
          </li>
          <!-- Liang Yue banner -->
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'Moonbeam Guardian'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('Moonbeam Guardian')">
              {{ $t('liang-yue') }}
            </button>
          </li>
          <!-- Ezio banner -->
          <li>
            <button
              v-bind:class="{
                'border-button': selectedBannerType === 'A Prophet Guided by Time'
              }"
              class="text-white py-1 px-3 hover:bg-info rounded-md"
              @click="selectBannerType('A Prophet Guided by Time')">
              {{ $t('ezio-auditore') }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <TrackerBoard
      v-if="selectedBannerType === 'Limited'"
      :text="$t('summary-limited')"
      :pulls="limitedPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Standard'"
      :text="$t('summary-standard')"
      :pulls="standardPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Invitation From the Water'"
      :text="$t('summary-thread')"
      :pulls="threadPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Abundance of the Water'"
      :text="$t('summary-abundance')"
      :pulls="abundancePulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Yearning of the Water'"
      :text="$t('summary-yearning')"
      :pulls="yearningPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Revelation of the Water'"
      :text="$t('summary-revelation')"
      :pulls="revelationPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Promise of the Water'"
      :text="$t('summary-promise')"
      :pulls="promisePulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Boon of the Water'"
      :text="$t('summary-boon')"
      :pulls="boonPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Golden Spindle'"
      :text="$t('summary-golden-spindle')"
      :pulls="goldenSpindlePulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Ripples on the Water'"
      :text="$t('summary-ripples')"
      :pulls="ripplesPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />

    <TrackerBoard
      v-if="selectedBannerType === 'Till the Last Drop'"
      :text="$t('jiu-niangzi')"
      :pulls="jiuNiangziPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Thoughts in Cylinder'"
      :text="$t('lucy')"
      :pulls="lucyPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Longing for Innocence'"
      :text="$t('anjo-nala')"
      :pulls="anjoNalaPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'Moonbeam Guardian'"
      :text="$t('liang-yue')"
      :pulls="liangPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
    <TrackerBoard
      v-if="selectedBannerType === 'A Prophet Guided by Time'"
      :text="$t('ezio-auditore')"
      :pulls="ezioPulls"
      :allPulls="allPulls"
      :isError="isError"
      :wrongTimestamps="wrongTimestamps" />
  </div>
</template>

<style scoped></style>
