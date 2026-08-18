import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // ✅ Check for token in localStorage (client-side only)
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        throw redirect({
          to: '/auth',
          search: { redirect: location.href }
        });
      }
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <SidebarInset className="min-w-0 flex-1">
          <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-2 px-4">
              <SidebarTrigger className="shrink-0" />
              <div className="flex-1" />
              <div className="text-sm font-medium text-muted-foreground">JobPilot AI</div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}