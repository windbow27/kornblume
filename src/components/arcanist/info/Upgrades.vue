<script setup lang="ts">
import Text from '@/components/arcanist/info/img/Text.vue';

const props = defineProps({
    arcanist: {
        type: Object,
        required: true
    }
});

</script>

<template>
    <div class="px-2">
        <h2 class=" text-white text-2xl font-bold">Upgrades</h2>
        <div class="p-2">
            <p class="text-white"> {{ props.arcanist.InsightEffects.Name }}</p>
            <table>
                <tr>
                    <td><img class="p-2" src="/images/items/common/insight1.webp"></td>
                    <td><Text :effect="props.arcanist.InsightEffects.Effect1" /></td>
                </tr>
                <tr>
                    <td><img class="p-2" src="/images/items/common/insight2.webp"></td>
                    <td><Text :effect="props.arcanist.InsightEffects.Effect2" /></td>
                </tr>
                <tr>
                    <td><img class="p-2" src="/images/items/common/insight3.webp"></td>
                    <td><Text :effect="props.arcanist.InsightEffects.Effect3" /></td>
                </tr>
                </table>
        </div>
        <div class="p-2">
            <p class="text-white"> Portrait </p>
            <table>
                <tr>
                    <td class="insight">Lv. 1</td>
                    <td><Text :effect="props.arcanist.PortraitEffects.Effect1" /></td>
                </tr>
                <tr>
                    <td class="insight">Lv. 2</td>
                    <td><Text :effect="props.arcanist.PortraitEffects.Effect2" /></td>
                </tr>
                <tr>
                    <td class="insight">Lv. 3</td>
                    <td><Text :effect="props.arcanist.PortraitEffects.Effect3" /></td>
                </tr>
                <tr>
                    <td class="insight">Lv. 4</td>
                    <td><Text :effect="props.arcanist.PortraitEffects.Effect4" /></td>
                </tr>
                <tr>
                    <td class="insight">Lv. 5</td>
                    <td><Text :effect="props.arcanist.PortraitEffects.Effect5" /></td>
                </tr>
                </table>
        </div>
    </div>
</template>

<style scoped>
.insight {
   @apply text-white text-sm whitespace-nowrap p-2;
}
</style>
