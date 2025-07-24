"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode"
import Cookies from "js-cookie"

interface DecodedToken {
  exp: number;
  user_id: string;
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

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = Cookies.get('authToken');
        
        if (!token) {
          setIsLoggedIn(false);
          setUser(null);
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        
        if (Date.now() >= decoded.exp * 1000) {
          logout(); // Token is expired, so log out
        } else {
          setIsLoggedIn(true);
          setUser(decoded);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout(); // If any error occurs, treat as logged out
      } finally {
        if (isLoading) {
          setIsLoading(false);
        }
      }
    };

    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 60000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const logout = () => {
    Cookies.remove('authToken', { path: '/' });
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      Cookies.set('authToken', token, { 
        path: '/',
        expires: new Date(decoded.exp * 1000) 
      });
      setIsLoggedIn(true);
      setUser(decoded);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
    }
  };

  const value = { isLoggedIn, isLoading, user, logout, login };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until the initial auth check is done */}
      {!isLoading && children}
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