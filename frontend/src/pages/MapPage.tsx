import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/api';
import { MapPin, Package, Activity, Navigation, Settings } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix for default marker icons if needed, but we will use custom DivIcons
const getCustomIcon = (status: string, category: string) => {
  let color = '#6366f1'; // Primary
  if (status === 'UNDER_MAINTENANCE') color = '#f59e0b';
  else if (status === 'RETIRED' || status === 'DISPOSED') color = '#94a3b8';
  else if (status === 'PLANNED') color = '#818cf8';
  else if (status === 'IN_USE' || status === 'INSTALLED') color = '#10b981';

  const iconHtml = renderToString(
    <div style={{
      width: '32px', height: '32px', 
      background: color, 
      borderRadius: '50%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      border: '3px solid white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <MapPin size={16} color="white" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to dynamically fit bounds to all markers
function MapBounds({ assets }: { assets: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (assets.length > 0) {
      const bounds = L.latLngBounds(assets.map(a => [a.latitude, a.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [assets, map]);
  return null;
}

export default function MapPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const { data } = await api.get('/assets', { params: { limit: 1000 } });
      setAssets(data.data?.assets || data.data || []);
    } catch (err) {
      console.error('Failed to load map assets', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h1>Geospatial Map</h1>
          <p className="page-header-sub">Live location and geofencing of all infrastructure assets</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-primary">
            <Navigation size={14} />
            {assets.length} Assets Mapped
          </span>
        </div>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <MapContainer 
            center={[21.1702, 72.8311]} // Default to Surat, India (or adjust as needed)
            zoom={12} 
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapBounds assets={assets} />

            {assets.map(asset => (
              <div key={asset.id}>
                <Marker 
                  position={[asset.latitude, asset.longitude]}
                  icon={getCustomIcon(asset.status, asset.category)}
                >
                  <Popup className="premium-popup">
                    <div style={{ padding: '8px', minWidth: '200px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b' }}>
                        {asset.name}
                      </h4>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {asset.assetId}
                      </p>
                      
                      <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category:</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{asset.category.replace('_', ' ')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Status:</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{asset.status.replace('_', ' ')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Health:</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{asset.healthScore ?? 'N/A'}/100</span>
                        </div>
                      </div>

                      <a href={`/assets`} style={{ 
                        display: 'block', textAlign: 'center', background: '#6366f1', 
                        color: 'white', textDecoration: 'none', padding: '6px', 
                        borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
                      }}>
                        View Details
                      </a>
                    </div>
                  </Popup>
                </Marker>

                {/* Geofence visualizer */}
                {asset.geofenceRadius && (
                  <Circle
                    center={[asset.latitude, asset.longitude]}
                    radius={asset.geofenceRadius}
                    pathOptions={{ 
                      color: asset.status === 'UNDER_MAINTENANCE' ? '#f59e0b' : '#6366f1',
                      fillColor: asset.status === 'UNDER_MAINTENANCE' ? '#f59e0b' : '#6366f1',
                      fillOpacity: 0.1,
                      weight: 1,
                      dashArray: '4 4'
                    }}
                  />
                )}
              </div>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
