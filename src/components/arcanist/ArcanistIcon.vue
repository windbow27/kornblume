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
    },
    isInteractive: {
        // Controls interactive features: tool-tip and link
        // This is used when we don't want a user making edits to lose their work
        type: Boolean,
        default: true
    }
});

const tooltip = ref(null);
const { t } = useI18n();

onMounted(() => {
    if (props.isInteractive) {
        tippy(tooltip.value as unknown as Element, {
            content: t(props.arcanist.Name),
            theme: 'daisyui'
        });
    }
});
</script>

<template>
    <div ref="tooltip" :class="{ 'cursor-pointer': isInteractive }">
        <component :is="isInteractive ? 'router-link' : 'div'" :to="isInteractive ? `/arcanist-${props.arcanist.Id}` : null">
            <div class="rounded-md overflow-hidden">
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
        </component>
    </div>
</template>

<style scoped></style>
