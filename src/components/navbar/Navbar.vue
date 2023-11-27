<template>
  <nav class="fixed top-0 left-0 right-0 custom-gradient-gray-blue p-4 opacity-90 z-50">
    <router-link to="/" class="nav-button">Home</router-link>
    <router-link to="/planner" class="nav-button">Planner</router-link>
    <router-link to="/about" class="nav-button">About</router-link>
  </nav>
</template>

<style scoped>
.nav-button {
  @apply text-white hover:bg-slate-700 px-4 py-2 rounded transition;
}
</style>
