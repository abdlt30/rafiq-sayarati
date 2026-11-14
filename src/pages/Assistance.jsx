import { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, MapPin, Phone, Navigation, 
  Wrench, Settings, Truck, AlertTriangle, Loader2, Map
} from 'lucide-react';

// ✅ دالة رياضية لحساب المسافة
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
};

// ✅ خوادم Overpass الاحتياطية (لحل مشكلة انقطاع الاتصال)
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

export default function Assistance() {
  const { t, lang } = useContext(AppContext);
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('repair');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFallback, setShowFallback] = useState(false); // ✅ حالة للتحول إلى جوجل مابس

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // 🗺️ دالة فتح خرائط جوجل ببحث دقيق (Deep Link)
  const openGoogleMapsSearch = useCallback(() => {
    if (!userLocation) return;
    
    let searchQuery = '';
    if (activeTab === 'repair') searchQuery = 'auto repair shop';
    else if (activeTab === 'parts') searchQuery = 'auto parts store';
    else if (activeTab === 'towing') searchQuery = 'towing service';

    // فتح الخريطة على موقع المستخدم بدقة مع البحث عن الكلمة المفتاحية
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}&center=${userLocation.lat},${userLocation.lon}&zoom=14`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [userLocation, activeTab]);

  // 📍 جلب الموقع بدقة عالية (High Accuracy)
  const fetchNearbyHelp = useCallback(async (type) => {
    setErrorMsg('');
    setShowFallback(false);
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

        let queryTag = '';
        if (type === 'repair') queryTag = 'nwr["amenity"="car_repair"]';
        else if (type === 'parts') queryTag = 'nwr["shop"="car_parts"]';
        else if (type === 'towing') queryTag = 'nwr["service"="towing"]';

        const query = `[out:json];(${queryTag}(around:10000,${latitude},${longitude}););out center 20;`;

        let success = false;
        let lastError = null;

        // ✅ محاولة الاتصال بالخوادم الاحتياطية بالتتابع
        for (const endpoint of OVERPASS_ENDPOINTS) {
          try {
            const res = await fetchWithTimeout(
              endpoint,
              { method: 'POST', body: query },
              15000 // 15 ثانية مهلة لكل خادم
            );
            
            if (res.ok) {
              const data = await res.json();
              if (data.elements) {
                const places = data.elements.map(el => {
                  const lat = el.lat || el.center?.lat;
                  const lon = el.lon || el.center?.lon;
                  if (!lat || !lon) return null;

                  return {
                    id: el.id,
                    name: el.tags?.name || el.tags?.brand || (type === 'towing' ? 'خدمة سحب' : 'ورشة غير مسمى'),
                    lat: lat,
                    lon: lon,
                    phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
                    distance: parseFloat(calculateDistance(latitude, longitude, lat, lon)),
                  };
                })
                .filter(Boolean)
                .sort((a, b) => a.distance - b.distance);

                setResults(places.slice(0, 10));
                success = true;
                break; // نجح الاتصال، نخرج من الحلقة
              }
            }
          } catch (err) {
            lastError = err;
            console.warn(`Endpoint failed: ${endpoint}`, err);
            // نستمر للخادم التالي
          }
        }

        if (!success) {
          // إذا فشلت جميع الخوادم، نظهر رسالة ونعرض زر الانتقال لجوجل مابس
          setErrorMsg(t('searchFailed') || 'تعذر الاتصال بقاعدة البيانات. جرب خرائط جوجل مباشرة.');
          setShowFallback(true);
        }
        
        setIsLoading(false);
      },
      (error) => {
        setErrorMsg(t('locationDenied') || 'تم رفض الوصول للموقع. يرجى السماح بالوصول.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } // ✅ دقة عالية وموقع جديد
    );
  }, [t]);

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
        </div>
      </div>

      {/* التبويبات */}
      <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-xl">
        <button onClick={() => setActiveTab('repair')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${activeTab === 'repair' ? 'bg-[var(--surface)] shadow-sm text-blue-500' : 'text-[var(--text-muted)]'}`}>
          <Wrench size={14} /> {t('findRepairShop') || 'ورش إصلاح'}
        </button>
        <button onClick={() => setActiveTab('parts')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${activeTab === 'parts' ? 'bg-[var(--surface)] shadow-sm text-purple-500' : 'text-[var(--text-muted)]'}`}>
          <Settings size={14} /> {t('findSpareParts') || 'قطع غيار'}
        </button>
        <button onClick={() => setActiveTab('towing')} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${activeTab === 'towing' ? 'bg-[var(--surface)] shadow-sm text-red-500' : 'text-[var(--text-muted)]'}`}>
          <Truck size={14} /> {t('requestTowing') || 'سطحة'}
        </button>
      </div>

      {/* منطقة الموقع */}
      <div className="w-full h-32 bg-[var(--surface-2)] rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center relative shadow-inner">
        <MapPin size={24} className="text-[var(--primary)] mb-1 animate-bounce" />
        <p className="text-[10px] font-bold text-[var(--text-muted)] mb-2">{t('yourLocation') || 'موقعك الحالي'}</p>
        
        {/* ✅ زر البحث الذكي في جوجل مابس */}
        {userLocation && (
          <button 
            onClick={openGoogleMapsSearch}
            className="flex items-center gap-1.5 bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform"
          >
            <Map size={14} /> {t('openInGoogleMaps') || 'البحث في خرائط جوجل'}
          </button>
        )}
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={32} className="animate-spin text-[var(--primary)] mb-3" />
          <p className="text-sm font-bold text-[var(--text-muted)]">{t('searchingHelp') || 'جاري البحث...'}</p>
        </div>
      )}

      {/* حالة الخطأ + زر التوجيه لجوجل مابس */}
      {errorMsg && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-500 mb-4">{errorMsg}</p>
          
          {showFallback && userLocation && (
            <button onClick={openGoogleMapsSearch} className="bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 w-full">
              <Map size={16} /> {t('searchOnGoogleMaps') || 'ابحث الآن على خرائط جوجل'}
            </button>
          )}
          
          <button onClick={() => fetchNearbyHelp(activeTab)} className="mt-3 text-[var(--text-muted)] text-xs underline">
            {t('retry') || 'إعادة المحاولة على خوادمنا'}
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
                  <p className="font-bold text-[var(--text)] text-sm truncate max-w-[160px]">{place.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {place.distance} {t('km') || 'كم'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {place.phone ? (
                  <a href={`tel:${place.phone}`} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl active:scale-90"><Phone size={16} /></a>
                ) : null}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl active:scale-90"><Navigation size={16} /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
