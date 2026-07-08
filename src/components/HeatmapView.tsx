import React, { useEffect, useRef, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2, AlertCircle } from 'lucide-react';
declare const L: any;

export const HeatmapView: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  const fetchHeatmap = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/api/grievances/heatmap');
      if (response.data.success) setHeatmapData(response.data.heatmap);
    } catch (err: any) { setError('Could not connect to geo-mapping service.'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHeatmap(); }, []);

  useEffect(() => {
    if (loading || error || !mapContainerRef.current) return;
    if (typeof L === 'undefined') { setError('Spatial Leaflet JS CDN did not load.'); return; }

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, { center: [22.535, 88.390], zoom: 12 });
      // Voyager is fine, but a dark map fits the Noir theme better if possible. Sticking to Voyager as requested.
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(mapInstanceRef.current);
      layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    if (layerGroupRef.current) layerGroupRef.current.clearLayers();

    heatmapData.forEach((item) => {
      if (!item.lat || !item.lng) return;
      let color = '#10B981'; let urgencyText = 'Low Urgency';
      if (item.urgencyScore >= 75) { color = '#E76F51'; urgencyText = 'Critical Urgency'; } 
      else if (item.urgencyScore >= 45) { color = '#F59E0B'; urgencyText = 'High/Medium'; }

      const circle = L.circle([item.lat, item.lng], { color, fillColor: color, fillOpacity: 0.45, radius: 180 + (item.urgencyScore * 2) });
      const popupContent = `<div style="font-family: 'Inter', sans-serif; padding: 4px; width: 220px; color: #111;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 8px;">
            <span style="font-weight: 800; font-size: 10px; text-transform: uppercase; color: ${color};">${item.category}</span>
            <span style="background-color: ${color}15; color: ${color}; font-weight: 800; font-size: 10px; padding: 2px 8px; border-radius: 6px;">${item.urgencyScore}/100</span>
          </div>
          <p style="font-size: 12px; font-weight: 800; margin: 0 0 4px 0;">${item.address}</p>
          <div style="font-size: 10px; font-weight: 700; color: #666; text-transform: uppercase;">Status: <span style="font-weight: 900; color: #111;">${urgencyText}</span></div>
        </div>`;
      circle.bindPopup(popupContent); layerGroupRef.current.addLayer(circle);
    });

    const resizeObserver = new ResizeObserver(() => { if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize(); });
    resizeObserver.observe(mapContainerRef.current);
    return () => resizeObserver.disconnect();
  }, [loading, error, heatmapData]);

  useEffect(() => { return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } }; }, []);

  if (loading) return (<div className="flex flex-col items-center justify-center h-125 neumorphic-concave rounded-4xl"><Loader2 className="w-8 h-8 theme-accent animate-spin" /><span className="theme-text-muted font-black text-xs mt-3 uppercase tracking-wider">Compiling GIS Layers...</span></div>);
  if (error) return (<div className="flex flex-col items-center justify-center h-125 neumorphic-concave rounded-4xl p-6"><AlertCircle className="w-10 h-10 text-red-500 mb-2" /><span className="theme-text-main font-black text-sm">Mapping Ingress Failure</span><p className="theme-text-muted text-xs text-center mt-1">{error}</p></div>);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div><h3 className="text-xl font-black theme-text-main tracking-tight">Constituency Distress Heatmap</h3><p className="text-xs theme-text-muted font-bold mt-1">Real-time localized clusters scaled by AI urgency</p></div>
        <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-wider neumorphic-concave px-4 py-2 rounded-xl">
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span><span className="theme-text-muted">Critical</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span><span className="theme-text-muted">Medium</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span><span className="theme-text-muted">Low</span></div>
        </div>
      </div>
      <div ref={mapContainerRef} className="w-full h-130 rounded-4xl overflow-hidden z-10" id="map-canvas" />
    </div>
  );
};