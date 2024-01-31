<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore';
import { IPull, usePullsRecordStore } from '../stores/pullsRecordStore'
import { bannerList, bannerRateUp, specialArcanists } from '@/utils/bannerData'
import { useChangelogsStore } from '@/stores/global';
import { convertGoldenThreadString, preprocess, preprocess1, preprocess2 } from '@/utils/preprocess';
import Tesseract, { createWorker } from 'tesseract.js';
import Fuse, { FuseResult } from 'fuse.js';
import TrackerBoard from '../components/tracker/TrackerBoard.vue';
import TrackerTutorial from '@/components/tracker/TrackerTutorial.vue';

const fileInput = ref<HTMLElement>(null!);
const isImporting = ref(false);
const currentFileIndex = ref(0);
const totalFiles = ref(0);
const text = ref('');
const arcanists = useDataStore().arcanists;
const isError = ref(false);
const wrongTimestamps = ref<number[]>([]);
const selectedBannerType = ref('Limited');
const pulls = ref<IPull[]>([]);
const changelogsStore = useChangelogsStore();
const tutorialButton = ref<HTMLButtonElement>(null!);
const currentPreprocess = ref('Default');

const triggerFileInput = (version: string) => {
    // Trigger the file input programmatically
    // check the clicked button id and set the currentPreprocess
    currentPreprocess.value = version;
    fileInput.value.click();
}

const isEqualPull = (pull1, pull2) => {
    return pull1.ArcanistName === pull2.ArcanistName &&
        pull1.BannerType === pull2.BannerType &&
        pull1.Rarity === pull2.Rarity;
}

const isEqualPulls = (pulls1, pulls2) => {
    return JSON.stringify(pulls1) === JSON.stringify(pulls2);
}

const resetTracker = () => {
    usePullsRecordStore().reset()
    window.location.reload()
}

const sortedPulls = computed(() => {
    return pulls.value.slice().sort((a, b) => b.Timestamp - a.Timestamp);
});

const threadPulls = computed(() => {
    const filteredPulls = sortedPulls.value.filter(pull => pull.BannerType === 'Invitation From the Water');
    return filteredPulls.map((pull, index) => {
        return {
            PullNumber: filteredPulls.length - index,
            ArcanistName: pull.ArcanistName,
            Rarity: pull.Rarity,
            BannerType: pull.BannerType,
            Timestamp: pull.Timestamp
        }
    });
});

const standardPulls = computed(() => {
    const filteredPulls = sortedPulls.value.filter(pull => pull.BannerType === 'Amongst the Lake');
    return filteredPulls.map((pull, index) => {
        return {
            PullNumber: filteredPulls.length - index,
            ArcanistName: pull.ArcanistName,
            Rarity: pull.Rarity,
            BannerType: pull.BannerType,
            Timestamp: pull.Timestamp
        }
    });
});

const limitedPulls = computed(() => {
    const filteredPulls = sortedPulls.value.filter(pull => pull.BannerType !== 'Amongst the Lake' && pull.BannerType !== 'Invitation From the Water');
    return filteredPulls.map((pull, index) => {
        return {
            PullNumber: filteredPulls.length - index,
            ArcanistName: pull.ArcanistName,
            Rarity: pull.Rarity,
            BannerType: pull.BannerType,
            Timestamp: pull.Timestamp
        }
    });
});

