import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { 
  Waves, 
  Mountain, 
  Flame, 
  Zap, 
  Filter, 
  X, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Maximize,
  Plus,
  Minus,
  Loader2,
  Phone,
  Wind,
  Activity
} from "lucide-react";

// Import Report type from shared schema
import type { Report } from "@shared/schema";

// Extended interface for map-specific data
interface MapReport extends Report {
  coordinates?: { lat: number; lng: number };
  severity?: "low" | "medium" | "high";
}

// Define props interface
interface DisasterMapProps {
  reports?: MapReport[];
}

// FIXED: Updated disaster types with better icons and case-insensitive mapping
const disasterTypes = [
  { 
    name: "Banjir", 
    icon: Waves, 
    color: "bg-blue-400", 
    textColor: "text-blue-600",
    lightBg: "bg-blue-50",
    borderColor: "border-blue-200",
    mapPinImage: "pin-blue",
    aliases: ["banjir", "flood"]
  },
  { 
    name: "Gempa", 
    icon: Activity, // Changed from Zap to Activity for better representation
    color: "bg-red-400", 
    textColor: "text-red-600",
    lightBg: "bg-red-50",
    borderColor: "border-red-200",
    mapPinImage: "pin-red",
    aliases: ["gempa", "earthquake", "gempa bumi"]
  },
  { 
    name: "Kebakaran", 
    icon: Flame, 
    color: "bg-orange-400", 
    textColor: "text-orange-600",
    lightBg: "bg-orange-50",
    borderColor: "border-orange-200",
    mapPinImage: "pin-darkred",
    aliases: ["kebakaran", "fire", "api"]
  },
  { 
    name: "Longsor", 
    icon: Mountain, 
    color: "bg-yellow-400", 
    textColor: "text-yellow-600",
    lightBg: "bg-yellow-50",
    borderColor: "border-yellow-200",
    mapPinImage: "pin-yellow",
    aliases: ["longsor", "landslide", "tanah longsor"]
  },
  { 
    name: "Tsunami", 
    icon: Waves, // Keep Waves but will be different color than Banjir
    color: "bg-teal-400", 
    textColor: "text-teal-600",
    lightBg: "bg-teal-50",
    borderColor: "border-teal-200",
    mapPinImage: "pin-teal",
    aliases: ["tsunami"]
  },
  { 
    name: "Angin", 
    icon: Wind, // Changed from Zap to Wind for better representation
    color: "bg-purple-400", 
    textColor: "text-purple-600",
    lightBg: "bg-purple-50",
    borderColor: "border-purple-200",
    mapPinImage: "pin-purple",
    aliases: ["angin", "wind", "puting beliung", "tornado"]
  }
];

