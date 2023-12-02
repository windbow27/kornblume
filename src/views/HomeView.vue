<script setup>
import { ref } from 'vue';
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
        link: 'https://www.pixiv.net/en/artworks/110046834',
        imageUrl: 'https://media.discordapp.net/attachments/1167811155021013113/1179403660472631296/bkornblume_reverse_1999_drawn_by_zaocan_nai_cha__e82e6a9976933a9f7bfe10bd786df82d.jpg?ex=6579a840&is=65673340&hm=158852f2b2081144a2e7b57acbff0be1e9edb0bf4fa2ccaa7c98e3a45dba26fb&=&format=webp&width=904&height=499'
    },
    {
        link: 'https://xieyun767.lofter.com/post/1e42475f_2b9822a23',
        imageUrl: 'https://r.res.easebar.com/pic/20231023/66e376a5-01c0-4e03-8b91-2a9084a48079.jpg'
    },
    {
        link: 'https://www.weibo.com/7600886366/KBBM3bSf6',
        imageUrl: 'https://media.discordapp.net/attachments/1167811155021013113/1179403455736057906/bkornblume_reverse_1999__f556d62c5766d7048c1023dc10bccbd7.jpg?ex=6579a810&is=65673310&hm=5932e6233dadaace15105efc4f323693aaf8037b01dd38c303c361d19c4e6d93&=&format=webp&width=978&height=425'
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
                    <button @click="openChangelogs" class="btn btn-ghost btn-sm custom-gradient-button"><i
                            class="fa-solid fa-book"></i> Changelogs</button>
                    <button @click="openResources" class="btn btn-ghost btn-sm custom-gradient-button"><i
                            class="fa-solid fa-book"></i> Resources</button>
                </div>
                <a href="https://github.com/windbow27/Kornblume" target="_blank"
                    class="text-3xl text-gray-400 hover:text-white">
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