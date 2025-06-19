import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { getCurrentUser, logout, isAdmin } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import type { Report } from "@shared/schema";
import { useTheme } from "@/lib/theme";

// UI Components from shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Extended Report interface with Azure Blob photos support
interface ExtendedReport extends Omit<Report, 'detailedAddress' | 'reporterPhone' | 'reporterEmail' | 'latitude' | 'longitude'> {
    severity?: 'low' | 'medium' | 'high';
    photos?: string | string[]; // Azure Blob URLs
    assignedTo?: string;
    detailedAddress: string | null; // Match exact type from Report
    reporterPhone: string | null; // Match exact type from Report
    reporterEmail: string | null; // Match exact type from Report
    latitude: number | null; // Match exact type from Report
    longitude: number | null; // Match exact type from Report
}

// Photo data interface
interface PhotoData {
    url: string;
    filename: string;
    uploadedAt: string;
}

// Type definitions for custom components
interface TabsProps {
    children: React.ReactNode;
    defaultValue: string;
    className?: string;
}

interface TabsListProps {
    children: React.ReactNode;
    activeTab?: string;
    setActiveTab?: (value: string) => void;
    className?: string;
}

interface TabsTriggerProps {
    children: React.ReactNode;
    value: string;
    activeTab?: string;
    setActiveTab?: (value: string) => void;
}

interface TabsContentProps {
    children: React.ReactNode;
    value: string;
    isActive?: boolean;
    className?: string;
}

interface SwitchProps {
    defaultChecked?: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    [key: string]: any;
}

interface ProgressProps {
    value?: number;
    className?: string;
    [key: string]: any;
}

// Icons from lucide-react
import {
    LayoutDashboard,
    FileText,
    Clock,
    Settings,
    LogOut,
    Download,
    Search,
    RotateCcw,
    Eye,
    CheckCircle2,
    Cog,
    MapPin,
    BarChart3,
    Bell,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Home,
    User,
    Menu,
    X,
    AlertTriangle,
    Waves,
    Flame,
    Mountain,
    Tornado,
    Cloudy,
    Filter,
    Plus,
    Edit,
    Trash2,
    Share2,
    Calendar,
    Users,
    Activity,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    Zap,
    Building,
    Phone,
    Mail,
    Save,
    UserPlus,
    Shield,
    Key,
    Globe,
    Moon,
    Sun,
    Image as ImageIcon,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    Download as DownloadIcon,
} from "lucide-react";

// Charting Library
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// PDF & CSV Export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// Utility function untuk parse photos data dari Azure Blob
const parsePhotosData = (photos: string | string[] | null | undefined): PhotoData[] => {
    if (!photos) return [];
    
    try {
        if (typeof photos === 'string') {
            // Cek apakah string adalah JSON array atau single URL
            if (photos.startsWith('[') || photos.startsWith('{')) {
                const parsed = JSON.parse(photos);
                if (Array.isArray(parsed)) {
                    return parsed.map((item, index) => {
                        if (typeof item === 'string') {
                            return {
                                url: item,
                                filename: `photo-${index + 1}.jpg`,
                                uploadedAt: new Date().toISOString()
                            };
                        }
                        return item;
                    });
                }
            }
            // Single URL string
            return [{
                url: photos,
                filename: 'photo.jpg',
                uploadedAt: new Date().toISOString()
            }];
        }
        
        if (Array.isArray(photos)) {
            return photos.map((photo, index) => {
                if (typeof photo === 'string') {
                    return {
                        url: photo,
                        filename: `photo-${index + 1}.jpg`,
                        uploadedAt: new Date().toISOString()
                    };
                }
                return photo;
            });
        }
    } catch (error) {
        console.error('Error parsing photos data:', error);
    }
    
    return [];
};

