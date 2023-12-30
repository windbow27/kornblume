<script lang="ts" setup name="Navbar">
import { onMounted, ref, watchEffect, watch } from 'vue';
import Popper from 'vue3-popper';
import { useI18n } from 'vue-i18n';

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

const flagMapping = {
    'en-US': 'fi fi-us',
    'de-DE': 'fi fi-de',
    'zh-CN': 'fi fi-cn',
    'zh-TW': 'fi fi-tw',
    'vi-VN': 'fi fi-vn',
    'id-ID': 'fi fi-id',
    'ko-KR': 'fi fi-kr',
    'ja-JP': 'fi fi-jp'
}

const langMapping = {
    'en-US': 'English',
    'de-DE': 'Deutsch',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    'vi-VN': 'Tiếng Việt',
    'id-ID': 'Indonesia',
    'ko-KR': '한국어',
    'ja-JP': '日本語'
}

const handleChangeLanguage = (langCode: string) => {
    currentLanguage.value = langMapping[langCode];
    currentFlag.value = flagMapping[langCode];
    locale.value = langCode;
}

onMounted(() => {
    if (localStorage.getItem('locale')) {
        const userLocale = localStorage.getItem('locale') || 'en-US'
        handleChangeLanguage(userLocale)
    } else {
        const userLocale = navigator.language || 'en-US'
        if (['en-US', 'de-DE', 'zh-CN', 'zh-TW', 'vi-VN', 'id-ID', 'ko-KR', 'ja-JP'].includes(userLocale)) {
            handleChangeLanguage(userLocale)
        } else {
            handleChangeLanguage('en-US')
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
            <p class="btn btn-ghost" @click="handleChangeLanguage('en-US')"> <span
                class="fi fi-us"></span> English </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('de-DE')"> <span
                class="fi fi-de"></span> Deutsch </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('zh-CN')"> <span
                class="fi fi-cn"></span> 简体中文 </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('zh-TW')"> <span
                class="fi fi-tw"></span> 繁體中文 </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('vi-VN')"> <span
                class="fi fi-vn"></span> Tiếng Việt </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('id-ID')"> <span
                class="fi fi-id"></span> Indonesia </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('ko-KR')"> <span
                class="fi fi-kr"></span> 한국어 </p>
            <p class="btn btn-ghost" @click="handleChangeLanguage('ja-JP')"> <span
                class="fi fi-jp"></span> 日本語 </p>
          </div>
          <div class="flex justify-center pt-2">
            <a href="https://github.com/windbow27/Kornblume/pull/26">
              <p class="btn btn-sm btn-outline btn-ghost hover:border-info hover:bg-transparent hover:text-info text-white"> {{ $t('help-us-translate') }} </p>
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
