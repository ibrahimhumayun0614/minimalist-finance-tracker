import React, { useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { AddExpenseSheet } from "@/components/expenses/AddExpenseSheet";
import { cn } from "@/lib/utils";
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
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      if (modifier && (e.key === 'k' || e.key === 'K')) {
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
      <SidebarInset className={cn("bg-background transition-colors duration-300", className)}>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-xl sticky top-0 z-30 bg-background/80 border-border/50">
          <SidebarTrigger className="-ml-1 text-foreground/70 hover:text-foreground hover:bg-accent transition-all" />
          <Separator orientation="vertical" className="mr-2 h-4 opacity-30" />
          <div className="flex-1">
             {title && (
               <motion.h2
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="text-[10px] font-black tracking-[0.2em] text-foreground/60 uppercase"
               >
                 {title}
               </motion.h2>
             )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddOpen(true)}
              className="hidden md:flex items-center gap-2 text-[10px] font-black text-muted-foreground/60 hover:text-primary bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-lg border border-border/50 transition-all active:scale-95 group"
              title="Keyboard Shortcut: Cmd+K"
            >
              <kbd className="font-mono bg-background px-1.5 py-0.5 rounded border border-border/50 opacity-80 group-hover:opacity-100">⌘</kbd>
              <kbd className="font-mono bg-background px-1.5 py-0.5 rounded border border-border/50 opacity-80 group-hover:opacity-100">K</kbd>
              <span className="uppercase tracking-widest ml-1 opacity-70 group-hover:opacity-100">Quick Add</span>
            </button>
          </div>
        </header>
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {container ? (
                <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12", contentClassName)}>
                  {children}
                </div>
              ) : (
                children
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
      <AddExpenseSheet />
      <Toaster
        richColors
        closeButton
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: '16px',
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
          },
        }}
      />
    </SidebarProvider>
  );
}