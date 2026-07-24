<script setup lang="ts">
import { ref, computed, nextTick, PropType } from 'vue';
import { onClickOutside, useEventListener } from '@vueuse/core';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array as PropType<string[]>,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  searchPlaceholder: {
    type: String,
    default: 'Search'
  },
  noResultsText: {
    type: String,
    default: 'No results'
  },
  optionLabel: {
    type: Function as PropType<(option: string) => string>,
    default: (option: string) => option
  }
});

const emit = defineEmits(['update:modelValue']);

const dropdownHeight = 300;

const isOpen = ref(false);
const query = ref('');
const highlighted = ref(0);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

const filteredOptions = computed(() => {
  const search = query.value.trim().toLowerCase();
  if (!search) {
    return props.options;
  }
  return props.options.filter((option) => props.optionLabel(option).toLowerCase().includes(search));
});

// The dropdown is teleported to the body so it can escape the scrolling table,
// which means it has to be positioned against the trigger by hand.
const updatePosition = () => {
  const trigger = triggerRef.value;
  if (!trigger) {
    return;
  }
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const dropUp = spaceBelow < dropdownHeight && rect.top > spaceBelow;

  dropdownStyle.value = {
    top: `${dropUp ? rect.top - 4 : rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    transform: dropUp ? 'translateY(-100%)' : '',
    maxHeight: `${Math.min(dropdownHeight, (dropUp ? rect.top : spaceBelow) - 12)}px`
  };
};

const scrollHighlightedIntoView = () => {
  const option = listRef.value?.children[highlighted.value] as HTMLElement | undefined;
  option?.scrollIntoView({ block: 'nearest' });
};

const close = () => {
  isOpen.value = false;
};

const open = async () => {
  isOpen.value = true;
  query.value = '';
  highlighted.value = Math.max(0, props.options.indexOf(props.modelValue));
  updatePosition();
  await nextTick();
  searchRef.value?.focus();
  scrollHighlightedIntoView();
};

const toggle = () => {
  if (isOpen.value) {
    close();
  } else {
    open();
  }
};

const select = (option: string) => {
  emit('update:modelValue', option);
  close();
  triggerRef.value?.focus();
};

const moveHighlight = async (offset: number) => {
  const count = filteredOptions.value.length;
  if (count === 0) {
    return;
  }
  highlighted.value = (highlighted.value + offset + count) % count;
  await nextTick();
  scrollHighlightedIntoView();
};

const onKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveHighlight(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveHighlight(-1);
      break;
    case 'Enter': {
      event.preventDefault();
      const option = filteredOptions.value[highlighted.value];
      if (option !== undefined) {
        select(option);
      }
      break;
    }
    case 'Escape':
      event.preventDefault();
      close();
      triggerRef.value?.focus();
      break;
  }
};

onClickOutside(dropdownRef, close, { ignore: [triggerRef] });

useEventListener(window, 'scroll', () => isOpen.value && updatePosition(), true);
useEventListener(window, 'resize', () => isOpen.value && updatePosition());
</script>

<template>
  <div class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="flex items-center justify-between w-full h-9 px-3 text-sm text-left rounded-[4px] bg-[#212121] border hover:border-white/50 focus:outline-none"
      :class="isOpen ? 'border-white/50' : 'border-white/5'"
      @click="toggle"
      @keydown.down.prevent="open()">
      <span class="truncate" :class="{ 'text-white/40': !modelValue }">
        {{ modelValue ? optionLabel(modelValue) : placeholder }}
      </span>
      <i class="fa-solid fa-chevron-down text-[10px] text-white/50 ms-2 shrink-0"></i>
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="fixed z-[100] flex flex-col rounded-[4px] bg-[#212121] border border-white/10 shadow-lg shadow-black/50 overflow-hidden"
        :style="dropdownStyle">
        <div class="p-2 border-b border-white/10">
          <input
            ref="searchRef"
            v-model="query"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full h-8 px-2 text-sm rounded-[4px] bg-[#2b2b2b] border border-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-info/70"
            @keydown="onKeydown" />
        </div>
        <ul ref="listRef" class="overflow-y-auto py-1 text-sm text-white">
          <li v-for="(option, index) in filteredOptions" :key="option">
            <button
              type="button"
              class="w-full px-3 py-1.5 text-left truncate"
              :class="[
                index === highlighted ? 'bg-white/10' : '',
                option === modelValue ? 'text-info' : ''
              ]"
              @click="select(option)"
              @mousemove="highlighted = index">
              {{ optionLabel(option) }}
            </button>
          </li>
          <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-white/40">
            {{ noResultsText }}
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<style scoped></style>
