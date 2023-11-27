<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/navbar/Navbar.vue'
</script>

<template>
  <div class="custom-gradient-gray-blue">
    <header>
      <Navbar />
    </header>
    <main class="z-0 min-h-screen w-full bg-gradient-to-r from-gray-900 to-blue-950 flex flex-col mt-14">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
</style>
