import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Bolt, MapPin, Phone, FileText, CheckCircle, Clock, Users, TrendingUp, MapPinned, Info } from "lucide-react";
import { reportFormSchema, type ReportFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocation } from "wouter";

export default function HomePage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { getCurrentPosition, latitude, longitude, loading: locationLoading } = useGeolocation();

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      disasterType: "",
      location: "",
      description: "",
      reporterName: "",
      reporterPhone: "",
      reporterEmail: "",
      status: "pending",
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (data: ReportFormData) => {
      const reportData = {
        ...data,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
      };
      const response = await apiRequest("POST", "/api/reports", reportData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Laporan berhasil dikirim!",
        description: `Kode tracking: ${data.code}`,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal mengirim laporan",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReportFormData) => {
    reportMutation.mutate(data);
  };

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  const features = [
    {
      icon: Bolt,
      title: "Pelaporan Real-time & Validasi Cepat",
      description: "Laporkan kejadian bencana secara langsung dengan validasi tim profesional dalam hitungan menit."
    },
    {
      icon: MapPinned,
      title: "Peta Interaktif & Filter Peta",
      description: "Visualisasi bencana pada peta interaktif dengan filter berdasarkan lokasi, jenis, dan waktu kejadian."
    },
    {
      icon: Shield,
      title: "Tips SOP & Nomor Darurat",
      description: "Akses mudah ke panduan SOP evakuasi dan daftar kontak darurat untuk berbagai situasi bencana."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Laporkan Bencana Secara Real-Time di Seluruh Indonesia
              </h1>
              <p className="text-xl text-blue-100">
                Quick Aid adalah platform pelaporan bencana berbasis teknologi yang memudahkan masyarakat melaporkan dan memantau bencana alam secara langsung di seluruh wilayah Indonesia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-alert text-white hover:bg-orange-600 transform hover:scale-105 transition-all shadow-lg"
                  onClick={() => document.getElementById("quick-report")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Lapor Sekarang
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white text-primary hover:bg-gray-50 border-white/20"
                  onClick={() => setLocation("/map")}
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Lihat Peta
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Mobile App Mockup */}
              <div className="relative mx-auto w-80 h-96 bg-blue-400 rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden">
                  <div className="bg-primary text-white p-4 text-center">
                    <MapPin className="mx-auto text-2xl mb-2" />
                    <div className="text-sm font-medium">Quick Aid Mobile</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-3 bg-red-50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="text-sm text-red-800">Banjir - Jakarta Utara</div>
                    </div>
                    <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-warning rounded-full"></div>
                      <div className="text-sm text-yellow-800">Gempa - Sumedang</div>
                    </div>
                    <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <div className="text-sm text-green-800">Kebakaran - Jakarta</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg p-3 shadow-lg animate-bounce">
                <FileText className="text-alert text-lg" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-lg">
                <TrendingUp className="text-success text-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dampak Quick Aid</h2>
            <p className="text-lg text-gray-600">Platform terpercaya untuk pelaporan bencana di Indonesia</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6 bg-blue-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-primary">{stats?.total || 0}</div>
                <div className="text-gray-600 font-medium">Total Laporan</div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-green-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-success">{stats?.resolved || 0}</div>
                <div className="text-gray-600 font-medium">Telah Ditangani</div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-orange-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-alert rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-alert">2.5</div>
                <div className="text-gray-600 font-medium">Jam Rata-rata Respon</div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-purple-50">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-purple-600">15,420</div>
                <div className="text-gray-600 font-medium">Pengguna Aktif</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Quick Aid?</h2>
            <p className="text-lg text-gray-600">Solusi lengkap untuk pelaporan dan penanganan bencana</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-6">
                    <feature.icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Report Section */}
      <section id="quick-report" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Laporkan Bencana Sekarang</h2>
            <p className="text-lg text-gray-600">Bantu sesama dengan melaporkan kondisi bencana di sekitar Anda</p>
          </div>
          
          <Card className="bg-gradient-to-r from-blue-50 to-orange-50 p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="disasterType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis Bencana *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jenis bencana" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="banjir">🌊 Banjir</SelectItem>
                            <SelectItem value="gempa">🌍 Gempa Bumi</SelectItem>
                            <SelectItem value="kebakaran">🔥 Kebakaran</SelectItem>
                            <SelectItem value="longsor">⛰️ Tanah Longsor</SelectItem>
                            <SelectItem value="tsunami">🌊 Tsunami</SelectItem>
                            <SelectItem value="angin">💨 Angin Kencang</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Kejadian *</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input placeholder="Masukkan alamat lengkap" {...field} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={handleGetLocation}
                            disabled={locationLoading}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Kejadian *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Jelaskan situasi bencana yang terjadi..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="reporterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pelapor</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama Anda (opsional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reporterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Nomor telepon (opsional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reporterEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email untuk tracking laporan (opsional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-alert text-white py-4 hover:bg-orange-600 transform hover:scale-[1.02] transition-all shadow-lg"
                  disabled={reportMutation.isPending}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  {reportMutation.isPending ? "Mengirim..." : "Kirim Laporan Darurat"}
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </section>
    </div>
  );
}
