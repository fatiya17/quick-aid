import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginData } from "@shared/schema";
import { login } from "@/lib/auth";
import { useLocation } from "wouter";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${user.name || user.username}`,
      });
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Login gagal",
        description: error.message || "Username atau password salah",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quick Aid</h1>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Masukkan kredensial Anda untuk mengakses dashboard admin
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukkan password" 
                            {...field} 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-alert text-white hover:bg-orange-600"
                  disabled={loginMutation.isPending}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {loginMutation.isPending ? "Masuk..." : "Masuk"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <Button 
              variant="link" 
              onClick={() => setLocation("/register")}
              className="text-primary hover:text-primary/80 p-0 h-auto"
            >
              Daftar di sini
            </Button>
          </p>
          <Button 
            variant="link" 
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:text-gray-800"
          >
            Kembali ke Beranda
          </Button>
        </div>
        
        {/* Demo credentials info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-800">
              <strong>Demo Login:</strong>
              <div>Username: admin</div>
              <div>Password: admin123</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
