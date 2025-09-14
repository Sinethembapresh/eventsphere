'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken } from '@/utils/auth';
import axiosInstance from '@/app/api/axiosInstance';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: any;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  loading: true,
  user: null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Clear any existing auth state on mount
        removeAuthToken();
        setIsAuthenticated(false);
        setUser(null);
        
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get('/auth/verify');
        if (response.data.success) {
          setIsAuthenticated(true);
          setUser(response.data.user);
        } else {
          removeAuthToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        removeAuthToken();
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);