import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type User, type LoginRequest } from '@shared/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user has permission based on role
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    switch (permission) {
      case 'view-gantt':
        return user.role === 'INSPECTOR' || user.role === 'ADMIN';
      case 'view-objects':
        return user.role === 'INSPECTOR' || user.role === 'ADMIN';
      case 'view-chats':
        return user.role === 'INSPECTOR' || user.role === 'CONTRACTOR' || user.role === 'ADMIN';
      case 'create-objects':
        return user.role === 'INSPECTOR' || user.role === 'ADMIN';
      case 'edit-objects':
        return user.role === 'INSPECTOR' || user.role === 'ADMIN';
      default:
        return false;
    }
  };

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  // Check if user is already authenticated on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        // User is not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

