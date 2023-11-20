<script setup>
import { ref } from 'vue';
import ArcanistOverlay from './ArcanistOverlay.vue';

const selectedArcanists = ref([]);

const isAddingArcanist = ref(false);

const startAddingArcanist = () => {
    isAddingArcanist.value = true;
};

const closeOverlay = () => {
    isAddingArcanist.value = false;
};

const getArcanistImagePath = (id) => {
    return `/images/arcanists/icon/${id}.png`;
};

</script>

<template>
    <div class="arcanist-container">
        <h2>Planner</h2>
        <div class="arcanist-icon">
            <div v-for="arc in selectedArcanists" :key="arc.Id">
                <img :src="getArcanistImagePath(arc.Id)" alt="Arcanist Image" />
            </div>
        </div>
        <button class="add-arcanist" @click="startAddingArcanist">Add Arcanist</button>
        <button class="add-psychube">Add Psychube</button>
        <ArcanistOverlay v-if="isAddingArcanist" :selectedArcanists="selectedArcanists" @closeOverlay="closeOverlay" />
    </div>
</template>

<style scoped> .arcanist-container {
     max-width: 800px;
     margin: 0 auto;
     padding: 20px;
     text-align: center;
 }

 .arcanist-icon {
     display: flex;
     justify-content: center;
     gap: 10px;
     margin-bottom: 20px;
 }

 .arcanist-icon img {
     width: 50px;
     height: 50px;
     border-radius: 50%;
 }

 h2 {
     font-size: 24px;
     margin-bottom: 20px;
 }

 button {
     background-color: rgb(72, 194, 235);
     color: #fff;
     padding: 10px;
     margin: 5px;
     border: none;
     cursor: pointer;
     font-size: 14px;
 }
</style>