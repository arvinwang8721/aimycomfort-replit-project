import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Edit, Trash2, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, InsertProduct } from "@shared/schema";
import { insertProductSchema } from "@shared/schema";


export default function Products() {
  const { toast } = useToast();
  
  // Fetch products from API
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "产品已删除",
        description: "产品已成功从库存中删除。",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除产品时出现错误，请重试。",
        variant: "destructive",
      });
    },
  });

  // Add product form
  const addForm = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      code: "",
      name: "",
      imageUrl: "",
      phase: "produced",
      coverCost: "0.00",
      innerCoreCost: "0.00",
      packageCost: "0.00",
      generalCost: "0.00",
      modelUrl: "",
      status: "active"
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: InsertProduct) => apiRequest('POST', '/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "产品已添加",
        description: "新产品已成功添加到库存中。"
      });
      setAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: "添加失败",
        description: "添加产品时出现错误，请重试。",
        variant: "destructive"
      });
    }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("current");
  const [sortField, setSortField] = useState<keyof Product>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, alt: string} | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    
    // Month filter logic - exclude products without createdAt when filtering by month
    let matchesMonth = true;
    if (monthFilter !== "all") {
      if (!product.createdAt) {
        matchesMonth = false;
      } else {
        const productDate = new Date(product.createdAt);
        const currentDate = new Date();
        
        if (monthFilter === "current") {
          matchesMonth = productDate.getMonth() === currentDate.getMonth() && 
                        productDate.getFullYear() === currentDate.getFullYear();
        } else if (monthFilter === "previous") {
          const prevMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
          const prevYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
          matchesMonth = productDate.getMonth() === prevMonth && 
                        productDate.getFullYear() === prevYear;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
    
    // Handle different data types
    if (sortField === 'createdAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      // Handle cost fields that are stored as strings
      if (['coverCost', 'innerCoreCost', 'packageCost', 'generalCost'].includes(sortField)) {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  const handleAddSubmit = (data: InsertProduct) => {
    addMutation.mutate(data);
  };

  const handleEdit = (product: Product) => {
    console.log("Edit product:", product);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个产品吗？此操作不可撤销。")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">产品</h1>
          <p className="text-muted-foreground">当前产品目录及成本明细</p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-product">
          <Plus className="h-4 w-4 mr-2" />
          添加产品
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索产品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-products"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px]" data-testid="select-status-filter">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="discontinued">已停产</SelectItem>
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[120px]" data-testid="select-month-filter">
            <SelectValue placeholder="月份" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有月份</SelectItem>
            <SelectItem value="current">本月</SelectItem>
            <SelectItem value="previous">上月</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>产品列表</CardTitle>
            <CardDescription>正在加载产品数据...</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      )}
      
      {/* Error State */}
      {error && (
        <Card>
          <CardHeader>
            <CardTitle>产品列表</CardTitle>
            <CardDescription>加载产品数据时出错</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-red-600">加载产品数据失败，请刷新页面重试。</p>
          </CardContent>
        </Card>
      )}
      
      {/* Product List Table */}
      {!isLoading && !error && (
        <Card>
        <CardHeader>
          <CardTitle>产品列表</CardTitle>
          <CardDescription>共 {sortedProducts.length} 个产品</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead data-testid="header-image">图片</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('code')}
                  data-testid="header-code"
                >
                  代码 {sortField === 'code' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('name')}
                  data-testid="header-name"
                >
                  名称 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('phase')}
                  data-testid="header-phase"
                >
                  阶段 {sortField === 'phase' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('createdAt')}
                  data-testid="header-created"
                >
                  创建日期 {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>总成本</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50" 
                  onClick={() => handleSort('status')}
                  data-testid="header-status"
                >
                  状态 {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>3D模型</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => {
                const hasUncertainCosts = product.phase === 'designing';
                const totalCost = hasUncertainCosts ? null : (() => {
                  const coverCost = parseFloat(product.coverCost || "0");
                  const innerCoreCost = parseFloat(product.innerCoreCost || "0");
                  const packageCost = parseFloat(product.packageCost || "0");
                  const generalCost = parseFloat(product.generalCost || "0");
                  
                  // Guard against NaN values
                  const safeCoverCost = Number.isNaN(coverCost) ? 0 : coverCost;
                  const safeInnerCoreCost = Number.isNaN(innerCoreCost) ? 0 : innerCoreCost;
                  const safePackageCost = Number.isNaN(packageCost) ? 0 : packageCost;
                  const safeGeneralCost = Number.isNaN(generalCost) ? 0 : generalCost;
                  
                  return (safeCoverCost + safeInnerCoreCost + safePackageCost + safeGeneralCost).toFixed(2);
                })();
                
                return (
                  <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                    <TableCell>
                      {product.imageUrl ? (
                        <button
                          className="relative group w-12 h-12 rounded-md overflow-hidden hover-elevate focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          onClick={() => {
                            setSelectedImage({url: product.imageUrl!, alt: product.name});
                            setImageDialogOpen(true);
                          }}
                          aria-label={`查看 ${product.name} 的大图`}
                          data-testid={`button-img-product-${product.id}`}
                        >
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            data-testid={`img-product-${product.id}`}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <ZoomIn className="h-4 w-4 text-white drop-shadow-sm" aria-hidden="true" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                          无图片
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.phase === 'produced' ? 'default' : 'outline'}>
                        {product.phase === 'produced' ? '已生产' : '设计中'}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.createdAt ? new Date(product.createdAt).toLocaleDateString('zh-CN') : '-'}</TableCell>
                    <TableCell className="font-semibold" data-testid={`text-product-total-${product.id}`}>
                      {hasUncertainCosts ? (
                        <span className="text-muted-foreground">待确定</span>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button 
                              className="cursor-help underline decoration-dotted text-inherit font-inherit bg-transparent border-none p-0 hover:text-inherit"
                              tabIndex={0}
                              aria-label={`总成本 $${totalCost}，点击查看成本明细`}
                              title="点击查看成本明细"
                              data-testid={`button-product-total-${product.id}`}
                            >
                              {`$${totalCost}`}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <div>面料成本: ${(Number.isNaN(parseFloat(product.coverCost || "0")) ? 0 : parseFloat(product.coverCost || "0")).toFixed(2)}</div>
                              <div>内芯成本: ${(Number.isNaN(parseFloat(product.innerCoreCost || "0")) ? 0 : parseFloat(product.innerCoreCost || "0")).toFixed(2)}</div>
                              <div>包装成本: ${(Number.isNaN(parseFloat(product.packageCost || "0")) ? 0 : parseFloat(product.packageCost || "0")).toFixed(2)}</div>
                              <div>一般成本: ${(Number.isNaN(parseFloat(product.generalCost || "0")) ? 0 : parseFloat(product.generalCost || "0")).toFixed(2)}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status === 'active' ? '活跃' : '已停产'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.modelUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const w = window.open(product.modelUrl!, '_blank', 'noopener');
                            if (w) w.opener = null;
                          }}
                          data-testid={`button-view-model-${product.id}`}
                        >
                          查看3D模型
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">无模型</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          data-testid={`button-edit-${product.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
      )}

      {!isLoading && !error && sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到符合您条件的产品。</p>
        </div>
      )}

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={(open) => {
        setImageDialogOpen(open);
        if (!open) {
          setSelectedImage(null);
        }
      }}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>产品图片</DialogTitle>
            <DialogDescription className="sr-only">
              {selectedImage ? `${selectedImage.alt}的放大图片` : '产品图片放大预览'}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                data-testid="img-product-dialog"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新产品</DialogTitle>
            <DialogDescription>向库存中添加新的产品信息</DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品代码 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入产品代码"
                          data-testid="input-product-code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>产品名称 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入产品名称"
                          data-testid="input-product-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>阶段</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product-phase">
                            <SelectValue placeholder="选择阶段" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="produced">已生产</SelectItem>
                          <SelectItem value="designing">设计中</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-product-status">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">活跃</SelectItem>
                          <SelectItem value="discontinued">已停产</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="coverCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>面料成本 (¥)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          data-testid="input-product-cover-cost"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="innerCoreCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>内芯成本 (¥)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          data-testid="input-product-inner-cost"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="packageCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>包装成本 (¥)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          data-testid="input-product-package-cost"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="generalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>一般成本 (¥)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          data-testid="input-product-general-cost"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品图片链接</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-product-image"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="modelUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>3D模型链接</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/model.glb"
                        data-testid="input-product-model"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={addMutation.isPending}
                  data-testid="button-submit-add-product"
                >
                  {addMutation.isPending ? "添加中..." : "添加产品"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}