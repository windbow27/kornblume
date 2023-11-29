<script setup>
import { ref} from 'vue';
import { onClickOutside } from '@vueuse/core';
import HomeChangelogs from '../components/home/HomeChangelogs.vue';
import HomeResources from '../components/home/HomeResources.vue';

const isChangeLogs = ref(false);
const isResources = ref(false);

const changelogsRef = ref(null);
const resourcesRef = ref(null);

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

const carouselItems = [
    {
        link: 'https://xieyun767.lofter.com/post/1e42475f_2b9822a23',
        imageUrl: 'https://r.res.easebar.com/pic/20231023/66e376a5-01c0-4e03-8b91-2a9084a48079.jpg'
    },
    {
        link: 'https://www.pixiv.net/en/artworks/113463395',
        imageUrl: 'https://cdn.donmai.us/original/b1/c6/__37_reverse_1999_drawn_by_calla10__b1c6c8cca9f5caf9e0cf87428bdb3183.jpg'
    },
    {
        link: 'https://m.weibo.cn/p/index?extparam=%E9%87%8D%E8%BF%94%E6%9C%AA%E6%9D%A51999&containerid=100808e787a351d78dce2b4b283051356b0c2b&luicode=20000061&lfid=4953268448395943#&gid=1&pid=1',
        imageUrl: 'https://wx4.sinaimg.cn/large/696c6a06gy1hk8oiwzqscj230a1ow1ky.jpg'
    },
    {
        link: 'https://re.bluepoch.com/home/detail.html#wallpaper',
        imageUrl: 'https://gamecms-res.sl916.com/official_website_resource/50001/4/PICTURE/20231114/97%202560x1440_ccb31017a58b47a5b285019ecab4bb27.jpg'
    }
];

onClickOutside(changelogsRef, closeChangelogs);
onClickOutside(resourcesRef, closeResources);

</script>

<template>
    <div class="responsive-spacer overflow-x-hidden">
        <div class="text-center p-10">
            <h1 class="text-5xl lg:text-6xl font-bold text-white">Kornblume</h1>
            <p class="text-lg lg:text-xl text-gray-300">A toolsite and cornflower worship place for Reverse:1999</p>
        </div>

        <div class="container mx-auto lg:w-2/3 p-4">
            <div class="tooltip" data-tip="I swear to god I can't find any good bkornblume images">
                <div class="carousel w-full rounded-md">
                    <!-- Loop through carousel items -->
                    <div v-for="(item, index) in carouselItems" :key="index" class="carousel-item w-full">
                        <a :href="item.link" target="_blank">
                            <div class=" aspect-video overflow-hidden rounded-md">
                                <img :src="item.imageUrl" class="object-cover w-full h-full" />
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <footer class="text-white py-8">
            <div class="container mx-auto flex flex-col items-center space">
                <div class="flex mb-4 space-x-4">
                    <button @click="openChangelogs" class="btn btn-ghost btn-sm custom-gradient-button"><i
                            class="fa-solid fa-book"></i> Changelogs</button>
                    <button @click="openResources" class="btn btn-ghost btn-sm custom-gradient-button"><i
                            class="fa-solid fa-book"></i> Resources</button>
                </div>
                <a href="https://github.com/your-username" target="_blank" class="text-3xl text-gray-400 hover:text-white">
                    <i class="fab fa-github"></i>
                </a>
                <p class="text-xs opacity-80 mb-2 text-center">All contributions are welcomed. If you enjoy the work, please
                    like, subscribe and smash that <i class="fa-regular fa-star"></i> button.</p>

                <div class="mb-4 text-center">
                    <p class="text-xs opacity-80">Kornblume is not affilated with BluePoch. All images and data belongs to
                        their respective owners.</p>
                    <p class="text-md opacity-80 m-2">Made by windbow</p>
                </div>
            </div>
        </footer>

        <!-- Changelogs Overlay -->
        <div v-if="isChangeLogs" class="overlay"><HomeChangelogs ref="changelogsRef" @closeOverlay="closeChangelogs"/></div>
        <div v-if="isResources" class="overlay"><HomeResources ref="resourcesRef" @closeOverlay="closeResources"/></div>
    </div><div></div>
</template>
    
<style scoped>
</style>