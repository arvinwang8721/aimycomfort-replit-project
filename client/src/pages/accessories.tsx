import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Accessory, InsertAccessory } from "@shared/schema";
import { insertAccessorySchema } from "@shared/schema";


export default function Accessories() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Accessory>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, alt: string} | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Fetch accessories from API
  const { data: accessories = [], isLoading, error } = useQuery<Accessory[]>({
    queryKey: ['/api/accessories']
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/accessories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      toast({
        title: "配件已删除",
        description: "配件已成功从库存中删除。"
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除配件时出现错误，请重试。",
        variant: "destructive"
      });
    }
  });

  // Add accessory form
  const addForm = useForm<InsertAccessory>({
    resolver: zodResolver(insertAccessorySchema),
    defaultValues: {
      name: "",
      price: "0.00",
      imageUrl: ""
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: InsertAccessory) => apiRequest('POST', '/api/accessories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accessories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "配件已添加",
        description: "新配件已成功添加到库存中。"
      });
      setAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: "添加失败",
        description: "添加配件时出现错误，请重试。",
        variant: "destructive"
      });
    }
  });

  const filteredAccessories = accessories.filter(accessory =>
    accessory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort accessories
  const sortedAccessories = [...filteredAccessories].sort((a, b) => {
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
      if (sortField === 'price') {
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

  const handleSort = (field: keyof Accessory) => {
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

  const handleAddSubmit = (data: InsertAccessory) => {
    addMutation.mutate(data);
  };

  const handleEdit = (accessory: Accessory) => {
    console.log("Edit accessory:", accessory);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个配件吗？此操作不可撤销。")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">配件库</h1>
          <p className="text-muted-foreground">管理配件库存和定价</p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-accessory">
          <Plus className="h-4 w-4 mr-2" />
          添加配件
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索配件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-accessories"
          />
        </div>
      </div>

      {/* Accessories List Table */}
      <Card>
        <CardHeader>
          <CardTitle>配件列表</CardTitle>
          <CardDescription>共 {sortedAccessories.length} 个配件</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-muted-foreground">正在加载配件数据...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-red-500">加载配件数据失败，请重试。</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead data-testid="header-image">图片</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('name')}
                    data-testid="header-name"
                  >
                    名称 {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('price')}
                    data-testid="header-price"
                  >
                    价格 {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => handleSort('createdAt')}
                    data-testid="header-created"
                  >
                    创建日期 {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {sortedAccessories.map((accessory) => (
                <TableRow key={accessory.id} data-testid={`row-accessory-${accessory.id}`}>
                  <TableCell>
                    {accessory.imageUrl ? (
                      <button
                        className="relative group w-12 h-12 rounded-md overflow-hidden hover-elevate focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => {
                          setSelectedImage({url: accessory.imageUrl!, alt: accessory.name});
                          setImageDialogOpen(true);
                        }}
                        aria-label={`查看 ${accessory.name} 的大图`}
                        data-testid={`button-img-accessory-${accessory.id}`}
                      >
                        <img 
                          src={accessory.imageUrl} 
                          alt={accessory.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-accessory-${accessory.id}`}
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
                  <TableCell className="font-medium">{accessory.name}</TableCell>
                  <TableCell>¥{accessory.price}</TableCell>
                  <TableCell>{accessory.createdAt ? new Date(accessory.createdAt).toLocaleDateString('zh-CN') : '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(accessory)}
                        data-testid={`button-edit-${accessory.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(accessory.id)}
                        data-testid={`button-delete-${accessory.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {!isLoading && !error && sortedAccessories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到符合搜索条件的配件。</p>
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
            <DialogTitle>配件图片</DialogTitle>
            <DialogDescription className="sr-only">
              {selectedImage ? `${selectedImage.alt}的放大图片` : '配件图片放大预览'}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                data-testid="img-accessory-dialog"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Accessory Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加新配件</DialogTitle>
            <DialogDescription>向库存中添加新的配件信息</DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>配件名称 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入配件名称"
                        data-testid="input-accessory-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>价格 (¥/件) *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="0.00"
                        data-testid="input-accessory-price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图片链接</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-accessory-image"
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
                  data-testid="button-submit-add-accessory"
                >
                  {addMutation.isPending ? "添加中..." : "添加配件"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}