import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  Volume2,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Key,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const user = getCurrentUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    reportUpdates: true,
    emergencyAlerts: true,
    weeklyDigest: false,
    
    // Privacy Settings
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    
    // Display Settings
    language: "id",
    timezone: "Asia/Jakarta",
    soundVolume: [70],
    
    // Password Change
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = (section: string) => {
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Pengaturan disimpan",
        description: `Pengaturan ${section} berhasil diperbarui.`,
      });
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (settings.newPassword !== settings.confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru dan konfirmasi password tidak cocok.",
        variant: "destructive"
      });
      return;
    }
    
    if (settings.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password baru harus minimal 8 karakter.",
        variant: "destructive"
      });
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      toast({
        title: "Password berhasil diubah",
        description: "Password Anda telah diperbarui.",
      });
    }, 1000);
  };

  const handleExportData = () => {
    toast({
      title: "Export dimulai",
      description: "Data Anda sedang dipersiapkan untuk diunduh.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Permintaan penghapusan akun",
      description: "Tim kami akan menghubungi Anda dalam 24 jam untuk konfirmasi.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Pengaturan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola preferensi, keamanan, dan privasi akun Anda
          </p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="privacy">Privasi</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="display">Tampilan</TabsTrigger>
            <TabsTrigger value="account">Akun</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pengaturan Notifikasi
                </CardTitle>
                <CardDescription>
                  Kelola bagaimana Anda ingin menerima notifikasi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Notifikasi Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi melalui email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Notifikasi Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima notifikasi push di perangkat Anda
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Update Laporan</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi saat status laporan Anda berubah
                      </p>
                    </div>
                    <Switch
                      checked={settings.reportUpdates}
                      onCheckedChange={(checked) => handleSettingChange('reportUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Alert Darurat</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifikasi untuk situasi darurat di sekitar Anda
                      </p>
                    </div>
                    <Switch
                      checked={settings.emergencyAlerts}
                      onCheckedChange={(checked) => handleSettingChange('emergencyAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Ringkasan Mingguan</Label>
                      <p className="text-sm text-muted-foreground">
                        Terima ringkasan aktivitas setiap minggu
                      </p>
                    </div>
                    <Switch
                      checked={settings.weeklyDigest}
                      onCheckedChange={(checked) => handleSettingChange('weeklyDigest', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-sm font-medium">Volume Suara Notifikasi</Label>
                  <div className="px-3">
                    <Slider
                      value={settings.soundVolume}
                      onValueChange={(value) => handleSettingChange('soundVolume', value)}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Sunyi</span>
                      <span>{settings.soundVolume[0]}%</span>
                      <span>Keras</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSaveSettings('notifikasi')} className="w-full">
                  Simpan Pengaturan Notifikasi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Pengaturan Privasi
                </CardTitle>
                <CardDescription>
                  Kontrol siapa yang dapat melihat informasi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Visibilitas Profil</Label>
                    <Select
                      value={settings.profileVisibility}
                      onValueChange={(value) => handleSettingChange('profileVisibility', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Publik</SelectItem>
                        <SelectItem value="private">Privat</SelectItem>
                        <SelectItem value="friends">Hanya Teman</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Tentukan siapa yang dapat melihat profil Anda
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Tampilkan Email</Label>
                      <p className="text-sm text-muted-foreground">
                        Izinkan orang lain melihat alamat email Anda
                      </p>
                    </div>
                    <Switch
                      checked={settings.showEmail}
                      onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Tampilkan Nomor Telepon</Label>
                      <p className="text-sm text-muted-foreground">
                        Izinkan orang lain melihat nomor telepon Anda
                      </p>
                    </div>
                    <Switch
                      checked={settings.showPhone}
                      onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Pengumpulan Data Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Bantu kami meningkatkan layanan dengan berbagi data analytics
                      </p>
                    </div>
                    <Switch
                      checked={settings.allowDataCollection}
                      onCheckedChange={(checked) => handleSettingChange('allowDataCollection', checked)}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSaveSettings('privasi')} className="w-full">
                  Simpan Pengaturan Privasi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Pengaturan Keamanan
                  </CardTitle>
                  <CardDescription>
                    Lindungi akun Anda dengan pengaturan keamanan tambahan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Autentikasi Dua Faktor (2FA)</Label>
                        <p className="text-sm text-muted-foreground">
                          Tambahkan lapisan keamanan ekstra untuk akun Anda
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.twoFactorAuth && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Aktif
                          </Badge>
                        )}
                        <Switch
                          checked={settings.twoFactorAuth}
                          onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Alert Login</Label>
                        <p className="text-sm text-muted-foreground">
                          Dapatkan notifikasi saat ada login baru ke akun Anda
                        </p>
                      </div>
                      <Switch
                        checked={settings.loginAlerts}
                        onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSaveSettings('keamanan')} className="w-full">
                    Simpan Pengaturan Keamanan
                  </Button>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Ubah Password
                  </CardTitle>
                  <CardDescription>
                    Perbarui password Anda secara berkala untuk keamanan maksimal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={settings.currentPassword}
                        onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                        placeholder="Masukkan password saat ini"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={settings.newPassword}
                        onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                        placeholder="Masukkan password baru"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={settings.confirmPassword}
                        onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                        placeholder="Konfirmasi password baru"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Tips Password Aman:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Minimal 8 karakter</li>
                      <li>• Kombinasi huruf besar, kecil, angka, dan simbol</li>
                      <li>• Hindari informasi personal</li>
                      <li>• Jangan gunakan password yang sama di tempat lain</li>
                    </ul>
                  </div>

                  <Button onClick={handlePasswordChange} className="w-full">
                    Ubah Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Display Tab */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  Pengaturan Tampilan
                </CardTitle>
                <CardDescription>
                  Sesuaikan tampilan aplikasi sesuai preferensi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tema</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Terang
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Gelap
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Ikuti Sistem
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Bahasa</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSettingChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="id">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Bahasa Indonesia
                          </div>
                        </SelectItem>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            English
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Zona Waktu</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => handleSettingChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Jakarta">WIB (Jakarta)</SelectItem>
                        <SelectItem value="Asia/Makassar">WITA (Makassar)</SelectItem>
                        <SelectItem value="Asia/Jayapura">WIT (Jayapura)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => handleSaveSettings('tampilan')} className="w-full">
                  Simpan Pengaturan Tampilan
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Data Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Unduh salinan data Anda untuk backup atau portabilitas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Anda dapat mengunduh semua data yang terkait dengan akun Anda, 
                      termasuk profil, laporan, dan riwayat aktivitas.
                    </p>
                    <Button onClick={handleExportData} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data Saya
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Zona Berbahaya
                  </CardTitle>
                  <CardDescription>
                    Tindakan ini tidak dapat dibatalkan. Harap berhati-hati.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                        Hapus Akun
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Menghapus akun akan menghilangkan semua data Anda secara permanen. 
                        Tindakan ini tidak dapat dibatalkan.
                      </p>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus Akun Saya
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="h-5 w-5" />
                              Konfirmasi Penghapusan Akun
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda benar-benar yakin ingin menghapus akun Anda? 
                              <br /><br />
                              <strong>Tindakan ini akan:</strong>
                              <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Menghapus semua data profil Anda</li>
                                <li>Menghapus semua laporan yang pernah Anda buat</li>
                                <li>Menghapus riwayat aktivitas Anda</li>
                                <li>Tidak dapat dibatalkan</li>
                              </ul>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteAccount}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Ya, Hapus Akun Saya
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}