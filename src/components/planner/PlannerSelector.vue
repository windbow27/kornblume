<script setup>
import ArcanistIconToggle from '../arcanist/ArcanistIconToggle.vue';
import { ref } from 'vue';

const props = defineProps({
    selectedArcanists: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['open-edit-overlay']);

const arcanists = ref(props.selectedArcanists);

const handleLeftClick = (arcanist) => {
    emit('open-edit-overlay', arcanist);
};

const handleRightClick = (arcanist) => {
    //console.log('right clicked');
    arcanist.isVisible = !arcanist.isVisible;
};
</script>
  
<template>
    <div>
        <div class="flex flex-row flex-wrap justify-center space-x-2">
            <ArcanistIconToggle v-for="arcanist in arcanists" :key="arcanist.Name" :arcanist="arcanist.info"
                :visible="arcanist.isVisible" 
                @click="handleLeftClick(arcanist)"
                @contextmenu.prevent="handleRightClick(arcanist)"/>
        </div>
        <p class="text-center text-slate-700 text-sm opacity-80">Left click to edit, right click to show / hide.</p>
    </div>
</template>

<style scoped></style>
  