<script setup>

const props = defineProps(['selectedArcanists']);

const getArcanistImagePath = (id) => {
    return `/images/arcanists/icon/${id}.png`;
};

</script>

<template>
    <div>
      <div v-for="item in props.selectedArcanists" :key="item.arc.Id">
        <img :src="item.imageSrc" alt="Arcanist Image" />
      </div>
    </div>
  </template>
 
<style scoped>
  img {
    width: 50px; 
    height: 50px; 
    border-radius: 50%;
  }
</style>
  