import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// User type without password hash for frontend
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'editor' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Check current authentication status
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['/api/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user state when query data changes
  useEffect(() => {
    if (currentUser !== undefined) {
      setUser(currentUser as User | null);
    }
  }, [currentUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', { email, password });
      return await response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.setQueryData(['/api/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      throw new Error(error.message || '登录失败，请检查邮箱和密码');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ email, name, password }: { email: string; name: string; password: string }) => {
      const response = await apiRequest('POST', '/api/register', { 
        email, 
        name, 
        passwordHash: password // Backend expects this field name
      });
      return await response.json();
    },
    onSuccess: (userData) => {
      setUser(userData);
      queryClient.setQueryData(['/api/user'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      throw new Error(error.message || '注册失败，请检查输入信息');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(['/api/user'], null);
      queryClient.clear(); // Clear all cached data on logout
    },
    onError: (error: any) => {
      console.error('Logout failed:', error);
      // Still clear local state even if logout request fails
      setUser(null);
      queryClient.setQueryData(['/api/user'], null);
      queryClient.clear();
    },
  });

  // Auth helper functions
  const login = async (email: string, password: string) => {
    const userData = await loginMutation.mutateAsync({ email, password });
    return userData;
  };

  const register = async (email: string, name: string, password: string) => {
    const userData = await registerMutation.mutateAsync({ email, name, password });
    return userData;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const hasRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  };

  // Permission helpers based on role
  const canCreate = hasRole(['editor', 'admin']);
  const canEdit = hasRole(['editor', 'admin']);
  const canDelete = hasRole(['editor', 'admin']);
  const isAdmin = hasRole(['admin']);
  const isEditor = hasRole(['editor']);
  const isGuest = hasRole(['guest']);
  
  // More robust authentication check - use query data directly when available
  const isAuthenticated = currentUser ? !!currentUser : !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isEditor,
    isGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for protected routes
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (!isLoading && !isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  return { isAuthenticated, isLoading };
}

// Helper hook for role-based access
export function useRequireRole(roles: string[]) {
  const { hasRole, isLoading, isAuthenticated } = useAuth();
  
  if (!isLoading && (!isAuthenticated || !hasRole(roles))) {
    throw new Error('Insufficient permissions');
  }
  
  return { hasAccess: hasRole(roles), isLoading };
}