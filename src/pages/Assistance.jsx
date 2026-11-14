import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, MapPin, Phone, Navigation, 
  Wrench, Settings, Truck, AlertTriangle, Loader2 
} from 'lucide-react';

// ✅ استيراد مكونات الخريطة (تأكد من تثبيت leaflet و react-leaflet)
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// ✅ دالة رياضية لحساب المسافة (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); // المسافة بالكيلومتر
};

export default function Assistance() {
  const { t, lang } = useContext(AppContext);
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('repair'); // repair | parts | towing
  const [errorMsg, setErrorMsg] = useState('');

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // 🗺️ جلب الموقع والبحث
  const fetchNearbyHelp = useCallback((type) => {
    setErrorMsg('');
    setIsLoading(true);
    setResults([]);

    if (!navigator.geolocation) {
      setErrorMsg(t('locationNotSupported') || 'متصفحك لا يدعم الموقع.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });

        try {
          // تحديد نوع البحث في OpenStreetMap (Overpass)
          let queryTag = '';
          if (type === 'repair') queryTag = 'node["amenity"="car_repair"]';
          else if (type === 'parts') queryTag = 'node["shop"="car_parts"]';
          else if (type === 'towing') queryTag = 'node["service"="towing"]';

          // البحث في نطاق 10 كم
          const query = `[out:json];(${queryTag}(around:10000,${latitude},${longitude}););out;`;
          const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const data = await res.json();

          if (data.elements && data.elements.length > 0) {
            const places = data.elements.map(el => {
              const lat = el.lat;
              const lon = el.lon;
              return {
                id: el.id,
                name: el.tags?.name || el.tags?.brand || (type === 'towing' ? 'خدمة سحب' : 'ورشة/محل غير مسمى'),
                lat: lat,
                lon: lon,
                phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
                distance: parseFloat(calculateDistance(latitude, longitude, lat, lon)),
              };
            }).sort((a, b) => a.distance - b.distance); // ترتيب حسب الأقرب

            setResults(places.slice(0, 10)); // عرض أفضل 10 نتائج
          } else {
            setErrorMsg(t('noHelpFound') || 'لا توجد نتائج قريبة.');
          }
        } catch (error) {
          console.error(error);
          setErrorMsg(t('searchFailed') || 'حدث خطأ في الاتصال بالخريطة.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setErrorMsg(t('locationDenied') || 'تم رفض الوصول للموقع.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [t]);

  // تشغيل البحث عند فتح الصفحة لأول مرة
  useEffect(() => {
    fetchNearbyHelp(activeTab);
  }, [activeTab, fetchNearbyHelp]);

  return (
    <div className="space-y-4 pb-24 px-4 pt-4 max-w-2xl mx-auto min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleBack} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] active:scale-90">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-red-500 flex items-center gap-2">
            <AlertTriangle size={24} /> {t('roadsideAssistance') || 'المساعدة على الطريق'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('helpDesc') || 'سيارة معطلة؟ ابحث عن أقرب مساعدة.'}</p>
        </div>
      </div>

      {/* التبويبات (Tabs) */}
      <div className="flex gap-2 bg-[var(--surface-2)] p-1 rounded-xl">
        <button onClick={() => setActiveTab('repair')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${activeTab === 'repair' ? 'bg-[var(--surface)] shadow-sm text-blue-500' : 'text-[var(--text-muted)]'}`}>
          <Wrench size={14} /> {t('findRepairShop') || 'ورش إصلاح'}
        </button>
        <button onClick={() => setActiveTab('parts')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${activeTab === 'parts' ? 'bg-[var(--surface)] shadow-sm text-purple-500' : 'text-[var(--text-muted)]'}`}>
          <Settings size={14} /> {t('findSpareParts') || 'قطع غيار'}
        </button>
        <button onClick={() => setActiveTab('towing')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${activeTab === 'towing' ? 'bg-[var(--surface)] shadow-sm text-red-500' : 'text-[var(--text-muted)]'}`}>
          <Truck size={14} /> {t('requestTowing') || 'سطحة إنقاذ'}
        </button>
      </div>

      {/* منطقة الخريطة (Map Placeholder) */}
      <div className="w-full h-48 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center overflow-hidden relative">
        {/* هنا يمكنك وضع <MapContainer> إذا كنت ستستخدم react-leaflet */}
        <MapPin size={32} className="text-[var(--primary)] mb-2 animate-bounce" />
        <p className="text-xs font-bold text-[var(--text-muted)]">موقعك الحالي (خريطة تفاعلية)</p>
        <button onClick={() => fetchNearbyHelp(activeTab)} className="absolute bottom-3 right-3 bg-[var(--primary)] text-white p-2 rounded-lg shadow-lg active:scale-95">
          <Navigation size={16} />
        </button>
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-[var(--primary)] mb-3" />
          <p className="text-sm font-bold text-[var(--text-muted)]">{t('searchingHelp') || 'جاري البحث...'}</p>
        </div>
      )}

      {/* رسالة الخطأ */}
      {errorMsg && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
          <p className="text-sm font-bold text-red-500">{errorMsg}</p>
          <button onClick={() => fetchNearbyHelp(activeTab)} className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold">
            {t('retry') || 'إعادة المحاولة'}
          </button>
        </div>
      )}

      {/* قائمة النتائج */}
      {!isLoading && !errorMsg && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[var(--text-muted)] px-1 mb-2">
            {t('stationsFound') || 'تم العثور على'} {results.length} {t('nearbyStationsCount') || 'مكان قريب'}
          </p>
          {results.map((place, index) => (
            <div key={place.id || index} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'repair' ? 'bg-blue-500/10 text-blue-500' : activeTab === 'parts' ? 'bg-purple-500/10 text-purple-500' : 'bg-red-500/10 text-red-500'}`}>
                  {activeTab === 'repair' ? <Wrench size={18} /> : activeTab === 'parts' ? <Settings size={18} /> : <Truck size={18} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm truncate max-w-[150px]">{place.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {place.distance} {t('km') || 'كم'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {place.phone ? (
                  <a href={`tel:${place.phone}`} className="p-2 bg-green-500/10 text-green-500 rounded-lg active:scale-90" aria-label={t('call')}>
                    <Phone size={16} />
                  </a>
                ) : null}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-500/10 text-blue-500 rounded-lg active:scale-90" aria-label={t('navigate')}>
                  <Navigation size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
