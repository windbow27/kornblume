<script setup lang="ts">
import { ref, Ref } from 'vue'
import { useDataStore } from '@/stores/dataStore';
import Tesseract, { createWorker } from 'tesseract.js';
import ArcanistIcon from '../components/arcanist/ArcanistIcon.vue';

const fileInput = ref(null)
const text = ref('')
const arcanists = useDataStore().arcanists;
const pulls = ref<{ ArcanistName: string; Rarity: number; DateAndTime: string }[]>([]);

const triggerFileInput = () => {
    // Trigger the file input programmatically
    (fileInput as Ref<HTMLElement | null>).value?.click()
}

type clickHandler = (payload: Event) => void | undefined;
const ocr: clickHandler = (payload: Event): void => {
    const fileList: FileList | null = (payload.target as HTMLInputElement).files;
    if (fileList) {
        (async (): Promise<void> => {
            const worker: Tesseract.Worker = await createWorker('eng');
            for (let i: number = 0; i < fileList.length; i++) {
                const file: File = fileList[i];
                if (file) {
                    const ret: Tesseract.RecognizeResult = await worker.recognize(file);
                    text.value = ret.data.text;
                    console.log(text.value);
                }
            }
            await worker.terminate();

            // Assuming arcanists is an array of objects with a Name property
            const arcanistNames = arcanists.map(a => a.Name).join('|');

            const pattern: RegExp = new RegExp(`(?<ArcanistName>${arcanistNames})(\\((?<Rarity>\\d+)\\))?(?<BannerGroup>.*?)(?<Date>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})`);

            // Extract information from each line
            text.value.trim().split('\n').forEach((line) => {
                const match = line.match(pattern);
                if (match) {
                    const arcanistName: string = match.groups?.ArcanistName.trim() || '';
                    const arcanist = arcanists.find(a => a.Name === arcanistName);
                    const rarity: number = arcanist ? arcanist.Rarity : 0;
                    const bannerGroup: string = match.groups?.BannerGroup.trim() || '';
                    const dateTime: Date = new Date(match.groups?.Date || '');
                    const formattedDate: string = dateTime.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const formattedTime: string = dateTime.toLocaleTimeString('en-GB', {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    const formattedDateTime: string = `${formattedDate} ${formattedTime}`;

                    // Create an object for each pull
                    const pull = {
                        ArcanistName: arcanistName,
                        Rarity: rarity,
                        BannerGroup: bannerGroup,
                        DateAndTime: formattedDateTime
                    };

                    // Add the pull to the array
                    pulls.value.push(pull);
                }
            });

            // Log the resulting array of pulls
            console.log(pulls.value);
        })();
    }
}
</script>

<template>
    <div class="responsive-spacer">
        <h2 class="text-2xl text-white font-bold mb-4 lg:mb-6">Summon Tracker</h2>
        <input type="file" ref="fileInput" @change="ocr" accept=".jpg" class="ml-4" style="display: none;" multiple />
        <button @click="triggerFileInput"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2">
            OCR Import
        </button>
        <p class=" text-white font-bold text-xl text-center">Summon Summary</p>
        <div class="flex flex-col text-white p-4 gap-2 max-w-xs mx-auto">
            <div class="flex justify-between">
                <div class="text">Total Summons:</div>
                <div class="number">{{ pulls.length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">6 <i class="fa-solid fa-star text-orange-300"></i> Summons:</div>
                <div class="number">{{ pulls.filter(p => p.Rarity === 6).length }}</div>
            </div>
            <div class="flex justify-between">
                <div class="text">5 <i class="fa-solid fa-star text-yellow-100"></i> Summons:</div>
                <div class="number">{{ pulls.filter(p => p.Rarity === 5).length }}</div>
            </div>
            <div v-if="pulls.filter(p => p.Rarity === 6).length > 0" class="flex justify-between">
                <div class="text">AVG 6 <i class="fa-solid fa-star text-orange-300"></i> Pity:</div>
                <div class="number">{{ Math.floor(pulls.length / pulls.filter(p => p.Rarity === 6).length) }}</div>
            </div>
            <div v-else class="flex justify-between">
                <div class="text">AVG 6 <i class="fa-solid fa-star text-orange-300"></i> Pity:</div>
                <div class="number">0</div>
            </div>
            <div v-if="pulls.filter(p => p.Rarity === 5).length > 0" class="flex justify-between">
                <div class="text">AVG 5 <i class="fa-solid fa-star text-yellow-100"></i> Pity:</div>
                <div class="number">{{ Math.floor(pulls.length / pulls.filter(p => p.Rarity === 5).length) }}</div>
            </div>
            <div v-else class="flex justify-between">
                <div class="text">AVG 5 <i class="fa-solid fa-star text-yellow-100"></i> Pity:</div>
                <div class="number">0</div>
            </div>
        </div>

        <div
            class="w-full items-center custom-gradient-gray-blue rounded border border-blue-900 justify-center px-4 pt-4 pb-2">
            <div class="text text-center pb-4">Recent 6 <i class="fa-solid fa-star text-orange-300"></i> Summons</div>
            <div class="flex justify-center space-x-3">
                <!-- Fix the key later -->
                <div v-for="pull in pulls.filter(p => p.Rarity === 6).slice(0, 5)"
                    :key="`${pull.DateAndTime}-${pull.ArcanistName}`">
                    <ArcanistIcon :arcanist="arcanists.find(a => a.Name === pull.ArcanistName)" />
                </div>
            </div>
        </div>

        <!-- Summon History -->
        <div>
            <div class="text text-center text-xl pb-4 pt-10">Summon History</div>
            <div v-for="(pull, index) in pulls" :key="`${pull.DateAndTime}-${pull.ArcanistName}-${index}`"
                class="grid grid-cols-3 justify-between items-center p-2 border-b border-gray-200 max-w-lg m-auto">
                <div class="flex items-center">
                    <ArcanistIcon :arcanist="arcanists.find(a => a.Name === pull.ArcanistName)" />
                    <div class="ml-2" :class="{
                        'text-orange-300': pull.Rarity === 6,
                        'text-yellow-100': pull.Rarity === 5,
                        'text-purple-400': pull.Rarity === 4,
                        'text-sky-200': pull.Rarity === 3,
                        'text-green-200': pull.Rarity === 2
                    }">{{ pull.ArcanistName }}</div>
                </div>
                <div :class="{
                    'text-orange-300': pull.Rarity === 6,
                    'text-yellow-100': pull.Rarity === 5,
                    'text-purple-400': pull.Rarity === 4,
                    'text-sky-200': pull.Rarity === 3,
                    'text-green-200': pull.Rarity === 2
                }">{{ pull.Rarity }} <i class="fa-solid fa-star"></i></div>
                <div class="text-white">{{ pull.DateAndTime }}</div>
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
</style>
