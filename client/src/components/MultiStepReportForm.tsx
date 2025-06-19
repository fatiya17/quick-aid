import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileText, MapPin, Camera, ArrowLeft, ArrowRight, Send, Loader2, XCircle, AlertCircle, CheckCircle, Copy, X, Eye, Zap, Hash,
  Shield,
  ChevronRight,
  Clock,
  Mail,
  BarChart3,
  Plus} from "lucide-react";

const steps = [
  { id: 1, title: "Informasi Umum", icon: FileText },
  { id: 2, title: "Lokasi Kejadian", icon: MapPin },
  { id: 3, title: "Dokumentasi", icon: Camera },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

interface PhotoPreview {
  id: number;
  url: string;
  file?: File;
  preview?: string;
  uploaded?: boolean;
}

interface FormData {
  disasterType: string;
  location: string;
  detailedAddress: string;
  description: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail: string;
  photos: string[];
  latitude?: string;
  longitude?: string;
}

export default function MultiStepReportForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<{ title: string; description: string; variant?: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    disasterType: "",
    location: "",
    detailedAddress: "",
    description: "",
    reporterName: "",
    reporterPhone: "",
    reporterEmail: "",
    photos: [],
    latitude: "",
    longitude: "",
  });

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (title: string, description: string, variant?: string) => {
    setToast({ title, description, variant });
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file terlalu besar. Maksimal 5MB.";
    }
    return null;
  };

  // Upload foto ke API
  const uploadPhoto = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      showToast("File tidak valid", validationError, "destructive");
      return;
    }

    // Buat preview terlebih dahulu
    const previewUrl = URL.createObjectURL(file);
    const newPreview: PhotoPreview = {
      id: Date.now(),
      url: previewUrl,
      file: file,
      preview: previewUrl,
      uploaded: false
    };

    setPhotoPreviews(prev => [...prev, newPreview]);
    setIsUploading(true);

    try {
      // Upload ke server
      const uploadedUrl = await uploadPhoto(file);
      
      // Update preview dengan URL yang sudah diupload
      setPhotoPreviews(prev =>
        prev.map(preview =>
          preview.id === newPreview.id
            ? { ...preview, url: uploadedUrl, uploaded: true }
            : preview
        )
      );

      // Update form data photos array
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, uploadedUrl]
      }));

      showToast("Upload berhasil", "Foto berhasil diunggah");
    } catch (error: any) {
      // Hapus preview jika upload gagal
      setPhotoPreviews(prev => prev.filter(preview => preview.id !== newPreview.id));
      showToast("Upload Gagal", error.message || "Terjadi kesalahan saat upload", "destructive");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const removePhoto = (previewToRemove: PhotoPreview) => {
    // Hapus dari preview
    setPhotoPreviews(prev => prev.filter(preview => preview.id !== previewToRemove.id));
    
    // Hapus dari form data jika sudah terupload
    if (previewToRemove.uploaded && previewToRemove.url) {
      setFormData(prev => ({
        ...prev,
        photos: prev.photos.filter(url => url !== previewToRemove.url)
      }));
    }

    // Cleanup object URL
    if (previewToRemove.preview && previewToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove.preview);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateCurrentStep = (step: number): { isValid: boolean, errors: string[] } => {
    const errors: string[] = [];

    if (step === 1) {
      if (!formData.disasterType.trim()) errors.push('Jenis Bencana wajib dipilih');
      if (!formData.description.trim()) errors.push('Deskripsi Kejadian wajib diisi');
      else if (formData.description.trim().length < 10) errors.push('Deskripsi harus minimal 10 karakter');
      if (!formData.reporterName.trim()) errors.push('Nama Pelapor wajib diisi');
      if (!formData.reporterPhone.trim()) errors.push('Nomor Telepon wajib diisi');
      else if (!/^(08|628)\d{8,12}$/.test(formData.reporterPhone.replace(/\s+/g, ''))) {
        errors.push('Format nomor telepon tidak valid');
      }
      if (!formData.reporterEmail.trim()) errors.push('Email wajib diisi');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.reporterEmail)) {
        errors.push('Format email tidak valid');
      }
    } else if (step === 2) {
      if (!formData.location.trim()) errors.push('Lokasi Utama wajib diisi');
      if (!formData.detailedAddress.trim()) errors.push('Alamat Lengkap wajib diisi');
      else if (formData.detailedAddress.trim().length < 10) {
        errors.push('Alamat lengkap harus minimal 10 karakter');
      }
    } else if (step === 3) {
      const uploadedPhotos = photoPreviews.filter(preview => preview.uploaded);
      if (uploadedPhotos.length === 0) errors.push('Minimal 1 foto wajib diupload');
      if (isUploading) errors.push('Tunggu hingga semua foto selesai diupload');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  const handleNext = () => {
    const validation = validateCurrentStep(currentStep);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      showToast("Form belum lengkap", `${validation.errors.length} field wajib belum diisi dengan benar`, "destructive");
      return;
    }

    setValidationErrors([]);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setValidationErrors([]);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (currentStep !== steps.length) return;

    const validation = validateCurrentStep(currentStep);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      showToast("Form belum lengkap", "Mohon periksa kembali semua field yang wajib diisi", "destructive");
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    try {
      // Persiapkan data untuk dikirim ke API
      const reportData = {
        disasterType: formData.disasterType,
        location: formData.location,
        detailedAddress: formData.detailedAddress,
        description: formData.description,
        reporterName: formData.reporterName,
        reporterPhone: formData.reporterPhone,
        reporterEmail: formData.reporterEmail,
        photos: formData.photos, // Array URL foto yang sudah diupload
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
      };

      console.log('Sending data to API:', reportData);

      // Kirim data ke API
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }

      const result = await response.json();
      console.log('Report created successfully:', result);

      // Set tracking code dari response
      setTrackingCode(result.code);
      setIsSuccess(true);

      showToast("Laporan berhasil dikirim!", "Tim respons akan segera menindaklanjuti laporan Anda");

    } catch (error: any) {
      console.error('Error submitting report:', error);
      showToast("Gagal mengirim laporan", error.message || "Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

const copyTrackingCode = () => {
  navigator.clipboard.writeText(trackingCode);
  setShowCopySuccess(true);
  setTimeout(() => setShowCopySuccess(false), 3000);
};

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          handleInputChange("latitude", lat);
          handleInputChange("longitude", lng);
          showToast("Koordinat GPS berhasil didapatkan", "Silakan isi lokasi utama dengan nama tempat yang mudah dimengerti");
        },
        (error) => {
          console.error('Error getting location:', error);
          showToast("Gagal mendapatkan lokasi", "Mohon masukkan lokasi secara manual", "destructive");
        }
      );
    } else {
      showToast("GPS tidak didukung", "Browser Anda tidak mendukung GPS", "destructive");
    }
  };

  const resetForm = () => {
    setFormData({
      disasterType: "",
      location: "",
      detailedAddress: "",
      description: "",
      reporterName: "",
      reporterPhone: "",
      reporterEmail: "",
      photos: [],
      latitude: "",
      longitude: "",
    });
    setPhotoPreviews([]);
    setCurrentStep(1);
    setValidationErrors([]);
    setIsSuccess(false);
    setTrackingCode("");
    setIsCopied(false);
    setShowCopySuccess(false);
  };

