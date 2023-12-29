<script setup lang="ts" name="HomeView">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import HomeChangelogs from '../components/home/HomeChangelogs.vue'
import HomeResources from '../components/home/HomeResources.vue'

const isChangeLogs = ref(false)
const isResources = ref(false)

const changelogsRef = ref(null)
const resourcesRef = ref(null)

const openChangelogs = () => {
    isChangeLogs.value = true
}

const openResources = () => {
    isResources.value = true
}

const closeChangelogs = () => {
    isChangeLogs.value = false
}

const closeResources = () => {
    isResources.value = false
}

const carouselItems = [
    {
        link: 'https://www.pixiv.net/en/artworks/110046834',
        imageUrl: 'https://pbs.twimg.com/media/F1XIYQXakAAgrt4?format=jpg&name=4096x4096'
    }
]

onClickOutside(changelogsRef, closeChangelogs)
onClickOutside(resourcesRef, closeResources)

</script>

<template>
    <div class="responsive-spacer overflow-x-hidden">
        <div class="text-center p-10">
            <h1 class="text-5xl lg:text-6xl font-bold text-white">Kornblume</h1>
            <p class="text-lg lg:text-xl text-gray-300">{{ $t('a-toolsite-and-cornflower-worship-place-for-reverse-1999') }}</p>
            <p class="text-md text-gray-300">{{ $t('any-help-sharing-this-tool-would-be-greated-appreciated') }}</p>
            <p class="text-md text-gray-300">
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

        <div class="container mx-auto lg:w-2/3 px-4">
            <div class="carousel w-full rounded-md">
                <!-- Loop through carousel items -->
                <div v-for="(item, index) in carouselItems" :key="index"
                    class="carousel-item w-full flex items-center justify-center">
                    <a :href="item.link" target="_blank">
                        <div class="aspect-video overflow-hidden rounded-md">
                            <img :src="item.imageUrl" class="object-cover w-full h-full" />
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <footer class="text-white py-8">
            <div class="container mx-auto flex flex-col items-center space">
                <div class="flex mb-4 space-x-4">
                    <button @click="openChangelogs" class="btn btn-ghost btn-md custom-gradient-button"><i
                            class="fa-solid fa-book"></i> {{ $t('changelogs') }} </button>
                    <button @click="openResources" class="btn btn-ghost btn-md custom-gradient-button"><i
                            class="fa-solid fa-book"></i> {{ $t('credits') }} </button>
                </div>
                <a href="https://forms.gle/vfapSjQmRNn7ChPe8" target="_blank"
                    class="btn btn-ghost btn-md custom-gradient-button">
                    <i class="fa-solid fa-rectangle-list"></i> {{ $t('comments-bug-reports') }}
                </a>

                <a href="https://github.com/windbow27/Kornblume" target="_blank"
                    class="text-3xl text-gray-400 hover:text-white pt-5">
                    <i class="fab fa-github"></i>
                </a>
                <p class="text-xs opacity-80 mb-2 text-center">
                    <i18n-t keypath="all-contributions-are-welcomed-if-you-enjoy-the-work-please-like-subscribe-and-smash-that-star-button">
                    <template #star>
                        <i class="fa-regular fa-star"></i>
                    </template>
                    </i18n-t>
                </p>

                <p class="text-xs opacity-80 mb-2 text-center">
                    <i18n-t keypath="we-are-translating-the-site-into-other-languages-please-help-us-out-you-could-reach-out-to-us-through-windbow-in-discord">
                    <template #link>
                        <a href="https://github.com/windbow27/Kornblume/pull/26"
                            target="_blank" class="text-blue-500 hover:text-blue-700">{{ $t('please-help-us-out') }}</a>
                    </template>
                    <template #discord>
                        @windbow
                    </template>
                    </i18n-t>
                </p>

                <div class="mb-4 text-center">
                    <p class="text-xs opacity-80">{{ $t('kornblume-is-not-affilated-with-bluepoch-all-images-and-data-belongs-to-their-respective-owners') }}</p>
                    <p class="text-md opacity-90 mx-2 mt-2">{{ $t('developed-by-windbow-joined-by-zero-day-and-fran') }}</p>
                    <button class="btn btn-ghost btn-xs opacity-80" onclick="my_modal_2.showModal()">{{ $t('privacy-policy') }}</button>
                    <dialog id="my_modal_2" class="modal">
                        <div class="modal-box custom-gradient-gray-blue">
                            <p class="py-4">{{ $t('kornblume-use-google-analytics-to-collect-traffics-most-viewed-pages-in-order-to-improve-kornblume-the-data-is-used-solely-for-that-reason-and-will-never-be-used-for-advertising-purposes') }} </p>
                            <p class="pb-4"> {{ $t('planner-data-is-stored-locally-on-your-device') }} </p>
                        </div>
                        <form method="dialog" class="modal-backdrop">
                            <button>{{ $t('close') }}</button>
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
