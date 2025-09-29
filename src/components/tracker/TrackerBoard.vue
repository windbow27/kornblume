<script setup lang="ts">
import { computed, ref, defineAsyncComponent, watch } from 'vue';
import { useDataStore } from '@/stores/dataStore';
import { bannerList, bannerRateUp } from '@/utils/bannerData'
import { useI18n } from 'vue-i18n';
import { IArcanist } from '@/types';
import { formatDate } from '@/composables/editor';
import { IPullNumber } from '@/stores/pullsRecordStore';
import ArcanistIcon from '../arcanist/ArcanistIcon.vue';
import SpecialIcon from '../common/SpecialIcon.vue';
import TrackerArcanistIcon from './TrackerArcanistIcon.vue';
import TrackerSpecialIcon from './TrackerSpecialIcon.vue';

const TrackerEditor = defineAsyncComponent(() =>
    import('./TrackerEditor.vue')
)

const props = defineProps({
    pulls: {
        type: Array as () => IPullNumber[],
        required: true
    },
    allPulls: {
        type: Array as () => IPullNumber[],
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
    bannerType: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
});

const arcanists = useDataStore().arcanists;
const activeRarities = ref<number[]>([6]);
const isEditing = ref(false);
const showSpinner = ref(false);
const { t } = useI18n();

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

const sixStarsPullsIndex = computed(() => {
    const sixStarPulls = (props.pulls)
        .filter(pull => pull.Rarity === 6)
        .sort((a, b) => a.PullNumber - b.PullNumber)
        .map(pull => pull.PullNumber);

    const indexBasedOnPullNumber = {};
    sixStarPulls.forEach((pullNumber, index) => {
        indexBasedOnPullNumber[pullNumber] = index === 0 ? pullNumber : pullNumber - sixStarPulls[index - 1];
    });

    return indexBasedOnPullNumber;
});

const summonSinceLastSixStar = computed(() => {
    const lastSixStarPull = props.pulls.find(pull => pull.Rarity === 6);
    if (lastSixStarPull) {
        return props.pulls.length - lastSixStarPull.PullNumber;
    } else {
        return props.pulls.length;
    }
});

const indicators = computed(() => {
    const result: Record<number, string> = {};
    let nextPullShouldBeG = false;

    if (props.text === t('summary-limited')) {
        const reversedPulls = [...props.pulls].reverse();

        for (const pull of reversedPulls) {
            if (pull.Rarity === 6) {
                if (nextPullShouldBeG) {
                    result[pull.PullNumber] = 'G';
                    nextPullShouldBeG = false;
                } else {
                    const bannerIndex = bannerList.indexOf(pull.BannerType);
                    if (bannerIndex !== -1 && bannerRateUp[bannerIndex].includes(pull.ArcanistName)) {
                        result[pull.PullNumber] = 'W';
                    } else {
                        result[pull.PullNumber] = 'L';
                        nextPullShouldBeG = true;
                    }
                }
            }
        }
    }
    return result;
});

const winrate = computed(() => {
    const indicatorsArray = Object.values(indicators.value);
    const winCount = indicatorsArray.filter(i => i === 'W').length;
    const loseCount = indicatorsArray.filter(i => i === 'L').length;
    return Math.round((winCount / (winCount + loseCount)) * 100);
});

watch(isEditing, (newVal) => {
    if (newVal) {
        showSpinner.value = true;
        setTimeout(() => {
            showSpinner.value = false;
        }, 1000);
    }
});

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
                {{ pulls.filter(p => p.Rarity === 6).length > 0 ? Math.floor((pulls.length - summonSinceLastSixStar) /
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
                    <template #star>
                        <i class="fa-solid fa-star text-orange-300"></i>
                    </template>
                </i18n-t>
            </div>
            <div class="number">
                {{ winrate ? winrate : 0 }} %
            </div>
        </div>
        <div v-if="props.text !== $t('summary-thread')" class="flex justify-between">
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
        <div class="flex flex-wrap justify-center gap-x-10">
            <!-- Fix the key later -->
            <div v-for="(pull, index) in pulls.filter(p => p.Rarity === 6)"
                :key="`${pull.Timestamp}-${pull.ArcanistName}`">
                <TrackerArcanistIcon v-if="arcanists.find(a => a.Name === pull.ArcanistName)" class="py-2"
                    :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) ?? {}"
                    :pity="sixStarsPullsList[sixStarsPullsList.length - 1 - index]"
                    :indicator="indicators[pull.PullNumber]" />
                <TrackerSpecialIcon v-else class="py-2" :name="pull.ArcanistName"
                    :pity="sixStarsPullsList[sixStarsPullsList.length - 1 - index]" />
            </div>
        </div>
    </div>

    <div class="pt-10 pb-4">
        <!-- Summon History -->
        <div class="text text-center text-xl">
            {{ isEditing ? $t('summon-editor') : $t('summon-history') }}
        </div>
        <div class="flex justify-center items-center space-x-2 pt-4">
            <span :class="{ 'opacity-50': isEditing, 'text-white': true }"><i class="fa-solid fa-eye"></i></span>
            <div class="tooltip" :data-tip="isEditing ? $t('summon-history') : $t('summon-editor')">
                <input type="checkbox" class="toggle toggle-info [--tglbg:#121b31]" v-model="isEditing" />
            </div>
            <span :class="{ 'opacity-50': !isEditing, 'text-white': true }"><i class="fa-solid fa-pen"></i></span>
        </div>
    </div>

    <TrackerEditor v-if="isEditing" :pulls="props.allPulls" :banner-type="props.bannerType" />
    <div v-if="showSpinner" class="text-white text-center font-bold"><i class="fa-solid fa-spinner fa-spin"></i></div>

    <div v-if="!isEditing" class="flex flex-col overflow-x-auto hidden-scrollbar">
        <!-- Rarity select -->
        <div class="flex justify-center space-x-2 pb-4">
            <button
                v-for="i in [2, 3, 4, 5, 6]"
                :key="i"
                :class="[
                    'border-2',
                    activeRarities.includes(i) ? 'border-info' : 'border-transparent'
                ]"
                @click="selectedRarities(i)"
                class="p-2 rounded-md"
            >
                <i class="fa-solid fa-star" :class="{
                    'text-orange-300': i === 6,
                    'text-yellow-100': i === 5,
                    'text-purple-400': i === 4,
                    'text-sky-200': i === 3,
                    'text-green-200': i === 2
                }"></i>
            </button>
        </div>

        <table class="table-auto max-w-2xl w-full text-white lg:mx-auto">
            <thead>
                <tr>
                    <th class="text-center">{{ $t('pull') }}</th>
                    <th class="text-center">{{ $t('arcanist') }}</th>
                    <th class="text-center">{{ $t('pity') }}</th>
                    <th class="text-center">{{ $t('banner') }}</th>
                    <th class="text-center">{{ $t('date') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(pull, index) in filteredRarityPulls"
                    :key="`${pull.Timestamp}-${pull.ArcanistName}-${index}`" :class="{
        'text-orange-300': pull.Rarity === 6,
        'text-yellow-100': pull.Rarity === 5,
        'text-purple-400': pull.Rarity === 4,
        'text-sky-200': pull.Rarity === 3,
        'text-green-200': pull.Rarity === 2
    }">
                    <!-- Index -->
                    <td class="text-center px-4 whitespace-nowrap">{{ pull.PullNumber }}</td>

                    <!-- Arcanist -->
                    <td class="flex items-center px-4 py-1 gap-x-3 whitespace-nowrap">
                        <ArcanistIcon v-if="arcanists.find(a => a.Name === pull.ArcanistName)"
                            :arcanist="arcanists.find(a => a.Name === pull.ArcanistName) as IArcanist" />
                        <SpecialIcon v-else :name="pull.ArcanistName" />
                        <div class="text-sm">{{ $t(pull.ArcanistName) }}</div>
                        <span v-if="indicators[pull.PullNumber] === 'L'" class="badge-indicator ">
                            <div class='tooltip' :data-tip="$t('lose')"><img
                                    src="/images/items/common/red-badge.webp" />
                            </div>
                        </span>
                        <span v-else-if="indicators[pull.PullNumber] === 'W'" class="badge-indicator ">
                            <div class='tooltip' :data-tip="$t('win')"><img
                                    src="/images/items/common/green-badge.webp" />
                            </div>
                        </span>
                        <span v-else-if="indicators[pull.PullNumber] === 'G'" class="badge-indicator ">
                            <div class='tooltip' :data-tip="$t('guaranteed')"><img
                                    src="/images/items/common/yellow-badge.webp" />
                            </div>
                        </span>
                    </td>

                    <!-- Pity -->
                    <td class="text-center px-4 whitespace-nowrap">
                        <span class="text-sme" v-show="pull.Rarity === 6">
                            {{ sixStarsPullsIndex[pull.PullNumber] }}
                        </span>
                    </td>

                    <!-- Banner -->
                    <td class="text-center px-4 whitespace-nowrap">
                        <span class="text-sm">{{ pull.BannerType }}</span>
                    </td>

                    <!-- Date -->
                    <td class="text-center px-4 whitespace-nowrap">
                        <span class="text-sm">{{ formatDate(pull.Timestamp) }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
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

.badge-indicator {
    @apply text-white font-bold w-7 rounded-md text-sm opacity-95 flex items-center justify-center;
}
</style>