// Custom components to replace unavailable ones
const CustomTabs: React.FC<TabsProps> = ({ children, defaultValue, className = "" }) => {
    const [activeTab, setActiveTab] = useState<string>(defaultValue);

    return (
        <div className={className}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    if (child.type === CustomTabsList) {
                        return React.cloneElement(child as React.ReactElement<TabsListProps>, {
                            activeTab,
                            setActiveTab
                        });
                    } else if (child.type === CustomTabsContent) {
                        const props = child.props as TabsContentProps;
                        return React.cloneElement(child as React.ReactElement<TabsContentProps>, {
                            isActive: props.value === activeTab
                        });
                    }
                }
                return child;
            })}
        </div>
    );
};

const CustomTabsList: React.FC<TabsListProps> = ({ children, activeTab, setActiveTab, className = "" }) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 ${className}`}>
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === CustomTabsTrigger) {
                return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
                    activeTab,
                    setActiveTab
                });
            }
            return child;
        })}
    </div>
);

const CustomTabsTrigger: React.FC<TabsTriggerProps> = ({ children, value, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab?.(value)}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === value
            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        {children}
    </button>
);

const CustomTabsContent: React.FC<TabsContentProps> = ({ children, isActive, className = "" }) =>
    isActive ? <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}>{children}</div> : null;

const CustomSwitch: React.FC<SwitchProps> = ({ defaultChecked = false, checked, onCheckedChange, ...props }) => {
    const [isChecked, setIsChecked] = useState<boolean>(defaultChecked || checked || false);

    const handleToggle = () => {
        const newValue = !isChecked;
        setIsChecked(newValue);
        onCheckedChange?.(newValue);
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={handleToggle}
            className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${isChecked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
            {...props}
        >
            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-0'
                }`} />
        </button>
    );
};

const CustomProgress: React.FC<ProgressProps> = ({ value = 0, className = "", ...props }) => (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`} {...props}>
        <div
            className="h-full w-full flex-1 bg-blue-600 transition-all duration-300 ease-in-out"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
);

// Image Preview Component
const ImagePreview: React.FC<{
    photos: PhotoData[];
    onClose: () => void;
    isOpen: boolean;
}> = ({ photos, onClose, isOpen }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentPhoto = photos[currentIndex];

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
        setIsLoading(true);
        setError(null);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
        setIsLoading(true);
        setError(null);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(currentPhoto.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentPhoto.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    if (!isOpen || !currentPhoto) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
                    <div className="text-white">
                        <h3 className="font-medium">{currentPhoto.filename}</h3>
                        <p className="text-sm text-gray-300">
                            {currentIndex + 1} dari {photos.length}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsZoomed(!isZoomed)}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownload}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Image Container */}
                <div className="flex-1 flex items-center justify-center relative">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    
                    {error ? (
                        <div className="text-white text-center">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                            <p>Gagal memuat gambar</p>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setError(null);
                                    setIsLoading(true);
                                }}
                                className="mt-2"
                            >
                                Coba Lagi
                            </Button>
                        </div>
                    ) : (
                        <img
                            src={currentPhoto.url}
                            alt={currentPhoto.filename}
                            className={`max-w-full max-h-full object-contain transition-transform duration-200 ${
                                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                            }`}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setIsLoading(false);
                                setError('Failed to load image');
                            }}
                            onClick={() => setIsZoomed(!isZoomed)}
                        />
                    )}

                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevious}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Thumbnail Strip */}
                {photos.length > 1 && (
                    <div className="p-4 bg-black bg-opacity-50">
                        <div className="flex justify-center gap-2 overflow-x-auto">
                            {photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentIndex(index);
                                        setIsLoading(true);
                                        setError(null);
                                    }}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                                        index === currentIndex
                                            ? 'border-blue-500'
                                            : 'border-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                    <img
                                        src={photo.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Photo Gallery Component for Report Details
const PhotoGallery: React.FC<{
    photos: PhotoData[];
    className?: string;
}> = ({ photos, className = "" }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    if (!photos || photos.length === 0) {
        return (
            <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center ${className}`}>
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Tidak ada foto</p>
            </div>
        );
    }

    const displayPhotos = photos.slice(0, 3); // Show max 3 thumbnails
    const remainingCount = photos.length - displayPhotos.length;

    return (
        <>
            <div className={`space-y-3 ${className}`}>
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                        Foto Laporan ({photos.length})
                    </h4>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPreviewOpen(true)}
                        className="text-xs"
                    >
                        <Eye className="w-3 h-3 mr-1" />
                        Lihat Semua
                    </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {displayPhotos.map((photo, index) => (
                        <div
                            key={index}
                            className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setIsPreviewOpen(true)}
                        >
                            <img
                                src={photo.url}
                                alt={photo.filename}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3e%3crect width="100" height="100" fill="%23f3f4f6"/%3e%3ctext x="50" y="50" text-anchor="middle" dy="0.35em" font-family="Arial, sans-serif" font-size="12" fill="%236b7280"%3eNo Image%3c/text%3e%3c/svg%3e';
                                }}
                            />
                            {index === 2 && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                    <span className="text-white font-medium">
                                        +{remainingCount}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <ImagePreview
                photos={photos}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </>
    );
};

