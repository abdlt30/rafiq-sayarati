import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// ✅ إصلاح مشكلة اختفاء الأيقونة في React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function FuelStations() {
  // إحداثيات الرياض كمركز افتراضي (يمكنك تغييرها لمدينتك)
  const position = [24.7136, 46.6753]; 

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">محطات الوقود القريبة</h1>
      </div>

      <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg relative z-0">
        <MapContainer center={position} zoom={13} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>موقعك الافتراضي (الرياض)</Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <p className="text-center text-xs text-[var(--text-muted)] mt-2">
        * هذه الخريطة مجانية بالكامل ولا تحتاج لأي مفاتيح API.
      </p>
    </div>
  );
}
