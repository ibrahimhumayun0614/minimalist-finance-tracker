import React from "react";
import { LayoutDashboard, History, Settings, PieChart } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/" },
    { title: "History", icon: History, path: "/history" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];
  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200 shadow-lg flex items-center justify-center">
            <PieChart className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight leading-tight">Minimalist Finance</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarMenu className="px-2 space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.path}
                  className="rounded-lg h-11"
                >
                  <Link to={item.path}>
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}