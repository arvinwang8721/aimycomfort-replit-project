import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Settings, Shield, Edit, Eye } from 'lucide-react';

export function AuthHeader() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated, isAdmin, isEditor, isGuest } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        title: "已退出登录",
        description: "感谢您的使用！",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "退出失败",
        description: "请重试",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleInfo = () => {
    if (isAdmin) return { label: "管理员", icon: Shield, variant: "destructive" as const };
    if (isEditor) return { label: "编辑员", icon: Edit, variant: "default" as const };
    if (isGuest) return { label: "访客", icon: Eye, variant: "secondary" as const };
    return { label: "未知", icon: User, variant: "outline" as const };
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setLocation("/login")}
          data-testid="button-login"
        >
          登录
        </Button>
      </div>
    );
  }

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <div className="flex items-center gap-3">
      {/* Role badge */}
      <Badge variant={roleInfo.variant} className="hidden sm:flex">
        <RoleIcon className="w-3 h-3 mr-1" />
        {roleInfo.label}
      </Badge>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="relative h-9 w-9 rounded-full"
            data-testid="button-user-menu"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-sm">
                {getInitials(user?.name || "用户")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none" data-testid="text-user-name">
                {user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground" data-testid="text-user-email">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Role info for mobile */}
          <DropdownMenuItem className="sm:hidden">
            <RoleIcon className="mr-2 h-4 w-4" />
            <span>{roleInfo.label}</span>
          </DropdownMenuItem>
          
          {/* Admin-only menu items */}
          {isAdmin && (
            <>
              <DropdownMenuItem onClick={() => setLocation("/admin")} data-testid="menu-admin">
                <Settings className="mr-2 h-4 w-4" />
                <span>管理面板</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem 
            onClick={handleLogout}
            disabled={isLoggingOut}
            data-testid="menu-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isLoggingOut ? "退出中..." : "退出登录"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}