import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Info, Phone, CheckSquare } from "lucide-react";

export default function ReportTrackingPage() {
  const [trackingInput, setTrackingInput] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const { data: userReports = [], isLoading } = useQuery({
    queryKey: ["/api/reports", { email: searchEmail }],
    enabled: !!searchEmail,
  });

  const handleSearch = () => {
    if (trackingInput.includes("@")) {
      setSearchEmail(trackingInput);
    } else {
      // Search by code - would need separate endpoint
      console.log("Searching by code:", trackingInput);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Menunggu</Badge>;
      case "validated":
        return <Badge className="bg-blue-100 text-blue-800">✓ Divalidasi</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-100 text-orange-800">🔄 Dalam Tindakan</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">✅ Selesai</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDisasterEmoji = (type: string) => {
    switch (type) {
      case "banjir": return "🌊";
      case "gempa": return "🌍";
      case "kebakaran": return "🔥";
      case "longsor": return "⛰️";
      case "tsunami": return "🌊";
      case "angin": return "💨";
      default: return "⚠️";
    }
  };

  const educationCards = [
    {
      icon: Info,
      title: "Tips Saat Bencana",
      color: "bg-blue-50",
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
      color: "bg-yellow-50",
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
      color: "bg-green-50",
      iconColor: "bg-success",
      tips: [
        "Tentukan titik kumpul keluarga",
        "Matikan listrik, gas sebelum keluar",
        "Ikuti jalur evakuasi resmi"
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Laporan Saya</h1>
        <p className="text-gray-600">
          Lihat status laporan yang telah Anda kirim. Masukkan kode laporan atau email untuk tracking progress setiap kasus.
        </p>
      </div>

      {/* Tracking Input Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Masukkan kode laporan atau email"
                value={trackingInput}
                onChange={(e) => setTrackingInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={!trackingInput.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report List */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Daftar Laporan Anda</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-gray-600">Status:</span>
            <Badge className="bg-yellow-100 text-yellow-800">Menunggu</Badge>
            <Badge className="bg-blue-100 text-blue-800">Divalidasi</Badge>
            <Badge className="bg-orange-100 text-orange-800">Dalam Tindakan</Badge>
            <Badge className="bg-green-100 text-green-800">Selesai</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Mencari laporan...</div>
          ) : userReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchEmail ? "Tidak ada laporan ditemukan untuk email ini" : "Masukkan email untuk melihat laporan Anda"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userReports.map((report: any) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getDisasterEmoji(report.disasterType)} {report.disasterType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {report.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-4 w-4" />
                          Lihat
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Educational Resources */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edukasi & Kesiapsiagaan</h2>
        <p className="text-gray-600 mb-6">
          Tips penting saat bencana, nomor darurat, dan SOP evakuasi untuk Anda dan keluarga.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {educationCards.map((card, index) => (
            <Card key={index} className={card.color}>
              <CardContent className="pt-6">
                <div className={`w-12 h-12 ${card.iconColor} rounded-lg flex items-center justify-center mb-4`}>
                  <card.icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{card.title}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {card.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
