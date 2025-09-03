import { ref, onMounted, onUnmounted } from 'vue';

export const MENU_BREAKPOINT = 1024;

export function useScreen() {
    const isLargeScreen = ref(window.innerWidth >= MENU_BREAKPOINT);
    const hasFinePointer = ref(window.matchMedia('(pointer: fine)').matches);

    const updateScreenSize = () => {
        isLargeScreen.value = window.innerWidth >= MENU_BREAKPOINT;
        hasFinePointer.value = window.matchMedia('(pointer: fine)').matches;
    };

    onMounted(() => window.addEventListener('resize', updateScreenSize));
    onUnmounted(() => window.removeEventListener('resize', updateScreenSize));

    return { isLargeScreen, hasFinePointer };
}
