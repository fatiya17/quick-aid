// src/contexts/AuthContext.tsx (buat file baru ini)
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema'; // Sesuaikan path
import { getCurrentUser, logout } from '@/lib/auth'; // Sesuaikan path

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean; // Opsional: untuk menunjukkan loading saat memuat sesi
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Coba memuat user dari LocalStorage saat komponen pertama kali di-mount
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null); // Bersihkan state user lokal
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};