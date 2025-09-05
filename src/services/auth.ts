import api, { endpoints } from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    // Login uses form-data format for OAuth2
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<AuthResponse>(endpoints.auth.login, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token } = response.data;
    
    // Store token
    localStorage.setItem('authToken', access_token);
    
    // Get user profile
    const userResponse = await api.get<User>(endpoints.auth.profile);
    const user = userResponse.data;
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  async logout(): Promise<void> {
    try {
      await api.post(endpoints.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await api.post<{ token: string }>(endpoints.auth.refresh);
      const { token } = response.data;
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const response = await api.get<User>(endpoints.auth.profile);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export default new AuthService();