import React, { useEffect, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2, AlertCircle } from 'lucide-react';

declare const L: any; // Leaflet is loaded via script tag in index.html

interface HeatmapItem {
  _id: string;
  lat: number;
  lng: number;
  urgencyScore: number;
  category: string;
  address: string;
}

export const HeatmapView: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<HeatmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Fetch coordinates
  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/grievances/heatmap');
      if (response.data.success) {
        setHeatmapData(response.data.heatmap);
      }
    } catch (err: any) {
      console.error('Failed to load heatmap data:', err);
      setError('Could not connect to the geo-mapping service. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, []);

  // Initialize and update the Leaflet map
  useEffect(() => {
    if (loading || error || !mapContainerRef.current) return;

    // Check if Leaflet L global is loaded
    if (typeof L === 'undefined') {
      setError('Spatial Leaflet JS CDN did not load. Try reloading the page.');
      return;
    }

    // 1. Create Map Instance if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: [22.535, 88.390], // Center around Kolkata municipal area
        zoom: 12,
        scrollWheelZoom: true,
        fadeAnimation: true
      });

      // 2. Add high-contrast Mapbox-like Voyager tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstanceRef.current);

      // 3. Create a layer group to easily clear and re-add markers
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    // Clear old markers/circles
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
    }

    // 4. Plot grievance nodes with colors mapped to urgencyScores
    heatmapData.forEach((item) => {
      if (!item.lat || !item.lng) return;

      // Color based on urgency Score (green -> yellow -> red)
      let color = '#10B981'; // Green (low priority)
      let urgencyText = 'Low Urgency';
      if (item.urgencyScore >= 75) {
        color = '#E76F51'; // Terracotta Red (extremely critical)
        urgencyText = 'Critical Urgency';
      } else if (item.urgencyScore >= 45) {
        color = '#F59E0B'; // Amber (medium warning)
        urgencyText = 'High/Medium';
      }

      // Add a customized visual circle indicating distress severity and area impact
      const circle = L.circle([item.lat, item.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        radius: 180 + (item.urgencyScore * 2) // radius expands with distress
      });

      // Simple HTML Popup with clean light styling
      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; width: 220px; color: #3A2E2B;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E5DEC9; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${color};">${item.category}</span>
            <span style="background-color: ${color}15; color: ${color}; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px; border: 1px solid ${color}20;">${item.urgencyScore}/100</span>
          </div>
          <p style="font-size: 12px; font-weight: 800; color: #3A2E2B; margin: 0 0 4px 0;">${item.address}</p>
          <div style="font-size: 10px; font-weight: 700; color: #9A8C7F; text-transform: uppercase; tracking: 0.05em;">
            Status: <span style="font-weight: 900; color: #3A2E2B;">${urgencyText}</span>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);
      layerGroupRef.current.addLayer(circle);
    });

    // Handle container resizing to avoid Leaflet gray grids
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };

  }, [loading, error, heatmapData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#FFFDF9] rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40">
        <Loader2 className="w-8 h-8 text-[#3F6C51] animate-spin" />
        <span className="text-[#9A8C7F] font-black text-xs mt-3 uppercase tracking-wider">Compiling GIS Spatial Layers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-[#FFFDF9] rounded-3xl shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] border border-white/40 p-6">
        <AlertCircle className="w-10 h-10 text-[#E76F51] mb-2" />
        <span className="text-[#3A2E2B] font-black text-sm">Mapping Ingress Failure</span>
        <p className="text-[#9A8C7F] text-xs text-center mt-1 max-w-sm font-bold">{error}</p>
        <button 
          onClick={fetchHeatmap} 
          className="mt-4 px-5 py-2.5 bg-[#E76F51] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_8px_rgba(231,111,81,0.25),-4px_-4px_8px_#FFFFFF] cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
        <div>
          <h3 className="text-base font-black text-[#3A2E2B]">Constituency Distress Heatmap</h3>
          <p className="text-xs text-[#9A8C7F] font-bold">Real-time localized grievance clusters scaled by compound urgency factors (2km spatial radius)</p>
        </div>
        <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-wider flex-wrap">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-[#E76F51] rounded-full shadow-sm"></span>
            <span className="text-[#9A8C7F]">Critical (75+)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm"></span>
            <span className="text-[#9A8C7F]">High/Medium (45-74)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></span>
            <span className="text-[#9A8C7F]">Low (&lt;45)</span>
          </div>
        </div>
      </div>

      <div 
        ref={mapContainerRef} 
        className="w-full h-[520px] bg-[#FFFDF9] rounded-3xl border border-white/40 shadow-[10px_10px_20px_0px_#E5DEC9,-10px_-10px_20px_0px_#FFFFFF] overflow-hidden z-10" 
        id="map-canvas"
      />
    </div>
  );
};

