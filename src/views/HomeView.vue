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
            <p class="text-lg lg:text-xl text-gray-300">A toolsite and cornflower worship place for Reverse:1999</p>
            <p class="text-md text-gray-300">Any help sharing this tool would be greated appreciated.</p>
            <p class="text-md text-gray-300">For <i class="fa-solid fa-mobile-screen-button"></i> users, click top right <i
                    class="fa-solid fa-bars"></i> to start.</p>
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
                            class="fa-solid fa-book"></i>{{ $t('Changelogs') }}</button>
                    <button @click="openResources" class="btn btn-ghost btn-md custom-gradient-button"><i
                            class="fa-solid fa-book"></i>{{ $t('Credits') }}</button>
                </div>
                <a href="https://forms.gle/vfapSjQmRNn7ChPe8" target="_blank"
                    class="btn btn-ghost btn-md custom-gradient-button">
                    <i class="fa-solid fa-rectangle-list"></i> Comments / Bug Reports
                </a>

                <a href="https://github.com/windbow27/Kornblume" target="_blank"
                    class="text-3xl text-gray-400 hover:text-white pt-5">
                    <i class="fab fa-github"></i>
                </a>
                <p class="text-xs opacity-80 mb-2 text-center">All contributions are welcomed. If you enjoy the work, please
                    like, subscribe and smash that <i class="fa-regular fa-star"></i> button.</p>
                <p class="text-xs opacity-80 mb-2 text-center">We are translating the site into other languages. <a href="https://github.com/windbow27/Kornblume/pull/26"
                            target="_blank" class="text-blue-500 hover:text-blue-700">Please help us out</a>. You could reach out to us through @windbow in Discord.</p>
                <div class="mb-4 text-center">
                    <p class="text-xs opacity-80">Kornblume is not affilated with BluePoch. All images and data belongs to
                        their respective owners.</p>
                    <p class="text-md opacity-90 mx-2 mt-2">Developed by windbow. Joined by zero.day and fran.</p>

                    <button class="btn btn-ghost btn-xs opacity-80" onclick="my_modal_2.showModal()">Privacy Policy</button>
                    <dialog id="my_modal_2" class="modal">
                        <div class="modal-box custom-gradient-gray-blue">
                            <p class="py-4">Kornblume use Google Analytics to collect traffics, most viewed pages in order
                                to improve Kornblume. The data is used solely for that reason and will never be used for
                                advertising purposes. </p>
                            <p class="pb-4"> Planner data is stored locally on your device. </p>
                        </div>
                        <form method="dialog" class="modal-backdrop">
                            <button>close</button>
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