const winrate = computed(() => {
    const totalRateUps = limitedPulls.value.filter(pull => {
        const bannerIndex = bannerList.indexOf(pull.BannerType);
        const rateUpArcanist = bannerRateUp[bannerIndex];
        return pull.ArcanistName === rateUpArcanist && pull.Rarity === 6;
    }).length;

    const totalSixStars = limitedPulls.value.filter(pull => pull.Rarity === 6).length;
    const loseAttempts = totalSixStars - totalRateUps;
    const winAttempts = totalSixStars - 2 * loseAttempts;
    return Math.max(0, Math.round(winAttempts / (winAttempts + loseAttempts) * 100));
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

async function preprocessImage (file: File, version: string): Promise<File> {
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
            prev[Timestamp][0].push(curr)
        } else {
            prev[Timestamp] = [[curr]]
        }
        return prev
    }, {});

    const bannerFuse: Fuse<string> = new Fuse(bannerList);

    const arcanistList = arcanists.map((arcanist) => arcanist.Name === 'Зима' ? '3uma' : arcanist.Name);
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
                    // console.log(text.value);
                    // (document.getElementById('testing') as HTMLImageElement).src = modifiedImage.toDataURL(); /* if modifiedImage is canvas */
                    // (document.getElementById('testing') as HTMLImageElement).src = URL.createObjectURL(modifiedImage); /* if modifiedImage is file */

                    const arcanistNameGroup: string = /^\W*(?<ArcanistName>\d*[A-Za-z.,]+(?:\s[A-Za-z.,1]+)*)/.source;
                    const parenGroup: string = /.*(?:\(?.*\)?)?.*/.source;
                    const bannerGroup: string = `(?<BannerType>${bannerList.join('|').replaceAll(/\s/g, '\\s?')}).*`;
                    const dateGroup: string = /(?<Date>\d{4}[-\s]?\d{2}[-\s]?\d{2}\s*\d{2}[:\s]?\d{2}[:\s]?\d{2})/.source;

                    const pattern = new RegExp(arcanistNameGroup + parenGroup + bannerGroup + dateGroup, 'i');
                    const currentPulls: { ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[] = [];
                    const currentPullsMapping = {}

                    // Extract information from each line
                    const excludeLineInfo = /(?:<\s*)?(\d+)\s*\/\s*(\d+)(?:\s*>)?|(Name\sType\sSummon\sTime)/;
                    text.value.trim().split('\n').forEach((line) => {
                        const match = line.match(pattern);
                        if (!match && line.length !== 0 && !line.match(excludeLineInfo)) { console.log(line); }
                        if (match) {
                            let arcanistName: string = match.groups?.ArcanistName.trim() || '';

                            /* change roman numeral to digit for better fuzzy string matching */
                            if (arcanistName.includes('Golden')) { arcanistName = convertGoldenThreadString(arcanistName, 'digit'); }

                            let fuseResult: FuseResult<string>[] = arcanistFuse.search(arcanistName, { limit: 1 });
                            if (fuseResult.length === 0) { console.log(`could not match fuzzy string ${arcanistName}`); return; }
                            const isGoldenThread: boolean = fuseResult[0].item.includes('The Golden Thread');

                            /* change digit back to roman numeral for proper display */
                            if (isGoldenThread) { fuseResult[0].item = convertGoldenThreadString(fuseResult[0].item, 'romanNumeral'); }
                            if (fuseResult[0].item === '3uma') { fuseResult[0].item = 'Зима'; }

                            // Create an object for each pull
                            const dateString: string = (match.groups?.Date || '').replace(/(\d{4})[-\s]?(\d{2})[-\s](\d{2})\s*(\d{2})[:\s]?(\d{2})[:\s]?(\d{2})/, '$1-$2-$3 $4:$5:$6');
                            const timestamp: number = new Date(dateString).getTime();
                            const pull: IPull = { ArcanistName: fuseResult[0].item, Rarity: 0, BannerType: '', Timestamp: timestamp };
                            pull.Rarity = isGoldenThread ? 6 : arcanists[fuseResult[0].refIndex].Rarity;

                            /* fuzzy match banner capture */
                            fuseResult = bannerFuse.search(match.groups?.BannerType.trim() || '', { limit: 1 });
                            pull.BannerType = fuseResult[0] ? bannerList[fuseResult[0].refIndex] : '';

                            currentPulls.push(pull);

                            if (currentPullsMapping[timestamp]) {
                                currentPullsMapping[timestamp].push(pull)
                            } else {
                                currentPullsMapping[timestamp] = [pull]
                            }
                        }
                    });

                    Object.keys(currentPullsMapping).forEach((ts) => {
                        const pullsArray = currentPullsMapping[ts]
                        if (!timestampMapping[ts]) {
                            timestampMapping[ts] = [pullsArray]
                        } else { // has repeated timestamp
                            const isExistComplete10Pulls = timestampMapping[ts].some((ary) => ary.length === 10)
                            if (!isExistComplete10Pulls) { // is not complete yet
                                if (
                                    isEqualPull(pullsArray[0], currentPulls[0]) &&
                                    isEqualPull(pullsArray[pullsArray.length - 1], currentPulls[pullsArray.length - 1])
                                ) {
                                    // assume this array is the second half of the 10-pulls
                                    timestampMapping[ts].push(pullsArray)
                                } else if (
                                    isEqualPull(pullsArray[pullsArray.length - 1], currentPulls[currentPulls.length - 1]) &&
                                    isEqualPull(pullsArray[0], currentPulls[currentPulls.length - pullsArray.length])
                                ) {
                                    // assume this array is the first half of the 10-pulls
                                    timestampMapping[ts].unshift(pullsArray)
                                }
                            }
                        }
                    })
                }
            }

            const flattenPullsArrayByTimestamp = {}
            Object.keys(timestampMapping).sort((a, b) => Number(b) - Number(a)).forEach(timestamp => {
                if (timestampMapping[timestamp].length === 1) {
                    flattenPullsArrayByTimestamp[timestamp] = timestampMapping[timestamp][0]
                } else if (timestampMapping[timestamp].length === 2) {
                    const firstHalf = timestampMapping[timestamp][0]
                    const secondHalf = timestampMapping[timestamp][1]
                    const fullLengh = firstHalf.length + secondHalf.length
                    if (!(isEqualPulls(firstHalf, secondHalf))) {
                        if (fullLengh <= 10) {
                            flattenPullsArrayByTimestamp[timestamp] = [...firstHalf, ...secondHalf]
                        } else { // has overlap
                            flattenPullsArrayByTimestamp[timestamp] = [...firstHalf.slice(0, 10 - fullLengh), ...secondHalf]
                        }
                    } else {
                        flattenPullsArrayByTimestamp[timestamp] = [...firstHalf]
                    }
                } else if (timestampMapping[timestamp].length > 2) { // screenshots from different times?
                    // idk, just take the top and bottom
                    const firstHalf = timestampMapping[timestamp][0]
                    const secondHalf = timestampMapping[timestamp][timestampMapping[timestamp].length - 1]
                    const fullLengh = firstHalf.length + secondHalf.length
                    if (!(isEqualPulls(firstHalf, secondHalf))) {
                        if (fullLengh <= 10) {
                            flattenPullsArrayByTimestamp[timestamp] = [...firstHalf, ...secondHalf]
                        } else { // has overlap
                            flattenPullsArrayByTimestamp[timestamp] = [...firstHalf.slice(0, 10 - fullLengh), ...secondHalf]
                        }
                    } else {
                        flattenPullsArrayByTimestamp[timestamp] = [...firstHalf]
                    }
                }
            })
            let result: IPull[] = []
            Object.keys(flattenPullsArrayByTimestamp).sort((a, b) => Number(b) - Number(a)).forEach((ts) => {
                result = [
                    ...result,
                    ...flattenPullsArrayByTimestamp[ts]
                ]
            })
            await worker.terminate();
            pulls.value = result;
            isImporting.value = false;
            // const endTime = performance.now();
            // console.log('time: ', endTime - startTime);
        })();
    }
}

