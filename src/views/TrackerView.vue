<script setup lang="ts">
import { ref, computed, Ref, watchEffect, onMounted, watch } from 'vue'
import { useDataStore } from '@/stores/dataStore';
import { IPull, usePullsRecordStore } from '../stores/pullsRecordStore'
import { bannerList, bannerRateUp, specialArcanists } from '@/utils/bannerData'
import { useChangelogsStore } from '@/stores/global';
import Tesseract, { createWorker } from 'tesseract.js';
import Fuse, { FuseResult } from 'fuse.js';
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
const pulls = ref<IPull[]>([]);
const changelogsStore = useChangelogsStore();
const tutorialButton = ref(null);

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

type cropOptions = { x: number, y: number, width: number, height: number };
function getCropOptions (context: CanvasRenderingContext2D | null, width: number, height: number): cropOptions {
    const imageData: ImageData | undefined = context?.getImageData(0, 0, width, height);
    if (!imageData) {
        console.log('failed to obtain image data (getCropOptions)');
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const pixels: Uint8ClampedArray = imageData?.data;
    if (!pixels) {
        console.log('failed to obtain pixel data (getCropOptions)');
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const x_half: number = ~~((width - 1) / 2);
    const y_half: number = ~~((height - 1) / 2);

    /* search for bottom of border, indicates corner y coordinate */
    let bottomRightY: number = 0;
    for (let i: number = height - 1; i > y_half; i--) {
        if (pixels[(x_half + width * i) * 4] === 255) {
            bottomRightY = i;
            break;
        }
    }

    /* search for right side of border, indicates corner x coordinate */
    let bottomRightX: number = 0;
    for (let i: number = width - 1; i > x_half; i--) {
        if (pixels[(i + width * y_half) * 4] === 255) {
            bottomRightX = i;
            break;
        }
    }
    /* original measurements needed to construct ratios */
    const og_width: number = 2400;
    const og_height: number = 1080;
    const og_topLeftX: number = 775;
    const og_topLeftY: number = 240;

    const imageX_scale: number = width / og_width;
    const imageY_scale: number = height / og_height;
    const target_width: number = bottomRightX - og_topLeftX * imageX_scale;
    const target_height: number = bottomRightY - og_topLeftY * imageY_scale;

    return {
        x: ~~(og_topLeftX * imageX_scale),
        y: ~~(og_topLeftY * imageY_scale),
        width: ~~target_width,
        height: ~~target_height
    };
}

function binarize (context: CanvasRenderingContext2D | null, width: number, height: number): ImageData {
    const imageData: ImageData | undefined = context?.getImageData(0, 0, width, height);
    if (!imageData) {
        console.log('failed to obtain image data (binarize)');
        return new ImageData(0, 0);
    }
    const pixels: Uint8ClampedArray = imageData?.data;
    if (!pixels) {
        console.log('failed to obtain pixel data (binarize)');
        return new ImageData(0, 0);
    }
    const level: number = 0.6;
    const thresh: number = Math.floor(level * 255);
    for (let i = 0; i < pixels.length; i += 4) {
        const r: number = pixels[i];
        const g: number = pixels[i + 1];
        const b: number = pixels[i + 2];
        const grey: number = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const val: number = grey >= thresh ? 255 : 0;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = val;
    }
    return imageData;
}

async function preprocessImage (file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        let modifiedFile: File;
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas: HTMLCanvasElement = document.createElement('canvas');
                const context: CanvasRenderingContext2D | null = canvas.getContext('2d', { willReadFrequently: true });
                if (!context) { reject(new Error('getContext failed (canvas, preprocessImage)')); }
                canvas.width = img.width;
                canvas.height = img.height;

                if (context) {
                    // context.filter = 'contrast(2) saturate(0)';
                    context.drawImage(img, 0, 0);
                }

                // debugging
                // const link = document.createElement('a');
                // link.download = 'image.png';
                // link.href = canvas.toDataURL();
                // link.click();

                const newData: ImageData = binarize(context, canvas.width, canvas.height);
                if (!newData) { reject(new Error('binarize failed (preprocessImage)')); }
                context?.putImageData(newData, 0, 0);

                const options: cropOptions = getCropOptions(context, canvas.width, canvas.height);
                const cropped_canvas: HTMLCanvasElement = document.createElement('canvas');
                const cropped_context: CanvasRenderingContext2D | null = cropped_canvas.getContext('2d');
                if (!cropped_context) { reject(new Error('getContext failed (cropped_canvas, preprocessImage)')); }

                cropped_canvas.width = options.width;
                cropped_canvas.height = options.height;
                cropped_context?.drawImage(canvas,
                    options.x, options.y, options.width, options.height, /* src */
                    0, 0, cropped_canvas.width, cropped_canvas.height /* dst */
                );

                cropped_canvas.toBlob((blob) => {
                    modifiedFile = new File([blob as Blob], file.name, { type: file.type });
                    resolve(modifiedFile);
                }, file.type);
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
}

function convertGoldenThreadString (goldenThread: string, value: 'digit' | 'romanNumeral'): string {
    const tempArray: string[] = goldenThread.split(' ');
    const numberPart: string = tempArray[tempArray.length - 1];
    if (value === 'digit') {
        return goldenThread.replace(numberPart, String(numberPart.length));
    } else if (value === 'romanNumeral') {
        return goldenThread.replace(numberPart, 'I'.repeat(parseInt(numberPart)));
    }
    console.log('error converting golden thread string');
    return '';
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
                    const modifiedImage: File = await preprocessImage(file);
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
            (tutorialButton.value as unknown as HTMLButtonElement).click();
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
        </h2>
        <div class="flex justify-between">
            <div class="flex flex-wrap space-x-3 gap-y-2 items-center">
                <input type="file" ref="fileInput" @change="ocr" accept="image/*" class="ml-4" style="display: none;"
                    multiple />
                <button id="import-button" @click="triggerFileInput" :disabled="isImporting"
                    class="bg-success hover:bg-green-600 text-white/90 font-bold py-2 px-4 rounded ml-2">
                    {{ $t('ocr-import') }} </button>

                <div class="space-x-3">
                    <button id="tutorial-button" ref="tutorialButton" class="btn btn-ghost custom-gradient-button btn-sm text-white"
                        onclick="tutorial.showModal()">{{
                            $t('tutorial') }}</button>

                    <button onclick="resetTracker.showModal()"
                        class="btn btn-ghost custom-gradient-button btn-sm text-white">{{
                            $t('reset') }}</button>
                </div>
            </div>

            <dialog id="tutorial" class="modal">
                <div class="modal-box custom-gradient-gray-blue custom-border relative h-2/3">
                    <div class="absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue rounded-2xl">
                        <form method="dialog">
                            <button class="btn btn-sm btn-circle btn-ghost absolute right-2.5 top-4 text-white">✕</button>
                        </form>
                        <h3 class="font-bold text-lg text-info p-2">{{ $t('tutorial') }}</h3>
                    </div>

                    <div class="text-white overflow-y-auto h-full pt-10">
                        <p class="py-4 text-white">{{ $t('video-demonstration-tutorial') }} <a
                                href="https://youtu.be/CNsZ4rGWtyY" target="_blank"
                                class="text-blue-500 hover:text-blue-700">{{
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
                        <p class=" text-white">
                            <i18n-t
                                keypath='if-you-encounter-a-bug-pinpoint-its-location-by-using-missing-information-timestamps'>
                                <template #missing>
                                    <span class="text-error">{{ $t('missing-information') }}</span>
                                </template>
                            </i18n-t>
                            <span class=" text-white ml-1">{{ $t('import-the-error-images-again') }}</span>
                        </p>
                        <p class="text-white">{{ $t('if-that-doesnt-work-recapture-the-images-and-import-them-again') }}</p>
                        <p class="text-white">
                            <i18n-t
                                keypath='if-the-error-persists-open-your-f12-console-send-the-text-and-images-through-bug-reports-or-directly-to-discord'>
                                <template #discord>@windbow</template>
                            </i18n-t>
                        </p>
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

        <div class="p-3 flex items-center ">
            <img v-show="isImporting" src="/images/items/common/vertin-wheel.apng" alt="Loading" class="w-12">
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
