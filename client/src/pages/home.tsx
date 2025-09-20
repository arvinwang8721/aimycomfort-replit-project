import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Palette, 
  Lightbulb, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertCircle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { MonthlyProgressWidget } from "@/components/monthly-progress-widget";
import type { Product } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Fetch real statistics from the API
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{
    totalFabrics: number;
    totalAccessories: number;
    totalProducts: number;
    activeDesignIdeas: number;
    pendingRequirements: number;
  }>({
    queryKey: ['/api/statistics']
  });
  
  // Fetch real products for monthly progress
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });


  const recentActivity = [
    { action: "新设计创意已提交", author: "Sarah Johnson", time: "2小时前", type: "design" },
    { action: "面料价格已更新", author: "Mike Chen", time: "4小时前", type: "fabric" },
    { action: "客户需求已完成", author: "Emma Wilson", time: "6小时前", type: "client" },
    { action: "新配件已添加", author: "David Brown", time: "1天前", type: "accessory" },
  ];

  const quickActions = [
    { title: "添加新面料", description: "注册新的面料材料", icon: Palette, href: "/fabrics", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    { title: "提交设计创意", description: "分享您的产品概念", icon: Lightbulb, href: "/design-ideas", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
    { title: "添加产品", description: "创建新产品条目", icon: ShoppingCart, href: "/products", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    { title: "客户请求", description: "记录新的客户需求", icon: Users, href: "/client-requirements", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">仪表板</h1>
        <p className="text-muted-foreground">欢迎使用您的产品开发系统</p>
      </div>

      {/* Monthly Progress Dashboard */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">月度产品开发进度</h2>
        {productsLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">正在加载产品数据...</p>
            </CardContent>
          </Card>
        ) : (
          <MonthlyProgressWidget products={products} />
        )}
      </div>

      {/* Stats Overview */}
      {statsLoading && (
        <Card className="mb-6">
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground">正在加载统计数据...</p>
          </CardContent>
        </Card>
      )}
      
      {statsError && (
        <Card className="mb-6">
          <CardContent className="text-center py-6">
            <p className="text-red-600">加载统计数据失败，请刷新页面重试。</p>
          </CardContent>
        </Card>
      )}
      
      {!statsLoading && !statsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">面料总数</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-fabrics">{stats?.totalFabrics || 0}</div>
            <p className="text-xs text-muted-foreground">可用材料</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配件</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-accessories">{stats?.totalAccessories || 0}</div>
            <p className="text-xs text-muted-foreground">库存中</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">设计创意</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-design-ideas">{stats?.activeDesignIdeas || 0}</div>
            <p className="text-xs text-muted-foreground">活跃概念</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">产品</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-products">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">当前目录</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-pending-requirements">{stats?.pendingRequirements || 0}</div>
            <p className="text-xs text-muted-foreground">客户请求</p>
          </CardContent>
        </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用任务和快捷方式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover-elevate border cursor-pointer">
                  <div className={`p-2 rounded-md ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{action.title}</h4>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>最新系统更新和变更</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'design' && <Lightbulb className="h-4 w-4 text-yellow-600 mt-1" />}
                    {activity.type === 'fabric' && <Palette className="h-4 w-4 text-blue-600 mt-1" />}
                    {activity.type === 'client' && <Users className="h-4 w-4 text-green-600 mt-1" />}
                    {activity.type === 'accessory' && <Package className="h-4 w-4 text-purple-600 mt-1" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>由 {activity.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}