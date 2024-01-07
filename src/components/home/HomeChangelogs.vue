<script setup>
import { changelogs } from '@/utils/changelogs.ts';

const emit = defineEmits({
    closeOverlay: {
        type: Function,
        required: true
    }
});

const closeOverlay = () => {
    emit('closeOverlay');
};

</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-small h-2/3 lg:h-1/2 overflow-y-scroll hidden-scrollbar">
            <button @click="closeOverlay" class="absolute top-2 right-2 text-white">
                <i class="fas fa-times"></i>
            </button>
            <h1 class="text-white font-bold text-2xl pb-2">{{ $t('changelogs') }}</h1>

            <ul class="text-white space-y-5">
                <li v-for="(log, index) in changelogs" :key="index">
                    <p class="text-sky-300">{{ log.date }}:</p>
                    <ul>
                        <li v-for="(line, lineIndex) in log.description.split('\n')" :key="lineIndex" class="text-sm">{{
                            line }}</li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped></style>
