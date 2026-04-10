'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { authApi } from '@/lib/services';
import { getToken } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isInitializing: boolean;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('subtrack_user');
    const token = getToken();

    // 1. Load from cache immediately for fast UI
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        setUser(parsed);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }

    // 2. Always sync with backend to get latest plan/role status
    if (token || storedUser) {
      authApi.me().then(res => {
        const freshUser = res.data.data;
        setUser(freshUser);
        localStorage.setItem('subtrack_user', JSON.stringify(freshUser));
      }).catch(err => {
        console.error('Failed to sync user state', err);
      }).finally(() => {
        setIsInitializing(false);
      });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout API failed', err);
    } finally {
      setUser(null);
      localStorage.removeItem('subtrack_token');
      localStorage.removeItem('subtrack_user');
      document.cookie = 'subtrack_refresh=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.push('/login');
    }
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('subtrack_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isInitializing, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