export default function DisasterMap({ reports: propReports }: DisasterMapProps) {
  const { theme, setTheme } = useTheme();
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [activeTypes, setActiveTypes] = useState<string[]>(disasterTypes.map(t => t.name));
  const [showFilters, setShowFilters] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [mapRef, setMapRef] = useState<any>(null);
  const [dataSource, setDataSource] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Fetch reports from API if not provided via props
  const { data: apiReports, isLoading, error, refetch } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    enabled: !propReports, // Only fetch if reports not provided via props
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Use prop reports or fetched reports
  const rawReports = propReports || apiReports || [];

  // Transform reports to include coordinates and severity
  const reports: MapReport[] = rawReports.map(report => ({
    ...report,
    coordinates: report.latitude && report.longitude 
      ? { 
          lat: parseFloat(report.latitude), 
          lng: parseFloat(report.longitude) 
        }
      : getDefaultCoordinates(report.location), // Fallback coordinates based on location
    severity: determineSeverity(report) // Determine severity based on disaster type and description
  }));

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Trigger data refetch
      if (!propReports) {
        refetch();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [propReports, refetch]);

  // FIXED: Case-insensitive filtering untuk solve Live Statistics = 0
  const filteredReports = reports.filter(report => {
    // Convert to lowercase untuk case-insensitive comparison
    const reportType = report.disasterType.toLowerCase();
    return activeTypes.some(activeType => {
      const disasterType = disasterTypes.find(dt => dt.name === activeType);
      if (!disasterType) return false;
      
      // Check main name and aliases
      return disasterType.name.toLowerCase() === reportType || 
             disasterType.aliases.some(alias => alias.toLowerCase() === reportType);
    });
  });

  // Load Azure Maps Script
  useEffect(() => {
    const loadAzureMaps = () => {
      // Check if Azure Maps is already loaded
      if (typeof window !== 'undefined' && (window as any).atlas) {
        initializeMap();
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css';
      document.head.appendChild(cssLink);

      // Load JavaScript
      const script = document.createElement('script');
      script.src = 'https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.js';
      script.async = true;
      script.onload = () => {
        initializeMap();
      };
      document.head.appendChild(script);

      return () => {
        try {
          document.head.removeChild(cssLink);
          document.head.removeChild(script);
        } catch (e) {
          // Elements might already be removed
        }
      };
    };

    loadAzureMaps();
  }, []);

  // Initialize Azure Maps
  const initializeMap = () => {
    if (typeof window === 'undefined' || !(window as any).atlas) return;

    const atlas = (window as any).atlas;
    
    try {
      const map = new atlas.Map('azureMapContainer', {
        center: [106.845599, -6.208763], // Jakarta center
        zoom: 5,
        language: 'id-ID',
        style: theme === 'dark' ? 'grayscale_dark' : 'road',
        authOptions: {
          authType: 'subscriptionKey',
          subscriptionKey: 'DlxNyfjrjHxxe5vJYrtcFxgLrkrlEXh1y1fJ0yEGzcw4hKZCgv8oJQQJ99BFACYeBjFKBiXcAAAgAZMP40Gu'
        }
      });

      map.events.add('ready', () => {
        setMapRef(map);
        setIsMapReady(true);
        
        // Create data source
        const ds = new atlas.source.DataSource();
        map.sources.add(ds);
        setDataSource(ds);

        // Add initial markers
        addMarkersToMap(map, ds, filteredReports);
      });

    } catch (error) {
      console.error('Failed to initialize Azure Maps:', error);
    }
  };

  // Add markers to Azure Maps
  const addMarkersToMap = (map: any, ds: any, reportsToShow: MapReport[]) => {
    if (!map || !ds || typeof window === 'undefined' || !(window as any).atlas) return;
    
    const atlas = (window as any).atlas;
    
    // Clear existing data
    ds.clear();

    // Add markers for each report
    reportsToShow.forEach(report => {
      if (report.coordinates) {
        const point = new atlas.data.Feature(
          new atlas.data.Point([report.coordinates.lng, report.coordinates.lat]),
          {
            id: report.id,
            code: report.code,
            title: report.disasterType,
            location: report.location,
            detailedAddress: report.detailedAddress,
            status: report.status,
            severity: report.severity,
            description: report.description,
            createdAt: report.createdAt,
            reporterName: report.reporterName,
            reporterPhone: report.reporterPhone
          }
        );
        ds.add(point);
      }
    });

    // Remove existing layers
    const existingLayers = map.layers.getLayers();
    existingLayers.forEach((layer: any) => {
      if (layer.getId().includes('disaster-')) {
        map.layers.remove(layer);
      }
    });

    // Create bubble layer for markers
    const bubbleLayer = new atlas.layer.BubbleLayer(ds, 'disaster-bubbles', {
      radius: [
        'case',
        ['==', ['get', 'severity'], 'high'], 15,
        ['==', ['get', 'severity'], 'medium'], 10,
        7
      ],
      color: [
        'case',
        ['==', ['get', 'status'], 'resolved'], '#10b981',
        ['==', ['get', 'status'], 'in_progress'], '#f59e0b',
        ['==', ['get', 'status'], 'validated'], '#3b82f6',
        '#ef4444'
      ],
      strokeColor: 'white',
      strokeWidth: 2,
      blur: 0.1
    });

    // Create symbol layer for icons
    const symbolLayer = new atlas.layer.SymbolLayer(ds, 'disaster-symbols', {
      iconOptions: {
        image: [
          'case',
          ['==', ['get', 'title'], 'Banjir'], 'pin-blue',
          ['==', ['get', 'title'], 'Gempa'], 'pin-red',
          ['==', ['get', 'title'], 'Kebakaran'], 'pin-darkred',
          ['==', ['get', 'title'], 'Longsor'], 'pin-yellow',
          // TAMBAHAN untuk handle lowercase dari API
          ['==', ['get', 'title'], 'banjir'], 'pin-blue',
          ['==', ['get', 'title'], 'gempa'], 'pin-red',
          ['==', ['get', 'title'], 'kebakaran'], 'pin-darkred',
          ['==', ['get', 'title'], 'longsor'], 'pin-yellow',
          ['==', ['get', 'title'], 'tsunami'], 'pin-blue',
          ['==', ['get', 'title'], 'angin'], 'pin-purple',
          'marker-blue'
        ],
        allowOverlap: true,
        ignorePlacement: true,
        size: 0.8
      },
      textOptions: {
        textField: ['get', 'title'],
        offset: [0, -2],
        color: 'white',
        size: 12,
        haloColor: 'black',
        haloWidth: 1
      }
    });

    map.layers.add([bubbleLayer, symbolLayer]);

    // Add click event for markers
    map.events.add('click', bubbleLayer, (e: any) => {
      if (e.shapes && e.shapes.length > 0) {
        const clickedShape = e.shapes[0];

        // Ensure clickedShape has a 'properties' object
        if (clickedShape && clickedShape.properties) {
          const properties = clickedShape.properties;
          const report = reports.find(r => r.id === properties.id);
          setSelectedReport(report || null);
          
        } else {
          // Log or handle the case where properties are missing
          console.warn("Clicked shape does not have expected properties:", clickedShape);
          setSelectedReport(null); // Clear selection if data is unexpected
        }
      } else {
        // No shapes clicked, or array is empty
        setSelectedReport(null); // Clear selection
      }
    });

    // Add hover effect
    map.events.add('mouseenter', bubbleLayer, () => {
      map.getCanvasContainer().style.cursor = 'pointer';
    });

    map.events.add('mouseleave', bubbleLayer, () => {
      map.getCanvasContainer().style.cursor = 'grab';
    });
  };

  // Update map style when theme changes
  useEffect(() => {
    if (mapRef) {
      mapRef.setStyle({
        style: theme === 'dark' ? 'grayscale_dark' : 'road'
      });
    }
  }, [theme, mapRef]);

  // Update markers when filters change
  useEffect(() => {
    if (isMapReady && mapRef && dataSource) {
      addMarkersToMap(mapRef, dataSource, filteredReports);
    }
  }, [activeTypes, isMapReady, mapRef, dataSource, reports]);

  const toggleDisasterType = (typeName: string) => {
    setActiveTypes(prev => 
      prev.includes(typeName) 
        ? prev.filter(t => t !== typeName)
        : [...prev, typeName]
    );
  };

  // FIXED: Case-insensitive disaster icon function
  const getDisasterIcon = (disasterType: string) => {
    const normalizedType = disasterType.toLowerCase();
    
    // Find type by name or aliases
    const type = disasterTypes.find(t => 
      t.name.toLowerCase() === normalizedType || 
      t.aliases.some(alias => alias.toLowerCase() === normalizedType)
    );
    
    return type?.icon || AlertTriangle;
  };

  // FIXED: Case-insensitive disaster type config function
  const getDisasterTypeConfig = (disasterType: string) => {
    const normalizedType = disasterType.toLowerCase();
    
    // Find type by name or aliases
    const type = disasterTypes.find(t => 
      t.name.toLowerCase() === normalizedType || 
      t.aliases.some(alias => alias.toLowerCase() === normalizedType)
    );
    
    return type || disasterTypes[0];
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "resolved": { 
        lightBg: "bg-emerald-50 dark:bg-emerald-900/30", 
        textColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-200 dark:border-emerald-500/30",
        label: "Selesai"
      },
      "in_progress": { 
        lightBg: "bg-amber-50 dark:bg-amber-900/30", 
        textColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-200 dark:border-amber-500/30",
        label: "Sedang Ditangani"
      },
      "validated": { 
        lightBg: "bg-sky-50 dark:bg-sky-900/30", 
        textColor: "text-sky-600 dark:text-sky-400",
        borderColor: "border-sky-200 dark:border-sky-500/30",
        label: "Tervalidasi"
      },
      "pending": { 
        lightBg: "bg-rose-50 dark:bg-rose-900/30", 
        textColor: "text-rose-600 dark:text-rose-400",
        borderColor: "border-rose-200 dark:border-rose-500/30",
        label: "Menunggu Validasi"
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Waktu tidak diketahui';
    
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari yang lalu`;
    } else if (diffHours > 0) {
      return `${diffHours} jam yang lalu`;
    } else {
      return `${diffMinutes} menit yang lalu`;
    }
  };

  const statusCounts = {
    resolved: reports.filter(r => r.status === 'resolved').length,
    in_progress: reports.filter(r => r.status === 'in_progress').length,
    validated: reports.filter(r => r.status === 'validated').length,
    pending: reports.filter(r => r.status === 'pending').length
  };

  // Map control functions
  const zoomIn = () => {
    if (mapRef) {
      const currentZoom = mapRef.getCamera().zoom;
      mapRef.setCamera({ zoom: currentZoom + 1 });
    }
  };

  const zoomOut = () => {
    if (mapRef) {
      const currentZoom = mapRef.getCamera().zoom;
      mapRef.setCamera({ zoom: currentZoom - 1 });
    }
  };

  const resetView = () => {
    if (mapRef) {
      mapRef.setCamera({ 
        center: [106.845599, -6.208763], 
        zoom: 5,
        type: 'ease',
        duration: 1000
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat data laporan...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Gagal memuat data laporan</p>
          <Button onClick={() => refetch()} variant="outline">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Grup Judul dan Tombol Theme */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-blue-500" />
                  Peta Bencana Real-time
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Terakhir diperbarui: {lastUpdate.toLocaleTimeString('id-ID')}
                  {!propReports && (
                    <span className="ml-2 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            {/* Status Summary */}
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className={`${getStatusConfig('resolved').lightBg} ${getStatusConfig('resolved').textColor} ${getStatusConfig('resolved').borderColor}`}
              >
                {statusCounts.resolved} Selesai
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getStatusConfig('in_progress').lightBg} ${getStatusConfig('in_progress').textColor} ${getStatusConfig('in_progress').borderColor}`}
              >
                {statusCounts.in_progress} Ditangani
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getStatusConfig('validated').lightBg} ${getStatusConfig('validated').textColor} ${getStatusConfig('validated').borderColor}`}
              >
                {statusCounts.validated} Validasi
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getStatusConfig('pending').lightBg} ${getStatusConfig('pending').textColor} ${getStatusConfig('pending').borderColor}`}
              >
                {statusCounts.pending} Menunggu
              </Badge>
            </div>
          </div>
          
          {/* Filter Toggle for Mobile */}
          <div className="mt-4 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter Bencana
              {showFilters && <X className="w-4 h-4" />}
            </Button>
          </div>
          
          {/* Filters */}
          <div className={`mt-4 ${showFilters || 'hidden lg:block'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Jenis:</span>
              <div className="flex flex-wrap gap-2">
                {disasterTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isActive = activeTypes.includes(type.name);
                  
                  return (
                    <Button
                      key={type.name}
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => toggleDisasterType(type.name)}
                      className={`text-xs transition-all flex items-center gap-1.5 ${
                        isActive 
                          ? `${type.color} hover:opacity-90 text-white border-0` 
                          : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700`
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                      {type.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Azure Maps Container */}
        <div id="azureMapContainer" className="w-full h-full bg-gray-100">
          {!isMapReady && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading Azure Maps...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* FIXED: Selected Report Popup with proper icon handling */}
        {selectedReport && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4">
            <div className="w-full max-w-sm mx-auto">
              <Card className="p-3 sm:p-4 shadow-xl bg-white/95 dark:bg-gray-900/90 dark:border-gray-700 backdrop-blur-sm border">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {(() => {
                        const DisasterIcon = getDisasterIcon(selectedReport.disasterType);
                        const typeConfig = getDisasterTypeConfig(selectedReport.disasterType);
                        return (
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 ${typeConfig.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <DisasterIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        );
                      })()}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-lg truncate">
                          {selectedReport.disasterType.charAt(0).toUpperCase() + selectedReport.disasterType.slice(1)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm flex items-center gap-1">
                          <MapPin className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                          <span className="truncate">{selectedReport.location}</span>
                        </p>
                        {selectedReport.code && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Kode: {selectedReport.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusConfig(selectedReport.status).lightBg} ${getStatusConfig(selectedReport.status).textColor} ${getStatusConfig(selectedReport.status).borderColor} text-xs px-1.5 py-0.5`}
                      >
                        <span className="hidden sm:inline">{getStatusConfig(selectedReport.status).label}</span>
                        <span className="sm:hidden">
                          {selectedReport.status === 'resolved' ? 'Selesai' : 
                           selectedReport.status === 'in_progress' ? 'Proses' :
                           selectedReport.status === 'validated' ? 'Valid' : 'Menunggu'}
                        </span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReport(null)}
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {selectedReport.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm leading-relaxed">
                      {selectedReport.description}
                    </p>
                  )}

                  {selectedReport.reporterName && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Pelapor: {selectedReport.reporterName}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700 gap-2">
                    <span className="flex items-center gap-1 min-w-0 flex-1">
                      <Clock className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">
                        {getTimeAgo(selectedReport.createdAt ? selectedReport.createdAt.toString() : undefined)}
                      </span>
                    </span>
                    {selectedReport.severity && (
                      <Badge variant="outline" className={`flex-shrink-0 text-xs px-1.5 py-0.5 ${
                        selectedReport.severity === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 
                        selectedReport.severity === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        <span className="hidden sm:inline">
                          Tingkat {selectedReport.severity === 'high' ? 'Tinggi' : selectedReport.severity === 'medium' ? 'Sedang' : 'Rendah'}
                        </span>
                        <span className="sm:hidden">
                          {selectedReport.severity === 'high' ? 'Tinggi' : selectedReport.severity === 'medium' ? 'Sedang' : 'Rendah'}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/90 dark:bg-gray-900/80 dark:border-gray-700 dark:hover:bg-gray-800 backdrop-blur hover:bg-white shadow-lg"
            onClick={zoomIn}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/90 dark:bg-gray-900/80 dark:border-gray-700 dark:hover:bg-gray-800 backdrop-blur hover:bg-white shadow-lg"
            onClick={zoomOut}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-white/90 dark:bg-gray-900/80 dark:border-gray-700 dark:hover:bg-gray-800 backdrop-blur hover:bg-white shadow-lg"
            onClick={resetView}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Legend */}
        <Card className="absolute bottom-4 left-4 p-4 bg-white dark:bg-gray-900 dark:border-gray-700 shadow-lg max-w-xs">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm lg:text-base">Status Laporan</h3>
          <div className="space-y-2 text-xs lg:text-sm">
            {[
              { status: 'resolved', color: '#10b981' },
              { status: 'in_progress', color: '#f59e0b' },
              { status: 'validated', color: '#3b82f6' },
              { status: 'pending', color: '#ef4444' }
            ].map(({ status, color }) => {
              const config = getStatusConfig(status);
              return (
                <div key={status} className="flex items-center space-x-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${status === 'pending' ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="dark:text-gray-300">{config.label}</span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t dark:border-gray-700">
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2 text-xs lg:text-sm">Jenis Bencana</h4>
            <div className="space-y-1.5">
              {disasterTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div key={type.name} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${type.color} rounded-sm flex items-center justify-center`}>
                      <IconComponent className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-xs dark:text-gray-300">{type.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card className="absolute top-4 left-4 p-3 lg:p-4 bg-white dark:bg-gray-900 dark:border-gray-700 shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm lg:text-base">Live Statistics</h3>
          <div className="text-xl lg:text-2xl font-bold text-blue-500">{filteredReports.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Laporan Aktif</div>
          <div className="mt-2 text-xs text-gray-400">
            Total: {reports.length} laporan
          </div>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get default coordinates based on location string
function getDefaultCoordinates(location: string): { lat: number; lng: number } {
  // Simple mapping of common Indonesian locations
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    'jakarta': { lat: -6.2088, lng: 106.8456 },
    'bandung': { lat: -6.9175, lng: 107.6191 },
    'surabaya': { lat: -7.2575, lng: 112.7521 },
    'yogyakarta': { lat: -7.7956, lng: 110.3695 },
    'medan': { lat: 3.5952, lng: 98.6722 },
    'makassar': { lat: -5.1477, lng: 119.4327 },
    'palembang': { lat: -2.9761, lng: 104.7754 },
    'semarang': { lat: -6.9667, lng: 110.4167 },
    'denpasar': { lat: -8.6500, lng: 115.2167 },
    'pontianak': { lat: -0.0263, lng: 109.3425 },
    'bogor': { lat: -6.5971, lng: 106.8060 },
    'senayan': { lat: -6.2088, lng: 106.8456 },
    'aceh': { lat: 5.5577, lng: 95.3222 },
    'bali': { lat: -8.4095, lng: 115.1889 }
  };

  const locationKey = location.toLowerCase();
  
  // Check if location contains any of the mapped cities
  for (const [city, coords] of Object.entries(locationMap)) {
    if (locationKey.includes(city)) {
      return coords;
    }
  }

  // Default to Jakarta if no match found
  return { lat: -6.2088, lng: 106.8456 };
}

// Helper function to determine severity based on disaster type and other factors
function determineSeverity(report: Report): "low" | "medium" | "high" {
  const disasterType = report.disasterType.toLowerCase();
  const description = report.description?.toLowerCase() || '';

  // High severity indicators
  const highSeverityKeywords = ['darurat', 'evakuasi', 'korban', 'mendesak', 'besar', 'parah', 'berbahaya'];
  const mediumSeverityKeywords = ['sedang', 'cukup', 'menengah'];
  
  // Check description for severity indicators
  const hasHighSeverity = highSeverityKeywords.some(keyword => description.includes(keyword));
  const hasMediumSeverity = mediumSeverityKeywords.some(keyword => description.includes(keyword));

  if (hasHighSeverity) return 'high';
  if (hasMediumSeverity) return 'medium';

  // Default severity based on disaster type
  switch (disasterType) {
    case 'gempa':
    case 'tsunami':
      return 'high';
    case 'banjir':
    case 'kebakaran':
      return 'medium';
    case 'longsor':
    case 'angin':
      return 'low';
    default:
      return 'medium';
  }
}