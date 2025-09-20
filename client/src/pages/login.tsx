import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, LogIn, UserPlus, ArrowLeft } from "lucide-react";

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位字符"),
});

const registerSchema = z.object({
  name: z.string().min(2, "姓名至少2位字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位字符"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  // Get returnTo parameter from URL
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');

  // Helper function to get default redirect based on user role
  const getDefaultRedirect = (userData: any) => {
    if (returnTo) {
      return decodeURIComponent(returnTo);
    }
    
    // Role-based default redirects
    switch (userData?.role) {
      case 'admin':
        return '/admin'; // Admin dashboard
      case 'editor':
        return '/products'; // Main data page for editors
      case 'guest':
      default:
        return '/'; // Home page for guests
    }
  };

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      const userData = await login(data.email, data.password);
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      
      // Use a more reliable redirect method
      const redirectPath = getDefaultRedirect(userData);
      console.log('Redirecting to:', redirectPath); // Debug log
      
      // Use both setLocation and window.location for reliability
      setTimeout(() => {
        setLocation(redirectPath);
        // Fallback: if setLocation doesn't work, use window.location
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = redirectPath;
          }
        }, 100);
      }, 100);
      
    } catch (error) {
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "请检查邮箱和密码",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      const userData = await register(data.email, data.name, data.password);
      toast({
        title: "注册成功",
        description: "账户创建成功，您已自动登录",
      });
      
      // Use a more reliable redirect method
      const redirectPath = getDefaultRedirect(userData);
      console.log('Redirecting to:', redirectPath); // Debug log
      
      // Use both setLocation and window.location for reliability
      setTimeout(() => {
        setLocation(redirectPath);
        // Fallback: if setLocation doesn't work, use window.location
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = redirectPath;
          }
        }, 100);
      }, 100);
      
    } catch (error) {
      toast({
        title: "注册失败",
        description: error instanceof Error ? error.message : "请检查输入信息",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back to app button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="mb-4"
          data-testid="button-back-to-app"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回应用
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">产品库存管理系统</CardTitle>
            <CardDescription>
              请登录或注册账户以访问系统功能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  登录
                </TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">
                  <UserPlus className="w-4 h-4 mr-2" />
                  注册
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        data-testid="input-login-email"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {loginForm.formState.errors.email.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="请输入密码"
                        className="pl-10"
                        data-testid="input-login-password"
                        {...loginForm.register("password")}
                      />
                    </div>
                    {loginForm.formState.errors.password && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {loginForm.formState.errors.password.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginForm.formState.isSubmitting}
                    data-testid="button-login-submit"
                  >
                    {loginForm.formState.isSubmitting ? "登录中..." : "登录"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">姓名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="请输入姓名"
                        className="pl-10"
                        data-testid="input-register-name"
                        {...registerForm.register("name")}
                      />
                    </div>
                    {registerForm.formState.errors.name && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerForm.formState.errors.name.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        data-testid="input-register-email"
                        {...registerForm.register("email")}
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerForm.formState.errors.email.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="请输入密码（至少6位）"
                        className="pl-10"
                        data-testid="input-register-password"
                        {...registerForm.register("password")}
                      />
                    </div>
                    {registerForm.formState.errors.password && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerForm.formState.errors.password.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="请再次输入密码"
                        className="pl-10"
                        data-testid="input-register-confirm-password"
                        {...registerForm.register("confirmPassword")}
                      />
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerForm.formState.errors.confirmPassword.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerForm.formState.isSubmitting}
                    data-testid="button-register-submit"
                  >
                    {registerForm.formState.isSubmitting ? "注册中..." : "注册"}
                  </Button>

                  <Alert>
                    <AlertDescription className="text-sm text-muted-foreground">
                      注册后您将获得访客权限，可查看所有数据并提交设计想法和客户需求。管理员可以提升您的权限。
                    </AlertDescription>
                  </Alert>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}