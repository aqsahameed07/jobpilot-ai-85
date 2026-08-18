import api from '@/lib/api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyData {
  email: string;
  code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  profileImage?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

class AuthService {
  // Register user
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  // Login user
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }

  // Verify email
  async verifyEmail(data: VerifyData): Promise<AuthResponse> {
    const response = await api.post('/auth/verify', data);
    return response.data;
  }

  // Resend verification code
  async resendVerification(email: string): Promise<AuthResponse> {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  }

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  // ✅ FIX: Check if running in browser before using localStorage
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Logout (client side)
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem('token');
  }

  // Get stored user
  getStoredUser(): User | null {
    if (!this.isBrowser()) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getStoredToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  // Set auth data
  setAuth(token: string, user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
export default authService;