// Photo Thumbnail Component
const PhotoThumbnail: React.FC<{
    photos: PhotoData[];
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
}> = ({ photos, size = 'sm', onClick }) => {
    if (!photos || photos.length === 0) {
        return (
            <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${
                size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
            }`}>
                <ImageIcon className={`text-gray-400 ${
                    size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
                }`} />
            </div>
        );
    }

    const firstPhoto = photos[0];
    const hasMore = photos.length > 1;

    return (
        <div 
            className={`relative cursor-pointer group ${
                size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
            }`}
            onClick={onClick}
            title={`${photos.length} foto tersedia`}
        >
            <img
                src={firstPhoto.url}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg transition-all duration-200 group-hover:scale-105"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%23f3f4f6'/%3e%3ctext x='50' y='50' text-anchor='middle' dy='0.35em' font-family='Arial, sans-serif' font-size='12' fill='%236b7280'%3eNo Image%3c/text%3e%3c/svg%3e`;
                }}
                loading="lazy"
            />
            
            {hasMore && (
                <div className={`absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg ${
                    size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'
                }`}>
                    +{photos.length - 1}
                </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                <Eye className={`text-white opacity-0 group-hover:opacity-100 transition-opacity ${
                    size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
                }`} />
            </div>
        </div>
    );
};

// Helper functions
const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case "banjir": return <Waves className="h-5 w-5 text-blue-500" />;
        case "gempa": return <Tornado className="h-5 w-5 text-yellow-600" />;
        case "kebakaran": return <Flame className="h-5 w-5 text-red-500" />;
        case "longsor": return <Mountain className="h-5 w-5 text-green-700" />;
        case "tsunami": return <Waves className="h-5 w-5 text-cyan-500" />;
        case "angin": return <Cloudy className="h-5 w-5 text-gray-500" />;
        default: return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
};

const getStatusConfig = (status: string) => {
    const configs: Record<string, {
        text: string;
        icon: JSX.Element;
        color: string;
        bgColor: string;
    }> = {
        pending: {
            text: "Menunggu",
            icon: <Clock className="w-4 h-4" />,
            color: "bg-amber-100 text-amber-800 border-amber-200",
            bgColor: "bg-amber-50"
        },
        validated: {
            text: "Divalidasi",
            icon: <CheckCircle className="w-4 h-4" />,
            color: "bg-blue-100 text-blue-800 border-blue-200",
            bgColor: "bg-blue-50"
        },
        in_progress: {
            text: "Dalam Tindakan",
            icon: <Cog className="w-4 h-4" />,
            color: "bg-orange-100 text-orange-800 border-orange-200",
            bgColor: "bg-orange-50"
        },
        resolved: {
            text: "Selesai",
            icon: <CheckCircle2 className="w-4 h-4" />,
            color: "bg-green-100 text-green-800 border-green-200",
            bgColor: "bg-green-50"
        }
    };
    return configs[status] || configs.pending;
};

const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { text: string; color: string }> = {
        low: { text: "Rendah", color: "bg-green-100 text-green-800" },
        medium: { text: "Sedang", color: "bg-yellow-100 text-yellow-800" },
        high: { text: "Tinggi", color: "bg-red-100 text-red-800" }
    };
    return configs[severity] || configs.medium;
};

