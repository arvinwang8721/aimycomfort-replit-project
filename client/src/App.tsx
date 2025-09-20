import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthHeader } from "@/components/AuthHeader";
import { AuthRoute, AdminRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/home";
import Fabrics from "@/pages/fabrics";
import Accessories from "@/pages/accessories";
import DesignIdeas from "@/pages/design-ideas";
import Products from "@/pages/products";
import ClientRequirements from "@/pages/client-requirements";
import Settings from "@/pages/settings";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <AuthRoute>
          <Home />
        </AuthRoute>
      </Route>
      <Route path="/fabrics">
        <AuthRoute>
          <Fabrics />
        </AuthRoute>
      </Route>
      <Route path="/accessories">
        <AuthRoute>
          <Accessories />
        </AuthRoute>
      </Route>
      <Route path="/design-ideas">
        <AuthRoute>
          <DesignIdeas />
        </AuthRoute>
      </Route>
      <Route path="/products">
        <AuthRoute>
          <Products />
        </AuthRoute>
      </Route>
      <Route path="/client-requirements">
        <AuthRoute>
          <ClientRequirements />
        </AuthRoute>
      </Route>
      <Route path="/settings">
        <AuthRoute>
          <Settings />
        </AuthRoute>
      </Route>
      <Route path="/admin">
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      </Route>
      <Route path="/login" component={LoginPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider style={style as React.CSSProperties}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1">
                  <header className="flex items-center justify-between p-2 border-b">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <div className="flex items-center gap-2">
                      <AuthHeader />
                      <ThemeToggle />
                    </div>
                  </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
              </div>
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
