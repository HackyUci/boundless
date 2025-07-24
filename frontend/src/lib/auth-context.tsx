"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"

interface DecodedToken {
  exp: number;
  uid: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean
  isLoading: boolean
  user: DecodedToken | null
  logout: () => void
  login: (token: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<DecodedToken | null>(null)
  const router = useRouter()

  const checkAuthStatus = () => {
    try {
      const cookies = document.cookie.split(';')
      const authTokenCookie = cookies.find(cookie => 
        cookie.trim().startsWith('authToken=')
      )
      
      if (!authTokenCookie) {
        setIsLoggedIn(false)
        setUser(null)
        return
      }

      const token = authTokenCookie.split('=')[1]
      
      if (!token) {
        setIsLoggedIn(false)
        setUser(null)
        return
      }

      const decoded = jwtDecode<DecodedToken>(token)
      
      if (Date.now() >= decoded.exp * 1000) {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        setIsLoggedIn(false)
        setUser(null)
      } else {
        setIsLoggedIn(true)
        setUser(decoded)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuthStatus()
    setIsLoading(false)

    if (typeof window !== 'undefined' && !window.__authCheckInterval) {
      window.__authCheckInterval = setInterval(checkAuthStatus, 60000)
    }

    return () => {
      if (typeof window !== 'undefined' && window.__authCheckInterval) {
        clearInterval(window.__authCheckInterval)
        window.__authCheckInterval = null
      }
    }
  }, [])

  const logout = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    setIsLoggedIn(false)
    setUser(null)
    router.push('/')
  }

  const login = (token: string) => {
    document.cookie = `authToken=${token}; path=/`
    checkAuthStatus()
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, user, logout, login }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}