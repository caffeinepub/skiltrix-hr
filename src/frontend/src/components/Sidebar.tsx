import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Building2,
  CalendarCheck,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type Page =
  | "dashboard"
  | "staff"
  | "attendance"
  | "leaves"
  | "payroll"
  | "add-employee"
  | "departments";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "staff" as Page, label: "Staff Directory", icon: Users },
  { id: "attendance" as Page, label: "Attendance", icon: CalendarCheck },
  { id: "leaves" as Page, label: "Leave Management", icon: FileText },
  { id: "payroll" as Page, label: "Payroll", icon: DollarSign },
  { id: "departments" as Page, label: "Departments", icon: Building2 },
];

const adminItems = [
  { id: "add-employee" as Page, label: "Add Employee", icon: UserPlus },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  isAdmin,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sidebar-foreground text-sm leading-tight">
            Skiltrix HR
          </p>
          <p className="text-xs text-sidebar-foreground/50">Teaching Academy</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
          Main
        </p>
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            data-ocid={`nav.${item.id}.link`}
            onClick={() => {
              onNavigate(item.id);
              setMobileOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              currentPage === item.id
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </button>
        ))}

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mt-4 mb-2">
              Admin
            </p>
            {adminItems.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  currentPage === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Auth */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {isLoggedIn ? (
          <div className="space-y-2">
            <p className="text-xs text-sidebar-foreground/50 px-2 truncate">
              {identity.getPrincipal().toString().slice(0, 20)}...
            </p>
            <Button
              data-ocid="auth.logout.button"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={() => clear()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            data-ocid="auth.login.button"
            size="sm"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => login()}
            disabled={loginStatus === "logging-in"}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-bold text-sidebar-foreground text-sm">
            Skiltrix HR
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-60 bg-sidebar z-50 lg:hidden"
            >
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sidebar-foreground/70 hover:bg-sidebar-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
