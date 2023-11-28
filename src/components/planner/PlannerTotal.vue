<script setup>
const props = defineProps({
    totalActivityAndDays: {
        type: Array,
        required: true,
    },
});

</script>

<template>
    <div class="flex items-start justify-between mb-2 mt-2 flex-wrap">
        <div class="flex custom-gradient-gray-blue-light py-3 pl-4 pr-3 rounded-md items-center">
            <i class="fa-solid fa-calculator text-white mr-3"></i>
            <div class="border-blue-700/90 border-l pl-3 text-sm text-white">{{ totalActivityAndDays[0] }}</div>
            <div class="avatar">
                <div class="w-8 rounded">
                    <img src="/images/items/common/0.png" alt="avatar" />
                </div>
            </div>
            <div class="border-blue-700/90 border-l pl-3 text-sm text-white">
                {{ totalActivityAndDays[1] }} {{ totalActivityAndDays[1] > 1 ? "days" : "day" }}</div>
        </div>
    </div>
</template>


<style scoped></style>
