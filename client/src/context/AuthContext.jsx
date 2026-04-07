import { createContext, useState, useCallback, useEffect } from 'react'
import * as authApi from '@/api/auth.api'

export const AuthContext = createContext(null)

const STORAGE_KEY_TOKEN = 'docflow_token'
const STORAGE_KEY_USER  = 'docflow_user'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount and sync with server
  useEffect(() => {
    async function initAuth() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_USER)
        if (raw) setUser(JSON.parse(raw))
        
        const token = localStorage.getItem(STORAGE_KEY_TOKEN)
        if (token) {
          const apiUsers = await import('@/api/users.api')
          const serverUser = await apiUsers.getMe()
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(serverUser))
          setUser(serverUser)
        }
      } catch { 
        /* corrupted storage or auth failed */ 
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const loginWithGoogle = useCallback(async (credential) => {
    const { token, user: userData } = await authApi.googleLogin(credential)
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_USER)
    setUser(null)
  }, [])

  /** Update company data in context after a PUT /users/me */
  const updateUserInContext = useCallback((updatedUser) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  const value = {
    user,
    company: user?.company ?? null,
    isAuthenticated: !!user,
    loading,
    loginWithGoogle,
    logout,
    updateUserInContext,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
