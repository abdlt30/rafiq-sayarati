import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx'; // ✅ إصلاح مسار Vite
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, MapPin, Phone, Navigation, 
  Wrench, Settings, Truck, AlertTriangle, Loader2, Map
} from 'lucide-react';

// ✅ دالة رياضية دقيقة لحساب المسافة (Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
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

  // 🗺️ جلب الموقع والبحث الفعلي
  const fetchNearbyHelp = useCallback((type) => {
    setErrorMsg('');
    setIsLoading(true);
    setResults([]);

    if (!navigator.geolocation) {
      setErrorMsg(t('locationNotSupported') || 'متصفحك لا يدعم تحديد الموقع.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });

        try {
          // ✅ تصحيح حرج: استخدام nwr لجلب (النقاط، المباني، والمناطق) لضمان دقة البيانات
          let queryTag = '';
          if (type === 'repair') queryTag = 'nwr["amenity"="car_repair"]';
          else if (type === 'parts') queryTag = 'nwr["shop"="car_parts"]';
          else if (type === 'towing') queryTag = 'nwr["service"="towing"]';

          // البحث في نطاق 10 كم
          const query = `[out:json];(${queryTag}(around:10000,${latitude},${longitude}););out center;`;
          const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
          const data = await res.json();

          if (data.elements && data.elements.length > 0) {
            const places = data.elements.map(el => {
              // في nwr قد يكون الموقع في el.lat أو el.center.lat
              const lat = el.lat || el.center?.lat;
              const lon = el.lon || el.center?.lon;
              
              if (!lat || !lon) return null; // تخطي إذا لم توجد إحداثيات

              return {
                id: el.id,
                name: el.tags?.name || el.tags?.brand || (type === 'towing' ? 'خدمة سحب وإنقاذ' : 'ورشة/محل غير مسمى'),
                lat: lat,
                lon: lon,
                phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
                distance: parseFloat(calculateDistance(latitude, longitude, lat, lon)),
              };
            })
            .filter(Boolean) // إزالة العناصر الفارغة
            .sort((a, b) => a.distance - b.distance); // ترتيب حسب الأقرب

            if (places.length > 0) {
              setResults(places.slice(0, 10)); // عرض أفضل 10 نتائج حقيقية
            } else {
              setErrorMsg(t('noHelpFound') || 'لم يتم العثور على نتائج في نطاق 10 كم.');
            }
          } else {
            setErrorMsg(t('noHelpFound') || 'لم يتم العثور على نتائج في نطاق 10 كم.');
          }
        } catch (error) {
          console.error(error);
          setErrorMsg(t('searchFailed') || 'تعذر الاتصال بقاعدة بيانات الخرائط. تحقق من الإنترنت.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setErrorMsg(t('locationDenied') || 'تم رفض الوصول للموقع. يرجى السماح للمتصفح بالوصول.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [t]);

  useEffect(() => {
    fetchNearbyHelp(activeTab);
  }, [activeTab, fetchNearbyHelp]);

  return (
    <div className="space-y-4 pb-24 px-4 pt-4 max-w-2xl mx-auto min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handleBack} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] active:scale-90 transition-transform">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-red-500 flex items-center gap-2">
            <AlertTriangle size={24} /> {t('roadsideAssistance') || 'المساعدة على الطريق'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('helpDesc') || 'سيارة معطلة؟ ابحث عن أقرب مساعدة حقيقية.'}</p>
        </div>
      </div>

      {/* التبويبات (Tabs) */}
      <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-xl">
        <button onClick={() => setActiveTab('repair')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${activeTab === 'repair' ? 'bg-[var(--surface)] shadow-sm text-blue-500' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
          <Wrench size={14} /> {t('findRepairShop') || 'ورش إصلاح'}
        </button>
        <button onClick={() => setActiveTab('parts')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${activeTab === 'parts' ? 'bg-[var(--surface)] shadow-sm text-purple-500' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
          <Settings size={14} /> {t('findSpareParts') || 'قطع غيار'}
        </button>
        <button onClick={() => setActiveTab('towing')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${activeTab === 'towing' ? 'bg-[var(--surface)] shadow-sm text-red-500' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
          <Truck size={14} /> {t('requestTowing') || 'سطحة إنقاذ'}
        </button>
      </div>

      {/* منطقة الخريطة (Map Link) */}
      <div className="w-full h-40 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
        <MapPin size={32} className="text-[var(--primary)] mb-2 animate-bounce" />
        <p className="text-xs font-bold text-[var(--text-muted)] mb-2">موقعك الحالي (تم التحديد)</p>
        {userLocation && (
          <a 
            href={`https://www.google.com/maps?q=${userLocation.lat},${userLocation.lon}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform"
          >
            <Map size={14} /> عرض على خرائط جوجل
          </a>
        )}
        <button 
          onClick={() => fetchNearbyHelp(activeTab)} 
          className="absolute bottom-3 right-3 bg-[var(--surface)] text-[var(--primary)] border border-[var(--border)] p-2.5 rounded-xl shadow-lg active:scale-95 transition-transform"
          aria-label={t('refreshSearch')}
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-[var(--primary)] mb-3" />
          <p className="text-sm font-bold text-[var(--text-muted)]">{t('searchingHelp') || 'جاري البحث عن مساعدة حقيقية...'}</p>
        </div>
      )}

      {/* رسالة الخطأ */}
      {errorMsg && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-500 mb-3">{errorMsg}</p>
          <button onClick={() => fetchNearbyHelp(activeTab)} className="bg-red-500 text-white px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
            {t('retry') || 'إعادة المحاولة'}
          </button>
        </div>
      )}

      {/* قائمة النتائج */}
      {!isLoading && !errorMsg && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[var(--text-muted)] px-1 mb-2">
            {t('stationsFound') || 'تم العثور على'} {results.length} {t('nearbyStationsCount') || 'مكان حقيقي قريب'}
          </p>
          {results.map((place, index) => (
            <div key={place.id || index} className="bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl flex items-center justify-between shadow-sm hover:border-[var(--primary)]/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeTab === 'repair' ? 'bg-blue-500/10 text-blue-500' : activeTab === 'parts' ? 'bg-purple-500/10 text-purple-500' : 'bg-red-500/10 text-red-500'}`}>
                  {activeTab === 'repair' ? <Wrench size={18} /> : activeTab === 'parts' ? <Settings size={18} /> : <Truck size={18} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm truncate max-w-[160px]">{place.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {place.distance} {t('km') || 'كم'} • {place.phone ? 'متوفر هاتف' : 'بدون هاتف'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {place.phone ? (
                  <a href={`tel:${place.phone}`} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl active:scale-90 transition-transform" aria-label={t('call')}>
                    <Phone size={16} />
                  </a>
                ) : null}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl active:scale-90 transition-transform" aria-label={t('navigate')}>
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
