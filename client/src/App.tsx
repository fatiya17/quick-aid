import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ReportTrackingPage from "@/pages/ReportTrackingPage";
import InteractiveMapPage from "@/pages/InteractiveMapPage";
import NotFound from "@/pages/not-found";
import { getCurrentUser, isAdmin } from "@/lib/auth";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  
  if (!user || !isAdmin()) {
    return <Redirect to="/admin/login" />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin">
        <ProtectedAdminRoute>
          <AdminDashboardPage />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/reports" component={ReportTrackingPage} />
      <Route path="/map" component={InteractiveMapPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
