import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Navigation, AlertCircle, Loader, Fuel } from 'lucide-react';

// ✅ إعداد أيقونة الموقع الحقيقي (أزرق)
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ إعداد أيقونة مخصصة لمحطات الوقود (برتقالي/أحمر)
const stationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f97316; width: 30px; height: 30px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"></line><line x1="4" y1="9" x2="14" y2="9"></line><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
});

// مكون لتحديث مركز الخريطة
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 14);
  return null;
}

export default function FuelStations() {
  const [position, setPosition] = useState(null);
  const [stations, setStations] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState(null);

  // 1. جلب الموقع الحقيقي
  const getLocation = () => {
    setLoadingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('متصفح هاتفك لا يدعم خدمة تحديد الموقع.');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoadingLocation(false);
      },
      (err) => {
        setError('تم رفض الوصول للموقع. يرجى تفعيل الـ GPS والسماح للمتصفح بالوصول لموقعك.');
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // 2. جلب محطات الوقود القريبة باستخدام Overpass API
  const fetchStations = async (lat, lon) => {
    setLoadingStations(true);
    // نبحث في نطاق 5 كيلومترات حول موقع المستخدم
    const radius = 5000; 
    const query = `
      [out:json];
      node["amenity"="fuel"](around:${radius},${lat},${lon});
      out;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      const data = await response.json();
      
      // تحويل البيانات لتناسب الخريطة
      const foundStations = data.elements.map(el => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || el.tags?.brand || 'محطة وقود',
        address: el.tags?.['addr:street'] || el.tags?.['addr:city'] || 'العنوان غير متوفر'
      }));

      setStations(foundStations);
    } catch (err) {
      console.error("خطأ في جلب المحطات:", err);
      setError('حدث خطأ أثناء الاتصال بقاعدة بيانات محطات الوقود. تأكد من اتصالك بالإنترنت.');
    } finally {
      setLoadingStations(false);
    }
  };

  // تشغيل الدوال عند فتح الصفحة
  useEffect(() => {
    getLocation();
  }, []);

  // بمجرد معرفة الموقع، نبحث عن المحطات
  useEffect(() => {
    if (position) {
      fetchStations(position[0], position[1]);
    }
  }, [position]);

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">محطات الوقود القريبة</h1>
      </div>

      {/* حالة التحميل */}
      {(loadingLocation || loadingStations) && (
        <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)] space-y-3">
          <Loader className="animate-spin text-[var(--primary)]" size={32} />
          <p className="text-sm font-bold">
            {loadingLocation ? 'جاري تحديد موقعك الحقيقي...' : 'جاري البحث عن محطات الوقود القريبة...'}
          </p>
        </div>
      )}

      {/* حالة الخطأ */}
      {error && !loadingLocation && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
          <AlertCircle className="text-red-500" size={48} />
          <p className="text-red-500 font-bold text-sm">{error}</p>
          <button onClick={getLocation} className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* الخريطة ومحطات الوقود */}
      {!loadingLocation && position && (
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg relative z-0">
            <MapContainer center={position} zoom={14} style={{ height: '450px', width: '100%' }}>
              <ChangeView center={position} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* دبوس موقع المستخدم */}
              <Marker position={position}>
                <Popup>موقعك الحقيقي</Popup>
              </Marker>

              {/* دبابيس محطات الوقود */}
              {stations.map(station => (
                <Marker key={station.id} position={[station.lat, station.lon]} icon={stationIcon}>
                  <Popup>
                    <div className="text-center font-sans">
                      <strong className="text-orange-600 block text-sm mb-1">{station.name}</strong>
                      <span className="text-xs text-gray-600">{station.address}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* ملخص النتائج */}
          <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
             <div className="flex items-center gap-2 text-[var(--text)]">
                <Fuel size={18} className="text-orange-500" />
                <span className="text-sm font-bold">تم العثور على {stations.length} محطة قريبة</span>
             </div>
             <button onClick={() => fetchStations(position[0], position[1])} className="text-xs text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg">
                تحديث البحث
             </button>
          </div>
        </div>
      )}
      
      <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
        * البيانات مقدمة من OpenStreetMap (Overpass API) ومجانية بالكامل.
      </p>
    </div>
  );
}
