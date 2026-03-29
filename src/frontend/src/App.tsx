import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GraduationCap, LogIn } from "lucide-react";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useUserProfile } from "./hooks/useQueries";
import AddEmployee from "./pages/AddEmployee";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import EmployeeProfile from "./pages/EmployeeProfile";
import LeaveManagement from "./pages/LeaveManagement";
import Payroll from "./pages/Payroll";
import StaffDirectory from "./pages/StaffDirectory";

type Page =
  | "dashboard"
  | "staff"
  | "attendance"
  | "leaves"
  | "payroll"
  | "add-employee"
  | "departments";

const queryClient = new QueryClient();

function AppInner() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [viewingEmployeeId, setViewingEmployeeId] = useState<bigint | null>(
    null,
  );
  const { data: isAdmin } = useIsAdmin();
  const { data: userProfile } = useUserProfile();
  const { loginStatus, identity, login } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;

  const navigate = (page: Page) => {
    setViewingEmployeeId(null);
    setCurrentPage(page);
  };

  const handleViewProfile = (id: bigint) => {
    setViewingEmployeeId(id);
  };

  // Show login screen if not authenticated
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <div className="text-center space-y-6 max-w-sm w-full px-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skiltrix HR</h1>
            <p className="text-muted-foreground mt-2">
              Teaching Academy HR Management
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
            <p className="text-sm text-muted-foreground">
              Sign in with Internet Identity to access the HR portal
            </p>
            <Button
              data-ocid="login.primary_button"
              className="w-full"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loginStatus === "logging-in" ? "Signing in..." : "Sign In"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    );
  }

  const currentEmployeeId = userProfile?.employeeId ?? null;

  const renderPage = () => {
    if (viewingEmployeeId !== null) {
      return (
        <EmployeeProfile
          employeeId={viewingEmployeeId}
          onBack={() => setViewingEmployeeId(null)}
        />
      );
    }
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "staff":
        return (
          <StaffDirectory
            isAdmin={!!isAdmin}
            onViewProfile={handleViewProfile}
          />
        );
      case "attendance":
        return <Attendance isAdmin={!!isAdmin} />;
      case "leaves":
        return (
          <LeaveManagement
            isAdmin={!!isAdmin}
            currentEmployeeId={currentEmployeeId}
          />
        );
      case "payroll":
        return <Payroll isAdmin={!!isAdmin} />;
      case "add-employee":
        return isAdmin ? <AddEmployee /> : <Dashboard />;
      case "departments":
        return <Departments isAdmin={!!isAdmin} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        isAdmin={!!isAdmin}
      />
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
        <footer className="px-6 py-3 border-t border-border text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster />
    </QueryClientProvider>
  );
}
