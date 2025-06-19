import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Loader2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Home,
  LogIn,
  MapPin,
  Zap,
  Mountain,
  Waves,
  Radio,
  Heart,
  Star
} from "lucide-react";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Enhanced validation schema dengan validasi password yang lebih ketat
const registerSchema = z.object({
  nama: z.string().min(1, "Nama lengkap wajib diisi").min(2, "Nama minimal 2 karakter"),
  email: z.string().min(3, "Email minimal 3 karakter").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  role: z.enum(["pelapor", "petugas", "admin"]).default("pelapor"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

interface ApiError {
  message: string;
  field?: string;
}

export default function UserRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "pelapor",
    },
    mode: "onChange", // Validasi real-time untuk memastikan semua field terisi
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { confirmPassword, ...userData } = data;
      
      try {
        const response = await apiRequest("POST", "/api/register", userData);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Terjadi kesalahan yang tidak diketahui");
      }
    },
    onSuccess: (user) => {
      toast({
        title: "Registrasi berhasil",
        description: `Akun berhasil dibuat untuk ${user.nama || "pengguna"}`,
      });
      
      // Reset form sebelum redirect
      form.reset();
      
      // Delay redirect sedikit untuk memberikan waktu user membaca toast
      setTimeout(() => {
        setLocation("/admin/login");
      }, 1500);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      
      // Handle specific error cases
      let errorMessage = "Terjadi kesalahan saat mendaftar";
      
      if (error.message.includes("username")) {
        errorMessage = "Username sudah digunakan, silakan pilih username lain";
      } else if (error.message.includes("email")) {
        errorMessage = "Email sudah terdaftar";
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        errorMessage = "Tidak dapat terhubung ke server, periksa koneksi internet Anda";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registrasi gagal",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterData) => {
    // Validasi tambahan sebelum submit untuk memastikan semua field wajib terisi
    const requiredFields = [
      { field: 'nama', message: 'Nama lengkap wajib diisi' },
      { field: 'email', message: 'Email wajib diisi' },
      { field: 'password', message: 'Password wajib diisi' },
      { field: 'confirmPassword', message: 'Konfirmasi password wajib diisi' }
    ];

    let hasError = false;
    
    requiredFields.forEach(({ field, message }) => {
      if (!data[field as keyof RegisterData] || data[field as keyof RegisterData]?.toString().trim() === '') {
        form.setError(field as keyof RegisterData, {
          type: "manual",
          message: message
        });
        hasError = true;
      }
    });

    if (hasError) {
      toast({
        title: "Form tidak lengkap",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }
    
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Password tidak cocok"
      });
      return;
    }
    
    registerMutation.mutate(data);
  };

  const handleBackToHome = () => {
    setLocation("/");
  };

  const handleGoToLogin = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-green-400/30 to-teal-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full animate-bounce"></div>
      </div>

      {/* Floating icons */}
      <div className="absolute top-10 left-10 animate-float">
        <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center">
          <Heart className="w-6 h-6 text-red-600" />
        </div>
      </div>
      <div className="absolute top-20 right-32 animate-float-delayed">
        <div className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
          <Star className="w-5 h-5 text-yellow-600" />
        </div>
      </div>
      <div className="absolute bottom-32 left-20 animate-float">
        <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-emerald-600" />
        </div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 via-blue-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-800 bg-clip-text text-transparent">
                  Quick Aid
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disaster Reporting Platform</p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <Card className="relative shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden">
            {/* Card decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-600"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full"></div>

            <CardContent className="relative pt-10 pb-10 px-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-emerald-300 dark:to-white mb-3">
                  Buat Akun Baru
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Bergabung dengan platform pelaporan bencana terpercaya
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                  {/* Nama Field */}
                  <FormField
                    control={form.control}
                    name="nama"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                          <User className="w-4 h-4 mr-2 text-emerald-600" />
                          Nama Lengkap <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama lengkap Anda"
                              className="h-12 pl-4 pr-4 border-2 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all duration-300 group-hover:border-emerald-300"
                              disabled={registerMutation.isPending}
                              required
                              {...field}
                            />
                          </FormControl>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-blue-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-blue-500/5 group-hover:to-emerald-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                          Email <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              placeholder="Masukkan email Anda"
                              className="h-12 pl-4 pr-4 border-2 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all duration-300 group-hover:border-emerald-300"
                              disabled={registerMutation.isPending}
                              autoComplete="email"
                              required
                              {...field}
                            />
                          </FormControl>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-blue-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-blue-500/5 group-hover:to-emerald-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <FormMessage className="text-xs" />
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
                          <Lock className="w-4 h-4 mr-2 text-emerald-600" />
                          Password <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Masukkan password yang kuat"
                              className="h-12 pl-4 pr-12 border-2 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all duration-300 group-hover:border-emerald-300"
                              disabled={registerMutation.isPending}
                              autoComplete="new-password"
                              required
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 hover:bg-emerald-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={registerMutation.isPending}
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Sembunyikan password" : "Tampilkan password"}
                            </span>
                          </Button>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-blue-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-blue-500/5 group-hover:to-emerald-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-emerald-600" />
                          Konfirmasi Password <span className="text-red-500 ml-1">*</span>
                        </FormLabel>
                        <div className="relative group">
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Ulangi password yang sama"
                              className="h-12 pl-4 pr-12 border-2 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all duration-300 group-hover:border-emerald-300"
                              disabled={registerMutation.isPending}
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-2 h-8 w-8 hover:bg-emerald-50 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={registerMutation.isPending}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                            </span>
                          </Button>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/0 via-blue-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-blue-500/5 group-hover:to-emerald-500/5 transition-all duration-300 pointer-events-none"></div>
                        </div>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {/* Register Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700 hover:from-emerald-700 hover:via-blue-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 group"
                    disabled={registerMutation.isPending || !form.formState.isValid || 
                      !form.watch('nama')?.trim() || 
                      !form.watch('email')?.trim() || 
                      !form.watch('password')?.trim() || 
                      !form.watch('confirmPassword')?.trim()}
                  >
                    <div className="flex items-center justify-center">
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Mendaftar...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                          Daftar Sekarang
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sudah punya akun?
              </p>
              <Button
                variant="link"
                onClick={handleGoToLogin}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 p-0 h-auto font-semibold group"
                disabled={registerMutation.isPending}
              >
                <LogIn className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
                Masuk di sini
              </Button>
            </div>

            <Button
              variant="link"
              onClick={handleBackToHome}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium group"
              disabled={registerMutation.isPending}
            >
              <Home className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform duration-200" />
              Kembali ke Beranda
            </Button>
          </div>

          {/* Registration Benefits */}
          <Card className="bg-gradient-to-br from-emerald-50/80 via-blue-50/80 to-emerald-50/80 dark:from-emerald-950/30 dark:via-blue-950/30 dark:to-emerald-950/30 border border-emerald-200/50 dark:border-emerald-500/20 backdrop-blur-sm">
            <CardContent className="pt-6 pb-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Zap className="w-3 h-3 mr-1" />
                  Keuntungan Bergabung
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-emerald-200/30 hover:border-emerald-400/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Lapor Cepat</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Laporkan bencana dengan mudah</div>
                </div>

                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200/30 hover:border-blue-400/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Lokasi Akurat</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Koordinat GPS otomatis</div>
                </div>

                <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200/30 hover:border-purple-400/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-200">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Bantu Sesama</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Berkontribusi untuk komunitas</div>
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