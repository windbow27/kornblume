<script setup lang="ts">
import SetOwnedArcanistsList from '@/components/arcanist/SetOwnedArcanistsList.vue';
</script>

<template>
  <div class="container">
    <div class="flex items-center justify-between pb-4">
      <h2 class="text-2xl text-white font-bold">Set owned arcanists</h2>
      <router-link to="/arcanists" class="btn btn-sm btn-outline text-white hover:bg-slate-700">
        Back to arcanists
      </router-link>
    </div>
    <SetOwnedArcanistsList />
  </div>
</template>

<style scoped></style>
