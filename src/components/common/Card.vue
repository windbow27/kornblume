<script setup>
const props = defineProps({
    card: {
        type: Object,
        required: true
    },
    getActivityImagePath: {
        type: Function,
        required: true
    }
});

</script>

<template>
    <div class="card">
        <div class="stage">
            <p>{{ card.stage }}</p>
        </div>
        <div class="calculations">
            <p> {{ card.runs > 0 ? 'x' : '' }}{{ card.runs }} </p>
            <p class="separator">{{ card.runs > 0 ? '|' : '' }}</p>
            <p>{{ card.activity }}</p>
            <img :src="getActivityImagePath(card.stage)" alt="Activity Image" />
            <p class="separator">{{ card.runs > 0 ? '|' : '' }}</p>
            <p>{{ card.days }} {{ card.days === null ? '' : card.days > 1 ? 'days' : 'day' }}</p>
        </div>

        <div class="materials">
            <div v-for="(material, materialIndex) in card.materials" :key="materialIndex" class="image-container">
                <img :src="material.borderImagePath" alt="Border Image" class="border-image" />
                <img :src="material.itemImagePath" alt="Material Image" class="material-image" />
                <p class="quantity">{{ material.quantity }}</p>
            </div>
        </div>
    </div>
</template>

  
<style scoped>
p {
    color: #fff;
    display: block;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.card {
    width: 50%;
    background-color: #26324c;
    border: 1px solid #0077cc;
    border-radius: 0.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stage {
    color: #fff;
    padding: 0.5rem;
}

.calculations {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #0c6ca3;
    color: #fff;
    padding: 0.5rem;
    border-radius: 0.2rem;
}

.calculations .separator {
    margin: 0 0.25rem;
    /* Adjust the spacing as needed */
}

.calculations img {
    display: inline-block;
    vertical-align: middle;
    width: 2rem;
    height: 2rem;
}

.materials img {
    width: 4rem;
    height: 4rem;
}

.materials {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    border-radius: 0.2rem;
}

.image-container {
    position: relative;
    display: inline-block;
    /* Allows for inline positioning */
}

.border-image {
    position: absolute;
}
</style>
