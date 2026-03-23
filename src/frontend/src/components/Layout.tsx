import { Button } from "@/components/ui/button";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Calculator,
  Heart,
  IndianRupee,
  LayoutDashboard,
  Menu,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/health-score", label: "Money Health Score", icon: Heart },
  { path: "/fire-planner", label: "FIRE Planner", icon: TrendingUp },
  { path: "/tax-wizard", label: "Tax Wizard", icon: Calculator },
  { path: "/life-event", label: "Life Event Advisor", icon: Sparkles },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border fixed inset-y-0 z-30">
        <SidebarContent currentPath={currentPath} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <BrandLogo />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground/70"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SidebarContent
                currentPath={currentPath}
                onNav={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar sticky top-0 z-20">
          <BrandLogo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="text-foreground/70"
            data-ocid="nav.toggle"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="border-t border-border px-6 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

function BrandLogo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
        <IndianRupee className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="font-display font-bold text-foreground text-lg leading-tight">
        FinMentor
      </span>
    </Link>
  );
}

function SidebarContent({
  currentPath,
  onNav,
}: {
  currentPath: string;
  onNav?: () => void;
}) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <div className="hidden lg:flex items-center gap-2 p-4 border-b border-sidebar-border">
        <BrandLogo />
      </div>
      <nav className="p-3 flex-1 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNav}
              data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 ${
                  isActive ? "text-primary" : "text-sidebar-foreground/50"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
          <p className="text-xs text-primary font-semibold mb-1">
            💡 Did you know?
          </p>
          <p className="text-xs text-muted-foreground">
            Starting SIPs at 25 vs 35 can double your retirement corpus.
          </p>
        </div>
      </div>
    </div>
  );
}
