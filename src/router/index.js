import { createRouter, createWebHistory } from 'vue-router'
import { useDataStore } from '../stores/DataStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component:() => import('../views/HomeView.vue'),
      meta: {
        requiredJson: ['arcanists', 'calculations', 'crafts', 'items', 'stages']
      }
    },
    {
      path: '/about',
      name: 'about',
      component:() => import('../views/AboutView.vue'),
      meta: {
        requiredJson: ['arcanists', 'calculations', 'crafts', 'items', 'stages']
      }
    },
    {
      path: '/planner',
      name: 'planner',
      component:() => import('../views/PlannerView.vue'),
      meta: {
        requiredJson: ['arcanists', 'calculations', 'crafts', 'items', 'stages']
      }
    }
  ]
})

router.beforeEach(async (to) => {
  const dataStore = useDataStore();
  if (to.meta.requiredJson) {
      await useDataStore().ensureData(...to.meta.requiredJson);
  }
})

export default router
