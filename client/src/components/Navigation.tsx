import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Sun, Moon } from "lucide-react";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getCurrentUser();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Peta Bencana", href: "/map" },
    { label: "Laporan Saya", href: "/reports" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold">Quick Aid</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  location === item.href
                    ? "text-primary font-medium"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-8 w-8 px-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Selamat datang, {user.name || user.username}
                </span>
                {isAdmin() ? (
                  <Link href="/admin">
                    <Button variant="default">
                      <Shield className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </Button>
                  </Link>
                ) : (
                  <Link href="/admin/login">
                    <Button variant="default">
                      <Shield className="mr-2 h-4 w-4" />
                      Login Admin
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Link href="/admin/login">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Shield className="mr-2 h-4 w-4" />
                  Login Admin
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-foreground/70 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Shield className="mr-2 h-4 w-4" />
                    Login Admin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
