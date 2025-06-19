import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import AdminLoginPage from "@/pages/LoginPage";
import ProfilePage from "@/components/ProfilePage";
import Pengaturan from "@/components/Pengaturan";
import UserRegisterPage from "@/pages/UserRegisterPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import ReportTrackingPage from "@/pages/ReportTrackingPage";
import InteractiveMapPage from "@/pages/InteractiveMapPage";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { queryClient } from './lib/queryClient'; // Import dari file yang sudah diperbaiki

// Komponen Rute Terproteksi yang lebih sederhana
function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memeriksa sesi admin...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    // Jika tidak loading dan bukan admin, langsung redirect
    return <Redirect to="/login" />;
  }

  // Jika admin, tampilkan children
  return <>{children}</>;
}

// Komponen Rute Terproteksi untuk pengguna yang sudah login (semua role)
function ProtectedUserRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memeriksa sesi pengguna...</p>
      </div>
    );
  }

  if (!user) {
    // Jika tidak loading dan tidak ada user, redirect ke login
    return <Redirect to="/login" />;
  }

  // Jika sudah login, tampilkan children
  return <>{children}</>;
}

// Komponen utama untuk routing
function AppRouter() {
  return (
    <Switch>
      {/* Rute Publik */}
      <Route path="/" component={HomePage} />
      <Route path="/login" component={AdminLoginPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/register" component={UserRegisterPage} />
      <Route path="/reports" component={ReportTrackingPage} />
      <Route path="/map" component={InteractiveMapPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/settings" component={Pengaturan} />

      {/* Rute yang dilindungi untuk Admin */}
      <Route path="/admin">
        <ProtectedAdminRoute>
          <AdminDashboardPage />
        </ProtectedAdminRoute>
      </Route>

      {/* Contoh Rute untuk Dashboard Pelapor (jika ada halaman terpisah) */}
      <Route path="/dashboard">
        <ProtectedUserRoute>
          {/* Ganti dengan komponen dashboard pelapor Anda jika ada */}
          <p>Halaman Dashboard Pelapor (Butuh Login)</p>
        </ProtectedUserRoute>
      </Route>

      {/* Halaman Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith('/admin');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="quick-aid-theme">
        <TooltipProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground">
              {/* Tampilkan navigasi jika BUKAN halaman admin */}
              {!isAdminPage && <Navigation />}

              {/* Router utama aplikasi */}
              <AppRouter />
            </div>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;