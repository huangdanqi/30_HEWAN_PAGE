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
      },
      {
        path: 'toy-production',
        name: 'ToyProduction',
        component: () => import('../views/ToyProduction.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'product-list',
        name: 'ProductList',
        component: () => import('../views/ProductList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'ip-management',
        name: 'IPManagement',
        component: () => import('../views/IPManagement.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'log-query',
        name: 'LogQuery',
        component: () => import('../views/LogQuery.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'demo-page',
        name: 'DemoPage',
        component: () => import('../views/DemoPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'demo-page-2',
        name: 'DemoPage2',
        component: () => import('../views/DemoPage2.vue'),
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