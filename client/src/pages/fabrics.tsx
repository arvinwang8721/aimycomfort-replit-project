import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash2, ZoomIn, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Fabric, InsertFabric } from "@shared/schema";
import { insertFabricSchema } from "@shared/schema";


export default function Fabrics() {
  const { toast } = useToast();
  const { canCreate, canEdit, canDelete } = useAuth();
  
  // Fetch fabrics from API
  const { data: fabrics = [], isLoading, error } = useQuery<Fabric[]>({
    queryKey: ['/api/fabrics'],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/fabrics/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fabrics'] });
      toast({
        title: "面料已删除",
        description: "面料已成功从库存中删除。",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除面料时出现错误，请重试。",
        variant: "destructive",
      });
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Fabric>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{url: string, alt: string} | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredFabrics = fabrics.filter(
    (fabric) =>
      fabric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fabric.color.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort fabrics
  const sortedFabrics = [...filteredFabrics].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === "asc" ? -1 : 1;
    if (bValue == null) return sortDirection === "asc" ? 1 : -1;

    // Handle different data types
    if (sortField === "createdAt") {
      aValue = new Date(aValue as any).getTime();
      bValue = new Date(bValue as any).getTime();
    } else if (typeof aValue === "string" && typeof bValue === "string") {
      if (sortField === "price") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      // For width and gramWeight
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Fabric) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Add fabric form
  const addForm = useForm<InsertFabric>({
    resolver: zodResolver(insertFabricSchema),
    defaultValues: {
      name: "",
      color: "",
      width: 0,
      gramWeight: 0,
      price: "0.00",
      imageUrl: ""
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: InsertFabric) => apiRequest('POST', '/api/fabrics', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fabrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "面料已添加",
        description: "新面料已成功添加到库存中。"
      });
      setAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: "添加失败",
        description: "添加面料时出现错误，请重试。",
        variant: "destructive"
      });
    }
  });

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  const handleAddSubmit = (data: InsertFabric) => {
    addMutation.mutate(data);
  };

  const handleEdit = (fabric: Fabric) => {
    console.log("Edit fabric:", fabric);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个面料吗？此操作不可撤销。")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">
            面料库
          </h1>
          <p className="text-muted-foreground">管理面料材料和规格</p>
        </div>
        {canCreate && (
          <Button onClick={handleAddNew} data-testid="button-add-fabric">
            <Plus className="h-4 w-4 mr-2" />
            添加面料
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索面料..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-fabrics"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>面料列表</CardTitle>
            <CardDescription>正在加载面料数据...</CardDescription>
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
            <CardTitle>面料列表</CardTitle>
            <CardDescription>加载面料数据时出错</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-red-600">加载面料数据失败，请刷新页面重试。</p>
          </CardContent>
        </Card>
      )}
      
      {/* Fabrics List - Responsive Layout */}
      {!isLoading && !error && (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>面料列表</CardTitle>
              <CardDescription>共 {sortedFabrics.length} 种面料</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-image">图片</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("name")}
                      data-testid="header-name"
                    >
                      名称{" "}
                      {sortField === "name" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("color")}
                      data-testid="header-color"
                    >
                      颜色{" "}
                      {sortField === "color" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("width")}
                      data-testid="header-width"
                    >
                      门幅 (厘米){" "}
                      {sortField === "width" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("gramWeight")}
                      data-testid="header-gram-weight"
                    >
                      克重 (克/平方米){" "}
                      {sortField === "gramWeight" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("price")}
                      data-testid="header-price"
                    >
                      价格{" "}
                      {sortField === "price" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("createdAt")}
                      data-testid="header-created"
                    >
                      创建日期{" "}
                      {sortField === "createdAt" &&
                        (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFabrics.map((fabric) => (
                    <TableRow
                      key={fabric.id}
                      data-testid={`row-fabric-${fabric.id}`}
                    >
                      <TableCell>
                        {fabric.imageUrl ? (
                          <button
                            className="relative group w-12 h-12 rounded-md overflow-hidden hover-elevate focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={() => {
                              setSelectedImage({url: fabric.imageUrl!, alt: fabric.name});
                              setImageDialogOpen(true);
                            }}
                            aria-label={`查看 ${fabric.name} 的大图`}
                            data-testid={`button-img-fabric-${fabric.id}`}
                          >
                            <img 
                              src={fabric.imageUrl} 
                              alt={fabric.name}
                              className="w-full h-full object-cover"
                              data-testid={`img-fabric-${fabric.id}`}
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
                      <TableCell className="font-medium">{fabric.name}</TableCell>
                      <TableCell>{fabric.color}</TableCell>
                      <TableCell>{fabric.width}</TableCell>
                      <TableCell>{fabric.gramWeight}</TableCell>
                      <TableCell>${fabric.price}</TableCell>
                      <TableCell>
                        {fabric.createdAt
                          ? new Date(fabric.createdAt).toLocaleDateString("zh-CN")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(fabric)}
                              data-testid={`button-edit-${fabric.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(fabric.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${fabric.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">面料列表</h2>
              <p className="text-sm text-muted-foreground">共 {sortedFabrics.length} 种面料</p>
            </div>
            <div className="space-y-4">
              {sortedFabrics.map((fabric) => (
                <Card key={fabric.id} data-testid={`card-fabric-${fabric.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {fabric.imageUrl ? (
                          <button
                            className="relative group w-16 h-16 rounded-md overflow-hidden hover-elevate focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={() => {
                              setSelectedImage({url: fabric.imageUrl!, alt: fabric.name});
                              setImageDialogOpen(true);
                            }}
                            aria-label={`查看 ${fabric.name} 的大图`}
                            data-testid={`button-img-fabric-${fabric.id}`}
                          >
                            <img 
                              src={fabric.imageUrl} 
                              alt={fabric.name}
                              className="w-full h-full object-cover"
                              data-testid={`img-fabric-${fabric.id}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <ZoomIn className="h-4 w-4 text-white drop-shadow-sm" aria-hidden="true" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                            无图片
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium truncate">{fabric.name}</h3>
                            <p className="text-sm text-muted-foreground">{fabric.color}</p>
                          </div>
                          
                          {/* Actions */}
                          {(canEdit || canDelete) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-actions-${fabric.id}`}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEdit && (
                                  <DropdownMenuItem 
                                    onClick={() => handleEdit(fabric)}
                                    data-testid={`button-edit-${fabric.id}`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    编辑
                                  </DropdownMenuItem>
                                )}
                                {canDelete && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(fabric.id)}
                                    disabled={deleteMutation.isPending}
                                    className="text-destructive"
                                    data-testid={`button-delete-${fabric.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {/* Details */}
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">门幅:</span> {fabric.width}cm
                          </div>
                          <div>
                            <span className="text-muted-foreground">克重:</span> {fabric.gramWeight}g/m²
                          </div>
                          <div>
                            <span className="text-muted-foreground">价格:</span> ${fabric.price}
                          </div>
                          <div>
                            <span className="text-muted-foreground">创建:</span>{" "}
                            {fabric.createdAt
                              ? new Date(fabric.createdAt).toLocaleDateString("zh-CN")
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {!isLoading && !error && sortedFabrics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到符合搜索条件的面料。</p>
        </div>
      )}

      {/* Add Fabric Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加新面料</DialogTitle>
            <DialogDescription>向库存中添加新的面料信息</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">面料名称 *</Label>
                <Input
                  id="name"
                  data-testid="input-fabric-name"
                  {...addForm.register("name")}
                  placeholder="输入面料名称"
                />
                {addForm.formState.errors.name && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">颜色 *</Label>
                <Input
                  id="color"
                  data-testid="input-fabric-color"
                  {...addForm.register("color")}
                  placeholder="输入颜色"
                />
                {addForm.formState.errors.color && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.color.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">宽度 (cm) *</Label>
                <Input
                  id="width"
                  type="number"
                  data-testid="input-fabric-width"
                  {...addForm.register("width", { valueAsNumber: true })}
                  placeholder="150"
                />
                {addForm.formState.errors.width && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.width.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gramWeight">克重 (g/m²) *</Label>
                <Input
                  id="gramWeight"
                  type="number"
                  data-testid="input-fabric-weight"
                  {...addForm.register("gramWeight", { valueAsNumber: true })}
                  placeholder="200"
                />
                {addForm.formState.errors.gramWeight && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.gramWeight.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">价格 (¥/米) *</Label>
                <Input
                  id="price"
                  data-testid="input-fabric-price"
                  {...addForm.register("price")}
                  placeholder="25.00"
                />
                {addForm.formState.errors.price && (
                  <p className="text-sm text-red-600">{addForm.formState.errors.price.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">图片链接</Label>
              <Input
                id="imageUrl"
                data-testid="input-fabric-image"
                {...addForm.register("imageUrl")}
                placeholder="https://example.com/image.jpg"
              />
              {addForm.formState.errors.imageUrl && (
                <p className="text-sm text-red-600">{addForm.formState.errors.imageUrl.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                取消
              </Button>
              <Button 
                type="submit" 
                data-testid="button-submit-add-fabric"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? "添加中..." : "添加面料"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={(open) => {
        setImageDialogOpen(open);
        if (!open) {
          setSelectedImage(null);
        }
      }}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>面料图片</DialogTitle>
            <DialogDescription className="sr-only">
              {selectedImage ? `${selectedImage.alt}的放大图片` : '面料图片放大预览'}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                data-testid="img-fabric-dialog"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
