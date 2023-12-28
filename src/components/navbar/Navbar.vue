<script lang="ts" setup name="Navbar">
import { onMounted, ref, watchEffect, watch } from 'vue';
import Popper from 'vue3-popper';
import { useI18n } from 'vue-i18n';

// just for debug
const enableI18n = localStorage.getItem('i18n-testing') === '1'

const isSmallScreen = ref(window.innerWidth <= 768);
const showDropdown = ref(false);

const currentLanguage = ref('English');
const currentFlag = ref('fi fi-us');

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

watchEffect(() => {
    const handleResize = () => {
        isSmallScreen.value = window.innerWidth <= 768;
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

const { locale } = useI18n()
const handleChangeLanguage = (e: string, flag: string, language: string) => {
    currentLanguage.value = language;
    currentFlag.value = flag;
    locale.value = e;
}

onMounted(() => {
    if (enableI18n) { // feature toggle
        if (localStorage.getItem('locale')) {
            const userLocale = localStorage.getItem('locale') || 'en-US'
            locale.value = userLocale
        } else {
            const userLocale = navigator.language || 'en-US'
            if (['en-US', 'de-DE', 'zh-CN', 'zh-TW', 'vi-VN', 'id-ID', 'ko-KR', 'ja-JP'].includes(userLocale)) {
                locale.value = userLocale
            } else {
                locale.value = 'en-US'
            }
        }
    }
})

watch(locale, (newLocale) => {
    localStorage.setItem('locale', newLocale);
})

</script>

<template>
  <nav class="fixed top-0 left-0 right-0 custom-gradient-gray-blue p-2 opacity-90 flex px-4 z-50">
    <img src="/images/items/common/logo.png" alt="logo" class="w-8 h-8 mt-1 mr-4" />

    <!-- Navigation Links for Large Screens -->
    <div v-if="!isSmallScreen" class="flex space-x-2">
      <router-link to="/" class="nav-button" :class="{ 'active': $route.path === '/' }"><i class="fa-solid fa-house"></i>
        {{ $t('home') }} </router-link>
      <router-link to="/tracker" class="nav-button" :class="{ 'active': $route.path === '/tracker' }"><i
          class="fa-brands fa-galactic-republic"></i> {{ $t('summon-tracker') }} </router-link>
      <router-link to="/planner" class="nav-button" :class="{ 'active': $route.path === '/planner' }"><i
          class="fas fa-tasks"></i> {{ $t('planner') }} </router-link>
      <router-link to="/profile" class="nav-button" :class="{ 'active': $route.path === '/profile' }"><i
          class="fa-solid fa-user-plus"></i> {{ $t('profile') }} </router-link>
    </div>

    <div class="ml-auto flex items-center">
      <Popper arrow placement="top" offsetDistance="2">
        <button class="btn btn-ghost btn-sm text-white"> <span :class="currentFlag"></span> {{ currentLanguage }}
        </button>
        <template #content>
          <div class="grid grid-cols-2">
            <p class="btn btn-ghost" @click="handleChangeLanguage('en-US', 'fi fi-us', 'English')"> <span
                class="fi fi-us"></span> English </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('de-DE', 'fi fi-de', 'Deutsch')"> <span
                class="fi fi-de"></span> Deutsch </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('zh-CN', 'fi fi-cn', '简体中文')"> <span
                class="fi fi-cn"></span> 简体中文 </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('zh-TW', 'fi fi-tw', '繁體中文')"> <span
                class="fi fi-tw"></span> 繁體中文 </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('vi-VN', 'fi fi-vn', 'Tiếng Việt')"> <span
                class="fi fi-vn"></span> Tiếng Việt </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('id-ID', 'fi fi-id', 'Indonesia')"> <span
                class="fi fi-id"></span> Indonesia </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('ko-KR', 'fi fi-kr', '한국어')"> <span
                class="fi fi-kr"></span> 한국어 </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('ja-JP', 'fi fi-jp', '日本語')"> <span
                class="fi fi-jp"></span> 日本語 </p>
          </div>
        </template>
      </Popper>

      <!-- Dropdown Button for Small Screens -->
      <div v-if="isSmallScreen">
        <Popper arrow placement="top" offsetDistance="2">
          <div class="nav-button cursor-pointer">
            <i class="fa-solid fa-bars text-white"></i>
          </div>
          <template #content>
            <div class="flex flex-col space-y-2">
              <router-link @click="toggleDropdown" to="/" class="nav-button block"
                :class="{ 'active': $route.path === '/' }"><i class="fa-solid fa-house"></i> {{ $t('home') }}
              </router-link>
              <router-link @click="toggleDropdown" to="/tracker" class="nav-button block"
                :class="{ 'active': $route.path === '/tracker' }"><i class="fa-brands fa-galactic-republic"></i> {{
                  $t('summon-tracker') }} </router-link>
              <router-link @click="toggleDropdown" to="/planner" class="nav-button block"
                :class="{ 'active': $route.path === '/planner' }"><i class="fas fa-tasks"></i> {{ $t('planner') }}
              </router-link>
              <router-link @click="toggleDropdown" to="/profile" class="nav-button block"
                :class="{ 'active': $route.path === '/profile' }"><i class="fa-solid fa-user-plus"></i> {{ $t('profile')
                }}
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
