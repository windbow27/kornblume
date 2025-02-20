<script lang="ts" setup name="Navbar">
import { onMounted, ref, watchEffect } from 'vue';
import { setLocale, supportedLangCodes, langDropdownOptions } from '@/utils/i18n';
import Popper from 'vue3-popper';

const isSmallScreen = ref(window.innerWidth <= 768);
const showDropdown = ref(false);
const currentLanguage = ref('English');
const currentFlag = ref('fi fi-us');

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const handleChangeLanguage = ({ locale, text, icon }) => {
    currentLanguage.value = text;
    currentFlag.value = icon;
    setLocale(locale);
};

onMounted(() => {
    // get default locale from local storage or broswer settings
    let defaultLocale = 'en-US';
    if (localStorage.getItem('locale')) {
        defaultLocale = localStorage.getItem('locale') || 'en-US';
    } else {
        defaultLocale = navigator.language || 'en-US';
        if (!supportedLangCodes.includes(defaultLocale)) {
            defaultLocale = 'en-US';
        }
    }
    const option = langDropdownOptions.find((opt) => opt.locale === defaultLocale);
    if (option) {
        handleChangeLanguage(option);
    }
});

watchEffect(() => {
    const handleResize = () => {
        isSmallScreen.value = window.innerWidth <= 1024;
        if (!isSmallScreen.value) {
            showDropdown.value = false;
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
        window.removeEventListener('resize', handleResize);
    };
});
</script>

<template>
    <nav class="fixed top-0 left-0 right-0 custom-gradient-gray-blue p-2 opacity-90 flex px-4 z-50">
        <router-link to="/"
            ><img src="/images/items/common/logo.webp" alt="logo" class="w-8 h-8 mt-1 mr-4"
        /></router-link>

        <!-- Navigation Links for Large Screens -->
        <div v-if="!isSmallScreen" class="flex space-x-2">
            <router-link to="/" class="nav-button" :class="{ active: $route.path === '/' }"
                ><i class="fa-solid fa-house"></i> {{ $t('home') }}
            </router-link>
            <router-link
                to="/arcanists"
                class="nav-button"
                :class="{ active: $route.path === '/arcanists' }"
                ><i class="fa-solid fa-user"></i> {{ $t('arcanists') }}
            </router-link>
            <router-link
                to="/items"
                class="nav-button"
                :class="{ active: $route.path === '/items' }"
                ><i class="fa-solid fa-box-archive"></i> {{ $t('items') }}
            </router-link>
            <router-link
                to="/tracker"
                class="nav-button"
                :class="{ active: $route.path === '/tracker' }"
                ><i class="fa-brands fa-galactic-republic"></i> {{ $t('summon-tracker') }}
            </router-link>
            <router-link
                to="/planner"
                class="nav-button"
                :class="{ active: $route.path === '/planner' }"
                ><i class="fas fa-tasks"></i> {{ $t('planner') }}
            </router-link>
            <router-link
                to="/stages"
                class="nav-button"
                :class="{ active: $route.path === '/stages' }"
                ><i class="fa-solid fa-wand-magic-sparkles"></i> {{ $t('stages') }}
            </router-link>
            <router-link
                to="/profile"
                class="nav-button"
                :class="{ active: $route.path === '/profile' }"
                ><i class="fa-regular fa-address-card"></i> {{ $t('profile') }}
            </router-link>
        </div>

        <div class="ml-auto flex items-center gap-1.5">
            <!-- Ko-fi Icon-->
            <div class="tooltip tooltip-bottom" :data-tip="$t('ko-fi')">
                <a href="https://ko-fi.com/windbow" target="_blank" rel="noopener noreferrer">
                    <img src="/images/items/common/kofi.webp" alt="kofi" class="h-4 m-auto" />
                </a>
            </div>
            <!-- Language Dropdown -->
            <Popper arrow placement="top" offsetDistance="2">
                <button class="btn btn-ghost btn-sm text-white">
                    <span :class="currentFlag"></span> {{ currentLanguage }}
                </button>
                <template #content>
                    <div class="grid grid-cols-2">
                        <p
                            v-for="option in langDropdownOptions"
                            :key="option.locale"
                            class="btn btn-ghost"
                            @click="handleChangeLanguage(option)">
                            <span :class="option.icon"></span>{{ option.text }}
                        </p>
                    </div>
                    <div class="flex justify-center pt-2">
                        <a href="https://github.com/windbow27/kornblume/blob/main/lang/README.md">
                            <p
                                class="btn btn-sm btn-outline btn-ghost hover:border-info hover:bg-transparent hover:text-info text-white">
                                {{ $t('help-us-translate') }}
                            </p>
                        </a>
                    </div>
                </template>
            </Popper>

            <!-- Dropdown Button for Small Screens -->
            <div v-if="isSmallScreen">
                <Popper arrow placement="top" offsetDistance="2">
                    <div class="nav-button cursor-pointer">
                        <i class="fa-solid fa-bars text-white"></i>
                    </div>
                    <template #content="{ close }">
                        <div class="flex flex-col space-y-2">
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/"
                                class="nav-button block"
                                :class="{ active: $route.path === '/' }"
                                ><i class="fa-solid fa-house"></i> {{ $t('home') }}
                            </router-link>
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/arcanists"
                                class="nav-button block"
                                :class="{ active: $route.path === '/arcanists' }"
                                ><i class="fa-solid fa-user"></i> {{ $t('arcanists') }}
                            </router-link>
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/items"
                                class="nav-button block"
                                :class="{ active: $route.path === '/items' }"
                                ><i class="fa-solid fa-box-archive"></i> {{ $t('items') }}
                            </router-link>
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/tracker"
                                class="nav-button block"
                                :class="{ active: $route.path === '/tracker' }"
                                ><i class="fa-brands fa-galactic-republic"></i>
                                {{ $t('summon-tracker') }}
                            </router-link>
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/planner"
                                class="nav-button block"
                                :class="{ active: $route.path === '/planner' }"
                                ><i class="fas fa-tasks"></i> {{ $t('planner') }}
                            </router-link>
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/stages"
                                class="nav-button block"
                                :class="{ active: $route.path === '/stages' }"
                                ><i class="fa-solid fa-wand-magic-sparkles"></i> {{ $t('stages') }}
                            </router-link>
                            <router-link
                                @click="
                                    () => {
                                        toggleDropdown();
                                        close();
                                    }
                                "
                                to="/profile"
                                class="nav-button block"
                                :class="{ active: $route.path === '/profile' }"
                                ><i class="fa-regular fa-address-card"></i> {{ $t('profile') }}
                            </router-link>
                        </div>
                    </template>
                </Popper>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.nav-button {
    @apply text-white px-4 py-2 rounded transition text-center;
}

/* Additional styling for the dropdown button */
.nav-button:hover,
.nav-button.active {
    @apply bg-slate-700;
    cursor: pointer;
}
</style>
