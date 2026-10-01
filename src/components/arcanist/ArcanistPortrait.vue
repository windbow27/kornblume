<script setup lang="ts">
import { computed } from 'vue';
import { getArcanistI0ImagePath, getArcanistFramePath, getArcanistAfflatusIconPath } from '@/composables/images';
import type { IArcanist } from '@/types';
import type { OwnershipSource, IArcanistOwnershipEntry } from '@/stores/arcanistOwnershipStore';
import { useArcanistOwnershipStore } from '@/stores/arcanistOwnershipStore';

const props = defineProps({
    arcanist: {
        type: Object as () => IArcanist,
        required: true
    }
});

const ownershipStore = useArcanistOwnershipStore();
const effectiveOwnership = computed<IArcanistOwnershipEntry | undefined>(() => ownershipStore.getEffectiveEntry(props.arcanist.Id));
const ownershipSource = computed<OwnershipSource>(() => (effectiveOwnership.value ? effectiveOwnership.value.source : 'none'));

const ownershipTooltip = computed(() => {
    if (ownershipSource.value === 'manual') {
        return 'Manual';
    }
    if (ownershipSource.value === 'tracker') {
        return 'Tracker';
    }
    return '';
});

const displayPortraitCount = computed(() => {
    if (!effectiveOwnership.value) {
        return null;
    }
    return effectiveOwnership.value.portrait;
});

</script>

<template>
    <div class="p-2.5 relative overflow-hidden group">
        <div class="transform transition-transform duration-500 overflow-hidden">
            <img class="w-16 sm:w-20 aspect-[57/131] object-contain object-center rounded-b-full scale-[1.025] transform transition-transform duration-300 group-hover:scale-125"
                :src="getArcanistI0ImagePath(props.arcanist.Id)" :alt="props.arcanist.Name" />
            <!-- Overlay -->
            <div
                class="overlay absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
            </div>
            <span v-if="displayPortraitCount !== null"
                class="absolute top-0.5 right-1.5 w-auto px-1 text-center text-sm font-bold text-white/90 bg-opacity-50 rounded-md bg-black"
                :title="ownershipTooltip">
                <span>{{ $t('P{portrait}', { portrait: displayPortraitCount }) }}</span>
            </span>
            <img class="absolute top-0 left-0 w-4 opacity-90" :src="getArcanistAfflatusIconPath(props.arcanist.Afflatus)"
                alt="">
            <img class="absolute bottom-0 w-16 sm:w-20 rounded-md" :src="getArcanistFramePath(props.arcanist.Rarity)"
                alt="">
            <span class="absolute bottom-0 w-16 sm:w-20 text-center text-white/90 py-2.5 text-shadow font-bold opacity-95"> {{
                $t(props.arcanist.Name) }} </span>
        </div>
    </div>
</template>

<style scoped>
.transform {
    border: 2px solid transparent;
    box-sizing: border-box;
}

.overlay {
    pointer-events: none;
}
.text-shadow {
    font-size: 0.825rem;
    line-height: 1rem;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
}
/* .transform:hover {
    border-color: white;
    border-radius: 0.5rem;
} */
</style>
