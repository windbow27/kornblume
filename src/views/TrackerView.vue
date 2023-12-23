<script setup lang="ts">
import { ref, computed, Ref, watchEffect, onMounted } from 'vue'
import { useDataStore } from '@/stores/dataStore';
import { Image } from 'image-js';
import Tesseract, { createWorker } from 'tesseract.js';
import ArcanistIcon from '../components/arcanist/ArcanistIcon.vue';
import TrackerArcanistIcon from '../components/tracker/TrackerArcanistIcon.vue';
import { usePullsRecordStore } from '../stores/pullsRecordStore'

const fileInput = ref(null)
const isImporting = ref(false);
const text = ref('')
const arcanists = useDataStore().arcanists;
const pulls = ref<{ ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[]>([]);

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

    const grey = blurred.grey();

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
    uma: 'Зима',
    aliEnT: 'aliEn T',
    Druvis: 'Druvis III'
}

type clickHandler = (payload: Event) => void | undefined;
const ocr: clickHandler = (payload: Event): void => {
    const fileList: FileList | null = (payload.target as HTMLInputElement).files;
    if (fileList) {
        isImporting.value = true;
        (async (): Promise<void> => {
            const worker: Tesseract.Worker = await createWorker('eng');
            for (let i: number = 0; i < fileList.length; i++) {
                const file: File = fileList[i];
                if (file) {
                    const canvas: Tesseract.ImageLike = await preprocessImage(file);
                    const ret: Tesseract.RecognizeResult = await worker.recognize(canvas);
                    console.log(ret.data.text);
                    text.value = ret.data.text;

                    const arcanistNames = arcanists.map(a => a.Name);
                    const arcanistNamesRegex = [...arcanistNames, ...Object.keys(ocrCorrectionMap)].join('|')

                    const pattern: RegExp = new RegExp(`(?<ArcanistName>${arcanistNamesRegex})\\s*(?:\\(.*?\\))?(?<BannerType>.*?)(?<Date>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})`, 'i');
                    const currentPulls: { ArcanistName: string; Rarity: number; BannerType: string; Timestamp: number }[] = [];

                    // Extract information from each line
                    text.value.trim().split('\n').forEach((line) => {
                        const match = line.match(pattern);
                        if (match) {
                            let arcanistName: string = match.groups?.ArcanistName.trim() || '';
                            if (ocrCorrectionMap[arcanistName]) {
                                arcanistName = ocrCorrectionMap[arcanistName]
                            }
                            const arcanist = arcanists.find(a => a.Name.toLowerCase() === arcanistName.toLowerCase());
                            const rarity: number = arcanist ? arcanist.Rarity : 0;
                            const bannerType: string = match.groups?.BannerType.trim() || '';
                            const timestamp: number = new Date(match.groups?.Date || '').getTime();

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
                        }
                    });

                    // console.log(currentPulls);

                    const isSubset = currentPulls.every(currentPull =>
                        pulls.value.some(pull => isEqualPull(pull, currentPull))
                    );
                    // console.log(isSubset);

                    if (!isSubset) {
                        // If currentPulls is not a subset of pulls, add all currentPulls to pulls
                        pulls.value.push(...currentPulls);
                    }
                }
            }
            await worker.terminate();
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
        pull1.Timestamp === pull2.Timestamp &&
        pull1.Rarity === pull2.Rarity;
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

</script>

<template>
    <div class="responsive-spacer">

        <h2 class="text-2xl text-white font-bold mb-4 lg:mb-6">
            Summon Tracker <span class="text-sm text-info opacity-90">Beta. Remember to read Tutorial.</span>
        </h2>
        <div class="space-x-3">
            <input type="file" ref="fileInput" @change="ocr" accept="image/*" class="ml-4" style="display: none;"
                multiple />
            <button @click="triggerFileInput" :disabled="isImporting"
                class="bg-success hover:bg-green-600 text-black font-bold py-2 px-4 rounded ml-2">
                OCR Import
            </button>

            <button class="btn btn-info btn-sm" onclick="tutorial.showModal()">Tutorial</button>
            <dialog id="tutorial" class="modal">
                <div class="modal-box custom-gradient-gray-blue border border-blue-800 -translate-x-3">
                    <form method="dialog">
                        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-white">✕</button>
                    </form>
                    <h3 class="font-bold text-lg text-info">Tutorial</h3>
                    <p class="py-4 text-white">Video demonstration/ tutorial: <a href="https://youtu.be/CNsZ4rGWtyY"
                            target="_blank" class="text-blue-500 hover:text-blue-700">Summon Tracker Demo</a></p>
                    <p class=" text-white">1. Take screenshots of your summon history.</p>
                    <p class=" text-white">2. Upload the screenshots to the Summon Tracker (You could upload <span
                            class="text-error">multiple images</span> at once).</p>
                    <p class=" text-white">3. The Summon Tracker will automatically extract, display and save the
                        information from the screenshots.</p>
                    <p class=" text-white">4. It is advised to save your screenshots for future usages.</p>
                    <h3 class="font-bold text-lg pt-4 text-info">Limitations</h3>
                    <p class="text-white">1. Images <span class="text-error">must be clear</span> or the Summon Tracker
                        may fail to read.</p>
                    <p class=" text-white">2. Summon Tracker is not yet tested on mobile devices.</p>
                    <h3 class="font-bold text-lg pt-4 text-info">Bug Reports</h3>
                    <p class="text-white">• Summon Tracker is still in Beta. Bugs are expected. If you encouter one, open
                        your F12 ‣ Console,
                        send the text through Bug Reports or directly to @windbow. </p>

                </div>
                <form method="dialog" class="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            <i v-show="isImporting" class="text-white text-2xl text-center fa-solid fa-spinner fa-spin-pulse"></i>
            <span v-show="isImporting" class="text-white text-base"> Processing... Please wait...</span>
        </div>

        <p class=" text-white font-bold text-xl text-center pt-4">Summon Summary</p>
        <div class="flex flex-col text-white p-4 gap-2 max-w-sm mx-auto">
            <div class="flex justify-between">
                <div class="text">Total Summons</div>
                <div class="number">{{ indexedPulls.length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">6 <i class="fa-solid fa-star text-orange-300"></i> Summons</div>
                <div class="number">{{ indexedPulls.filter(p => p.Rarity === 6).length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">5 <i class="fa-solid fa-star text-yellow-100"></i> Summons</div>
                <div class="number">{{ indexedPulls.filter(p => p.Rarity === 5).length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text"> 6 <i class="fa-solid fa-star text-orange-300"></i> Average</div>
                <div class="number">
                    {{ indexedPulls.filter(p => p.Rarity === 6).length > 0 ? Math.floor(indexedPulls.length /
                        indexedPulls.filter(p => p.Rarity === 6).length) : 0 }}
                </div>
            </div>
            <div class="flex justify-between">
                <div class="text"> 5 <i class="fa-solid fa-star text-yellow-100"></i> Average</div>
                <div class="number">
                    {{ indexedPulls.filter(p => p.Rarity === 5).length > 0 ? Math.floor(indexedPulls.length /
                        indexedPulls.filter(p => p.Rarity === 5).length) : 0 }}
                </div>
            </div>
            <div class="flex justify-between">
                <div class="text">Current 6 <i class="fa-solid fa-star text-orange-300"></i> Pity</div>
                <div class="number">{{ summonSinceLastSixStar }} / 70</div>
            </div>
        </div>

        <div
            class="w-full items-center custom-gradient-gray-blue rounded border border-blue-800 justify-center px-4 pt-4 pb-3">
            <div class="text text-center pb-4">Recent 6 <i class="fa-solid fa-star text-orange-300"></i> Summons</div>
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
        <div class="text text-center text-xl pb-4 pt-10">Summon History</div>

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
                        <ArcanistIcon :arcanist="arcanists.find(a => a.Name === pull.ArcanistName)" />
                        <div class="pullArcanistName ml-2" :class="{
                            'text-orange-300': pull.Rarity === 6,
                            'text-yellow-100': pull.Rarity === 5,
                            'text-purple-400': pull.Rarity === 4,
                            'text-sky-200': pull.Rarity === 3,
                            'text-green-200': pull.Rarity === 2
                        }">{{ pull.ArcanistName }}</div>
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
