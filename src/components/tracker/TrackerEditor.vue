<script setup lang="ts">
// import { IPull } from '@/stores/pullsRecordStore';

// const props = defineProps({
//     pulls: {
//         type: Array as () => IPull[],
//         required: true
//     }
// });
</script>

<template>
    <div class="flex space-x-5 justify-center pb-4">
        <button class="blue-button">Add Pull</button>
        <button class="green-button">{{ $t('save') }}</button>
    </div>
    <table class="table-auto max-w-2xl w-full text-white lg:mx-auto">
        <thead>
            <tr>
                <th class="text-left pl-20">{{ $t('arcanist') }}</th>
                <th class="text-center mx-4">{{ $t('banner') }}</th>
                <th class="text-center mx-4">{{ $t('date') }}</th>
            </tr>
        </thead>

    </table>
</template>

<style scoped></style>
