import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface LocationPickerProps {
  latitude: number | string;
  longitude: number | string;
  address: string;
  onChange: (lat: number, lng: number, addr: string) => void;
}

function LocationMarker({ position, setPosition, setAddress }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      reverseGeocode(e.latlng.lat, e.latlng.lng).then(setAddress);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

async function reverseGeocode(lat: number, lon: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await res.json();
    return data.display_name || '';
  } catch (err) {
    return '';
  }
}

export default function LocationPicker({ latitude, longitude, address, onChange }: LocationPickerProps) {
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pos, setPos] = useState<[number, number] | null>(
    latitude && longitude ? [Number(latitude), Number(longitude)] : null
  );
  const [addr, setAddr] = useState(address);

  // Sync internal state if props change (e.g. edit mode loaded)
  useEffect(() => {
    if (latitude && longitude) {
      setPos([Number(latitude), Number(longitude)]);
    }
    setAddr(address);
  }, [latitude, longitude, address]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setPos([Number(lat), Number(lon)]);
        setAddr(display_name);
      } else {
        toast.error('Location not found');
      }
    } catch {
      toast.error('Failed to search location');
    }
  };

  const confirmLocation = () => {
    if (pos) {
      onChange(pos[0], pos[1], addr);
      setShowMap(false);
    }
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'block' }}>
        Location Coordinates & Address
      </label>
      
      {!showMap ? (
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary flex-1" 
            style={{ justifyContent: 'flex-start', textAlign: 'left', fontWeight: 'normal', color: addr ? 'var(--text-primary)' : 'var(--text-muted)' }}
            onClick={(e) => { e.preventDefault(); setShowMap(true); }}
          >
            <MapPin size={16} className="text-primary-500" />
            {addr ? `${addr.substring(0, 50)}...` : 'Select Location on Map'}
          </button>
        </div>
      ) : (
        <div className="border border-[var(--border-color)] rounded-lg overflow-hidden" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 flex gap-2">
            <input 
              className="input flex-1" 
              placeholder="Search address or landmark..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            />
            <button className="btn btn-secondary btn-icon" onClick={(e) => { e.preventDefault(); handleSearch(); }}>
              <Search size={18} />
            </button>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer 
              center={pos || [21.1702, 72.8311]} // Surat default
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <LocationMarker position={pos} setPosition={setPos} setAddress={setAddr} />
            </MapContainer>
          </div>

          <div className="p-3 bg-white dark:bg-[var(--bg-surface)] border-t border-[var(--border-color)] flex justify-between items-center gap-4">
            <div className="text-sm truncate flex-1 text-gray-600 dark:text-gray-400">
              {addr || 'Click on the map to select a location'}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={(e) => { e.preventDefault(); setShowMap(false); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={!pos} onClick={(e) => { e.preventDefault(); confirmLocation(); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
