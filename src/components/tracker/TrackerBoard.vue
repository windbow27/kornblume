<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import ArcanistIcon from '../arcanist/ArcanistIcon.vue';
import SpecialIcon from '../common/SpecialIcon.vue';
import TrackerArcanistIcon from './TrackerArcanistIcon.vue';
import TrackerSpecialIcon from './TrackerSpecialIcon.vue';

interface Pull {
    PullNumber: number;
    ArcanistName: string;
    Rarity: number;
    Timestamp: number;
}

const props = defineProps({
    pulls: {
        type: Array as () => Pull[],
        required: true
    },
    isError: {
        type: Boolean,
        required: true
    },
    wrongTimestamps: {
        type: Array as () => number[],
        required: true
    },
    text: {
        type: String,
        required: true
    },
    winrate: {
        type: Number,
        required: false
    }
});

const arcanists = useDataStore().arcanists;
const activeRarities = ref<number[]>([5, 6]);

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

const selectedRarities = (rarity: number) => {
    if (activeRarities.value.includes(rarity)) {
        activeRarities.value = activeRarities.value.filter(r => r !== rarity);
    } else {
        activeRarities.value.push(rarity);
    }
}

const filteredRarityPulls = computed(() => {
    // console.log(filteredRarityPulls.value);
    return props.pulls.filter(pull => activeRarities.value.includes(pull.Rarity));
});

const sixStarsPullsList = computed(() => {
    const sixStarPulls = (props.pulls)
        .filter(pull => pull.Rarity === 6)
        .sort((a, b) => a.PullNumber - b.PullNumber)
        .map(pull => pull.PullNumber);
    return sixStarPulls.map((pullNumber, index) => index === 0 ? pullNumber : pullNumber - sixStarPulls[index - 1]);
});

const summonSinceLastSixStar = computed(() => {
    const lastSixStarPull = props.pulls.find(pull => pull.Rarity === 6);
    if (lastSixStarPull) {
        return props.pulls.length - lastSixStarPull.PullNumber;
    } else {
        return props.pulls.length;
    }
});

defineExpose({
    formatDate
})

</script>

<template>
    <p class=" text-white font-bold text-xl text-center pt-4">{{ props.text }}</p>
    <div class="flex flex-col text-white p-4 gap-2 max-w-sm mx-auto">
        <div class="flex justify-between">
            <div class="text">{{ $t('total-summons') }}</div>
            <div class="number">{{ pulls.length }}</div>
        </div>
        <div class="flex justify-between">
            <div class="text">
                <i18n-t keypath='6-star-summons'>
                    <template #star>
                        <i class="fa-solid fa-star text-orange-300"></i>
                    </template>
                </i18n-t>
            </div>
            <div class="number">{{ pulls.filter(p => p.Rarity === 6).length }}</div>
        </div>
        <div class="flex justify-between">
            <div class="text">
                <i18n-t keypath='5-star-summons'>
                    <template #star>
                        <i class="fa-solid fa-star text-yellow-100"></i>
                    </template>
                </i18n-t>
            </div>
            <div class="number">{{ pulls.filter(p => p.Rarity === 5).length }}</div>
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
                {{ pulls.filter(p => p.Rarity === 6).length > 0 ? Math.floor(pulls.length /
                    pulls.filter(p => p.Rarity === 6).length) : 0 }}
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
                {{ pulls.filter(p => p.Rarity === 5).length > 0 ? Math.floor(pulls.length /
                    pulls.filter(p => p.Rarity === 5).length) : 0 }}
            </div>
        </div>
        <div v-if="props.text == $t('summary-limited')" class="flex justify-between">
            <div class="text">
                <i18n-t keypath='50-50-winrate'>
                </i18n-t>
            </div>
            <div class="number">
                {{ props.winrate ? props.winrate : 0 }} %
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

    <div class="w-full items-center custom-gradient-gray-blue rounded border border-blue-800 justify-center px-4 pt-4 pb-3">
        <div class="text text-center pb-4">
            <i18n-t keypath='recent-6-star-summons'>
                <template #star>
                    <i class="fa-solid fa-star text-orange-300"></i>
                </template>
            </i18n-t>
        </div>
        <div class="flex flex-wrap justify-center space-x-8">
            <!-- Fix the key later -->
            <div v-for="(pull, index) in pulls.filter(p => p.Rarity === 6)" :key="`${pull.Timestamp}-${pull.ArcanistName}`">
                <TrackerArcanistIcon v-if="arcanists.find(a => a.Name === pull.ArcanistName)" class="py-2"
                    :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) ?? {}"
                    :pity="sixStarsPullsList[sixStarsPullsList.length - 1 - index]" />
                <TrackerSpecialIcon v-else class="py-2" :name="pull.ArcanistName"
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
                    <ArcanistIcon v-if="arcanists.find(a => a.Name === pull.ArcanistName)"
                        :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) as Record<string, any>" />
                    <SpecialIcon v-else :name="pull.ArcanistName" />
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
