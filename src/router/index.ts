import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '../stores/dataStore';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue'),
            meta: {
                requiredJson: []
            }
        },
        {
            path: '/tracker',
            name: 'tracker',
            component: () => import('../views/TrackerView.vue'),
            meta: {
                requiredJson: ['arcanists']
            }
        },
        {
            path: '/planner',
            name: 'planner',
            component: () => import('../views/PlannerView.vue'),
            meta: {
                requiredJson: ['arcanists', 'items', 'shops', 'formulas', 'stages', 'stages1_4', 'stages_greedy', 'stages1_4_greedy']
            }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue'),
            meta: {
                requiredJson: []
            }
        }
    ]
})

router.beforeEach(async (to) => {
    const dataStore = useDataStore();
    if (to.meta.requiredJson) {
        await dataStore.checkDataLoaded([...to.meta.requiredJson as string[]]);
    }
})

export default router
