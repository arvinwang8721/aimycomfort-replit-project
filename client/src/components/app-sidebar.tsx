import { Package, Palette, Lightbulb, ShoppingCart, Users, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const navigationItems = [
  {
    title: "面料库",
    url: "/fabrics",
    icon: Palette,
  },
  {
    title: "配件",
    url: "/accessories", 
    icon: Package,
  },
  {
    title: "设计创意",
    url: "/design-ideas",
    icon: Lightbulb,
  },
  {
    title: "产品",
    url: "/products",
    icon: ShoppingCart,
  },
  {
    title: "客户需求",
    url: "/client-requirements",
    icon: Users,
  },
  {
    title: "设置",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">产品开发系统</h2>
          <p className="text-sm text-muted-foreground">枕头靠垫公司</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>模块</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}