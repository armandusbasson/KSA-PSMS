import client from './client';

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreateUserInput {
  username: string;
  password: string;
  email?: string;
  full_name?: string;
  role: 'admin' | 'manager' | 'user';
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  full_name?: string;
  role?: 'admin' | 'manager' | 'user';
  is_active?: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await client.post('/api/auth/login', credentials);
    const data = response.data as LoginResponse;
    
    // Store token and user in localStorage
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    // Update axios default headers
    client.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
    
    return data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete client.defaults.headers.common['Authorization'];
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await client.get('/api/auth/me');
    return response.data;
  },

  async updateCurrentUser(data: { email?: string; full_name?: string }): Promise<User> {
    const response = await client.put('/api/auth/me', data);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await client.put('/api/auth/me/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Admin functions
  async getUsers(): Promise<User[]> {
    const response = await client.get('/api/auth/users');
    return response.data;
  },

  async createUser(user: CreateUserInput): Promise<User> {
    const response = await client.post('/api/auth/users', user);
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await client.get(`/api/auth/users/${id}`);
    return response.data;
  },

  async updateUser(id: number, data: UpdateUserInput): Promise<User> {
    const response = await client.put(`/api/auth/users/${id}`, data);
    return response.data;
  },

  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    await client.put(`/api/auth/users/${id}/password`, {
      new_password: newPassword,
    });
  },

  async deleteUser(id: number): Promise<void> {
    await client.delete(`/api/auth/users/${id}`);
  },
};
