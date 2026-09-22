<script setup lang="ts">
import { computed } from 'vue';
import { useArcanistOwnershipStore } from '@/stores/arcanistOwnershipStore';
import type { OwnershipSource } from '@/stores/arcanistOwnershipStore';
import type { IArcanist } from '@/types';

const props = defineProps<{
    arcanist?: IArcanist;
}>();

const ownershipStore = useArcanistOwnershipStore();
const effectiveEntry = computed(() => ownershipStore.getEffectiveEntry(props.arcanist?.Id ?? -1));
const ownershipSource = computed<OwnershipSource>(() => effectiveEntry.value?.source ?? 'none');
const hasTrackerOwnership = computed(() => {
    if (!props.arcanist) {
        return false;
    }

    return !!ownershipStore.getTrackerEntry(props.arcanist.Id);
});

const isOwnedChecked = computed(() => ownershipSource.value === 'manual');
const ownershipPortraitLabel = computed(() => (
    hasTrackerOwnership.value
        ? 'Overwrite Tracker Ownership - Portrait'
        : 'Owned - Portrait'
));
const portraitValue = computed(() => effectiveEntry.value?.portrait ?? 0);
const isPortraitDisabled = computed(() => ownershipSource.value !== 'manual');

const applyOwnershipUpdate = (updates: { portrait?: number }) => {
    if (!props.arcanist) {
        return;
    }

    ownershipStore.updateEntry(props.arcanist.Id, {
        Id: props.arcanist.Id,
        Name: props.arcanist.Name,
        ...updates,
    });
};

const setOwned = (value: boolean) => {
    if (!props.arcanist) {
        return;
    }

    if (!value) {
        ownershipStore.removeEntry(props.arcanist.Id);
        return;
    }

    ownershipStore.setOwned(props.arcanist.Id, props.arcanist.Name);
};

const setCurrentPortrait = (value: number) => {
    applyOwnershipUpdate({ portrait: value });
};
</script>

<template>
    <div class="mt-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
        <div class="mb-3 flex flex-wrap items-center gap-2">
            <span class="rounded-full border border-slate-600 px-2 py-1 text-xs uppercase tracking-wide text-slate-300">
                Ownership: {{ effectiveEntry ? ownershipSource : 'NONE' }}
            </span>
            <span v-if="effectiveEntry && ownershipSource === 'manual'" class="text-xs text-emerald-400">You set this manually.</span>
            <span v-else-if="effectiveEntry && ownershipSource === 'tracker'" class="text-xs text-sky-400">Showing ownership from summon tracker.</span>
            <span v-else class="text-xs text-slate-400">Ownership is not marked as present.</span>
        </div>
        <div class="flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
                <input
                    type="checkbox"
                    class="checkbox checkbox-info checkbox-sm"
                    :checked="isOwnedChecked"
                    @change="setOwned(($event.target as HTMLInputElement).checked)" />
                <label class="flex items-center gap-2">
                    <span>{{ ownershipPortraitLabel }}</span>
                    <select
                        class="select select-sm w-20 bg-slate-800 text-white"
                        :disabled="isPortraitDisabled"
                        :value="portraitValue"
                        @change="setCurrentPortrait(Number(($event.target as HTMLSelectElement).value))">
                        <option :value="0">0</option>
                        <option :value="1">1</option>
                        <option :value="2">2</option>
                        <option :value="3">3</option>
                        <option :value="4">4</option>
                        <option :value="5">5</option>
                    </select>
                </label>
            </div>
        </div>
    </div>
</template>
