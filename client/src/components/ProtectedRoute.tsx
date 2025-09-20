import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRoles?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireRoles = [], 
  fallback 
}: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();

  // Auto-redirect to login with returnTo parameter
  useEffect(() => {
    // Only redirect if we're NOT loading AND require auth AND not authenticated
    if (!isLoading && requireAuth && !isAuthenticated) {
      const returnTo = encodeURIComponent(location);
      console.log('AuthRoute redirecting to login from:', location); // Debug log
      setLocation(`/login?returnTo=${returnTo}`);
    }
  }, [isLoading, requireAuth, isAuthenticated, location, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">需要登录</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  请登录后访问此页面
                </p>
              </div>
              <Button 
                onClick={() => setLocation('/login')} 
                className="w-full"
                data-testid="button-login-required"
              >
                前往登录
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirements
  if (requireRoles.length > 0 && (!user || !hasRole(requireRoles))) {
    if (fallback) {
      return <>{fallback}</>;
    }

    const userRole = user?.role || 'guest';
    const roleMap = {
      guest: '访客',
      editor: '编辑员', 
      admin: '管理员'
    };

    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">权限不足</h3>
                <div className="text-sm text-muted-foreground mt-2 space-y-1">
                  <p>您当前的角色：{roleMap[userRole as keyof typeof roleMap]}</p>
                  <p>需要的角色：{requireRoles.map(role => roleMap[role as keyof typeof roleMap]).join(' 或 ')}</p>
                </div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  请联系管理员提升您的权限等级
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline"
                onClick={() => setLocation('/')} 
                className="w-full"
                data-testid="button-back-home"
              >
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Convenience wrapper for routes that require authentication
export function AuthRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for routes that require specific roles
export function RoleRoute({ 
  roles, 
  children, 
  ...props 
}: Omit<ProtectedRouteProps, 'requireRoles'> & { roles: string[] }) {
  return (
    <ProtectedRoute requireAuth={true} requireRoles={roles} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireRoles'>) {
  return (
    <ProtectedRoute requireAuth={true} requireRoles={['admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for editor and admin routes
export function EditorRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireRoles'>) {
  return (
    <ProtectedRoute requireAuth={true} requireRoles={['editor', 'admin']} {...props}>
      {children}
    </ProtectedRoute>
  );
}