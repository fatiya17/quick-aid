import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  FileText, 
  Clock, 
  Settings, 
  LogOut, 
  Download, 
  Filter, 
  RotateCcw,
  Eye,
  CheckCircle,
  Cog,
  MapPin,
  BarChart,
  Bell
} from "lucide-react";
import { getCurrentUser, logout, isAdmin } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Report } from "@shared/schema";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  // Redirect if not admin
  if (!user || !isAdmin()) {
    setLocation("/admin/login");
    return null;
  }

  // Fetch data
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/reports/${id}/status`, { 
        status, 
        assignedTo: user.name 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status berhasil diperbarui",
        description: "Status laporan telah diubah",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
    toast({
      title: "Logout berhasil",
      description: "Anda telah keluar dari sistem",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">⏳ Menunggu</Badge>;
      case "validated":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">✓ Divalidasi</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">🔄 Dalam Tindakan</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">✅ Selesai</Badge>;
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

  const filteredReports = reports.filter((report: Report) => {
    const matchesStatus = !statusFilter || report.status === statusFilter;
    const matchesLocation = !locationFilter || 
      report.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesStatus && matchesLocation;
  });

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "reports", label: "Laporan Masuk", icon: FileText, badge: stats?.pending },
    { id: "validated", label: "Divalidasi", icon: CheckCircle },
    { id: "in-progress", label: "Dalam Tindakan", icon: Cog },
    { id: "resolved", label: "Selesai", icon: CheckCircle },
    { id: "maps", label: "Peta Interaktif", icon: MapPin },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-alert rounded-lg flex items-center justify-center">
              <Shield className="text-white text-sm" />
            </div>
            <span className="text-lg font-bold text-gray-900">Quick Aid Admin</span>
          </div>
        </div>
        
        <nav className="px-6 py-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3 py-2 rounded-lg flex items-center justify-between font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge className="bg-alert text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
            
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-lg flex items-center space-x-3 text-alert hover:bg-red-50 font-medium mt-8"
            >
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-gray-600">Kelola laporan bencana dan pantau aktivitas pelaporan</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="p-2">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-alert text-white text-xs rounded-full flex items-center justify-center">
                    {stats?.pending || 0}
                  </Badge>
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {activeTab === "dashboard" && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Laporan</p>
                        <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                        <p className="text-sm text-gray-500">Semua laporan yang masuk</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="text-primary text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Menunggu Verifikasi</p>
                        <p className="text-3xl font-bold text-warning">{stats?.pending || 0}</p>
                        <p className="text-sm text-alert">⚠️ Perlu tindakan segera</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Clock className="text-warning text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Dalam Penanganan</p>
                        <p className="text-3xl font-bold text-alert">{stats?.inProgress || 0}</p>
                        <p className="text-sm text-gray-500">Sedang ditindaklanjuti</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Cog className="text-alert text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Selesai Ditangani</p>
                        <p className="text-3xl font-bold text-success">{stats?.resolved || 0}</p>
                        <p className="text-sm text-gray-500">Berhasil diselesaikan</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="text-success text-xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          
          {/* Reports Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Laporan Terbaru</CardTitle>
                <p className="text-sm text-gray-600">Kelola dan pantau status laporan bencana</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Unduh CSV
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh PDF
                </Button>
              </div>
            </CardHeader>
            
            {/* Filters */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="flex flex-wrap gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="validated">Divalidasi</SelectItem>
                    <SelectItem value="in_progress">Dalam Tindakan</SelectItem>
                    <SelectItem value="resolved">Selesai</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder="Cari lokasi..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-[200px]"
                />
                
                <Button variant="outline" onClick={() => {
                  setStatusFilter("");
                  setLocationFilter("");
                }}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
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
                        Pelapor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {reports.length === 0 ? "Belum ada laporan" : "Tidak ada laporan yang sesuai filter"}
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report: Report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.createdAt ? new Date(report.createdAt).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getDisasterEmoji(report.disasterType)} {report.disasterType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Select
                              value={report.status}
                              onValueChange={(status) => updateStatusMutation.mutate({ id: report.id, status })}
                            >
                              <SelectTrigger className="w-fit border-none shadow-none">
                                <SelectValue>{getStatusBadge(report.status)}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Menunggu</SelectItem>
                                <SelectItem value="validated">Divalidasi</SelectItem>
                                <SelectItem value="in_progress">Dalam Tindakan</SelectItem>
                                <SelectItem value="resolved">Selesai</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {report.reporterName || "Anonim"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-4 w-4" />
                              Detail
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
