import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  Zap, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  Map, 
  Info, 
  Clipboard, 
  AlertTriangle, 
  Flame,
  Home,
  Waves,
  Mountain,
  Radio,
  Eye,
  Activity,
  Smartphone,
  Cloud,
  Database,
  LifeBuoy,
  Siren,
  Navigation
} from "lucide-react";
import { useLocation } from "wouter";
import MultiStepReportForm from "@/components/MultiStepReportForm";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [, setLocation] = useLocation();

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const features = [
    {
      icon: Zap,
      title: "Pelaporan Real-time & Validasi Cepat",
      description: "Laporkan kejadian bencana secara langsung dengan validasi tim profesional dalam hitungan menit.",
      gradient: "from-amber-400 via-orange-500 to-red-500"
    },
    {
      icon: Map,
      title: "Peta Interaktif & Filter Peta",
      description: "Visualisasi bencana pada peta interaktif dengan filter berdasarkan lokasi, jenis, dan waktu kejadian.",
      gradient: "from-blue-400 via-cyan-500 to-teal-500"
    },
    {
      icon: Shield,
      title: "Tips SOP & Nomor Darurat",
      description: "Akses mudah ke panduan SOP evakuasi dan daftar kontak darurat untuk berbagai situasi bencana.",
      gradient: "from-emerald-400 via-green-500 to-teal-600"
    }
  ];

  const disasterTips = [
    {
      icon: Mountain,
      title: "Saat Gempa Bumi",
      color: "bg-gradient-to-br from-red-50 via-orange-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30",
      iconColor: "bg-gradient-to-br from-red-500 via-orange-500 to-red-600",
      borderColor: "hover:border-red-300 dark:hover:border-red-700",
      tips: [
        "Berlindung di bawah meja yang kuat",
        "Jauhi jendela dan benda yang bisa jatuh",
        "Keluar dengan tenang setelah guncangan berhenti",
        "Waspada gempa susulan"
      ]
    },
    {
      icon: Waves,
      title: "Saat Banjir",
      color: "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30",
      iconColor: "bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600",
      borderColor: "hover:border-blue-300 dark:hover:border-blue-700",
      tips: [
        "Pindah ke tempat yang lebih tinggi",
        "Matikan listrik dan gas",
        "Siapkan makanan dan air bersih",
        "Hindari berjalan di air yang mengalir"
      ]
    },
    {
      icon: Flame,
      title: "Saat Kebakaran",
      color: "bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30",
      iconColor: "bg-gradient-to-br from-orange-500 via-yellow-500 to-orange-600",
      borderColor: "hover:border-orange-300 dark:hover:border-orange-700",
      tips: [
        "Keluar dengan posisi merangkak",
        "Tutup pintu untuk menahan api",
        "Jangan gunakan lift",
        "Kumpul di titik aman yang ditentukan"
      ]
    }
  ];

  const educationCards = [
    {
      icon: LifeBuoy,
      title: "Tips Saat Bencana",
      color: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950/20 dark:to-indigo-900/30",
      iconColor: "bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600",
      borderColor: "hover:border-blue-300 dark:hover:border-blue-700",
      tips: [
        "Tetap tenang & jangan panik",
        "Ikuti instruksi petugas",
        "Persiapkan tas darurat"
      ]
    },
    {
      icon: Siren,
      title: "Nomor Darurat",
      color: "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 dark:from-yellow-950/20 dark:to-amber-900/30",
      iconColor: "bg-gradient-to-br from-yellow-600 via-amber-600 to-orange-600",
      borderColor: "hover:border-yellow-300 dark:hover:border-yellow-700",
      tips: [
        "BNPB: 117",
        "Basarnas: 115",
        "Ambulan: 118"
      ]
    },
    {
      icon: Navigation,
      title: "SOP Evakuasi",
      color: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-950/20 dark:to-emerald-900/30",
      iconColor: "bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600",
      borderColor: "hover:border-green-300 dark:hover:border-green-700",
      tips: [
        "Tentukan titik kumpul keluarga",
        "Matikan listrik, gas sebelum keluar",
        "Ikuti jalur evakuasi resmi"
      ]
    }
  ];

  const aboutFeatures = [
    {
      icon: Users,
      title: "Dukungan pengguna lokal & filter peta",
      description: "Platform yang mudah digunakan dengan dukungan komunitas lokal dan filter peta yang canggih.",
      gradient: "from-purple-500 via-pink-500 to-rose-500"
    },
    {
      icon: Smartphone,
      title: "Form pelaporan mudah & aman",
      description: "Interface yang intuitif memungkinkan pelaporan cepat dengan validasi data yang akurat.",
      gradient: "from-blue-500 via-cyan-500 to-teal-500"
    },
    {
      icon: Eye,
      title: "Dashboard admin untuk validasi cepat",
      description: "Sistem admin yang responsif untuk memvalidasi dan menindaklanjuti laporan dengan cepat.",
      gradient: "from-green-500 via-emerald-500 to-teal-500"
    },
    {
      icon: Cloud,
      title: "Data terintegrasi & terintegrasi cloud Azure",
      description: "Infrastruktur cloud yang handal dengan Microsoft Azure untuk performa dan keamanan optimal.",
      gradient: "from-orange-500 via-red-500 to-pink-500"
    }
  ];

  return (
    <div id="hero" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium animate-pulse">
                  <Shield className="w-4 h-4 mr-2" />
                  Platform Pelaporan Bencana Alam di Indonesia
                </div>
              <h1 className="text-4xl lg:text-4xl font-bold leading-tight">
                Laporkan Bencana Secara 
                <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent"> Real-Time</span> di Seluruh Indonesia
              </h1>
              <p className="text-ml text-blue-100">
                Quick Aid adalah platform pelaporan bencana berbasis teknologi yang memudahkan masyarakat melaporkan dan memantau bencana alam secara langsung di seluruh wilayah Indonesia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-orange-600 text-white hover:bg-orange-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                  onClick={() => document.getElementById("quick-report")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Clipboard className="mr-2 h-5 w-5" />
                  Lapor Sekarang
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white text-blue-600 hover:bg-gray-50 border-white/20 transform hover:scale-105 transition-all"
                  onClick={() => setLocation("/map")}
                >
                  <Map className="mr-2 h-5 w-5" />
                  Lihat Peta
                </Button>
              </div>

              {/* Quick stats in hero */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center mb-2 transform group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 mr-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-white">{(stats as any)?.total || 0}</div>
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">Total Laporan</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center mb-2 transform group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mr-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-white">{(stats as any)?.resolved || 0}</div>
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">Telah Ditangani</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="flex items-center justify-center mb-2 transform group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mr-2" />
                    <div className="text-2xl sm:text-3xl font-bold text-white">2.5</div>
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">Jam Rata-rata Respon</div>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Mobile App Mockup */}
              <div className="relative mx-auto w-80 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-2xl shadow-inner overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center">
                    <MapPin className="mx-auto text-2xl mb-2" />
                    <div className="text-sm font-medium">Quick Aid Mobile</div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-3 bg-red-50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="text-sm text-red-800">Banjir - Jakarta Utara</div>
                    </div>
                    <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <div className="text-sm text-yellow-800">Gempa - Sumedang</div>
                    </div>
                    <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div className="text-sm text-green-800">Kebakaran - Jakarta</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-white rounded-lg p-3 shadow-lg animate-bounce">
                <Radio className="text-orange-600 text-lg" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-lg animate-pulse">
                <TrendingUp className="text-green-600 text-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
<section className="py-16 bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    {/* Changed from grid-cols-2 md:grid-cols-4 to grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 for better responsiveness */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="text-center p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
            <Database className="text-white text-2xl" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{(stats as any)?.total || 14}</div>
          <div className="text-muted-foreground font-medium">Total Laporan</div>
        </CardContent>
      </Card>
      
      <Card className="text-center p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
            <CheckCircle className="text-white text-2xl" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{(stats as any)?.resolved || 0}</div>
          <div className="text-muted-foreground font-medium">Telah Ditangani</div>
        </CardContent>
      </Card>
      
      <Card className="text-center p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
            <Activity className="text-white text-2xl" />
          </div>
          <div className="text-3xl font-bold text-orange-600 mb-2">2.5</div>
          <div className="text-muted-foreground font-medium">Jam Rata-rata Respon</div>
        </CardContent>
      </Card>
      
      <Card className="text-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
        <CardContent className="pt-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
            <Users className="text-white text-2xl" />
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">15,420</div>
          <div className="text-muted-foreground font-medium">Pengguna Aktif</div>
        </CardContent>
      </Card>
    </div>
  </div>
</section>

{/* About Quick Aid Section */}
      <section id="tentang" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Tentang Quick Aid
            </h2>
            <p className="text-md text-muted-foreground max-w-3xl mx-auto">
              Quick Aid adalah aplikasi pelaporan bencana alam yang memudahkan masyarakat Indonesia untuk melaporkan kejadian secara real-time, sekaligus memantau perkembangan bencana melalui peta interaktif dan dashboard transparan.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <MapPin className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-3">Dukungan pengguna lokal & filter peta</h3>
                <p className="text-sm text-muted-foreground">Platform dengan komunitas lokal aktif dan sistem filter peta yang canggih untuk monitoring real-time</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <FileText className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-3">Form pelaporan mudah & aman</h3>
                <p className="text-sm text-muted-foreground">Interface intuitif yang memungkinkan pelaporan cepat dengan keamanan data terjamin</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <Eye className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-3">Dashboard admin untuk validasi cepat</h3>
                <p className="text-sm text-muted-foreground">Sistem admin responsif untuk validasi dan tindak lanjut laporan dengan cepat</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-orange-950/20 dark:to-red-900/30 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce">
                  <Cloud className="text-white text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-3">Data terintegrasi & cloud Azure</h3>
                <p className="text-sm text-muted-foreground">Infrastruktur cloud Microsoft Azure untuk performa optimal dan keamanan data tinggi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="mengapa" className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Mengapa Quick Aid */}
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-8">
                Mengapa Quick Aid?
              </h2>
              <p className="text-muted-foreground mb-8 text-md">
                Bencana bisa terjadi kapan saja. Quick Aid hadir sebagai solusi pelaporan cepat, kolaboratif, dan transparan untuk membantu masyarakat dan pemerintah dalam penanganan bencana di Indonesia.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Pelaporan real-time & validasi cepat</h3>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Map className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Peta interaktif & filter peta bencana</h3>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Tips SOP & nomor <span className="text-blue-600 underline">darurat</span> dan paksa</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Tips & Emergency Numbers */}
            <div id="tips" className="space-y-8">
              {/* Tips Saat Terjadi Bencana */}
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h3 className="text-xl font-bold mb-4">Tips Saat Terjadi Bencana</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Segera evakuasi ke tempat aman</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Hubungi nomor darurat nasional</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Laporkan kejadian lewat Quick Aid</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">Jaga komunikasi dengan pihak berwenang</span>
                  </li>
                </ul>
              </Card>

              {/* Nomor Darurat Nasional */}
              <Card className="p-6 bg-white dark:bg-gray-900">
                <h3 className="text-xl font-bold mb-4">Nomor Darurat Nasional</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm">BNPB: 117</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm">Basarnas: 115</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm">Ambulans: 118</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-sm">Polisi: 110</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Disaster Tips Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Tips Menghadapi Bencana
            </h2>
            <p className="text-md text-muted-foreground max-w-3xl mx-auto">
              Panduan praktis untuk tetap aman dalam berbagai situasi darurat
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {disasterTips.map((tip, index) => (
              <Card key={index} className={`${tip.color} ${tip.borderColor} border-2 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group`}>
                <CardContent className="p-6 md:p-8">
                  <div className={`w-12 h-12 md:w-16 md:h-16 ${tip.iconColor} rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:animate-bounce`}>
                    <tip.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-center mb-4 md:mb-6">
                    {tip.title}
                  </h3>
                  <ul className="space-y-2 md:space-y-3">
                    {tip.tips.map((tipText, tipIndex) => (
                      <li key={tipIndex} className="text-xs md:text-sm flex items-start group-hover:translate-x-1 transition-transform duration-200" style={{transitionDelay: `${tipIndex * 50}ms`}}>
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        {tipText}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting Form Section */}
      <section id="quick-report" className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              Laporkan Bencana
            </h2>
            <p className="text-md text-muted-foreground">
              Bantu kami memantau situasi bencana dengan melaporkan kejadian yang Anda saksikan
            </p>
          </div>
          
          <MultiStepReportForm />
        </div>
      </section>

      <Footer />
    </div>
  );
}