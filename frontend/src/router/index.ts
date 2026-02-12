import { createRouter, createWebHistory } from 'vue-router'
import SiteMap from '@/components/map/SiteMap.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'sitemap',
      component: SiteMap, // Loaded immediately
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      // TRULY LAZY LOADED: Only downloads when user clicks "Dashboard"
      component: () => import('@/components/dashboard/DashboardView.vue'),
    },
  ],
})

export default router
