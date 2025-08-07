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

  // Initialize user data from localStorage if token exists
  const initializeUser = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        // Fallback to dummy user
        const dummyUser = {
          id: 1,
          username: 'demo_user',
          name: 'demo_user',
          role: 'admin'
        }
        user.value = dummyUser
      }
    }
  }

  // Initialize user on store creation
  initializeUser()

  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      // For demo purposes, accept any non-empty username and password
      // In production, this would call the real API
      if (username && password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create a dummy token and user data
        const dummyToken = `dummy-token-${Date.now()}`
        const dummyUser = {
          id: 1,
          username: username,
          name: username, // Use the actual username instead of hardcoded "管理员"
          role: 'admin'
        }
        
        token.value = dummyToken
        user.value = dummyUser
        localStorage.setItem('token', dummyToken)
        localStorage.setItem('user', JSON.stringify(dummyUser)) // Store user data
        return true
      } else {
        return false
      }
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
    localStorage.removeItem('user') // Remove user data
    router.push('/login')
  }

  const isAuthenticated = () => {
    return !!token.value && !!user.value
  }

  // Method to manually set logged-in state for testing
  const setLoggedInState = (username: string) => {
    const dummyToken = `dummy-token-${Date.now()}`
    const dummyUser = {
      id: 1,
      username: username,
      name: username,
      role: 'admin'
    }
    
    token.value = dummyToken
    user.value = dummyUser
    localStorage.setItem('token', dummyToken)
    localStorage.setItem('user', JSON.stringify(dummyUser))
  }

  return {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    setLoggedInState,
  }
}) 