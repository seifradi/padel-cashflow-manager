
import { 
  BarChartBig, 
  Home, 
  CircleDollarSign, 
  Calendar, 
  Package, 
  Settings 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      path: "/dashboard",
    },
    {
      title: "Cash Register",
      icon: <CircleDollarSign className="h-4 w-4" />,
      path: "/cash-register",
    },
    {
      title: "Bookings",
      icon: <Calendar className="h-4 w-4" />,
      path: "/bookings",
    },
    {
      title: "Inventory",
      icon: <Package className="h-4 w-4" />,
      path: "/inventory",
    },
    {
      title: "Reports",
      icon: <BarChartBig className="h-4 w-4" />,
      path: "/reports",
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      path: "/settings",
    },
  ];

  return (
    <ShadcnSidebar className="border-r">
      <SidebarHeader className="flex h-14 items-center px-6 border-b">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <CircleDollarSign className="h-5 w-5 text-primary" />
          <span className="font-semibold">Padel Cash</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all-fast",
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 text-xs text-sidebar-foreground/50">
        <div className="text-center">Padel Club Cash Register</div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;
