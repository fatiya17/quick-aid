import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Maximize } from "lucide-react";

interface DisasterMarker {
  id: string;
  type: string;
  location: string;
  severity: "low" | "medium" | "high";
  time: string;
  coordinates: { x: number; y: number };
}

const mockMarkers: DisasterMarker[] = [
  {
    id: "1",
    type: "Gempa",
    location: "Sumedang, Jawa Barat",
    severity: "high",
    time: "2 jam yang lalu",
    coordinates: { x: 33, y: 25 }
  },
  {
    id: "2",
    type: "Banjir",
    location: "Jakarta Utara",
    severity: "medium",
    time: "1 jam yang lalu",
    coordinates: { x: 25, y: 50 }
  },
  {
    id: "3",
    type: "Kebakaran",
    location: "Yogyakarta",
    severity: "low",
    time: "3 jam yang lalu",
    coordinates: { x: 50, y: 65 }
  }
];

const disasterTypes = [
  { name: "Banjir", emoji: "🌊", color: "bg-blue-500", count: 23 },
  { name: "Gempa", emoji: "🌍", color: "bg-red-500", count: 8 },
  { name: "Kebakaran", emoji: "🔥", color: "bg-orange-500", count: 15 },
  { name: "Longsor", emoji: "⛰️", color: "bg-yellow-500", count: 5 }
];

export default function DisasterMap() {
  const [selectedMarker, setSelectedMarker] = useState<DisasterMarker | null>(null);
  const [activeTypes, setActiveTypes] = useState<string[]>(disasterTypes.map(t => t.name));

  const toggleDisasterType = (typeName: string) => {
    setActiveTypes(prev => 
      prev.includes(typeName) 
        ? prev.filter(t => t !== typeName)
        : [...prev, typeName]
    );
  };

  const getMarkerColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-orange-500";
      case "low": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Map Header */}
      <div className="bg-white shadow-sm p-4 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Peta Bencana Indonesia</h1>
            <p className="text-gray-600">Visualisasi real-time sebaran bencana di seluruh Indonesia</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {disasterTypes.map((type) => (
              <button
                key={type.name}
                onClick={() => toggleDisasterType(type.name)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-opacity ${
                  activeTypes.includes(type.name) ? 'opacity-100' : 'opacity-50'
                } ${type.name === 'Banjir' ? 'bg-blue-100 text-blue-800' :
                   type.name === 'Gempa' ? 'bg-red-100 text-red-800' :
                   type.name === 'Kebakaran' ? 'bg-orange-100 text-orange-800' :
                   'bg-gray-100 text-gray-800'}`}
              >
                {type.emoji} {type.name} ({type.count})
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="flex-1 relative">
        {/* Map Background */}
        <div 
          className="w-full h-full bg-cover bg-center relative"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200')"
          }}
        >
          <div className="absolute inset-0 bg-blue-900/20"></div>
          
          {/* Disaster Markers */}
          {mockMarkers
            .filter(marker => activeTypes.includes(marker.type))
            .map((marker) => (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${marker.coordinates.x}%`, 
                top: `${marker.coordinates.y}%` 
              }}
              onClick={() => setSelectedMarker(marker)}
            >
              <div className={`w-6 h-6 ${getMarkerColor(marker.severity)} rounded-full border-2 border-white shadow-lg ${
                marker.severity === 'high' ? 'animate-pulse' : ''
              }`}></div>
              
              {selectedMarker?.id === marker.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                  <Card className="p-3 shadow-lg text-sm whitespace-nowrap">
                    <div className="font-semibold">
                      {marker.type === 'Gempa' ? '🌍' : 
                       marker.type === 'Banjir' ? '🌊' : 
                       marker.type === 'Kebakaran' ? '🔥' : '⛰️'} {marker.type}
                    </div>
                    <div className="text-gray-600">{marker.location}</div>
                    <div className="text-xs text-gray-500">{marker.time}</div>
                  </Card>
                </div>
              )}
            </div>
          ))}
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button size="sm" variant="outline" className="bg-white">
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-white">
              <Minus className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="bg-white">
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Legend */}
          <Card className="absolute bottom-4 left-4 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Legenda</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Tingkat Tinggi</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Tingkat Sedang</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Tingkat Rendah</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
