/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react'
import { authApi, setAuthToken } from '../services/api'
import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'retech-auth-token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)
    setAuthToken(null)
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    setAuthToken(token)
    authApi.me().then(setUser).catch(logout).finally(() => setLoading(false))
  }, [logout, token])

  const authenticate = async (action, credentials) => {
    const result = await action(credentials)
    window.localStorage.setItem(TOKEN_KEY, result.token)
    setAuthToken(result.token)
    setToken(result.token)
    setUser(result.user)
    return result.user
  }

  const login = (credentials) => authenticate(authApi.login, credentials)
  const register = (credentials) => authenticate(authApi.register, credentials)

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>
}
