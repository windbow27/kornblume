<script setup lang="ts">
import { ref, computed, Ref, watchEffect, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore';
import { GreyAlgorithm, Image } from 'image-js';
import Tesseract, { createWorker } from 'tesseract.js';
import ArcanistIcon from '../components/arcanist/ArcanistIcon.vue';
import TrackerArcanistIcon from '../components/tracker/TrackerArcanistIcon.vue';
import { IPull, usePullsRecordStore } from '../stores/pullsRecordStore'

const fileInput = ref(null)
const isImporting = ref(false);
const currentFileIndex = ref(0);
const totalFiles = ref(0);
const text = ref('')
const arcanists = useDataStore().arcanists;
const pulls = ref<{ ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[]>([]);
const isError = ref(false);
const wrongTimestamps = ref<number[]>([]);

const indexedPulls = computed(() => {
    const sortedPulls = pulls.value.slice().sort((a, b) => b.Timestamp - a.Timestamp);
    return sortedPulls.map((pull, index) => {
        return {
            PullNumber: sortedPulls.length - index,
            ArcanistName: pull.ArcanistName,
            Rarity: pull.Rarity,
            Timestamp: pull.Timestamp
        }
    });
});

watch(indexedPulls, (newVal) => {
    const timestampCounts = newVal.reduce((counts, pull) => {
        counts[pull.Timestamp] = (counts[pull.Timestamp] || 0) + 1;
        return counts;
    }, {});

    wrongTimestamps.value = Object.entries(timestampCounts)
        .filter(([, count]) => count !== 1 && count !== 10)
        .map(([timestamp]) => Number(timestamp));

    isError.value = wrongTimestamps.value.length > 0;
    // console.log(wrongTimestamps.value);
});

const sixStarsPullsList = computed(() => {
    const sixStarPulls = indexedPulls.value
        .filter(pull => pull.Rarity === 6)
        .sort((a, b) => a.PullNumber - b.PullNumber)
        .map(pull => pull.PullNumber);
    return sixStarPulls.map((pullNumber, index) => index === 0 ? pullNumber : pullNumber - sixStarPulls[index - 1]);
});

const summonSinceLastSixStar = computed(() => {
    const lastSixStarPull = indexedPulls.value.find(pull => pull.Rarity === 6);
    if (lastSixStarPull) {
        return indexedPulls.value.length - lastSixStarPull.PullNumber;
    } else {
        return indexedPulls.value.length;
    }
});

async function preprocessImage (file: File) {
    const imageData = await Image.load(await file.arrayBuffer());

    const blurred = imageData.blurFilter({ radius: 1 });

    const grey = blurred.grey({
        algorithm: 'average' as GreyAlgorithm
    });

    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];

    // Apply sharpening filter
    const sharpened = grey.convolution(kernel);

    const gaussian = sharpened.gaussianFilter({ radius: 1 });

    return gaussian.getCanvas();
}

const ocrCorrectionMap = {
    '3uma': 'Зима',
    '3lonney': 'Blonney',
    uma: 'Зима',
    aliEnT: 'aliEn T',
    Druvis: 'Druvis III',
    korn: 'Bkornblume',
    corn: 'Bkornblume',
    AKnight: 'A Knight',
    THT: 'TTT',
    fennant: 'Tennant',
    Blonnev: 'Blonney',
    Doc: 'Door'
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
    if (fileList) {
        isImporting.value = true;
        (async (): Promise<void> => {
            const worker: Tesseract.Worker = await createWorker('eng');
            for (let i: number = 0; i < fileList.length; i++) {
                const file: File = fileList[i];
                currentFileIndex.value = i + 1;
                totalFiles.value = fileList.length;
                if (file) {
                    const canvas: Tesseract.ImageLike = await preprocessImage(file);
                    const ret: Tesseract.RecognizeResult = await worker.recognize(canvas);
                    console.log(ret.data.text);
                    text.value = ret.data.text;

                    const arcanistNames = arcanists.map(a => a.Name);
                    const arcanistNamesRegex = [...arcanistNames, ...Object.keys(ocrCorrectionMap)].join('|')

                    const pattern: RegExp = new RegExp(`(?<ArcanistName>${arcanistNamesRegex})\\s*(?:\\(.*?\\))?(?<BannerType>.*?)(?<Date>\\d{4}-\\d{2}-\\d{2}\\s*\\d{2}:\\d{2}:\\d{2})`, 'i');
                    const currentPulls: { ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[] = [];
                    const currentPullsMapping = {}

                    // Extract information from each line
                    text.value.trim().split('\n').forEach((line) => {
                        const match = line.match(pattern);
                        if (match) {
                            // console.log(match);
                            let arcanistName: string = match.groups?.ArcanistName.trim() || '';
                            if (ocrCorrectionMap[arcanistName]) {
                                arcanistName = ocrCorrectionMap[arcanistName]
                            }
                            const arcanist = arcanists.find(a => a.Name.toLowerCase() === arcanistName.toLowerCase());
                            const rarity: number = arcanist ? arcanist.Rarity : 0;
                            const bannerType: string = match.groups?.BannerType.trim() || '';
                            const timestamp: number = new Date((match.groups?.Date || '').replace(/(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/, '$1 $2')).getTime();

                            // Create an object for each pull
                            const pull = {
                                ArcanistName: arcanist?.Name || '',
                                Rarity: rarity,
                                BannerType: bannerType,
                                Timestamp: timestamp
                            };
                            // console.log(pull);

                            currentPulls.push(pull);
                            // console.log(currentPulls);

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
        })();
    }
}

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

const formatDate = (timestamp: number): string => {
    const date: Date = new Date(timestamp);
    const formattedDate: string = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const formattedTime: string = date.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${formattedDate} ${formattedTime}`;
}

const activeRarities = ref<number[]>([5, 6]);

const selectedRarities = (rarity: number) => {
    if (activeRarities.value.includes(rarity)) {
        activeRarities.value = activeRarities.value.filter(r => r !== rarity);
    } else {
        activeRarities.value.push(rarity);
    }
}

const filteredRarityPulls = computed(() => {
    // console.log(filteredRarityPulls.value);
    return indexedPulls.value.filter(pull => activeRarities.value.includes(pull.Rarity));
});

defineExpose({
    formatDate
})

watchEffect(() => {
    if (pulls.value.length > 0) {
        usePullsRecordStore().updatePullsRecord(pulls.value)
    }
});

onMounted(() => {
    if (usePullsRecordStore().data.length > 0) {
        pulls.value = [...usePullsRecordStore().data]
    }
})

const resetTracker = () => {
    usePullsRecordStore().reset()
    window.location.reload()
}

</script>

<template>
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

        <p class=" text-white font-bold text-xl text-center pt-4">{{ $t('summon-summary') }}</p>
        <div class="flex flex-col text-white p-4 gap-2 max-w-sm mx-auto">
            <div class="flex justify-between">
                <div class="text">{{ $t('total-summons') }}</div>
                <div class="number">{{ indexedPulls.length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">
                    <i18n-t keypath='6-star-summons'>
                        <template #star>
                            <i class="fa-solid fa-star text-orange-300"></i>
                        </template>
                    </i18n-t>
                </div>
                <div class="number">{{ indexedPulls.filter(p => p.Rarity === 6).length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">
                    <i18n-t keypath='5-star-summons'>
                        <template #star>
                            <i class="fa-solid fa-star text-yellow-100"></i>
                        </template>
                    </i18n-t>
                </div>
                <div class="number">{{ indexedPulls.filter(p => p.Rarity === 5).length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">
                    <i18n-t keypath='6-star-average'>
                        <template #star>
                            <i class="fa-solid fa-star text-orange-300"></i>
                        </template>
                    </i18n-t>
                </div>
                <div class="number">
                    {{ indexedPulls.filter(p => p.Rarity === 6).length > 0 ? Math.floor(indexedPulls.length /
                        indexedPulls.filter(p => p.Rarity === 6).length) : 0 }}
                </div>
            </div>
            <div class="flex justify-between">
                <div class="text">
                    <i18n-t keypath='5-star-average'>
                        <template #star>
                            <i class="fa-solid fa-star text-yellow-100"></i>
                        </template>
                    </i18n-t>
                </div>
                <div class="number">
                    {{ indexedPulls.filter(p => p.Rarity === 5).length > 0 ? Math.floor(indexedPulls.length /
                        indexedPulls.filter(p => p.Rarity === 5).length) : 0 }}
                </div>
            </div>
            <div class="flex justify-between">
                <div class="text">
                    <i18n-t keypath='current-6-star-pity'>
                        <template #star>
                            <i class="fa-solid fa-star text-orange-300"></i>
                        </template>
                    </i18n-t>
                </div>
                <div class="number">{{ summonSinceLastSixStar }} / 70</div>
            </div>
            <div class="flex flex-col justify-between opacity-95" v-if="isError">
                <div class=" text-error text-sm">{{ $t('import-error') }}</div>
                <div class="text-error text-sm">
                    <i18n-t keypath='wrong-timestamps'>
                        <template #timestamps>
                            <span class="number text-sm">{{ wrongTimestamps.map(formatDate).join(', ') }}</span>
                        </template>
                    </i18n-t>
                </div>
            </div>
        </div>

        <div
            class="w-full items-center custom-gradient-gray-blue rounded border border-blue-800 justify-center px-4 pt-4 pb-3">
            <div class="text text-center pb-4">
                <i18n-t keypath='recent-6-star-summons'>
                    <template #star>
                        <i class="fa-solid fa-star text-orange-300"></i>
                    </template>
                </i18n-t>
            </div>
            <div class="flex flex-wrap justify-center space-x-8">
                <!-- Fix the key later -->
                <div v-for="(pull, index) in indexedPulls.filter(p => p.Rarity === 6)"
                    :key="`${pull.Timestamp}-${pull.ArcanistName}`">
                    <TrackerArcanistIcon class="py-2" :arcanist="arcanists.find(a => a.Name === pull.ArcanistName)"
                        :pity="sixStarsPullsList[sixStarsPullsList.length - 1 - index]" />
                </div>
            </div>
        </div>

        <!-- Summon History -->
        <div class="text text-center text-xl pb-4 pt-10">{{ $t('summon-history') }}</div>

        <!-- Rarity select -->
        <div class="flex justify-center space-x-2">
            <button v-for="i in [2, 3, 4, 5, 6]" :key="i" :class="{ 'border-2 border-info': activeRarities.includes(i) }"
                @click="selectedRarities(i)" class="p-2 rounded-md">
                <i class="fa-solid fa-star" :class="{
                    'text-orange-300': i === 6,
                    'text-yellow-100': i === 5,
                    'text-purple-400': i === 4,
                    'text-sky-200': i === 3,
                    'text-green-200': i === 2
                }"></i>
            </button>
        </div>

        <div class="max-w-lg m-auto">
            <div v-for="(pull, index) in filteredRarityPulls" :key="`${pull.Timestamp}-${pull.ArcanistName}-${index}`"
                class="grid grid-cols-4 sm:grid-cols-5 justify-between items-center p-2 border-b border-gray-200 space-x-5">
                <!-- Index, Image, Name -->
                <div class="col-span-1 sm:col-span-2 flex items-center space-x-5">
                    <div class="flex items-center space-x-5">
                        <div class="text-white">{{ pull.PullNumber }} </div>
                        <ArcanistIcon
                            :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) as Record<string, any>" />
                        <div class="pullArcanistName ml-2" :class="{
                            'text-orange-300': pull.Rarity === 6,
                            'text-yellow-100': pull.Rarity === 5,
                            'text-purple-400': pull.Rarity === 4,
                            'text-sky-200': pull.Rarity === 3,
                            'text-green-200': pull.Rarity === 2
                        }">{{ $t(pull.ArcanistName) }}</div>
                    </div>
                </div>
                <!-- Rarity -->
                <div class="text-center" :class="{
                    'text-orange-300': pull.Rarity === 6,
                    'text-yellow-100': pull.Rarity === 5,
                    'text-purple-400': pull.Rarity === 4,
                    'text-sky-200': pull.Rarity === 3,
                    'text-green-200': pull.Rarity === 2
                }">{{ pull.Rarity }} <i class="fa-solid fa-star"></i></div>
                <!-- Date -->
                <div class="col-span-2">
                    <div class="text-white"> {{ formatDate(pull.Timestamp) }}</div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.text {
    @apply text-white font-bold;
}

.number {
    @apply text-info font-bold;
}

.pullArcanistName {
    display: none;
}

@media screen and (min-width: 640px) {
    .pullArcanistName {
        display: block;
    }
}
</style>
