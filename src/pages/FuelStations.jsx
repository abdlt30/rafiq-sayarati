import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Navigation, AlertCircle, Loader } from 'lucide-react';

// ✅ إصلاح مشكلة اختفاء أيقونة الدبوس في React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ مكون مساعد لتحديث مركز الخريطة عند تغير الموقع
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function FuelStations() {
  // حالة لحفظ إحداثيات الموقع الحقيقي
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // دالة جلب الموقع الحقيقي من الهاتف
  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('متصفح هاتفك لا يدعم خدمة تحديد الموقع.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // نجح جلب الموقع
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        // فشل جلب الموقع (المستخدم رفض الإذن أو الـ GPS مغلق)
        setError('تم رفض الوصول للموقع. يرجى تفعيل الـ GPS والسماح للمتصفح بالوصول لموقعك.');
        setLoading(false);
      },
      { enableHighAccuracy: true } // طلب دقة عالية
    );
  };

  // جلب الموقع تلقائياً عند فتح الصفحة
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">محطات الوقود القريبة</h1>
      </div>

      {/* حالة التحميل */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)] space-y-3">
          <Loader className="animate-spin text-[var(--primary)]" size={32} />
          <p className="text-sm font-bold">جاري تحديد موقعك الحقيقي...</p>
        </div>
      )}

      {/* حالة الخطأ (إذا رفض المستخدم الإذن) */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
          <AlertCircle className="text-red-500" size={48} />
          <p className="text-red-500 font-bold text-sm">{error}</p>
          <button onClick={getLocation} className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* عرض الخريطة فقط عندما نعرف الموقع الحقيقي */}
      {!loading && position && (
        <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg relative z-0">
          <MapContainer center={position} zoom={15} style={{ height: '500px', width: '100%' }}>
            <ChangeView center={position} /> {/* لتحديث المركز */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>موقعك الحقيقي هنا</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
      
      <button 
        onClick={getLocation} 
        className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 mt-4"
      >
        <Navigation size={20} />
        تحديث موقعي الحالي
      </button>
    </div>
  );
}
