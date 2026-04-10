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
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('subtrack_user');
    if (storedUser) {
      try {
        const parsed: User = JSON.parse(storedUser);
        // If the stored user is missing the role field (old session), refresh from API
        if (!parsed.role) {
          const token = getToken();
          if (token) {
            authApi.me().then(res => {
              const freshUser = res.data.data;
              setUser(freshUser);
              localStorage.setItem('subtrack_user', JSON.stringify(freshUser));
            }).catch(() => {
              setUser(parsed);
            }).finally(() => setIsInitializing(false));
            return;
          }
        } else {
          setUser(parsed);
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
      }
    }
    setIsInitializing(false);
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('subtrack_token');
    localStorage.removeItem('subtrack_user');
    router.push('/login');
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
