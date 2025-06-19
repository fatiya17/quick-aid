import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Sun, Moon, LogOut, User, Settings, ChevronDown, UserCircle } from "lucide-react";
import { getCurrentUser, isAdmin, logout } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const user = getCurrentUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fungsi untuk memicu popup konfirmasi
  const triggerLogoutConfirm = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };

  // Fungsi untuk logout sebenarnya
  const confirmLogout = () => {
    logout();
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem",
    });
    setShowLogoutConfirm(false);
  };

  // Function to handle smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  // Handle navigation click
  type NavItem = {
    label: string;
    href: string;
    section?: string;
  };

  const handleNavClick = (item: NavItem) => {
    if (item.section) {
      if (location === "/") {
        scrollToSection(item.section);
      } else {
        setActiveSection(item.section);
        window.location.href = `/#${item.section}`;
      }
    } else {
      setActiveSection("");
    }
  };

  // Check URL hash on component mount and location change
  useEffect(() => {
    if (location === "/") {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setActiveSection(hash);
      } else {
        setActiveSection("");
      }
    } else {
      setActiveSection("");
    }
  }, [location]);

  // Function to determine if nav item is active
  const isNavItemActive = (item: NavItem) => {
    if (item.section) {
      return location === "/" && activeSection === item.section;
    }
    return location === item.href && !activeSection;
  };

  const navItems = [
    { label: "Beranda", href: "/", section: "hero" },
    { label: "Tentang", href: "/", section: "tentang" },
    { label: "Peta Bencana", href: "/map" },
    { label: "Laporan Saya", href: "/reports" },
  ];

  // Get user initials for avatar
  const getUserInitials = (user: any) => {
    if (user?.nama) {
      return user.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (isAdmin()) return "/admin";
    if (user?.role === "petugas") return "/petugas";
    return "/dashboard"; // fallback
  };

  const getDashboardLabel = () => {
    if (isAdmin()) return "Dashboard Admin";
    if (user?.role === "petugas") return "Dashboard Petugas";
    return "Dashboard";
  };

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3" onClick={() => setActiveSection("")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold">Quick Aid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item);
              return (
                <button
                  key={item.href + item.label}
                  onClick={() => handleNavClick(item)}
                  className={`px-4 py-2 rounded-2xl transition-colors duration-200 ease-in-out cursor-pointer ${isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-foreground/70 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  {item.section ? (
                    item.label
                  ) : (
                    <Link href={item.href} className="block w-full h-full" onClick={() => setActiveSection("")}>
                      {item.label}
                    </Link>
                  )}
                </button>
              );
            })}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-10 w-12 px-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Dashboard Button for Admin/Petugas - Positioned on the right */}
                {isAdmin() && (
                  <Link href="/admin">
                    <Button 
                      variant="default" 
                      className="bg-red-400 hover:bg-red-500 text-white font-medium shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </Button>
                  </Link>
                )}

                {/* Dashboard Button for Petugas */}
                {user?.role === "petugas" && !isAdmin() && (
                  <Link href="/petugas">
                    <Button 
                      variant="default" 
                      className="bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-md transition-all duration-200 hover:shadow-lg"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard Petugas
                    </Button>
                  </Link>
                )}

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
                  >
                    {/* User Avatar */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                      {getUserInitials(user)}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">
                        {user.nama || user.email}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role || 'User'}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {getUserInitials(user)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.nama || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 capitalize ${
                              isAdmin() ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              user.role === 'petugas' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {user.role || 'User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link href="/profile" onClick={() => setShowProfileDropdown(false)}>
                          <div className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <UserCircle className="h-4 w-4 mr-3 text-muted-foreground" />
                            Profil Saya
                          </div>
                        </Link>
                        
                        <Link href="/settings" onClick={() => setShowProfileDropdown(false)}>
                          <div className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                            <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                            Pengaturan
                          </div>
                        </Link>

                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        
                        <button
                          onClick={triggerLogoutConfirm}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8 px-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="text-foreground" />
              ) : (
                <Menu className="text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item);
                return (
                  <button
                    key={item.href + item.label}
                    onClick={() => {
                      handleNavClick(item);
                      setMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:text-primary hover:bg-muted"
                      }`}
                  >
                    {item.section ? (
                      item.label
                    ) : (
                      <Link
                        href={item.href}
                        className="block w-full h-full"
                        onClick={() => {
                          setActiveSection("");
                          setMobileMenuOpen(false);
                        }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </button>
                );
              })}

              {/* Mobile Auth Section */}
              <div className="px-3 py-4 border-t">
                {user ? (
                  <div className="space-y-3">
                    {/* User Info in Mobile */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getUserInitials(user)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.nama || user.email}</p>
                        <p className="text-sm text-muted-foreground capitalize">{user.role || 'User'}</p>
                      </div>
                    </div>

                    {/* Dashboard Button for Admin in Mobile */}
                    {isAdmin() && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full mb-2 bg-red-600 hover:bg-red-700 text-white">
                          <Shield className="mr-2 h-4 w-4" />
                          Dashboard Admin
                        </Button>
                      </Link>
                    )}

                    {/* Dashboard Button for Petugas in Mobile */}
                    {user?.role === "petugas" && !isAdmin() && (
                      <Link href="/petugas" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full mb-2 bg-orange-600 hover:bg-orange-700 text-white">
                          <Shield className="mr-2 h-4 w-4" />
                          Dashboard Petugas
                        </Button>
                      </Link>
                    )}

                    {/* Profile and Settings Links */}
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full mb-2">
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profil Saya
                      </Button>
                    </Link>

                    <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full mb-2">
                        <Settings className="mr-2 h-4 w-4" />
                        Pengaturan
                      </Button>
                    </Link>

                    {/* Logout Button for Mobile */}
                    <Button
                      variant="destructive"
                      onClick={() => {
                        triggerLogoutConfirm();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar dari akun Anda?
              {user?.role !== 'admin' && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Anda akan keluar dari akun Anda dan kembali ke halaman utama.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutConfirm(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-red-500 hover:bg-red-600">
              Ya, Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
}