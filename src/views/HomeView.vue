<script setup lang="ts" name="HomeView">
import { onMounted, onUnmounted, ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useChangelogsStore } from '@/stores/global';
import { changelogs } from '@/utils/changelogs';
import HomeChangelogs from '@/components/home/HomeChangelogs.vue';
import HomeResources from '@/components/home/HomeResources.vue';

const changelogsStore = useChangelogsStore();
const isChangeLogs = ref(false);
const isResources = ref(false);
const changelogsRef = ref(null);
const resourcesRef = ref(null);
const isMediumScreen = ref(window.innerWidth >= 768);
const carouselItems = [
    {
        link: 'https://www.pixiv.net/en/artworks/110046834',
        imageUrl: 'https://pbs.twimg.com/media/F1XIYQXakAAgrt4?format=jpg&name=4096x4096'
    }
];

const openChangelogs = () => {
    isChangeLogs.value = true;
};

const openResources = () => {
    isResources.value = true;
};

const closeChangelogs = () => {
    isChangeLogs.value = false;
};

const closeResources = () => {
    isResources.value = false;
};

const updateScreenSize = () => {
    isMediumScreen.value = window.innerWidth >= 768;
};

onMounted(() => {
    window.addEventListener('resize', updateScreenSize);
    if (changelogs[0].date !== changelogsStore.lastChangelogs) {
        openChangelogs();
        changelogsStore.setLastChangelogs(changelogs[0].date);
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', updateScreenSize);
});

onClickOutside(changelogsRef, closeChangelogs);
onClickOutside(resourcesRef, closeResources);
</script>

<template>
    <div class="container overflow-x-hidden">
        <div class="text-center p-2 mb-1">
            <h1 class="text-5xl lg:text-6xl font-bold text-white pt-2">Kornblume</h1>
            <p class="text-sm sm:text-lg text-gray-300">
                {{ $t('a-toolsite-and-cornflower-worship-place-for-reverse-1999') }}
            </p>
            <p class="text-xs sm:text-base text-gray-300">
                {{ $t('any-help-sharing-this-tool-would-be-greated-appreciated') }}
            </p>
            <p class="text-xs sm:text-base text-gray-300" v-if="!isMediumScreen">
                <i18n-t keypath="for-mobile-users-click-top-right-to-start">
                    <template #mobile>
                        <i class="fa-solid fa-mobile-screen-button"></i>
                    </template>
                    <template #bars>
                        <i class="fa-solid fa-bars"></i>
                    </template>
                </i18n-t>
            </p>
        </div>

        <div class="container mx-auto w-full xl:w-2/3 px-4 aspect-video">
            <div class="carousel w-full rounded-md">
                <!-- Loop through carousel items -->
                <div
                    v-for="(item, index) in carouselItems"
                    :key="index"
                    class="carousel-item w-full flex items-center justify-center">
                    <a :href="item.link" target="_blank">
                        <div class="aspect-video overflow-hidden rounded-md">
                            <img :src="item.imageUrl" class="object-cover w-full h-full" />
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <footer class="text-white">
            <div class="container mx-auto flex flex-col items-center space">
                <div class="flex flex-wrap justify-center items-center mb-4 gap-x-4 gap-y-4">
                    <button
                        @click="openChangelogs"
                        class="btn btn-ghost btn-md custom-gradient-button">
                        <i class="fa-solid fa-book"></i> {{ $t('changelogs') }}
                    </button>
                    <button
                        @click="openResources"
                        class="btn btn-ghost btn-md custom-gradient-button">
                        <i class="fa-solid fa-book"></i> {{ $t('credits') }}
                    </button>
                    <a
                        href="https://github.com/windbow27/kornblume/issues"
                        target="_blank"
                        class="btn btn-ghost btn-md custom-gradient-button">
                        <i class="fa-solid fa-rectangle-list"></i>
                        {{ $t('comments-bug-reports') }}
                    </a>
                </div>

                <a
                    href="https://github.com/windbow27/kornblume"
                    target="_blank"
                    class="text-2xl lg:text-3xl text-gray-400 hover:text-white">
                    <i class="fab fa-github"></i>
                </a>
                <p class="text-xs opacity-80 mb-2 text-center">
                    <i18n-t
                        keypath="all-contributions-are-welcomed-if-you-enjoy-the-work-please-like-subscribe-and-smash-that-star-button">
                        <template #star>
                            <i class="fa-regular fa-star"></i>
                        </template>
                    </i18n-t>
                </p>

                <div class="mb-4 text-center">
                    <p class="text-xs opacity-80">
                        {{
                            $t(
                                'kornblume-is-not-affilated-with-bluepoch-all-images-and-data-belongs-to-their-respective-owners'
                            )
                        }}
                    </p>
                    <p class="text-xs sm:text-base opacity-90 mx-2 mt-2">
                        {{ $t('developed-by-windbow-joined-by-zero-day-and-fran') }}
                    </p>
                    <button
                        class="btn btn-ghost btn-xs sm:btn-sm opacity-90"
                        onclick="translators.showModal()">
                        {{ $t('contributors') }}
                    </button>
                    <button
                        class="btn btn-ghost btn-xs sm:btn-sm opacity-90"
                        onclick="privacy.showModal()">
                        {{ $t('privacy-policy') }}
                    </button>
                    <dialog id="translators" class="modal">
                        <div class="modal-box custom-border custom-gradient-gray-blue">
                            <form method="dialog">
                                <button
                                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                    ✕
                                </button>
                            </form>
                            <h2 class="pb-3 text-xl font-bold">
                                {{ $t('contributors') }}
                            </h2>
                            <div class="space-y-1">
                                <p>
                                    <span class="text-info"> Español </span>
                                    mgeshagrath
                                </p>
                                <p>
                                    <span class="text-info"> Français </span> я герой#3673 &
                                    sillight
                                </p>
                                <!-- <p><span class="text-info"> Deutsch </span> </p> -->
                                <p>
                                    <span class="text-info"> 简体中文 </span>
                                    fran & ryle798 & Yumemigokochi
                                </p>
                                <p>
                                    <span class="text-info"> 繁體中文 </span>
                                    fran & Yumemigokochi
                                </p>
                                <p>
                                    <span class="text-info"> Tiếng Việt </span>
                                    windbow
                                </p>
                                <p>
                                    <span class="text-info"> Indonesia </span>
                                    ArieKee
                                </p>
                                <p>
                                    <span class="text-info"> 한국어 </span>
                                    CaptinRegulus, LyvaKim & seih6790
                                </p>
                                <p>
                                    <span class="text-info"> 日本語 </span>
                                    yagochi & Yumemigokochi
                                </p>
                                <p>
                                    <span class="text-info"> Русский </span>
                                    spun4ik, dagufz37 & mushel2442
                                </p>
                                <p>hato</p>
                                <p>Heightweight</p>
                                <p>Ipun-majessica</p>
                            </div>
                        </div>
                        <form method="dialog" class="modal-backdrop">
                            <button>{{ $t('') }}</button>
                        </form>
                    </dialog>
                    <dialog id="privacy" class="modal">
                        <div class="modal-box custom-border custom-gradient-gray-blue">
                            <form method="dialog">
                                <button
                                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                    ✕
                                </button>
                            </form>
                            <p class="py-4">
                                {{
                                    $t(
                                        'kornblume-use-google-analytics-to-collect-traffics-most-viewed-pages-in-order-to-improve-kornblume-the-data-is-used-solely-for-that-reason-and-will-never-be-used-for-advertising-purposes'
                                    )
                                }}
                            </p>
                            <p class="pb-4">
                                {{ $t('planner-data-is-stored-locally-on-your-device') }}
                            </p>
                        </div>
                        <form method="dialog" class="modal-backdrop">
                            <button>{{ $t('') }}</button>
                        </form>
                    </dialog>
                </div>
            </div>
        </footer>

        <!-- Changelogs Overlay -->
        <div v-if="isChangeLogs" class="overlay">
            <HomeChangelogs ref="changelogsRef" @closeOverlay="closeChangelogs" />
        </div>
        <div v-if="isResources" class="overlay">
            <HomeResources ref="resourcesRef" @closeOverlay="closeResources" />
        </div>
    </div>
    <div></div>
</template>

<style scoped></style>
