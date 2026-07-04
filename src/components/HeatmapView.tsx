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
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
        color = '#EF4444'; // Red (extremely critical)
        urgencyText = 'Critical Urgency';
      } else if (item.urgencyScore >= 45) {
        color = '#F59E0B'; // Amber (medium warning)
        urgencyText = 'High/Medium';
      }

      // Add a customized visual circle indicating distress severity and area impact
      const circle = L.circle([item.lat, item.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 180 + (item.urgencyScore * 2) // radius expands with distress
      });

      // Simple HTML Popup with dark styling
      const popupContent = `
        <div style="font-family: sans-serif; padding: 6px; width: 220px; color: #f8fafc;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: ${color};">${item.category}</span>
            <span style="background-color: ${color}20; color: ${color}; font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 9999px;">${item.urgencyScore}/100</span>
          </div>
          <p style="font-size: 12px; font-weight: 600; color: #f1f5f9; margin: 0 0 4px 0;">${item.address}</p>
          <div style="font-size: 11px; font-weight: 500; color: #94a3b8;">
            Status: <span style="font-weight: 700; color: #cbd5e1;">${urgencyText}</span>
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
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <span className="text-slate-400 font-semibold text-xs mt-3 uppercase tracking-wider">Compiling GIS Spatial Layers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-rose-950/40 border border-rose-900/30 rounded-2xl shadow-xl p-6">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
        <span className="text-rose-300 font-bold text-sm">Mapping Ingress Failure</span>
        <p className="text-rose-400/80 text-xs text-center mt-1 max-w-sm">{error}</p>
        <button 
          onClick={fetchHeatmap} 
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
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
          <h3 className="text-base font-bold text-slate-100">Constituency Distress Heatmap</h3>
          <p className="text-xs text-slate-500 font-medium">Real-time localized grievance clusters scaled by compound urgency factors (2km spatial radius)</p>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-semibold flex-wrap">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            <span className="text-slate-400">Critical (75+)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
            <span className="text-slate-400">High/Medium (45-74)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span className="text-slate-400">Low (&lt;45)</span>
          </div>
        </div>
      </div>

      <div 
        ref={mapContainerRef} 
        className="w-full h-[520px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden z-10" 
        id="map-canvas"
      />
    </div>
  );
};
