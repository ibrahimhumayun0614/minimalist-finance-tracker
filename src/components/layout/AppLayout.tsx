import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
  title?: string;
};
export function AppLayout({ children, container = false, className, contentClassName, title }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-sm sticky top-0 z-20 bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
             {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
          </div>
        </header>
        <main className="flex-1">
          {container ? (
            <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}