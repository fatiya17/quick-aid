import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  Eye,
  EyeOff,
  Users,
  AlertTriangle,
  UserCheck,
  Mail,
  Lock,
  ArrowRight,
  Home,
  UserPlus,
  MapPin,
  Zap,
  Mountain,
  Waves,
  Radio,
  TrendingUp
} from "lucide-react";
import { loginSchema, type LoginData } from "@shared/schema";
import { login } from "@/lib/auth";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { user, setUser, isLoading } = useAuth();

  useEffect(() => {
    // Jika sesi selesai dimuat dan user sudah ada
    if (!isLoading && user) {
      // Redirect berdasarkan role
      switch (user.role) {
        case "admin":
          setLocation("/admin");
          break;
        case "petugas":
          setLocation("/petugas"); // Asumsi ada rute ini
          break;
        default:
          setLocation("/"); // Untuk pelapor atau role lain
          break;
      }
    }
  }, [user, isLoading, setLocation]); // Dependensi effec

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (loggedInUser) => { // Gunakan nama berbeda agar tidak konflik dengan 'user' dari context
      setUser(loggedInUser); // Set user di context setelah login berhasil
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${loggedInUser.nama || loggedInUser.email}`,
      });

      // Redirect berdasarkan role
      switch (loggedInUser.role) {
        case "admin":
          setLocation("/admin");
          break;
        case "petugas":
          setLocation("/petugas");
          break;
        case "pelapor":
          setLocation("/");
          break;
        default:
          setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login gagal",
        description: error.message || "Email atau password salah",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  if (isLoading || user) {
    // Tampilkan pesan loading atau kosongkan layar selama proses redirect
    // untuk mencegah form login berkedip.
    return <div className="min-h-screen flex items-center justify-center">Memeriksa sesi...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-green-400/30 to-teal-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full animate-bounce"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-10 left-10 animate-float">
        <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center">
          <Mountain className="w-6 h-6 text-orange-600" />
        </div>
      </div>
      <div className="absolute top-20 right-32 animate-float-delayed">
        <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
          <Waves className="w-5 h-5 text-blue-600" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 animate-float">
        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
          <Radio className="w-4 h-4 text-green-600" />
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Quick Aid
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disaster Reporting Platform</p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <Card className="relative shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden">
            {/* Card decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full"></div>

            <CardContent className="relative pt-10 pb-10 px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-blue-300 dark:to-white mb-3">
                  Masuk ke Akun
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Akses platform pelaporan bencana terpercaya
                </p>
              </div>

              <Form {...form}>
                <div onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          Email
                        </FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              placeholder="Masukkan email Anda"
                              className="h-12 pl-4 pr-4 border-2 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-blue-300"
                              {...field}
                            />
                          </FormControl>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-blue-600" />
                          Password
                        </FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan password Anda"
                              className="h-12 pl-4 pr-12 border-2 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-300 group-hover:border-blue-300"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </Button>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Login Button */}
                  <Button
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 group"
                    disabled={loginMutation.isPending}
                  >
                    <div className="flex items-center justify-center">
                      {loginMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                          Masuk ke Platform
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </Button>
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Belum punya akun pelapor?
              </p>
              <Button
                variant="link"
                onClick={() => setLocation("/register")}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto font-semibold group"
              >
                <UserPlus className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
                Daftar Sekarang
              </Button>
            </div>

            <Button
              variant="link"
              onClick={() => setLocation("/")}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium group"
            >
              <Home className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
              Kembali ke Beranda
            </Button>
          </div>

          {/* Demo Credentials */}
          <Card className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-blue-50/80 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-blue-950/30 border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Zap className="w-3 h-3 mr-1" />
                  Demo Login Tersedia
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/30 hover:border-blue-400/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Admin</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">admindev@gmail.com / admin123</div>
                </div>

                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-green-200/30 hover:border-green-400/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Petugas</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">- / -</div>
                </div>

                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-orange-200/30 hover:border-orange-400/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer group">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Pelapor</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">pelapor@gmail.com / pelaporpass</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}