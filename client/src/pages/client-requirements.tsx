import { useState, useEffect } from "react";
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
import { ClientRequirementCard } from "@/components/client-requirement-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ClientRequirement, InsertClientRequirement } from "@shared/schema";
import { insertClientRequirementSchema } from "@shared/schema";
import { z } from "zod";

// Enhanced schema with proper validation
const formSchema = insertClientRequirementSchema.extend({
  clientName: z.string().min(1, "客户姓名为必填项"),
  description: z.string().min(1, "需求描述为必填项"),
  requirements: z.string().min(1, "详细要求为必填项"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high"])
});


export default function ClientRequirements() {
  const { toast } = useToast();
  
  // Fetch client requirements from API
  const { data: requirements = [], isLoading, error } = useQuery<ClientRequirement[]>({
    queryKey: ['/api/client-requirements'],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/client-requirements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-requirements'] });
      toast({
        title: "客户需求已删除",
        description: "客户需求已成功从库存中删除。",
      });
    },
    onError: () => {
      toast({
        title: "删除失败",
        description: "删除客户需求时出现错误，请重试。",
        variant: "destructive",
      });
    },
  });

  // Add client requirement form
  const addForm = useForm<InsertClientRequirement>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      description: "",
      requirements: "",
      status: "pending",
      priority: "medium"
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: (data: InsertClientRequirement) => apiRequest('POST', '/api/client-requirements', data),
    onSuccess: () => {
      // Invalidate queries first
      queryClient.invalidateQueries({ queryKey: ['/api/client-requirements'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      // Show success toast
      toast({
        title: "客户需求已添加",
        description: "新的客户需求已成功添加。"
      });
    },
    onError: () => {
      toast({
        title: "添加失败",
        description: "添加客户需求时出现错误，请重试。",
        variant: "destructive"
      });
    }
  });

  // Handle successful mutation - close dialog and reset form
  useEffect(() => {
    if (addMutation.isSuccess && !addMutation.isPending) {
      addForm.reset();
      setAddDialogOpen(false);
      addMutation.reset(); // Reset mutation state
    }
  }, [addMutation.isSuccess, addMutation.isPending, addForm]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = requirement.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requirement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || requirement.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || requirement.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  const handleAddSubmit = (data: InsertClientRequirement) => {
    addMutation.mutate(data);
  };

  const handleEdit = (requirement: ClientRequirement) => {
    console.log("Edit client requirement:", requirement);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个客户需求吗？此操作不可撤销。")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">客户需求</h1>
          <p className="text-muted-foreground">跟踪和管理客户请求和规格</p>
        </div>
        <Button onClick={handleAddNew} data-testid="button-add-client-requirement">
          <Plus className="h-4 w-4 mr-2" />
          新请求
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索客户需求..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-client-requirements"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]" data-testid="select-priority-filter">
            <SelectValue placeholder="优先级" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有优先级</SelectItem>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>客户需求列表</CardTitle>
            <CardDescription>正在加载客户需求数据...</CardDescription>
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
            <CardTitle>客户需求列表</CardTitle>
            <CardDescription>加载客户需求数据时出错</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-red-600">加载客户需求数据失败，请刷新页面重试。</p>
          </CardContent>
        </Card>
      )}
      
      {/* Client Requirements Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequirements.map((requirement) => (
          <ClientRequirementCard
            key={requirement.id}
            requirement={requirement}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
        </div>
      )}

      {!isLoading && !error && filteredRequirements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">没有找到符合您条件的客户需求。</p>
        </div>
      )}

      {/* Add Client Requirement Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) {
          addForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新客户需求</DialogTitle>
            <DialogDescription>添加新的客户需求和规格</DialogDescription>
          </DialogHeader>
          
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户姓名 *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入客户姓名"
                        data-testid="input-client-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>需求描述 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="简要描述客户的需求..."
                        className="min-h-[100px]"
                        data-testid="textarea-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>详细要求 *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="详细列出客户的具体要求和规格..."
                        className="min-h-[120px]"
                        data-testid="textarea-requirements"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>状态</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">待处理</SelectItem>
                          <SelectItem value="in_progress">进行中</SelectItem>
                          <SelectItem value="completed">已完成</SelectItem>
                          <SelectItem value="cancelled">已取消</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>优先级</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue placeholder="选择优先级" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="low">低</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  data-testid="button-submit-add-client-requirement"
                >
                  {addMutation.isPending ? "添加中..." : "添加需求"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}