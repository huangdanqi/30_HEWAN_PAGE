import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiService from '@/utils/api'
import type { Router } from 'vue-router'

interface LoginResponseData {
  token: string;
  user: any; // You might want to define a more specific type for user
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any | null>(null)
  const loading = ref(false)

  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      const response = await apiService.login({ username, password }) as unknown as LoginResponseData
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = (router: Router) => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  }
}) 