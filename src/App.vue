<script lang="ts" setup name="App">
import { RouterView } from 'vue-router'
import { useGlobalStore } from './stores/global'
import Navbar from './components/navbar/Navbar.vue'
import LoadingScreen from './components/navbar/LoadingScreen.vue'

const globalStore = useGlobalStore()

</script>

<template>
  <div class="custom-gradient-gray-blue">
    <header>
      <Navbar />
    </header>
    <main class="z-0 min-h-screen bg-gradient-to-r from-gray-900 to-blue-950 flex flex-col pt-14">
      <LoadingScreen v-if="globalStore.isLoading"></LoadingScreen>
      <RouterView v-else></RouterView>
    </main>
  </div>
</template>

<style scoped>
body,
html {
  margin: 0;
  padding: 0;
}
</style>
