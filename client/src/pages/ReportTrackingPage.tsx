import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Info, Phone, CheckSquare, AlertCircle, Calendar, MapPin } from "lucide-react";

// Types for better type safety
interface Report {
  id: string;
  createdAt: string;
  disasterType: string;
  location: string;
  status: 'pending' | 'validated' | 'in_progress' | 'resolved';
  code: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface EducationCard {
  icon: React.ComponentType<any>;
  title: string;
  color: string;
  iconColor: string;
  tips: string[];
}

export default function ReportTrackingPage() {
  const [trackingInput, setTrackingInput] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Query for reports by email - hanya dijalankan jika searchEmail ada dan valid
  const { data: userReports = [], isLoading: isLoadingReports, error: reportsError } = useQuery<Report[]>({
    queryKey: ["/api/reports", { email: searchEmail }],
    queryFn: async () => {
      const res = await fetch(`/api/reports?email=${encodeURIComponent(searchEmail)}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
    enabled: !!searchEmail && searchEmail.includes("@") && searchEmail.includes("."),
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  // Query for single report by code - hanya dijalankan jika searchCode ada dan valid
  const { data: reportByCode, isLoading: isLoadingCode, error: codeError } = useQuery<Report | null>({
    queryKey: ["/api/reports/code", { code: searchCode }],
    queryFn: async () => {
      const res = await fetch(`/api/reports/code/${encodeURIComponent(searchCode)}`);
      if (!res.ok) {
        if (res.status === 404) {
          return null; // Report not found
        }
        throw new Error("Failed to fetch report by code");
      }
      return res.json();
    },
    enabled: !!searchCode && searchCode.length >= 3, // Minimal 3 karakter untuk pencarian kode
    staleTime: 30000,
    retry: 2
  });

  const handleSearch = useCallback(() => {
    if (!trackingInput.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Reset previous searches
    setSearchEmail("");
    setSearchCode("");

    // Determine search type based on input format
    const trimmedInput = trackingInput.trim();

    if (trimmedInput.includes("@") && trimmedInput.includes(".")) {
      // Email format detected
      setSearchEmail(trimmedInput);
    } else {
      // Code format detected - normalize to uppercase
      setSearchCode(trimmedInput.toUpperCase());
    }

    setTimeout(() => setIsSearching(false), 500);
  }, [trackingInput]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const handleClearSearch = useCallback(() => {
    setTrackingInput("");
    setSearchEmail("");
    setSearchCode("");
    setHasSearched(false);
  }, []);

  // Helper function to capitalize first letter of each word
  const capitalizeWords = useCallback((text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      pending: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-500/20",
        label: "Menunggu",
        description: "Laporan sedang diverifikasi"
      },
      validated: {
        className: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-500/20",
        label: "Divalidasi",
        description: "Laporan telah diverifikasi"
      },
      in_progress: {
        className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-500/20",
        label: "Dalam Tindakan",
        description: "Tim sedang menangani"
      },
      resolved: {
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/20",
        label: "Selesai",
        description: "Laporan telah ditangani"
      }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
      label: "❓ Tidak Diketahui",
      description: "Status tidak diketahui"
    };
    return <Badge className={`${config.className} border`} title={config.description}>{config.label}</Badge>;
  }, []);

  // Helper function to get disaster type badge with distinct colors
  const getDisasterTypeBadge = useCallback((disasterType: string) => {
    // Satu gaya seragam untuk semua jenis bencana
    const uniformClassName = "bg-blue-100 text-blue-800 border-blue-200 ";

    return (
      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium border text-center min-w-[120px] ${uniformClassName}`}>
        {capitalizeWords(disasterType)}
      </span>
    );
  }, [capitalizeWords]);

  const getPriorityBadge = useCallback((priority: string) => {
    const priorityConfig = {
      high: { className: "bg-red-100 text-red-800", label: "Tinggi" },
      medium: { className: "bg-yellow-100 text-yellow-800", label: "Sedang" },
      low: { className: "bg-green-100 text-green-800", label: "Rendah" }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;

    return (
      <Badge className={config.className} variant="outline">
        {config.label}
      </Badge>
    );
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }, []);

  const educationCards: EducationCard[] = [
    {
      icon: Info,
      title: "Tips Saat Bencana",
      color: "bg-blue-50 border-blue-200",
      iconColor: "bg-blue-500",
      tips: [
        "Tetap tenang dan jangan panik",
        "Ikuti instruksi dari petugas berwenang",
        "Persiapkan tas darurat berisi kebutuhan pokok",
        "Jauhi area berbahaya dan ikuti jalur evakuasi"
      ]
    },
    {
      icon: Phone,
      title: "Nomor Darurat",
      color: "bg-red-50 border-red-200",
      iconColor: "bg-red-500",
      tips: [
        "BNPB (Badan Nasional Penanggulangan Bencana): 117",
        "Basarnas (SAR): 115",
        "Ambulan/Gawat Darurat: 118",
        "Pemadam Kebakaran: 113"
      ]
    },
    {
      icon: CheckSquare,
      title: "SOP Evakuasi",
      color: "bg-green-50 border-green-200",
      iconColor: "bg-green-500",
      tips: [
        "Tentukan titik kumpul keluarga terlebih dahulu",
        "Matikan listrik, gas, dan air sebelum keluar",
        "Ikuti jalur evakuasi resmi yang telah ditentukan",
        "Bawa dokumen penting dan obat-obatan"
      ]
    }
  ];

  const handleViewDetail = useCallback((report: Report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedReport(null);
  }, []);

  // Tentukan laporan yang akan ditampilkan berdasarkan pencarian
  const getDisplayedReports = (): Report[] => {
    if (searchCode && reportByCode) {
      return [reportByCode];
    } else if (searchEmail && userReports.length > 0) {
      return userReports;
    } else {
      return [];
    }
  };

  const displayedReports = getDisplayedReports();
  const isLoading = isLoadingReports || isLoadingCode || isSearching;
  const hasError = reportsError || codeError;

  // Tentukan status pencarian
  const getSearchStatus = () => {
    if (!hasSearched) {
      return { type: 'initial', message: 'Masukkan kode laporan atau email untuk melihat riwayat laporan Anda' };
    }

    if (isLoading) {
      return { type: 'loading', message: 'Mencari laporan...' };
    }

    if (hasError) {
      return { type: 'error', message: 'Terjadi kesalahan saat memuat data' };
    }

    if (displayedReports.length === 0) {
      const searchTerm = searchEmail || searchCode;
      return {
        type: 'no-results',
        message: `Tidak ada laporan ditemukan untuk "${searchTerm}"`,
        subtitle: 'Pastikan kode laporan atau email yang dimasukkan benar'
      };
    }

    return { type: 'success', message: '' };
  };

  const searchStatus = getSearchStatus();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="mb-8 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-4">
            Riwayat Laporan Saya
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            Pantau status laporan bencana yang telah Anda kirim. Masukkan kode laporan atau alamat email
            untuk melihat progress penanganan setiap kasus secara real-time.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8 lg:mb-12 shadow-sm bg-white dark:bg-gray-800/50 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Kolom Input */}
                <div className="flex-1">
                  <div className="h-11">
                    <Input
                      placeholder="Contoh: QA-XXXX-XXX atau email"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full h-full text-base"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Gunakan kode laporan atau email untuk pencarian
                  </p>
                </div>

                {/* Kolom Tombol */}
                <div className="flex gap-2 sm:w-auto w-full">
                  <Button
                    onClick={handleSearch}
                    disabled={!trackingInput.trim() || isLoading}
                    className="h-11 w-full sm:w-auto flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        <span>Mencari...</span>
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        <span>Cari Laporan</span>
                      </>
                    )}
                  </Button>

                  {hasSearched && (
                    <Button
                      onClick={handleClearSearch}
                      variant="outline"
                      className="h-11 w-full sm:w-auto flex items-center justify-center"
                    >
                      Reset Pencarian
                    </Button>
                  )}
                </div>
              </div>
              {/* Search Info */}
              {hasSearched && (searchEmail || searchCode) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center text-sm text-blue-800">
                    <Search className="h-4 w-4 mr-2" />
                    <span>
                      Mencari berdasarkan: <strong>
                        {searchEmail ? `Email (${searchEmail})` : `Kode Laporan (${searchCode})`}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="mb-12 lg:mb-16 shadow-sm bg-white dark:bg-gray-800/50 dark:border-gray-700">
          <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-700">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl mb-8 text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" />
              {hasSearched ? 'Hasil Pencarian' : 'Daftar Laporan Anda'}
              {displayedReports.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {displayedReports.length} laporan
                </Badge>
              )}
            </CardTitle>
            {displayedReports.length > 0 && (
              <div className="flex flex-wrap gap-5 mt-6 text-sm">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Legend Status:</span>
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge('pending')}
                  {getStatusBadge('validated')}
                  {getStatusBadge('in_progress')}
                  {getStatusBadge('resolved')}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {searchStatus.type === 'error' ? (
              <div className="p-8 lg:p-12 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <p className="text-red-600 font-medium text-lg mb-2">{searchStatus.message}</p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Silakan coba lagi atau hubungi tim support jika masalah berlanjut
                </p>
                <Button
                  onClick={handleSearch}
                  className="mt-4"
                  variant="outline"
                >
                  Coba Lagi
                </Button>
              </div>
            ) : searchStatus.type === 'loading' ? (
              <div className="p-8 lg:p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6" />
                <p className="text-gray-500 text-lg">{searchStatus.message}</p>
              </div>
            ) : searchStatus.type === 'no-results' ? (
              <div className="p-8 lg:p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-500 font-medium mb-3 text-lg">
                  {searchStatus.message}
                </p>
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                  {searchStatus.subtitle}
                </p>
              </div>
            ) : searchStatus.type === 'initial' ? (
              <div className="p-8 lg:p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <p className="text-gray-500 font-medium mb-3 text-lg">
                  Belum ada pencarian
                </p>
                <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
                  {searchStatus.message}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="block lg:hidden">
                  <div className="divide-y divide-gray-200">
                    {displayedReports.map((report: Report) => (
                      <div key={report.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(report.createdAt)}
                            </div>
                            <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              {report.code}
                            </code>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                              {getDisasterTypeBadge(report.disasterType)}
                              {report.priority && getPriorityBadge(report.priority)}
                            </div>
                            {getStatusBadge(report.status)}
                          </div>

                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                            <span className="break-words">{report.location}</span>
                          </div>

                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-200 h-9 px-3"
                              onClick={() => handleViewDetail(report)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tanggal & Waktu
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Jenis Bencana
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Kode Laporan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {displayedReports.map((report: Report) => (
                        <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                              {formatDate(report.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex flex-col gap-2 items-center">
                              {getDisasterTypeBadge(report.disasterType)}
                              {report.priority && getPriorityBadge(report.priority)}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-gray-900 dark:text-gray-300 max-w-xs">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="break-words">{report.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {getStatusBadge(report.status)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded border dark:border-gray-600">
                              {report.code}
                            </code>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full hover:bg-blue-50 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-200 h-9 px-3"
                              onClick={() => handleViewDetail(report)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Educational Resources */}
        <section className="space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Edukasi & Kesiapsiagaan Bencana
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-4xl mx-auto lg:mx-0 leading-relaxed">
              Informasi penting untuk meningkatkan kesiapsiagaan Anda dan keluarga dalam menghadapi bencana alam.
              Pelajari tips, nomor darurat, dan prosedur evakuasi yang benar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {educationCards.map((card, index) => (
              <Card key={index} className={`${card.color} border hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardContent className="p-6 lg:p-8">
                  <div className={`w-14 h-14 ${card.iconColor} rounded-xl flex items-center justify-center mb-6 shadow-md`}>
                    <card.icon className="text-white h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">
                    {card.title}
                  </h3>
                  <ul className="text-sm sm:text-base text-gray-700 space-y-3">
                    {card.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start leading-relaxed">
                        <span className="text-blue-500 mr-3 font-bold text-lg flex-shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Detail Modal */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
            {/* Container Utama Modal */}
            <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="p-6 border-b dark:border-gray-800">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detail Laporan</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeDetailModal}
                    className="hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 h-8 w-8 p-0 rounded-full"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Isi (Body) Modal */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Kode Laporan</label>
                    <code className="block text-lg font-mono bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 px-3 py-2 rounded mt-1 border">
                      {selectedReport.code}
                    </code>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                    <div className="mt-2">
                      {getStatusBadge(selectedReport.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Laporan</label>
                    <div className="flex items-center mt-2">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 dark:text-gray-200">{formatDate(selectedReport.createdAt)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Jenis Bencana</label>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        {capitalizeWords(selectedReport.disasterType)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lokasi</label>
                  <div className="flex items-start mt-2">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-gray-200">{selectedReport.location}</span>
                  </div>
                </div>

                {selectedReport.priority && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Prioritas</label>
                    <div className="mt-2">
                      {getPriorityBadge(selectedReport.priority)}
                    </div>
                  </div>
                )}

                {selectedReport.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Deskripsi</label>
                    <p className="mt-2 text-gray-900 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                      {selectedReport.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <Button
                  onClick={closeDetailModal}
                  className="w-full sm:w-auto h-10 px-4"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}