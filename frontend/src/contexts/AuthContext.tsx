import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  name: string; 
  email: string;
  role: string;
  isVerified: boolean;
  profileImage?: string;
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  googleLogin: () => void;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:5000/api';

// ✅ Helper to check if running in browser
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (!isBrowser) {
      setIsLoading(false);
      return;
    }

    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const setAuth = (newToken: string, newUser: User) => {
    if (!isBrowser) return;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    setAuth(token, user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  };

  const verifyEmail = async (email: string, code: string) => {
    const response = await api.post('/auth/verify', { email, code });
    const { token, user } = response.data;
    setAuth(token, user);
  };

  const resendVerification = async (email: string) => {
    await api.post('/auth/resend-verification', { email });
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    const { token, user } = response.data;
    setAuth(token, user);
    return response.data;
  };

  const googleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    if (isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        googleLogin,
        logout,
        setAuth,
      }}
    >
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