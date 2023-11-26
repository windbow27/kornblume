<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/navbar/Navbar.vue'
</script>

<template>
  <div class="content">
    <header>
      <Navbar />
    </header>
    <main class="z-0 h-screen w-full bg-gradient-to-r from-gray-900 to-blue-950 
    overflow-y-auto flex flex-col"
    >
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
</style>