// Helper function to safely get severity
const getReportSeverity = (report: ExtendedReport): string => {
    return report.severity || 'medium';
};

export default function ModernAdminDashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [statusFilter, setStatusFilter] = useState("all");
    const [locationFilter, setLocationFilter] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();
    const user = getCurrentUser();

    // Redirect if not admin
    if (!user || !isAdmin()) {
        setLocation("/admin/login");
        return null;
    }

    // --- DATA FETCHING ---
    type Stats = {
        total?: number;
        pending?: number;
        inProgress?: number;
        resolved?: number;
        validated?: number;
        [key: string]: any;
    };

    const { data: stats = {} as Stats } = useQuery<Stats>({ queryKey: ["/api/stats"] });
    const { data: reports = [] } = useQuery<ExtendedReport[]>({ queryKey: ["/api/reports"] });

    // --- MUTATIONS ---
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const response = await apiRequest("PATCH", `/api/reports/${id}/status`, { status, assignedTo: user.nama });
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Status Berhasil Diperbarui",
                description: "Status laporan telah diubah."
            });
            queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        },
        onError: (error: any) => {
            toast({
                title: "Gagal Memperbarui Status",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    // Export functions
    const handleExportCSV = () => {
        const csv = Papa.unparse(filteredReports.map(r => ({
            ID: r.id,
            Waktu: r.createdAt ? new Date(r.createdAt).toLocaleString('id-ID') : "",
            Jenis_Bencana: r.disasterType,
            Lokasi: r.location,
            Status: getStatusConfig(r.status).text,
            Pelapor: r.reporterName || "Anonim",
        })));
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "laporan_bencana.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        toast({
            title: "CSV Berhasil Diunduh",
            description: "File laporan telah berhasil diunduh dalam format CSV.",
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Daftar Laporan Bencana", 14, 16);
        autoTable(doc, {
            startY: 22,
            head: [['Waktu', 'Jenis Bencana', 'Lokasi', 'Status', 'Pelapor']],
            body: filteredReports.map(report => [
                report.createdAt ? new Date(report.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : "-",
                report.disasterType,
                report.location,
                getStatusConfig(report.status).text,
                report.reporterName || "Anonim"
            ]),
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            styles: { font: 'helvetica', fontSize: 8 },
        });
        doc.save('laporan_bencana.pdf');
        toast({
            title: "PDF Berhasil Diunduh",
            description: "File laporan telah berhasil diunduh dalam format PDF.",
        });
    };

    const handleStatusUpdate = (reportId: number, newStatus: string) => {
        updateStatusMutation.mutate({ id: reportId, status: newStatus });
    };

    const handleLogout = () => {
        logout();
        setLocation("/");
        toast({
            title: "Berhasil Keluar",
            description: "Anda telah keluar dari sistem.",
        });
    };

    // Filtered reports
    const filteredReports = useMemo(() => {
        let filtered = reports;

        if (activeTab !== 'dashboard' && activeTab !== 'reports') {
            const statusMap: Record<'validated' | 'in-progress' | 'resolved' | 'pending', string> = {
                'validated': 'validated',
                'in-progress': 'in_progress',
                'resolved': 'resolved',
                'pending': 'pending'
            };
            if (['validated', 'in-progress', 'resolved', 'pending'].includes(activeTab)) {
                filtered = reports.filter(r => r.status === statusMap[activeTab as 'validated' | 'in-progress' | 'resolved' | 'pending']);
            }
        }

        return filtered.filter(report => {
            const matchesStatus = statusFilter === "all" || report.status === statusFilter;
            const matchesLocation = !locationFilter ||
                report.location.toLowerCase().includes(locationFilter.toLowerCase());
            return matchesStatus && matchesLocation;
        });
    }, [reports, statusFilter, locationFilter, activeTab]);

    // Chart data
    const chartData = {
        disaster: [
            { name: 'Banjir', value: 122, color: '#3b82f6' },
            { name: 'Kebakaran', value: 76, color: '#ef4444' },
            { name: 'Longsor', value: 45, color: '#10b981' },
            { name: 'Gempa', value: 32, color: '#f59e0b' }
        ],
        monthly: [
            { name: 'Jan', laporan: 150, selesai: 140 },
            { name: 'Feb', laporan: 180, selesai: 165 },
            { name: 'Mar', laporan: 220, selesai: 200 },
            { name: 'Apr', laporan: 200, selesai: 185 },
            { name: 'Mei', laporan: 250, selesai: 230 },
            { name: 'Jun', laporan: 300, selesai: 280 }
        ]
    };

    // Sidebar items
    const sidebarItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "reports", label: "Laporan Masuk", icon: FileText, badge: stats?.pending },
        { id: "pending", label: "Menunggu", icon: Clock },
        { id: "validated", label: "Divalidasi", icon: ShieldCheck },
        { id: "in-progress", label: "Dalam Tindakan", icon: Cog },
        { id: "resolved", label: "Selesai", icon: CheckCircle2 },
        { id: "maps", label: "Peta Interaktif", icon: MapPin },
        { id: "statistics", label: "Statistik", icon: BarChart3 },
        { id: "settings", label: "Pengaturan", icon: Settings },
    ];

    // Components
    const Sidebar = () => (
        <aside className={`
            bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? "w-64" : "w-0 lg:w-16"}
            overflow-hidden fixed lg:relative z-30 h-full
        `}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Link href="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    {(isSidebarOpen) && (
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                Quick Aid
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                        </div>
                    )}
                </Link>
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                {sidebarItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`
                            w-full px-3 py-3 rounded-xl flex items-center justify-between
                            text-sm font-medium transition-all duration-200
                            ${activeTab === item.id
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            }
                        `}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
                        </div>
                        {isSidebarOpen && item.badge && item.badge > 0 && (
                            <Badge className="bg-red-500 text-white border-0 shadow-sm">
                                {item.badge}
                            </Badge>
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                            <LogOut className="mr-3 w-5 h-5" />
                            {isSidebarOpen && <span className="whitespace-nowrap">Keluar</span>}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                Konfirmasi Logout
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin keluar dari dashboard admin? Anda akan diarahkan ke halaman login.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Ya, Keluar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </aside>
    );

    const Header = () => {
        const { theme, setTheme } = useTheme();

        const handleToggleTheme = () => {
            setTheme(theme === 'dark' ? 'light' : 'dark');
        };

        return (
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
                <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden mr-2"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {sidebarItems.find(i => i.id === activeTab)?.label}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Kelola laporan bencana dan pantau aktivitas pelaporan
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={handleToggleTheme}>
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gray-600" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gray-600" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            {stats?.pending && stats.pending > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-medium">
                                        {stats.pending}
                                    </span>
                                </span>
                            )}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2">
                                    <Avatar>
                                        <AvatarImage src={`https://ui-avatars.com/api/?name=${user.nama}&background=random`} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                            {user.nama.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {user.nama}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Super Admin
                                        </div>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>
                                    <User className="mr-2 w-4 h-4" />
                                    <span>Profil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                                    <Settings className="mr-2 w-4 h-4" />
                                    <span>Pengaturan</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <LogOut className="mr-2 w-4 h-4 text-red-500" />
                                            <span className="text-red-500">Keluar</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Apakah Anda yakin ingin keluar?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
                                                Keluar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
        );
    };

    // Dashboard Content
    const DashboardContent = () => {
        const progressPercentage = (stats.total && stats.resolved)
            ? Math.round((stats.resolved / stats.total) * 100)
            : 0;

        return (
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                Total Laporan
                            </CardTitle>
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                {stats?.total || 0}
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12% dari bulan lalu
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                Menunggu Verifikasi
                            </CardTitle>
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                                {stats?.pending || 0}
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center mt-1">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Perlu tindakan segera
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                                Dalam Penanganan
                            </CardTitle>
                            <Cog className="w-5 h-5 text-orange-600 dark:text-orange-400 animate-spin" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                                {stats?.inProgress || 0}
                            </div>
                            <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                                <Activity className="w-3 h-3 mr-1" />
                                Sedang ditindaklanjuti
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                                Selesai Ditangani
                            </CardTitle>
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                                {stats?.resolved || 0}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Berhasil diselesaikan
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Recent Reports */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5" />
                                        Laporan Terbaru
                                    </CardTitle>
                                    <CardDescription>5 laporan terakhir yang masuk</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setActiveTab('reports')}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Lihat Semua
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {reports.slice(0, 5).map((report) => {
                                    const photos = parsePhotosData(report.photos);
                                    
                                    return (
                                        <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {/* Photo Thumbnail */}
                                                <PhotoThumbnail 
                                                    photos={photos} 
                                                    size="sm" 
                                                    onClick={() => setSelectedReport(report)}
                                                />
                                                <div className={`p-2 rounded-lg ${getSeverityConfig(getReportSeverity(report)).color}`}>
                                                    {getDisasterIcon(report.disasterType)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{report.disasterType}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{report.location}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline" className={getStatusConfig(report.status).color}>
                                                    {getStatusConfig(report.status).text}
                                                </Badge>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Ringkasan Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress Penyelesaian</span>
                                        <span className="font-medium">{progressPercentage}%</span>
                                    </div>
                                    <CustomProgress value={progressPercentage} className="h-2" />
                                </div>

                                <div className="space-y-3">
                                    {Object.entries({
                                        pending: stats.pending || 0,
                                        validated: stats.validated || 0,
                                        in_progress: stats.inProgress || 0,
                                        resolved: stats.resolved || 0
                                    }).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {getStatusConfig(status).icon}
                                                <span className="text-sm">{getStatusConfig(status).text}</span>
                                            </div>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // Reports Table Component with Photos
    const ReportsTable = () => (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Daftar Laporan
                        </CardTitle>
                        <CardDescription>
                            Kelola dan pantau semua laporan bencana yang masuk
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            Unduh CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <Download className="w-4 h-4 mr-2" />
                            Unduh PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari lokasi..."
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            autoComplete="off"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="validated">Divalidasi</SelectItem>
                            <SelectItem value="in_progress">Dalam Tindakan</SelectItem>
                            <SelectItem value="resolved">Selesai</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="ghost"
                        onClick={() => { setStatusFilter("all"); setLocationFilter(""); }}
                        className="whitespace-nowrap"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>

                {/* Table with Photos */}
                <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Foto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Jenis Bencana
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Lokasi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Waktu Lapor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Pelapor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Tingkat
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => {
                                        const photos = parsePhotosData(report.photos);
                                        
                                        return (
                                            <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                {/* Photo Column */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <PhotoThumbnail 
                                                        photos={photos} 
                                                        size="md" 
                                                        onClick={() => setSelectedReport(report)}
                                                    />
                                                </td>
                                                
                                                {/* Disaster Type Column */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${getSeverityConfig(getReportSeverity(report)).color}`}>
                                                            {getDisasterIcon(report.disasterType)}
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {report.disasterType.charAt(0).toUpperCase() + report.disasterType.slice(1)}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                {/* Other columns remain the same */}
                                                <td className="px-6 py-4 whitespace-nowrap max-w-48">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                        <span className="truncate text-gray-900 dark:text-white">{report.location}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {report.createdAt ? new Date(report.createdAt).toLocaleString('id-ID', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            }) : '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-900 dark:text-white">{report.reporterName || "Anonim"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="outline" className={getSeverityConfig(getReportSeverity(report)).color}>
                                                        {getSeverityConfig(getReportSeverity(report)).text}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="outline" className={getStatusConfig(report.status).color}>
                                                        <div className="flex items-center gap-1">
                                                            {getStatusConfig(report.status).icon}
                                                            {getStatusConfig(report.status).text}
                                                        </div>
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setSelectedReport(report)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Detail
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm">
                                                                    <Edit className="w-4 h-4 mr-1" />
                                                                    Ubah Status
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {['pending', 'validated', 'in_progress', 'resolved'].map((status) => (
                                                                    <DropdownMenuItem
                                                                        key={status}
                                                                        onClick={() => handleStatusUpdate(report.id, status)}
                                                                        disabled={report.status === status}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            {getStatusConfig(status).icon}
                                                                            {getStatusConfig(status).text}
                                                                        </div>
                                                                    </DropdownMenuItem>
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                                <p className="text-gray-500">Tidak ada laporan yang ditemukan</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Interactive Map Content
    const InteractiveMapContent = () => (
        <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Peta Interaktif Bencana
                </CardTitle>
                <CardDescription>
                    Visualisasi lokasi laporan bencana secara real-time
                </CardDescription>
            </CardHeader>
            <CardContent className="h-full">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                            Integrasi Peta Azure Maps
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Fitur peta interaktif akan ditampilkan di sini dengan integrasi Azure Maps
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Statistics Content
    const StatisticsContent = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Statistik Laporan
                            </CardTitle>
                            <CardDescription>
                                Analisis tren dan distribusi laporan bencana
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Unduh Statistik
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <CustomTabs defaultValue="overview" className="space-y-4">
                        <CustomTabsList>
                            <CustomTabsTrigger value="overview">Ringkasan</CustomTabsTrigger>
                            <CustomTabsTrigger value="disaster-type">Jenis Bencana</CustomTabsTrigger>
                            <CustomTabsTrigger value="trends">Tren Bulanan</CustomTabsTrigger>
                        </CustomTabsList>

                        <CustomTabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-green-600">85%</div>
                                        <p className="text-sm text-gray-600">Tingkat Penyelesaian</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <Zap className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-blue-600">2.5h</div>
                                        <p className="text-sm text-gray-600">Rata-rata Respons</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-purple-600">1,247</div>
                                        <p className="text-sm text-gray-600">Total Pelapor</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CustomTabsContent>

                        <CustomTabsContent value="disaster-type">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.disaster}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {chartData.disaster.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CustomTabsContent>

                        <CustomTabsContent value="trends">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData.monthly}>
                                        <defs>
                                            <linearGradient id="colorLaporan" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="laporan"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#colorLaporan)"
                                            name="Total Laporan"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="selesai"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#colorSelesai)"
                                            name="Selesai Ditangani"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CustomTabsContent>
                    </CustomTabs>
                </CardContent>
            </Card>
        </div>
    );

    // Settings Content
    const SettingsContent = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Pengaturan Akun
                    </CardTitle>
                    <CardDescription>
                        Kelola informasi profil dan preferensi sistem
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomTabs defaultValue="profile" className="space-y-4">
                        <CustomTabsList className="grid w-full grid-cols-3">
                            <CustomTabsTrigger value="profile">Profil</CustomTabsTrigger>
                            <CustomTabsTrigger value="notifications">Notifikasi</CustomTabsTrigger>
                            <CustomTabsTrigger value="security">Keamanan</CustomTabsTrigger>
                        </CustomTabsList>

                        <CustomTabsContent value="profile" className="space-y-4">
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user.nama}&background=random`} />
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg">
                                        {user.nama.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline" size="sm">
                                        <User className="w-4 h-4 mr-2" />
                                        Ubah Foto
                                    </Button>
                                    <p className="text-sm text-gray-500 mt-1">JPG, PNG maksimal 2MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium">Nama Lengkap</label>
                                    <Input id="name" defaultValue={user.nama} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input id="email" type="email" defaultValue={user.email} />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                                    <Input id="role" defaultValue="Super Admin" disabled />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium">Nomor Telepon</label>
                                    <Input id="phone" placeholder="+62 812 3456 7890" />
                                </div>
                            </div>

                            <Button className="mt-4">
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Perubahan
                            </Button>
                        </CustomTabsContent>

                        <CustomTabsContent value="notifications" className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Laporan Baru</h4>
                                        <p className="text-sm text-gray-500">Dapatkan notifikasi untuk laporan bencana baru</p>
                                    </div>
                                    <CustomSwitch defaultChecked={true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Status Update</h4>
                                        <p className="text-sm text-gray-500">Notifikasi ketika status laporan berubah</p>
                                    </div>
                                    <CustomSwitch defaultChecked={true} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Email Ringkasan</h4>
                                        <p className="text-sm text-gray-500">Ringkasan harian aktivitas sistem</p>
                                    </div>
                                    <CustomSwitch defaultChecked={false} />
                                </div>
                            </div>
                        </CustomTabsContent>

                        <CustomTabsContent value="security" className="space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password Saat Ini</label>
                                    <Input type="password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Password Baru</label>
                                    <Input type="password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Konfirmasi Password Baru</label>
                                    <Input type="password" />
                                </div>
                                <Button>
                                    <Key className="w-4 h-4 mr-2" />
                                    Ubah Password
                                </Button>
                            </div>
                        </CustomTabsContent>
                    </CustomTabs>
                </CardContent>
            </Card>
        </div>
    );

    // Enhanced Report Detail Dialog dengan Photos
    const ReportDetailDialog = () => {
        const photos = selectedReport ? parsePhotosData(selectedReport.photos) : [];

        return (
            <AlertDialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
                <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Detail Laporan #{selectedReport?.id}
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    
                    {selectedReport && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Jenis Bencana</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getDisasterIcon(selectedReport.disasterType)}
                                        <span className="font-medium">{selectedReport.disasterType}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getStatusConfig(selectedReport.status).color}>
                                            <div className="flex items-center gap-1">
                                                {getStatusConfig(selectedReport.status).icon}
                                                {getStatusConfig(selectedReport.status).text}
                                            </div>
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Lokasi</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{selectedReport.location}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tingkat Keparahan</label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getSeverityConfig(selectedReport.severity || 'medium').color}>
                                            {getSeverityConfig(selectedReport.severity || 'medium').text}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Pelapor</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>{selectedReport.reporterName || "Anonim"}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Waktu Lapor</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">
                                            {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString('id-ID', {
                                                dateStyle: 'full',
                                                timeStyle: 'short'
                                            }) : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            {(selectedReport.reporterPhone || selectedReport.reporterEmail) && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Kontak Pelapor</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedReport.reporterPhone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{selectedReport.reporterPhone}</span>
                                            </div>
                                        )}
                                        {selectedReport.reporterEmail && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{selectedReport.reporterEmail}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Location Details */}
                            {selectedReport.detailedAddress && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Alamat Detail</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedReport.detailedAddress}</p>
                                </div>
                            )}

                            {/* Description */}
                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Deskripsi Kejadian</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {selectedReport.description || "Tidak ada deskripsi."}
                                </p>
                            </div>

                            {/* Photo Gallery */}
                            <div className="border-t pt-4">
                                <PhotoGallery photos={photos} />
                            </div>

                            {/* Coordinates */}
                            {(selectedReport.latitude && selectedReport.longitude) && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Koordinat Lokasi</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Latitude:</span>
                                            <span>{selectedReport.latitude}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">Longitude:</span>
                                            <span>{selectedReport.longitude}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Assignment Info */}
                            {selectedReport.assignedTo && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ditugaskan Kepada</h4>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm">{selectedReport.assignedTo}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedReport(null)}>Tutup</AlertDialogCancel>
                        <AlertDialogAction>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Laporan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    };

    // Profile Dialog
    const ProfileDialog = () => (
        <AlertDialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profil Pengguna
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${user.nama}&background=random`} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                {user.nama.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-lg">{user.nama}</h3>
                            <p className="text-gray-500">Super Admin</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                        </div>
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setActiveTab('settings')}>
                        Edit Profil
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <DashboardContent />;
            case "reports":
            case "pending":
            case "validated":
            case "in-progress":
            case "resolved":
                return <ReportsTable />;
            case "maps": return <InteractiveMapContent />;
            case "statistics": return <StatisticsContent />;
            case "settings": return <SettingsContent />;
            default: return <DashboardContent />;
        }
    };

    // Main render
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Sidebar Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {renderContent()}
                </main>
            </div>

            <ReportDetailDialog />
            <ProfileDialog />
        </div>
    );
}