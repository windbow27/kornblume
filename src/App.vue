<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="content">
    <header>
      <Navbar />
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* .content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
} */
</style>