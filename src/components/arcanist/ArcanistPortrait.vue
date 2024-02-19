<script setup lang="ts">
const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    },
    count: {
        type: Number,
        required: true
    }
});

const getArcanistImagePath = (id: string) => {
    return `images/arcanists/i0/${id}.png`;
};

const getArcanistFramePath = (rarity: number) => {
    return `images/arcanists/misc/bg${rarity}.png`;
};

const getArcanistAfflatusPath = (afflatus: string) => {
    afflatus = afflatus.toLowerCase();
    return `images/arcanists/misc/${afflatus}.png`;
};

</script>

<template>
    <div class="p-2.5 relative overflow-hidden group">
        <div class="transform transition-transform duration-500 overflow-hidden">
            <img class="w-16 sm:w-20 rounded-b-full scale-[1.025] transform transition-transform duration-300 group-hover:scale-125"
                :src="getArcanistImagePath(props.arcanist.Id)" :alt="props.arcanist.Name" />
            <!-- Overlay -->
            <div
                class="overlay absolute inset-0 bg-gray-500 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
            </div>
            <span v-if="count >= 0"
                class="absolute top-0.5 right-1.5 w-auto px-1 text-center text-sm font-bold text-white/90 bg-opacity-50 rounded-md bg-black">
                <i18n-t keypath='P{portrait}'>
                    <template #portrait>
                        <span> {{ props.count }}</span>
                    </template>
                </i18n-t>
            </span>
            <img class="absolute top-0 left-1 w-4 opacity-90" :src="getArcanistAfflatusPath(props.arcanist.Afflatus)"
                alt="">
            <img class="absolute bottom-0 w-16 sm:w-20 rounded-md" :src="getArcanistFramePath(props.arcanist.Rarity)"
                alt="">
            <span class="absolute bottom-0 w-16 sm:w-20 text-center text-white/90 py-2.5 text-shadow font-bold opacity-95"> {{
                props.arcanist.Name }} </span>
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
.transform:hover {
    border-color: white;
    border-radius: 0.5rem;
}
</style>
