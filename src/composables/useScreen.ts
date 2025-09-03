import { ref, onMounted, onUnmounted } from 'vue';

export const MENU_BREAKPOINT = 1024;

export function useScreen() {
    const isLargeScreen = ref(window.innerWidth >= MENU_BREAKPOINT);

    const updateScreenSize = () => {
        isLargeScreen.value = window.innerWidth >= MENU_BREAKPOINT;
    };

    onMounted(() => window.addEventListener('resize', updateScreenSize));
    onUnmounted(() => window.removeEventListener('resize', updateScreenSize));

    return { isLargeScreen };
}
