import { useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

// ✅ Helper to check if running in browser
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export const useAuth = () => {
  const { user, token, isLoading, setAuth, logout: contextLogout } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register user
  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register({ name, email, password });
      if (response.success) {
        toast.success(response.message || 'Registration successful! Check your email for verification code.');
        return response;
      } else {
        toast.error(response.message || 'Registration failed');
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.token && response.user) {
        setAuth(response.token, response.user);
        toast.success('Welcome back! 🎉');
        return response;
      } else {
        toast.error(response.message || 'Login failed');
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // Verify email
  const verifyEmail = useCallback(async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail({ email, code });
      if (response.success && response.token && response.user) {
        setAuth(response.token, response.user);
        toast.success('Email verified successfully! 🎉');
        return response;
      } else {
        toast.error(response.message || 'Verification failed');
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Verification failed';
      toast.error(message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // Resend verification
  const resendVerification = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resendVerification(email);
      if (response.success) {
        toast.success('New verification code sent!');
        return response;
      } else {
        toast.error(response.message || 'Failed to resend code');
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to resend code';
      toast.error(message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.forgotPassword({ email });
      if (response.success) {
        toast.success('Reset code sent to your email!');
        return response;
      } else {
        toast.error(response.message || 'Failed to send reset code');
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to send reset code';
      toast.error(message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.resetPassword({ email, code, newPassword });
      if (response.success && response.token && response.user) {
        setAuth(response.token, response.user);
        toast.success('Password reset successfully! 🎉');
        return response;
      } else {
        toast.error(response.message || 'Failed to reset password');
        setError(response.message);
        return null;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setAuth]);

  // Google login
  const googleLogin = useCallback(() => {
    if (!isBrowser) return;
    authService.logout();
    window.location.href = `${import.meta.env['VITE_API_URL'] || 'http://localhost:5000/api'}/auth/google`;
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    authService.logout();
    contextLogout();
    toast.info('Logged out');
  }, [contextLogout]);

  // ✅ Only check authentication on client side
  const isAuthenticated = isBrowser ? authService.isAuthenticated() : false;

  return {
    user,
    token,
    isLoading,
    loading,
    error,
    register,
    login,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    googleLogin,
    logout: handleLogout,
    isAuthenticated,
  };
};

export default useAuth;