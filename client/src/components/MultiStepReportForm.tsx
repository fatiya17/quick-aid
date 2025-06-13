import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileText, MapPin, Camera, ArrowLeft, ArrowRight, Send } from "lucide-react";
import { reportFormSchema, type ReportFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/use-geolocation";

const steps = [
  { id: 1, title: "Informasi Umum", icon: FileText },
  { id: 2, title: "Lokasi Kejadian", icon: MapPin },
  { id: 3, title: "Dokumentasi", icon: Camera },
];

export default function MultiStepReportForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getCurrentPosition, latitude, longitude, loading: locationLoading } = useGeolocation();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      disasterType: "",
      location: "",
      detailedAddress: "",
      description: "",
      reporterName: "",
      reporterPhone: "",
      reporterEmail: "",
      photos: [],
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
      setCurrentStep(1);
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

  const handleNext = async () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = await form.trigger(["disasterType", "description", "reporterName", "reporterPhone", "reporterEmail"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["location"]);
    } else {
      isValid = true;
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: ReportFormData) => {
    reportMutation.mutate(data);
  };

  const handleGetLocation = () => {
    getCurrentPosition();
    if (latitude && longitude) {
      form.setValue("location", `${latitude}, ${longitude}`);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-2xl">Laporkan Bencana</CardTitle>
          <div className="text-sm text-muted-foreground">
            Langkah {currentStep} dari {steps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 ${
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Step 1: Informasi Umum */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Informasi Umum Bencana</h3>
                  <p className="text-muted-foreground">Berikan informasi dasar tentang bencana yang terjadi</p>
                </div>

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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi Kejadian *</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={4} 
                          placeholder="Jelaskan detail situasi bencana yang terjadi, dampak yang terlihat, dan kondisi sekitar..." 
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
                          <Input placeholder="Nama lengkap (opsional)" {...field} />
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
                          <Input type="tel" placeholder="08xxxxxxxxxx (opsional)" {...field} />
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
                        <Input type="email" placeholder="email@contoh.com (untuk tracking laporan)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Lokasi Kejadian */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Lokasi Kejadian</h3>
                  <p className="text-muted-foreground">Tentukan lokasi tepat dimana bencana terjadi</p>
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasi Utama *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="Nama kota, kecamatan, atau alamat umum" {...field} />
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

                <FormField
                  control={form.control}
                  name="detailedAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Lengkap</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          placeholder="Berikan alamat yang lebih detail, nama jalan, landmark terdekat, dll..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {latitude && longitude && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Koordinat GPS:</p>
                    <p className="text-sm text-muted-foreground">
                      Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Dokumentasi */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Dokumentasi</h3>
                  <p className="text-muted-foreground">Upload foto untuk melengkapi laporan (opsional)</p>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Upload Foto Bencana</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop foto atau klik untuk memilih file
                  </p>
                  <Button type="button" variant="outline">
                    Pilih Foto
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: JPG, PNG. Maksimal 5MB per foto.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Tips Foto yang Baik:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Foto kondisi kerusakan secara jelas</li>
                    <li>• Sertakan landmark atau penanda lokasi</li>
                    <li>• Hindari foto yang blur atau gelap</li>
                    <li>• Prioritaskan keselamatan saat mengambil foto</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sebelumnya
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Selanjutnya
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="bg-alert hover:bg-alert/90 text-white"
                  disabled={reportMutation.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {reportMutation.isPending ? "Mengirim..." : "Kirim Laporan"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}