// Success Modal
  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg animate-in fade-in-0 scale-in-95 duration-300 
                         bg-white dark:bg-gray-900 border-0 shadow-2xl overflow-hidden
                         relative">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardContent className="p-0 relative">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center p-6 pb-4 relative">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 
                                  rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <CheckCircle className="h-7 w-7 text-white drop-shadow-sm" />
                  </div>
                  {/* Floating particles effect */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-300 rounded-full animate-bounce delay-75"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce delay-150"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Laporan Terkirim
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 
                                     text-green-700 dark:text-green-300 rounded-full animate-pulse">
                      ✓ Sukses
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Berhasil dikirim ke tim respons
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="h-9 w-9 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 
                           text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300
                           transition-all duration-200 hover:rotate-90 hover:scale-110"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="px-6 pb-6 space-y-6">
              {/* Tracking Code */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 
                              rounded-xl p-5 border dark:border-gray-700 relative overflow-hidden
                              hover:shadow-md transition-all duration-300">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"></div>
                
                <div className="text-center relative">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Hash className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kode Tracking Laporan
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 
                                     bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/20 
                                     px-5 py-3 rounded-lg border border-blue-200 dark:border-blue-800
                                     shadow-sm hover:shadow-md transition-all duration-200
                                     selection:bg-blue-200 dark:selection:bg-blue-800">
                      {trackingCode}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={copyTrackingCode}
                      className="h-11 w-11 p-0 border-gray-300 dark:border-gray-600
                                 hover:bg-gray-50 dark:hover:bg-gray-700
                                 text-gray-600 dark:text-gray-400
                                 hover:border-blue-400 dark:hover:border-blue-500
                                 hover:text-blue-600 dark:hover:text-blue-400
                                 transition-all duration-200 hover:scale-105 active:scale-95
                                 group"
                    >
                      <Copy className="h-4 w-4 group-hover:animate-pulse" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Simpan kode untuk tracking status laporan
                  </p>
                </div>
              </div>

              {/* Copy Success Notification */}
              {showCopySuccess && (
                <div className="fixed top-4 right-4 z-60 animate-in slide-in-from-right-2 fade-in-0 duration-300">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2
                                  border border-green-400 backdrop-blur-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Kode berhasil disalin!</span>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <ChevronRight className="h-3 w-3 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Langkah Selanjutnya:
                  </h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 
                                  rounded-lg p-3 -m-3 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center 
                                    flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-500" />
                        Tim akan verifikasi laporan dalam <span className="font-medium text-orange-600 dark:text-orange-400">15-30 menit</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 
                                  rounded-lg p-3 -m-3 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center 
                                    flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xs font-bold text-white">2</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-blue-500" />
                        Notifikasi update akan dikirim via email
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 
                                  rounded-lg p-3 -m-3 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center 
                                    flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform duration-200">
                      <span className="text-xs font-bold text-white">3</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-purple-500" />
                        Pantau progress di halaman <span className="font-medium text-purple-600 dark:text-purple-400">Laporan Saya</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={resetForm}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                             dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700
                             text-white border-0 shadow-lg hover:shadow-xl
                             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                             flex items-center justify-center gap-2 group"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
                  Buat Laporan Baru
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Navigate to tracking page
                    window.location.href = '/reports';
                  }}
                  className="flex-1 border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 
                             text-gray-700 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             hover:border-gray-400 dark:hover:border-gray-500
                             transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                             flex items-center justify-center gap-2 group
                             shadow-sm hover:shadow-md"
                >
                  <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Lihat Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 min-w-80 p-4 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-300 ${
          toast.variant === 'destructive' ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            {toast.variant === 'destructive' ? (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium ${toast.variant === 'destructive' ? 'text-red-900' : 'text-green-900'}`}>
                {toast.title}
              </h4>
              <p className={`text-sm mt-1 ${toast.variant === 'destructive' ? 'text-red-700' : 'text-green-700'}`}>
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className={`${toast.variant === 'destructive' ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">Laporkan Bencana</CardTitle>
            <div className="text-sm text-muted-foreground dark:text-gray-400">
              Langkah {currentStep} dari {steps.length}
            </div>
          </div>
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
          {/* Validation Errors Display */}
          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Mohon lengkapi field berikut:</h4>
              </div>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 1: Informasi Umum */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Informasi Umum Bencana</h3>
                <p className="text-muted-foreground dark:text-gray-400">Berikan informasi dasar tentang bencana yang terjadi</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Jenis Bencana *</label>
                <select
                  value={formData.disasterType}
                  onChange={(e) => handleInputChange('disasterType', e.target.value)}
                  className="w-full p-3 border text-sm 
                             border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white
                             rounded-md 
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                             focus:border-transparent
                             hover:border-gray-400 dark:hover:border-gray-500
                             transition-colors duration-200"
                >
                  <option value="" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Pilih jenis bencana</option>
                  <option value="banjir" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Banjir</option>
                  <option value="gempa" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Gempa Bumi</option>
                  <option value="kebakaran" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Kebakaran</option>
                  <option value="longsor" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Tanah Longsor</option>
                  <option value="tsunami" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Tsunami</option>
                  <option value="angin" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Angin Kencang</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Deskripsi Kejadian *</label>
                <Textarea
                  rows={4}
                  placeholder="Jelaskan detail situasi bencana yang terjadi, dampak yang terlihat, dan kondisi sekitar (minimal 10 karakter)..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border text-sm 
                             border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400
                             rounded-md 
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                             focus:border-transparent
                             hover:border-gray-400 dark:hover:border-gray-500
                             transition-colors duration-200"
                />
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                  {formData.description.length}/10 karakter minimum
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Nama Pelapor *</label>
                  <Input
                    placeholder="Nama lengkap"
                    value={formData.reporterName}
                    onChange={(e) => handleInputChange('reporterName', e.target.value)}
                    className="w-full p-3 border text-sm 
                               border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 
                               text-gray-900 dark:text-white
                               placeholder-gray-500 dark:placeholder-gray-400
                               rounded-md 
                               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                               focus:border-transparent
                               hover:border-gray-400 dark:hover:border-gray-500
                               transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Nomor Telepon *</label>
                  <Input
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.reporterPhone}
                    onChange={(e) => handleInputChange('reporterPhone', e.target.value)}
                    className="w-full p-3 border text-sm 
                               border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 
                               text-gray-900 dark:text-white
                               placeholder-gray-500 dark:placeholder-gray-400
                               rounded-md 
                               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                               focus:border-transparent
                               hover:border-gray-400 dark:hover:border-gray-500
                               transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Email *</label>
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  value={formData.reporterEmail}
                  onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                  className="w-full p-3 border text-sm 
                             border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400
                             rounded-md 
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                             focus:border-transparent
                             hover:border-gray-400 dark:hover:border-gray-500
                             transition-colors duration-200"
                />
              </div>
            </div>
          )}

          {/* Step 2: Lokasi Kejadian */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Lokasi Kejadian</h3>
                <p className="text-muted-foreground dark:text-gray-400">Tentukan lokasi tepat dimana bencana terjadi</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Lokasi Utama *</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nama kota, kecamatan, atau alamat umum"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-3 border text-sm 
                               border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 
                               text-gray-900 dark:text-white
                               placeholder-gray-500 dark:placeholder-gray-400
                               rounded-md 
                               focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                               focus:border-transparent
                               hover:border-gray-400 dark:hover:border-gray-500
                               transition-colors duration-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocation}
                    className="border-gray-300 dark:border-gray-600 
                               bg-white dark:bg-gray-800 
                               text-gray-900 dark:text-white
                               hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Alamat Lengkap *</label>
                <Textarea
                  rows={3}
                  placeholder="Berikan alamat yang lebih detail, nama jalan, landmark terdekat, dll (minimal 10 karakter)..."
                  value={formData.detailedAddress}
                  onChange={(e) => handleInputChange('detailedAddress', e.target.value)}
                  className="w-full p-3 border text-sm 
                             border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400
                             rounded-md 
                             focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                             focus:border-transparent
                             hover:border-gray-400 dark:hover:border-gray-500
                             transition-colors duration-200"
                />
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                  {formData.detailedAddress.length}/10 karakter minimum
                </p>
              </div>

              {(formData.latitude && formData.longitude) && (
                <div className="p-4 bg-muted/50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <p className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Koordinat GPS:</p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    Latitude: {formData.latitude}, Longitude: {formData.longitude}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Dokumentasi */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Dokumentasi</h3>
                <p className="text-muted-foreground dark:text-gray-400">Upload foto untuk melengkapi laporan (wajib minimal 1 foto)</p>
              </div>

              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                photoPreviews.length === 0
                  ? "border-amber-300 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                  : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50"
              }`}>
                <Camera className={`h-12 w-12 mx-auto mb-4 transition-colors duration-200 ${
                  photoPreviews.length === 0
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-gray-400 dark:text-gray-500"
                }`} />

                <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                  Upload Foto Bencana *
                </p>

                <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
                  Seret & lepas foto atau klik untuk memilih file.
                </p>

                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg"
                  disabled={isUploading}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                  className="border-gray-300 dark:border-gray-600 
                             bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             hover:border-gray-400 dark:hover:border-gray-500
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors duration-200"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    "Pilih Foto"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-2">
                  Format: JPG, PNG. Maksimal 5MB. Minimal 1 foto wajib.
                </p>

                {photoPreviews.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                    ⚠️ Minimal 1 foto harus diupload untuk melanjutkan
                  </p>
                )}
              </div>

              {photoPreviews.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">
                    ✓ Foto Terunggah ({photoPreviews.filter(p => p.uploaded).length}/{photoPreviews.length}):
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photoPreviews.map((preview) => (
                      <div key={preview.id} className="relative group">
                        <img
                          src={preview.preview || preview.url}
                          alt={`Preview Bencana ${preview.id}`}
                          className={`rounded-md w-full h-24 object-cover border-2 ${
                            preview.uploaded ? 'border-green-200 dark:border-green-800' : 'border-yellow-200 dark:border-yellow-800'
                          }`}
                        />
                        {!preview.uploaded && (
                          <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(preview)}
                          className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-0.5 text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-md border dark:border-gray-600"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 
                         text-gray-900 dark:text-white
                         hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length && (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                >
                  Selanjutnya
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {currentStep === steps.length && (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
                  disabled={isSubmitting || photoPreviews.filter(p => p.uploaded).length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Kirim Laporan
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}