import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, Shield, Edit, Eye, Calendar, Activity, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'guest' | 'editor' | 'admin';
  createdAt: string;
}

interface OperationLog {
  id: string;
  userId: string | null;
  method: string;
  route: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");

  // Fetch users
  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 30000, // 30 seconds
  });

  // Fetch operation logs
  const { data: logs, isLoading: logsLoading, error: logsError } = useQuery<OperationLog[]>({
    queryKey: ['/api/operation-logs'],
    staleTime: 30000, // 30 seconds
  });

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: '管理员', icon: Shield, variant: 'destructive' as const };
      case 'editor':
        return { label: '编辑员', icon: Edit, variant: 'default' as const };
      case 'guest':
        return { label: '访客', icon: Eye, variant: 'secondary' as const };
      default:
        return { label: '未知', icon: User, variant: 'outline' as const };
    }
  };

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'CREATE':
        return { label: '创建', variant: 'default' as const };
      case 'UPDATE':
        return { label: '更新', variant: 'secondary' as const };
      case 'DELETE':
        return { label: '删除', variant: 'destructive' as const };
      default:
        return { label: action, variant: 'outline' as const };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getEntityTypeName = (entityType: string | null) => {
    if (!entityType) return '-';
    const typeMap: { [key: string]: string } = {
      'fabrics': '面料',
      'accessories': '配件',
      'products': '产品',
      'design-ideas': '设计想法',
      'client-requirements': '客户需求',
      'users': '用户'
    };
    return typeMap[entityType] || entityType;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-admin-title">管理面板</h1>
          <p className="text-muted-foreground">用户管理和系统监控</p>
        </div>
        <Badge variant="destructive" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          管理员权限
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-2" />
            用户管理
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            <Activity className="w-4 h-4 mr-2" />
            操作日志
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                用户列表
              </CardTitle>
              <CardDescription>
                管理系统用户角色和权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">加载中...</div>
                </div>
              ) : usersError ? (
                <div className="text-center py-8 text-destructive">
                  加载用户列表失败
                </div>
              ) : !users || users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无用户数据
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户</TableHead>
                      <TableHead>角色</TableHead>
                      <TableHead>注册时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const roleInfo = getRoleInfo(user.role);
                      const RoleIcon = roleInfo.icon;
                      return (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium" data-testid={`text-user-name-${user.id}`}>
                                {user.name}
                              </div>
                              <div className="text-sm text-muted-foreground" data-testid={`text-user-email-${user.id}`}>
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={roleInfo.variant} data-testid={`badge-user-role-${user.id}`}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {roleInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(user.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled
                              data-testid={`button-manage-user-${user.id}`}
                            >
                              管理权限
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                操作日志
              </CardTitle>
              <CardDescription>
                系统操作审计记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">加载中...</div>
                </div>
              ) : logsError ? (
                <div className="text-center py-8 text-destructive">
                  加载操作日志失败
                </div>
              ) : !logs || logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无操作记录
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead>用户</TableHead>
                      <TableHead>操作</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>路径</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.slice(0, 50).map((log) => {
                      const actionInfo = getActionInfo(log.action);
                      return (
                        <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3" />
                              {formatDate(log.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {log.userId ? `用户 ${log.userId.slice(0, 8)}...` : '系统'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={actionInfo.variant}>
                              {actionInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {getEntityTypeName(log.entityType)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono text-muted-foreground">
                              {log.method} {log.route}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}