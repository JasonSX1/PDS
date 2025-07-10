import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '@/pages/Dashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DashboardView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
