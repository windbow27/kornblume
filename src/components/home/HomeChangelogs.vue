<script setup lang="ts">
import { changelogs } from '@/utils/changelogs';

const emit = defineEmits(['closeOverlay']);

const closeOverlay = () => {
    emit('closeOverlay');
};
</script>

<template>
    <div class="list-overlay">
        <div class="custom-modal-big h-2/3 lg:h-1/2 relative">
            <div class="absolute top-0 left-0 right-0 p-4 custom-gradient-gray-blue">
                <button @click="closeOverlay" class="absolute top-5 right-7 text-white">
                    <i class="fas fa-times"></i>
                </button>
                <h1 class="text-white font-bold text-2xl p-2">{{ $t('changelogs') }}</h1>
            </div>

            <ul class="text-white space-y-5 pt-12 overflow-y-auto h-full">
                <li v-for="(log, index) in changelogs" :key="index">
                    <p class="text-sky-300">{{ log.date }}:</p>
                    <ul>
                        <li
                            v-for="(line, lineIndex) in log.description.split('<br>')"
                            :key="lineIndex"
                            class="text-sm"
                            v-html="line"></li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped></style>
