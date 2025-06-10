import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/account'
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('../views/Account.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'ota',
        name: 'OTA',
        component: () => import('../views/OTA.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'firmware',
        name: 'Firmware',
        component: () => import('../views/Firmware.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'movement-production',
        name: 'MovementProduction',
        component: () => import('../views/MovementProduction.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'product-management',
        name: 'ProductManagement',
        component: () => import('../views/ProductManagement.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 