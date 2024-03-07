<script setup lang="ts">
import { ref, computed } from 'vue';
import SelectList from '../common/SelectList.vue';

const props = defineProps({
    settings: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['closeOverlay', 'saveWildernessSettings']);

const selectedDust1 = ref(props.settings.dust1);
const selectedDust2 = ref(props.settings.dust2);
const selectedDust3 = ref(props.settings.dust3);
const selectedGold1 = ref(props.settings.gold1);
const selectedGold2 = ref(props.settings.gold2);
const selectedGold3 = ref(props.settings.gold3);
const vigor = ref(props.settings.vigor);
const lazyModo = ref(props.settings.lazyModo);

const options = [0, 1, 2, 3, 4, 5, 6];
const dustMultiplier = [0, 120, 150, 175, 210, 240, 270];
const goldMultiplier = [0, 60, 75, 80, 96, 108, 120];

const closeOverlay = () => {
    emit('closeOverlay');
};

const handleSelected = (option, label) => {
    switch (label) {
    case 'Dust 1':
        selectedDust1.value = option;
        break;
    case 'Dust 2':
        selectedDust2.value = option;
        break;
    case 'Dust 3':
        selectedDust3.value = option;
        break;
    case 'Gold 1':
        selectedGold1.value = option;
        break;
    case 'Gold 2':
        selectedGold2.value = option;
        break;
    case 'Gold 3':
        selectedGold3.value = option;
        break;
    }
};

const validateVigor = () => {
    const vigorValue = parseInt(vigor.value, 10);
    if (isNaN(vigorValue)) {
        vigor.value = null;
        return;
    }
    if (vigorValue < 0) {
        vigor.value = 0;
        return;
    }
    if (vigorValue > 50) {
        vigor.value = 50;
        return;
    }
    vigor.value = vigorValue;
};

const saveWildernessSettings = () => {
    const settings = {
        dust1: selectedDust1.value,
        dust2: selectedDust2.value,
        dust3: selectedDust3.value,
        gold1: selectedGold1.value,
        gold2: selectedGold2.value,
        gold3: selectedGold3.value,
        vigor: vigor.value,
        lazyModo: lazyModo.value,
        wildernessOutput: wildernessOutput.value
    };
    emit('saveWildernessSettings', settings);
    closeOverlay();
};

const wildernessOutput = computed(() => {
    const valueDust = dustMultiplier[selectedDust1.value] + dustMultiplier[selectedDust2.value] + dustMultiplier[selectedDust3.value];
    const valueGold = goldMultiplier[selectedGold1.value] + goldMultiplier[selectedGold2.value] + goldMultiplier[selectedGold3.value];
    const valueVigor = vigor.value ? parseFloat(vigor.value.toString()) / 100 : 0;
    const valueLazyModo = lazyModo.value ? 20 : 24;
    const resultDust = Math.ceil(valueDust * (1 + valueVigor) * valueLazyModo);
    const resultGold = Math.ceil(valueGold * (1 + valueVigor) * valueLazyModo);
    // console.log(resultDust, resultGold);
    return {
        dust: resultDust,
        gold: resultGold
    };
});

</script>

<template>
  <div class="list-overlay">
    <div class="custom-modal-small h-auto">
      <!-- Close button -->
      <button @click="closeOverlay" class="absolute top-2 right-4 text-white">
        <i class="fas fa-times"></i>
      </button>

      <!-- Selectors -->
      <div class="custom-label text-yellow-100">{{ $t('dust-bell-towers') }}</div>
      <div class="grid grid-cols-3">
        <SelectList class="select-list" :options="options" :selected="selectedDust1" label="Dust 1"
          v-on:update:selected="handleSelected" />
        <SelectList class="select-list" :options="options" :selected="selectedDust2" label="Dust 2"
          v-on:update:selected="handleSelected" />
        <SelectList class="select-list" :options="options" :selected="selectedDust3" label="Dust 3"
          v-on:update:selected="handleSelected" />
      </div>
      <div class="custom-label text-yellow-100">{{ $t('sharpodonty-markets') }}</div>
      <div class="grid grid-cols-3">
        <SelectList class="select-list" :options="options" :selected="selectedGold1" label="Gold 1"
          v-on:update:selected="handleSelected" />
        <SelectList class="select-list" :options="options" :selected="selectedGold2" label="Gold 2"
          v-on:update:selected="handleSelected" />
        <SelectList class="select-list" :options="options" :selected="selectedGold3" label="Gold 3"
          v-on:update:selected="handleSelected" />
      </div>
      <div class="custom-label text-yellow-100">{{ $t('vigor-percent') }}</div>
      <div class="grid grid-cols-2 p-2 items-center">
        <input @input="validateVigor" v-model="vigor" type="text" :placeholder="$t('vigor')"
          class="input input-bordered input-info input-sm mx-10 lg:mx-5 gradient-blue text-center" />
        <div class="tooltip" :data-tip="$t('collect-once-a-day')">
          <div class="form-control">
            <label class="cursor-pointer label justify-center">
              <span class="label-text text-yellow-100 mr-3">{{ $t('lazy-modo') }}</span>
              <input v-model="lazyModo" type="checkbox" :checked="lazyModo" class="checkbox checkbox-info" />
            </label>
          </div>
        </div>
      </div>
      <div class="custom-label text-yellow-100">{{ $t('output') }}</div>
      <div class="grid grid-cols-2 p-2">
        <div class="tooltip" :data-tip="$t('Dust')">
          <label class="flex items-center justify-center gradient-blue text-center rounded-xl mx-5 lg:mx-2 h-8">
            {{ wildernessOutput.dust }}
          </label>
        </div>
        <div class="tooltip" :data-tip="$t('Sharpodonty')">
          <label class="flex items-center justify-center gradient-blue text-center rounded-xl mx-5 lg:mx-2 h-8">
            {{ wildernessOutput.gold }}
          </label>
        </div>
      </div>
      <!-- <p class="text-yellow-100 text-sm text-center p-2">{{ $t('wilderness-output-will-be-considered-for-calculations') }}
      </p> -->
      <div class="flex justify-center">
        <button @click="saveWildernessSettings" class="green-button">{{ $t('save') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-list {
  @apply w-full
}
</style>
