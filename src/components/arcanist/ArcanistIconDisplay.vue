<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getArcanistIconImagePath } from '@/composables/images';
import { IArcanist } from '@/types';
import { useI18n } from 'vue-i18n';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

const props = defineProps({
    arcanist: {
        type: Object as () => IArcanist,
        required: true
    }
});

const tooltip = ref(null);
const { t } = useI18n();

onMounted(() => {
    tippy(tooltip.value as unknown as Element, {
        content: t(props.arcanist.Name),
        theme: 'daisyui'
    });
});
</script>

<template>
    <div ref="tooltip" class="rounded-md overflow-hidden">
        <div class="avatar">
            <div class="w-10 rounded" :class="{
                'bg-orange-300': props.arcanist.Rarity === 6,
                'bg-yellow-100': props.arcanist.Rarity === 5,
                'bg-purple-400': props.arcanist.Rarity === 4,
                'bg-sky-200': props.arcanist.Rarity === 3,
                'bg-green-200': props.arcanist.Rarity === 2
            }">
                <img :src="getArcanistIconImagePath(props.arcanist.Id)" :alt="props.arcanist.Name" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
