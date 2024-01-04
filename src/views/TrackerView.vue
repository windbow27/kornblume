<script setup lang="ts">
import { ref, computed, Ref, watchEffect, onMounted, watch } from 'vue'
import { GreyAlgorithm, Image } from 'image-js';
import { useDataStore } from '@/stores/dataStore';
import { IPull, usePullsRecordStore } from '../stores/pullsRecordStore'
import Tesseract, { createWorker } from 'tesseract.js';
import Fuse from 'fuse.js';
import cannyEdgeDetector from 'canny-edge-detector';
import TrackerBoard from '../components/tracker/TrackerBoard.vue';

const fileInput = ref(null);
const isImporting = ref(false);
const currentFileIndex = ref(0);
const totalFiles = ref(0);
const text = ref('');
const arcanists = useDataStore().arcanists;
const isError = ref(false);
const wrongTimestamps = ref<number[]>([]);
const selectedBannerType = ref('Limited');
const pulls = ref<{ ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[]>([]);

const bannerList: string = [
    // limited
    'One Gram of Curiosity',
    'Clang of Sword & Armor',
    'Pop Is Everything',
    'Whisper of the Woods',
    'Thus Spoke the Border Collie',
    'Swinging Freely',
    'The Fairies Shining at Night',
    'Where the Star Alighted',
    'The Changeling Awaits',
    'The Ever-flowing',
    'Midnight Movie Party',
    // standard
    'Amongst the Lake',
    // thread
    'Invitation From the Water'
].join('|');

const bannerRateUp: string[] = [
    'Sotheby',
    'A Knight',
    'Melania',
    'Druvis',
    'Pickles',
    'Regulus',
    'Tooth Fairy',
    'Voyager',
    'Changeling',
    'Eternity',
    'An-an Lee'
]

const specialNames = [
    'The Golden Thread III',
    'The Golden Thread II',
    'The Golden Thread I'
]

const triggerFileInput = () => {
    // Trigger the file input programmatically
    (fileInput as Ref<HTMLElement | null>).value?.click()
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
    const winAttempts = limitedPulls.value.filter(pull => {
        const bannerIndex = bannerList.split('|').indexOf(pull.BannerType);
        const rateUpArcanist = bannerRateUp[bannerIndex];
        // console.log(bannerIndex, rateUpArcanist, pull.ArcanistName)
        return pull.ArcanistName === rateUpArcanist && pull.Rarity === 6;
    }).length;

    const totalAttempts = limitedPulls.value.filter(pull => pull.Rarity === 6).length;
    return Math.round(winAttempts / totalAttempts * 100);
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

type cropOptions = {x: number, y: number, width:number, height: number};
function getCropOptions (image: Image): cropOptions {
    const edge: Image = cannyEdgeDetector(image);
    const x_half: number = ~~((image.width - 1) / 2);
    const y_half: number = ~~((image.height - 1) / 2);
    const pixels: number[][] = edge.getPixelsArray();

    /* search for bottom of border, indicates corner y coordinate */
    let bottomRightY: number = 0;
    for (let i: number = image.height - 1; i > y_half; i--) {
        for (let j: number = x_half; j < x_half + (x_half / 2); j++) {
            if (pixels[j + image.width * i][0] === 255) {
                bottomRightY = i;
                break;
            }
        }
        if (bottomRightY > 0) break;
    }

    /* search for right side of border, indicates corner x coordinate */
    let bottomRightX: number = 0;
    for (let i: number = image.width - 1; i > x_half; i--) {
        for (let j: number = y_half; j < y_half + (y_half / 2); j++) {
            if (pixels[i + image.width * j][0] === 255) {
                bottomRightX = i;
                break;
            }
        }
        if (bottomRightX > 0) break;
    }

    /* original measurements needed to construct ratios */
    const og_width: number = 2408;
    const og_height: number = 1080;
    const imageX_scale: number = image.width / og_width;
    const imageY_scale: number = image.height / og_height;

    const og_bottomRightX: number = 2069;
    const og_bottomRightY: number = 977;
    const og_topLeftX: number = 775;
    const og_topLeftY: number = 240;

    const target_width: number = og_bottomRightX - og_topLeftX;
    const target_height: number = og_bottomRightY - og_topLeftY;
    const targetX_scale: number = bottomRightX / og_bottomRightX;
    const targetY_scale: number = bottomRightY / og_bottomRightY;

    return {
        x: og_topLeftX * imageX_scale,
        y: og_topLeftY * imageY_scale,
        width: target_width * targetX_scale,
        height: target_height * targetY_scale
    };
}

async function preprocessImage (file: File) {
    const imageData = await Image.load(await file.arrayBuffer());
    const blurred = imageData.blurFilter({ radius: 1 });
    const grey = blurred.grey({
        algorithm: 'lightness' as GreyAlgorithm
    });
    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];
    // Apply sharpening filter
    const sharpened = grey.convolution(kernel);
    const gaussian = sharpened.gaussianFilter({ radius: 1 });

    const options: cropOptions = getCropOptions(gaussian);
    const cropped: Image = gaussian.crop(options);
    return cropped.getCanvas();
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

    const fuseSearchList = arcanists.map((arcanist) => arcanist.Name === 'Зима' ? '3uma' : arcanist.Name);
    const fuse: Fuse<string> = new Fuse(fuseSearchList);
    specialNames.forEach(name => fuse.add(name));

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
                    const modifiedImage: HTMLCanvasElement = await preprocessImage(file);
                    const ret: Tesseract.RecognizeResult = await worker.recognize(modifiedImage);
                    text.value = ret.data.text;
                    console.log(text.value);
                    // (document.getElementById('testing') as HTMLImageElement).src = URL.createObjectURL(modifiedFile);

                    const arcanistNameGroup = /(?<ArcanistName>^\w+\.?(?:\s\w+\.?)*)/;
                    const parenGroup = /(?:\(?.*\)?)?\s+/;
                    const bannerGroup = String.raw`(?<BannerType>${bannerList})\s+`;
                    const dateGroup = /(?<Date>\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}:\d{2})/;

                    const pattern = new RegExp(arcanistNameGroup.source + parenGroup.source + bannerGroup + dateGroup.source, 'i');
                    const currentPulls: { ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[] = [];
                    const currentPullsMapping = {}

                    // Extract information from each line
                    text.value.trim().split('\n').forEach((line) => {
                        const match = line.match(pattern);
                        if (!match && line.length !== 0 && !line.match(String.raw`(?:<\s*)?(\d+)\s*\/\s*(\d+)(?:\s*>)?`)) { console.log(line); }
                        if (match) {
                            const arcanistName: string = match.groups?.ArcanistName.trim() || '';
                            const fuseResult = fuse.search(arcanistName);
                            if (fuseResult.length === 0) { console.log(`could not match fuzzy string ${arcanistName}`); return; }
                            const isGoldenThread: boolean = fuseResult[0].refIndex - arcanists.length + 1 > 0
                            const timestamp: number = new Date((match.groups?.Date || '').replace(/(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/, '$1 $2')).getTime();

                            // Create an object for each pull
                            const pull: IPull = {
                                ArcanistName: isGoldenThread ? fuseSearchList[fuseResult[0].refIndex] : arcanists[fuseResult[0].refIndex].Name,
                                Rarity: isGoldenThread ? 6 : arcanists[fuseResult[0].refIndex].Rarity,
                                BannerType: match.groups?.BannerType.trim() || '',
                                Timestamp: timestamp
                            };
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
            {{ $t('summon-tracker') }} <span class="text-info text-sm">{{ $t('please-read-tutorial') }}</span>
        </h2>
        <div class="flex justify-between">
            <div class="space-x-3">
                <input type="file" ref="fileInput" @change="ocr" accept="image/*" class="ml-4" style="display: none;"
                    multiple />
                <button @click="triggerFileInput" :disabled="isImporting"
                    class="bg-success hover:bg-green-600 text-white/90 font-bold py-2 px-4 rounded ml-2">
                    {{ $t('ocr-import') }} </button>

                <button class="btn btn-ghost custom-gradient-button btn-sm text-white" onclick="tutorial.showModal()">{{
                    $t('tutorial') }}</button>

                <button onclick="resetTracker.showModal()" class="btn btn-ghost custom-gradient-button btn-sm text-white">{{
                    $t('reset') }}</button>
            </div>

            <dialog id="tutorial" class="modal">
                <div class="modal-box custom-gradient-gray-blue custom-border hidden-scrollbar">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <h3 class="font-bold text-lg text-info">{{ $t('tutorial') }}</h3>
                    <p class="py-4 text-white">{{ $t('video-demonstration-tutorial') }} <a
                            href="https://youtu.be/CNsZ4rGWtyY" target="_blank" class="text-blue-500 hover:text-blue-700">{{
                                $t('summon-tracker-demo') }}</a></p>
                    <p class=" text-white">1. {{ $t('take-screenshots-of-your-summon-history') }}</p>
                    <p class=" text-white">2.
                        <i18n-t
                            keypath="upload-the-screenshots-to-the-summon-tracker-you-could-upload-multiple-images-at-once">
                            <template #highlight>
                                <span class="text-error">{{ $t('multiple-images') }}</span>
                            </template>
                        </i18n-t>
                    </p>
                    <p class=" text-white">3. {{
                        $t('the-summon-tracker-will-automatically-extract-display-and-save-the-information-from-the-screenshots')
                    }}</p>
                    <p class=" text-white">4. {{ $t('it-is-advised-to-save-your-screenshots-for-future-usages') }}</p>
                    <h3 class="font-bold text-lg pt-4 text-info">{{ $t('limitations') }}</h3>
                    <p class="text-white">•
                        <i18n-t
                            keypath="ocr-import-only-works-with-english-text-consider-changing-your-language-into-english-to-screenshot">
                            <template #highlight>
                                <span class="text-error">{{ $t('english-text') }}</span>
                            </template>
                        </i18n-t>
                    </p>
                    <p class="text-white">•
                        <i18n-t keypath="images-must-be-clear-or-the-summon-tracker-may-fail-to-read">
                            <template #highlight>
                                <span class="text-error">{{ $t('must-be-clear') }}</span>
                            </template>
                        </i18n-t>
                    </p>
                    <p class="text-white">•
                        <i18n-t
                            keypath='if-images-take-too-long-to-process-or-fail-to-read-5-arcanists-consider-screenshotting-clearer-images'>
                            <template #highlight1>
                                <span class="text-error">{{ $t('take-too-long') }}</span>
                            </template>
                            <template #highlight2>
                                <span class="text-error">{{ $t('fail-to-read') }}</span>
                            </template>
                            <template #star>
                                <i class="fa-solid fa-star text-yellow-100"></i>
                            </template>
                        </i18n-t>
                    </p>
                    <p class="text-white">•
                        <i18n-t keypath='this-is-an-example-of-a-good-image'>
                            <template #highlight>
                                <a href="https://i.imgur.com/NgspD1g.png" target="_blank"
                                    class="text-blue-500 hover:text-blue-700">{{ $t('image') }}</a>
                            </template>
                        </i18n-t>
                    </p>
                    <h3 class="font-bold text-lg pt-4 text-info">{{ $t('bug-reports') }}</h3>
                    <p class="text-white">•
                        <i18n-t
                            keypath='if-you-encouter-a-bug-open-your-f12-console-send-the-text-through-bug-reports-or-directly-to-windbow'>
                            <template #discord>@windbow</template>
                        </i18n-t>
                    </p>

                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <dialog id="resetTracker" class="modal">
                <div class="modal-box custom-gradient-gray-blue flex flex-col justify-center items-center">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <p class="pb-4 text-white text-center">{{
                        $t('once-you-delete-your-summon-tracker-data-there-is-no-going-back') }}
                    </p>
                    <p class="pb-4 text-white text-center">{{ $t('please-be-certain') }}</p>
                    <button @click="resetTracker" class="btn btn-error text-black font-bold py-2 px-4 rounded ml-2">
                        {{ $t('reset-tracker') }} </button>
                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>

        <div class="p-3">
            <i v-show="isImporting" class="text-white text-2xl text-center fa-solid fa-spinner fa-spin-pulse"></i>
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

        <div class="flex justify-center space-x-5 pb-5">
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
</style>
