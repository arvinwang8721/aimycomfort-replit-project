import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search } from "lucide-react";
import { DesignIdeaCard } from "@/components/design-idea-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DesignIdea, InsertDesignIdea } from "@shared/schema";
import { insertDesignIdeaSchema } from "@shared/schema";


export default function DesignIdeas() {
  const { toast } = useToast();
  
  // Fetch design ideas from API
  const { data: designIdeas = [], isLoading, error } = useQuery<DesignIdea[]>({
    queryKey: ['/api/design-ideas'],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/design-ideas/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/design-ideas'] });
      toast({
        title: "设计创意已删除",
        description: "设计创意已成功从库存中删除。",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除设计创意时出现错误，请重试。",
        variant: "destructive",
      });
    },
  });

  // Add design idea form
  const addForm = useForm<InsertDesignIdea>({
    resolver: zodResolver(insertDesignIdeaSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrls: [],
      demandAnalysis: "",
      negativeReviews: "",
      redesignReason: "",
      priceRangeMin: undefined,
      priceRangeMax: undefined,
      createdBy: "",
      status: "pending"
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: InsertDesignIdea) => apiRequest('POST', '/api/design-ideas', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/design-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "设计创意已添加",
        description: "新的设计创意已成功添加。"
      });
      setAddDialogOpen(false);
      addForm.reset();
    },
    onError: () => {
      toast({
        title: "添加失败",
        description: "添加设计创意时出现错误，请重试。",
        variant: "destructive"
      });
    }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredDesignIdeas = designIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  const handleAddSubmit = (data: InsertDesignIdea) => {
    addMutation.mutate(data);
  };

  const handleEdit = (designIdea: DesignIdea) => {
    console.log("Edit design idea:", designIdea);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个设计创意吗？此操作不可撤销。")) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (designIdea: DesignIdea) => {
    console.log("View design idea:", designIdea);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">设计创意</h1>
          <p className="text-muted-foreground">团队协作开发新产品概念</p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-design-idea">
          <Plus className="h-4 w-4 mr-2" />
          新创意
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索设计创意..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-design-ideas"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="按状态过滤" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="approved">已批准</SelectItem>
            <SelectItem value="rejected">已拒绝</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>设计创意列表</CardTitle>
            <CardDescription>正在加载设计创意数据...</CardDescription>
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
            <CardTitle>设计创意列表</CardTitle>
            <CardDescription>加载设计创意数据时出错</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-red-600">加载设计创意数据失败，请刷新页面重试。</p>
          </CardContent>
        </Card>
      )}
      
      {/* Design Ideas Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDesignIdeas.map((designIdea) => (
          <DesignIdeaCard
            key={designIdea.id}
            designIdea={designIdea}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}
        </div>
      )}

      {!isLoading && !error && filteredDesignIdeas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到符合您条件的设计创意。</p>
        </div>
      )}

      {/* Add Design Idea Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) {
          addForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新设计创意</DialogTitle>
            <DialogDescription>添加新的产品设计创意和分析</DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>创意标题 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入创意标题"
                          data-testid="input-design-idea-title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="createdBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>创建者 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入创建者姓名"
                          data-testid="input-design-idea-creator"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>创意描述 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="详细描述这个设计创意..."
                        className="min-h-[100px]"
                        data-testid="textarea-design-idea-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="demandAnalysis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>需求分析</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="市场需求和目标用户分析..."
                        className="min-h-[80px]"
                        data-testid="textarea-design-idea-analysis"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="priceRangeMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>价格范围下限 (¥)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          data-testid="input-design-idea-price-min"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="priceRangeMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>价格范围上限 (¥)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="0.00"
                          data-testid="input-design-idea-price-max"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
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
                  name="negativeReviews"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>负面反馈</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="记录可能的负面反馈..."
                          className="min-h-[80px]"
                          data-testid="textarea-design-idea-negative"
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
                  name="redesignReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>重设计原因</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="如需重设计的原因..."
                          className="min-h-[80px]"
                          data-testid="textarea-design-idea-redesign"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-design-idea-status">
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="in_progress">进行中</SelectItem>
                        <SelectItem value="approved">已批准</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
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
                  data-testid="button-submit-add-design-idea"
                >
                  {addMutation.isPending ? "添加中..." : "添加创意"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}