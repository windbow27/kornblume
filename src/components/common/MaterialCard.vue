<script setup>
import { ref, computed } from 'vue';
import i from '../../../public/data/items.json';
import s from '../../../public/data/stages.json'

const items = ref(i);
const stages = ref(s);

const props = defineProps({
    calcArcanists: {
        type: Array,
        required: true
    }
});



</script>

<template>
    <div>
        <div v-for="(material, index) in calcArcanists" :key="index" class="material-item">
            {{ material.Material }}: {{ material.Quantity }}
        </div>

        <div class="card">
            <div class="stage">
                <p>Stage Name</p>
            </div>

            <div class="calculations">
                <p>Runs</p>
                <p>| Total Energy Needed |</p>
                <p>Days</p>
            </div>

            <div class="materials">
                <img src="path/to/material-image.png" alt="Material Image" />
                <p>Quantity</p>
            </div>
        </div>
    </div>
</template>
  
<style scoped>
p {
    color:#fff;
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.material-item {
    margin-bottom: 8px;
}

.card {
    width: 50%;
    height: 200px;
    background-color: #26324c;
    /* Light blue background */
    border: 1px solid #0077cc;
    /* Border color */
    border-radius: 0.2rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stage {
    color: #fff;
    padding: 0.5rem;
}

.calculations {
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: #0c6ca3;
    color: #fff;
    padding: 0.5rem;
    border-radius: 0.2rem;
}

.materials {
    margin-top: 16px;
}

.calculation-item {
    flex: 1;
    text-align: center;
}

.materials {
    display: flex;
    align-items: center;
    margin-top: 8px;
}

.materials img {
    width: 32px;
    /* Adjust the width as needed */
    height: 32px;
    /* Adjust the height as needed */
    margin-right: 8px;
}</style>