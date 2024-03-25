import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '@/stores/dataStore';
import { useGlobalStore } from '@/stores/global';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
            meta: {
                requiredJson: []
            }
        },
        {
            path: '/arcanists',
            name: 'arcanists',
            component: () => import('@/views/ArcanistsView.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'stages1_4', 'psychubes']
            }
        },
        {
            path: '/items',
            name: 'items',
            component: () => import('@/views/ItemsView.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'stages1_4', 'psychubes', 'formulas']
            }
        },
        {
            path: '/tracker',
            name: 'tracker',
            component: () => import('@/views/TrackerView.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'stages1_4']
            }
        },
        {
            path: '/planner',
            name: 'planner',
            component: () => import('@/views/PlannerView.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'stages1_4', 'stages1_4_greedy', 'shops', 'formulas']
            }
        },
        {
            path: '/stages',
            name: 'stages',
            component: () => import('@/views/StagesView.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'stages1_4']
            }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('@/views/ProfileView.vue'),
            meta: {
                requiredJson: []
            }
        },
        {
            path: '/arcanist-:id',
            name: 'arcanist',
            component: () => import('@/components/arcanist/ArcanistDisplay.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'stages1_4', 'psychubes']
            }
        }
    ]
})

router.beforeEach(async (to) => {
    const dataStore = useDataStore();
    if (to.meta.requiredJson) {
        to.meta.isNavigationPending = true
        await dataStore.checkDataLoaded([...to.meta.requiredJson as string[]]);
    }
})

router.beforeEach((_to, _from, next) => {
    const globalStore = useGlobalStore();
    globalStore.startLoading();
    next();
});

router.afterEach(() => {
    const globalStore = useGlobalStore();
    globalStore.finishLoading();
});

export default router
