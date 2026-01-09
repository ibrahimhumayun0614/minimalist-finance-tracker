import React, { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { AddExpenseSheet } from "@/components/expenses/AddExpenseSheet";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
  title?: string;
};
export function AppLayout({ children, container = false, className, contentClassName, title }: AppLayoutProps): JSX.Element {
  const setIsAddOpen = useAppStore(s => s.setIsAddExpenseOpen);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAddOpen]);
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className={className}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md sticky top-0 z-20 bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
             {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded border">
              <kbd className="font-sans">⌘</kbd>
              <kbd className="font-sans">K</kbd>
              <span>Quick Add</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {container ? (
              <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
                {children}
              </div>
            ) : (
              children
            )}
          </motion.div>
        </main>
      </SidebarInset>
      <AddExpenseSheet />
      <Toaster richColors closeButton position="top-right" />
    </SidebarProvider>
  );
}