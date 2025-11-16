'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loadUserFromSession, logout as authLogout, setCurrentUser, type User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário da sessão do Supabase na montagem
    const loadUser = async () => {
      try {
        const currentUser = await loadUserFromSession();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (user: User) => {
    setUser(user);
    setCurrentUser(user);
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setCurrentUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