onMounted(() => {
    if (usePullsRecordStore().data.length > 0) {
        pulls.value = [...usePullsRecordStore().data]
    }
    if (!changelogsStore.isOpenTutorial) {
        console.log(tutorialButton.value);
        if (tutorialButton.value) {
            tutorialButton.value.click();
        }
        changelogsStore.setIsOpenTutorial(true)
    }
})

watchEffect(() => {
    if (pulls.value.length > 0) {
        usePullsRecordStore().updatePullsRecord(pulls.value)
    }
});

</script>

<template>
    <!-- <img id="testing" src=""/> -->
    <div class="responsive-spacer">
        <h2 class="text-2xl text-white font-bold mb-4 lg:mb-6">
            {{ $t('summon-tracker') }}
            <span class="text-info text-sm">{{ $t('please-read-tutorial') }}</span>
            <div role="alert" class="alert alert-info custom-gradient-gray-blue text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    class="stroke-current shrink-0 w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm lg:text-base"> {{ $t('try-legacy') }} </span>
            </div>
        </h2>
        <div class="flex justify-between">
            <div class="flex flex-wrap space-x-2 sm:space-x-3 gap-y-2 items-center">
                <input type="file" ref="fileInput" @change="ocr" accept="image/*" class="ml-4" style="display: none;"
                    multiple />
                <button @click="triggerFileInput('Default')" :disabled="isImporting"
                    class="bg-gradient-to-br from-success to-green-600 focus:ring-2 focus:outline-none focus:ring-green-200 hover:bg-gradient-to-bl text-white/90 font-bold py-2 px-4 rounded ml-2">
                    {{ $t('ocr-import') }} </button>

                <div class="space-x-1.5 sm:space-x-2">
                    <button id="tutorial-button" ref="tutorialButton"
                        class="btn btn-ghost custom-gradient-button btn-sm text-white" onclick="tutorial.showModal()">{{
                            $t('tutorial') }}</button>
                    <button onclick="legacyButtons.showModal()"
                        class="btn btn-ghost custom-gradient-button btn-sm text-white">{{
                            $t('legacy') }}</button>
                    <button onclick="resetTracker.showModal()"
                        class="btn btn-ghost custom-gradient-button btn-sm text-white">{{
                            $t('reset') }}</button>
                </div>
            </div>

            <TrackerTutorial />

            <dialog id="legacyButtons" class="modal">
                <div class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="p-2 text-white text-center">{{
                        $t('legacy-notice') }}
                    </p>
                    <div class="flex gap-x-10 p-2">
                        <form method="dialog">
                            <div class="tooltip" data-tip="Stable. Works on all OS.">
                                <button @click="triggerFileInput('Version1')" :disabled="isImporting"
                                    class="bg-gradient-to-br from-success to-green-600 focus:ring-2 focus:outline-none focus:ring-green-200 hover:bg-gradient-to-bl text-white/90 font-bold py-2 px-4 rounded ml-2">
                                    Version 1 </button>
                            </div>
                        </form>
                        <form method="dialog">
                            <div class="tooltip" data-tip="Better. Doesn't support iOS.">
                                <button @click="triggerFileInput('Version2')" :disabled="isImporting"
                                    class="bg-gradient-to-br from-success to-green-600 focus:ring-2 focus:outline-none focus:ring-green-200 hover:bg-gradient-to-bl text-white/90 font-bold py-2 px-4 rounded ml-2">
                                    Version 2 </button>
                            </div>
                        </form>
                        <!-- <div class="tooltip" :data-tip="$t('exploshe')">
                        <button
                            class="btn btn-ghost bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-padding hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-purple-200 btn-sm text-white">
                            exploshe </button>
                    </div> -->
                    </div>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="resetTracker" class="modal">
                <div class="modal-box custom-border custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="p-2 text-white text-center">{{
                        $t('once-you-delete-your-summon-tracker-data-there-is-no-going-back') }}
                    </p>
                    <p class="pb-4 text-white text-center">{{ $t('please-be-certain') }}</p>
                    <button @click="resetTracker"
                        class="btn btn-error bg-gradient-to-br hover:bg-gradient-to-bl from-error to-red-500/90 text-black font-bold py-2 px-4 rounded ml-2">
                        {{ $t('reset-tracker') }} </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>

        <div class="p-3 flex items-center ">
            <a :href="'https://weibo.com/1851315674/N36YRc9zw?pagetype=viewer'"> <img v-show="isImporting"
                    src="/images/items/common/vertin-wheel.apng" alt="Loading" class="w-12"></a>
            <span v-show="isImporting" class="text-white text-base pl-1">
                <i18n-t keypath='processing-file-number-out-of-numbers-please-wait'>
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
            <button v-bind:class="{ 'border-button': selectedBannerType === 'Limited' }" class=' text-white py-1 px-3'
                @click="selectedBannerType = 'Limited'">{{ $t('limited') }}</button>
            <button v-bind:class="{ 'border-button': selectedBannerType === 'Standard' }" class=' text-white py-1 px-3'
                @click="selectedBannerType = 'Standard'">{{ $t('standard') }}</button>
            <button v-bind:class="{ 'border-button': selectedBannerType === 'Thread' }" class=' text-white py-1 px-3'
                @click="selectedBannerType = 'Thread'">{{ $t('thread') }}</button>
        </div>

        <TrackerBoard v-if="selectedBannerType === 'Limited'" :text="$t('summary-limited')" :pulls="limitedPulls"
            :isError="isError" :wrongTimestamps="wrongTimestamps" :winrate="winrate" />
        <TrackerBoard v-if="selectedBannerType === 'Standard'" :text="$t('summary-standard')" :pulls="standardPulls"
            :isError="isError" :wrongTimestamps="wrongTimestamps" />
        <TrackerBoard v-if="selectedBannerType === 'Thread'" :text="$t('summary-thread')" :pulls="threadPulls"
            :isError="isError" :wrongTimestamps="wrongTimestamps" />
    </div>
</template>

<style scoped>
.border-button {
    @apply border-2 border-info rounded-md
}

.modal-box {
    overflow-y: unset;
}
</style>
