import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  KanbanSquare,
  Plane,
  LogOut,
  FileSearch,
  PenLine,
  MessagesSquare,
  Settings,
} from "lucide-react";

import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authService } from "@/services/auth.service";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", url: "/applications", icon: KanbanSquare },
  { title: "Resume analyzer", url: "/resume", icon: FileSearch },
  { title: "Cover letters", url: "/cover-letters", icon: PenLine },
  { title: "Interview prep", url: "/interview", icon: MessagesSquare },
  { title: "Profile & settings", url: "/settings", icon: Settings },
] as const;


export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    authService.logout();
    toast.success("Signed out");
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-border/60">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <span className="bg-primary/15 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
            <Plane className="size-4" />
          </span>
          {!collapsed && <span className="font-semibold tracking-tight">JobPilot AI</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="size-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
