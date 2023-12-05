<template>
  <nav class="fixed top-0 left-0 right-0 custom-gradient-gray-blue p-2 opacity-90 z-50 flex px-4">
    <img src="/images/items/common/logo.png" alt="logo" class="w-8 h-8 mt-1 mr-4" />

    <!-- Navigation Links for Large Screens -->
    <div v-if="!isSmallScreen" class="flex space-x-2">
      <router-link to="/" class="nav-button" :class="{ 'active': $route.path === '/' }"><i class="fa-solid fa-house"></i> Home</router-link>
      <router-link to="/planner" class="nav-button" :class="{ 'active': $route.path === '/planner' }"><i class="fas fa-tasks"></i> Planner</router-link>
      <router-link to="/profile" class="nav-button" :class="{ 'active': $route.path === '/planner' }"><i class="fa-solid fa-user-plus"></i> Profile</router-link>
    </div>

    <!-- Dropdown Button for Small Screens -->
    <div v-if="isSmallScreen" class="ml-auto">
      <div @click="toggleDropdown" class="nav-button cursor-pointer">
        <i class="fa-solid fa-bars text-white"></i>
      </div>
    </div>

    <!-- Dropdown Menu for Small Screens -->
    <div v-if="isSmallScreen && showDropdown" class="absolute top-full left-0 right-0 bg-gray-800 py-2">
      <router-link @click="toggleDropdown" to="/" class="nav-button block" :class="{ 'active': $route.path === '/' }"><i class="fa-solid fa-house"></i> Home</router-link>
      <router-link @click="toggleDropdown" to="/planner" class="nav-button block" :class="{ 'active': $route.path === '/planner' }"><i class="fas fa-tasks"></i> Planner</router-link>
      <router-link @click="toggleDropdown" to="/profile" class="nav-button block" :class="{ 'active': $route.path === '/profile' }"><i class="fa-solid fa-user-plus"></i> Profile</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

const isSmallScreen = ref(window.innerWidth <= 768);
const showDropdown = ref(false);

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
</script>

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
