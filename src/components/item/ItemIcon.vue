<script setup>
import { ref, computed } from 'vue';
import i from '../../../public/data/items.json'

const items = ref(i);

const props = defineProps({
    material: {
        type: Object,
        required: true
    }
});

const processMaterial = computed(() => {
    const mat = props.material;
    const result = {
        material: mat.Material,
        quantity: mat.Quantity,
        itemImagePath: getItemImagePath(mat.Material),
        borderImagePath: getBorderImagePath(mat.Material),
    }
    return result;
});

const getId = (material) => {
    const item = items.value.find(item => item.Name == material);
    return item ? item.Id : null;
};

const getRarity = (material) => {
    const item = items.value.find(item => item.Name == material);
    return item ? item.Rarity : null;
};

const getItemImagePath = (material) => {
    const id = getId(material);
    return id ? `/images/items/icon/${id}.png` : null;
};

const getBorderImagePath = (material) => {
    const rarity = getRarity(material);
    return rarity ? `/images/items/border/${rarity}.png` : null;
};

const formatQuantity = (quantity) => {
    if (quantity > 10000) {
        return `${(quantity / 1000).toFixed(0)}k`;
    } else {
        return quantity.toString();
    }
};

</script>

<template>
    <div class="image-container relative inline-block">
        <img :src="processMaterial.borderImagePath" alt="Border Image" class=" w-20 h-20 absolute" />
        <img :src="processMaterial.itemImagePath" alt="Material Image" class="w-20 h-20" />
        <div class="absolute text-white bottom-4 right-3 bg-gray-700 rounded-tl px-1 py-px text-xs">
            {{ formatQuantity(processMaterial.quantity) }}
        </div>
    </div>
</template>
  
<style scoped></style>
  