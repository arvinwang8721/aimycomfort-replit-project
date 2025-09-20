import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Calendar, TrendingUp } from "lucide-react";
import type { Product } from "@shared/schema";

interface MonthlyProgressWidgetProps {
  products: Product[];
}

export function MonthlyProgressWidget({ products }: MonthlyProgressWidgetProps) {
  // Monthly progress calculations
  const monthlyStats = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthProducts = products.filter(product => {
      if (!product.createdAt) return false;
      const productDate = new Date(product.createdAt);
      return productDate.getMonth() === currentMonth && 
             productDate.getFullYear() === currentYear &&
             product.status === 'active';
    });
    
    const previousMonthProducts = products.filter(product => {
      if (!product.createdAt) return false;
      const productDate = new Date(product.createdAt);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return productDate.getMonth() === prevMonth && 
             productDate.getFullYear() === prevYear &&
             product.status === 'active';
    });
    
    return {
      currentMonthCount: currentMonthProducts.length,
      previousMonthCount: previousMonthProducts.length,
      target: 8,
      progress: (currentMonthProducts.length / 8) * 100
    };
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本月产品开发</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="monthly-current-count">
            {monthlyStats.currentMonthCount}/8
          </div>
          <p className="text-xs text-muted-foreground">
            目标：8个产品/月
          </p>
          <div className="w-full bg-secondary rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(monthlyStats.progress, 100)}%` }}
              data-testid="monthly-progress-bar"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">上月完成</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="monthly-previous-count">
            {monthlyStats.previousMonthCount}
          </div>
          <p className="text-xs text-muted-foreground">
            已完成产品数量
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">完成率</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" data-testid="monthly-progress-percent">
            {monthlyStats.progress.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            月度目标进度
          </p>
        </CardContent>
      </Card>
    </div>
  );
}