import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export default function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = getCurrentUser();

  const navItems = [
    { label: "Beranda", href: "/" },
    { label: "Peta Bencana", href: "/map" },
    { label: "Laporan Saya", href: "/reports" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="text-white text-sm" />
            </div>
            <span className="text-xl font-bold text-gray-900">Quick Aid</span>
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
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
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
                <Button className="bg-primary text-white hover:bg-secondary">
                  <Shield className="mr-2 h-4 w-4" />
                  Login Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="text-gray-700" />
            ) : (
              <Menu className="text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-primary text-white hover:bg-secondary">
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
