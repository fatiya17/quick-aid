import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Bolt, MapPin, Phone, FileText, CheckCircle, Clock, Users, TrendingUp, MapPinned, Info, CheckSquare, AlertTriangle, Heart, Home } from "lucide-react";
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

  const disasterTips = [
    {
      icon: AlertTriangle,
      title: "Saat Gempa Bumi",
      color: "bg-red-50 dark:bg-red-950/20",
      iconColor: "bg-red-500",
      tips: [
        "Berlindung di bawah meja yang kuat",
        "Jauhi jendela dan benda yang bisa jatuh",
        "Keluar dengan tenang setelah guncangan berhenti",
        "Waspada gempa susulan"
      ]
    },
    {
      icon: MapPin,
      title: "Saat Banjir",
      color: "bg-blue-50 dark:bg-blue-950/20",
      iconColor: "bg-blue-500",
      tips: [
        "Pindah ke tempat yang lebih tinggi",
        "Matikan listrik dan gas",
        "Siapkan makanan dan air bersih",
        "Hindari berjalan di air yang mengalir"
      ]
    },
    {
      icon: Heart,
      title: "Saat Kebakaran",
      color: "bg-orange-50 dark:bg-orange-950/20",
      iconColor: "bg-orange-500",
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
      icon: Info,
      title: "Tips Saat Bencana",
      color: "bg-blue-50 dark:bg-blue-950/20",
      iconColor: "bg-primary",
      tips: [
        "Tetap tenang & jangan panik",
        "Ikuti instruksi petugas",
        "Persiapkan tas darurat"
      ]
    },
    {
      icon: Phone,
      title: "Nomor Darurat",
      color: "bg-yellow-50 dark:bg-yellow-950/20",
      iconColor: "bg-warning",
      tips: [
        "BNPB: 117",
        "Basarnas: 115",
        "Ambulan: 118"
      ]
    },
    {
      icon: CheckSquare,
      title: "SOP Evakuasi",
      color: "bg-green-50 dark:bg-green-950/20",
      iconColor: "bg-success",
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
      description: "Platform yang mudah digunakan dengan dukungan komunitas lokal dan filter peta yang canggih."
    },
    {
      icon: FileText,
      title: "Form pelaporan mudah & aman",
      description: "Interface yang intuitif memungkinkan pelaporan cepat dengan validasi data yang akurat."
    },
    {
      icon: Shield,
      title: "Dashboard admin untuk validasi cepat",
      description: "Sistem admin yang responsif untuk memvalidasi dan menindaklanjuti laporan dengan cepat."
    },
    {
      icon: TrendingUp,
      title: "Data terintegrasi & terintegrasi cloud Azure",
      description: "Infrastruktur cloud yang handal dengan Microsoft Azure untuk performa dan keamanan optimal."
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
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Dampak Quick Aid</h2>
            <p className="text-lg text-muted-foreground">Platform terpercaya untuk pelaporan bencana di Indonesia</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center p-6 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-primary">{(stats as any)?.total || 0}</div>
                <div className="text-muted-foreground font-medium">Total Laporan</div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-green-50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-success">{(stats as any)?.resolved || 0}</div>
                <div className="text-muted-foreground font-medium">Telah Ditangani</div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-orange-50 dark:bg-orange-950/20">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-alert rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-alert">2.5</div>
                <div className="text-muted-foreground font-medium">Jam Rata-rata Respon</div>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 bg-purple-50 dark:bg-purple-950/20">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white text-2xl" />
                </div>
                <div className="text-3xl font-bold text-purple-600">15,420</div>
                <div className="text-muted-foreground font-medium">Pengguna Aktif</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Mengapa Quick Aid?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Solusi terdepan dalam pelaporan dan pemantauan bencana alam di Indonesia
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tentang Quick Aid
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Platform inovatif yang menggabungkan teknologi cloud Azure dengan kemudahan akses untuk semua lapisan masyarakat
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {aboutFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Preparedness Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Edukasi & Kesiapsiagaan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tingkatkan kesiapan Anda menghadapi bencana dengan panduan dan informasi penting
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {educationCards.map((card, index) => (
              <Card key={index} className={`${card.color} border-0 hover:shadow-lg transition-shadow`}>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${card.iconColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <card.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-6">
                    {card.title}
                  </h3>
                  <ul className="space-y-3">
                    {card.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disaster Tips Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tips Menghadapi Bencana
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Panduan praktis untuk tetap aman dalam berbagai situasi darurat
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {disasterTips.map((tip, index) => (
              <Card key={index} className={`${tip.color} border-0 hover:shadow-lg transition-shadow`}>
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${tip.iconColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <tip.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-center mb-6">
                    {tip.title}
                  </h3>
                  <ul className="space-y-3">
                    {tip.tips.map((tipText, tipIndex) => (
                      <li key={tipIndex} className="text-sm flex items-start">
                        <CheckCircle className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Laporkan Bencana
            </h2>
            <p className="text-xl text-muted-foreground">
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