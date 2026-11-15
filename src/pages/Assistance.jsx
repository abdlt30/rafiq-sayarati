import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, MapPin, Phone, Navigation, 
  Wrench, Settings, Truck, AlertTriangle, Loader2, Map, Star
} from 'lucide-react';

// ✅ استيراد الدوال المحدثة من ملف regions.js
import { REGIONS, getSearchKeywords } from '../constants/regions.js';
import { safeNumber } from '../shared/utils/safeNumber.js';

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

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter'
];

export default function Assistance() {
  const { t, lang, currency } = useContext(AppContext);
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('repair'); // repair | parts | towing
  const [activeSubTab, setActiveSubTab] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  const [showFallback, setShowFallback] = useState(false);

  const loadingTimerRef = useRef(null);

  const CURRENCY_TO_COUNTRY = {
    'MAD': 'MA', 'DZD': 'DZ', 'TND': 'TN', 'LYD': 'LY', 'EGP': 'EG',
    'SAR': 'SA', 'AED': 'AE', 'KWD': 'KW', 'QAR': 'QA', 'BHD': 'BH', 'OMR': 'OM', 'JOD': 'JO',
    'USD': 'SA', 'EUR': 'MA' 
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // 🗺️ دالة فتح خرائط جوجل (محدثة لتدعم التخصيصات واللغة)
  const openGoogleMapsSearch = useCallback(() => {
    // جلب الكلمات المفتاحية باللغة الحالية
    const keywords = getSearchKeywords(currency, lang);
    const regionConfig = REGIONS[currency] || REGIONS['MAD'];

    let searchQuery = '';
    
    // إذا كان هناك تخصيص محدد (مثل قطع غيار مستعملة)
    if (activeSubTab) {
      // جلب الرقائق الخاصة باللغة الحالية أو العربية كاحتياط
      const subTabs = regionConfig?.subKeywords?.[lang]?.[activeTab] 
                   || regionConfig?.subKeywords?.['ar']?.[activeTab] 
                   || [];
      const sub = subTabs.find(s => s.id === activeSubTab);
      if (sub) searchQuery = sub.query;
    }
    
    // إذا لم يوجد تخصيص، استخدم الكلمة العامة
    if (!searchQuery) {
      searchQuery = keywords[activeTab] || keywords.repair;
    }

    // فتح الرابط
    if (userLocation) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${userLocation.lat},${userLocation.lon},14z`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [userLocation, activeTab, activeSubTab, currency, lang]);

  // 📍 جلب الموقع بدقة عالية مع معالجة التعليق
  const fetchNearbyHelp = useCallback(async (type) => {
    setErrorMsg('');
    setShowFallback(false);
    setIsLoading(true);
    setResults([]);

    // ✅ إصلاح مشكلة "التعليق": إذا استغرق البحث أكثر من 8 ثوانٍ، اعرض زر جوجل مابس
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setErrorMsg('استغرق البحث وقتاً طويلاً (قد تكون الشبكة ضعيفة).');
      setShowFallback(true);
    }, 8000);

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
        else if (type === 'towing') {
          queryTag = '(nwr["service"="towing"];nwr["amenity"="car_repair"]["name"~"دبناج|سطحة|Remorquage|Dépannage|ونش|ت Bottom",i];)';
        }

        const query = `[out:json];(${queryTag}(around:10000,${latitude},${longitude}););out center 20;`;

        try {
          let success = false;
          for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 6000);

              const res = await fetch(endpoint, { method: 'POST', body: query, signal: controller.signal });
              clearTimeout(timeoutId);

              if (res.ok) {
                const data = await res.json();
                if (data.elements && data.elements.length > 0) {
                  const places = data.elements.map(el => {
                    const lat = el.lat || el.center?.lat;
                    const lon = el.lon || el.center?.lon;
                    if (!lat || !lon) return null;

                    return {
                      id: el.id,
                      name: el.tags?.name || el.tags?.brand || (type === 'towing' ? 'خدمة سحب' : 'ورشة غير مسماة'),
                      lat: lat,
                      lon: lon,
                      phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
                      distance: parseFloat(calculateDistance(latitude, longitude, lat, lon)),
                    };
                  }).filter(Boolean).sort((a, b) => a.distance - b.distance);

                  setResults(places.slice(0, 10));
                  success = true;
                  break;
                }
              }
            } catch (err) {
              console.warn(`Endpoint failed: ${endpoint}`, err);
            }
          }

          if (!success) {
            setErrorMsg(t('searchFailed') || 'لم نجد نتائج في نطاق 10 كم. جرب خرائط جوجل مباشرة.');
            setShowFallback(true);
          }
        } finally {
          if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
          setIsLoading(false);
        }
      },
      (error) => {
        if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
        setErrorMsg(t('locationDenied') || 'تم رفض الوصول للموقع. يرجى السماح بالوصول.');
        setIsLoading(false);
        setShowFallback(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [t]);

  useEffect(() => {
    fetchNearbyHelp(activeTab);
    setActiveSubTab(''); // إعادة تعيين التخصيص عند تغيير التبويب الرئيسي
    
    // ✅ تنظيف المؤقت عند مغادرة الصفحة
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [activeTab, fetchNearbyHelp]);

  // ✅ جلب التخصيصات بناءً على الدولة واللغة والتبويب الحالي
  const regionConfig = REGIONS[currency] || REGIONS['MAD'];
  const availableSubTabs = regionConfig?.subKeywords?.[lang]?.[activeTab] 
                        || regionConfig?.subKeywords?.['ar']?.[activeTab] 
                        || [];

  return (
    <div className="space-y-4 pb-24 px-4 pt-4 max-w-2xl mx-auto min-h-screen font-sans">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={handleBack} className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95 transition-all shadow-sm">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-extrabold text-[var(--text)] flex items-center gap-2 tracking-tight">
          <span className="p-1.5 bg-red-500/10 text-red-500 rounded-lg"><AlertTriangle size={20} /></span>
          {t('roadsideAssistance') || 'المساعدة على الطريق'}
        </h1>
      </div>

      {/* التبويبات الرئيسية */}
      <div className="flex gap-1.5 bg-[var(--surface-2)] p-1.5 rounded-2xl border border-[var(--border)]/50 shadow-inner">
        <button onClick={() => setActiveTab('repair')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'repair' ? 'bg-[var(--surface)] shadow-md text-blue-500 scale-[1.02]' : 'text-[var(--text-muted)]'}`}>
          <Wrench size={16} /> {t('findRepairShop') || 'ورش إصلاح'}
        </button>
        <button onClick={() => setActiveTab('parts')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'parts' ? 'bg-[var(--surface)] shadow-md text-purple-500 scale-[1.02]' : 'text-[var(--text-muted)]'}`}>
          <Settings size={16} /> {t('findSpareParts') || 'قطع غيار'}
        </button>
        <button onClick={() => setActiveTab('towing')} className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${activeTab === 'towing' ? 'bg-[var(--surface)] shadow-md text-red-500 scale-[1.02]' : 'text-[var(--text-muted)]'}`}>
          <Truck size={16} /> {t('requestTowing') || 'سحب السيارات'}
        </button>
      </div>

      {/* ✅ الرقائق الذكية (Smart Chips) للتخصيص */}
      {availableSubTabs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide animate-fade-in">
          {availableSubTabs.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(activeSubTab === sub.id ? '' : sub.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                activeSubTab === sub.id 
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/20' 
                  : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)]'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

      {/* منطقة البحث والخريطة */}
      <div className="w-full h-44 bg-gradient-to-br from-blue-900/10 to-[var(--surface)] rounded-3xl border border-blue-500/20 flex flex-col items-center justify-center relative shadow-lg overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-[var(--primary)] rounded-full animate-ping opacity-20"></div>
            <MapPin size={36} className="text-[var(--primary)] relative z-10" />
          </div>
          <p className="text-xs font-bold text-[var(--text)] mb-3 bg-[var(--surface)]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[var(--border)]">
            {t('yourLocation') || 'موقعك الحالي (تم التحديد)'}
          </p>
          
          <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mb-3 bg-green-500/10 px-2.5 py-1 rounded-md border border-green-500/20">
            <Star size={12} fill="currentColor" /> ننصحك باختيار الخدمات 4.5 ⭐ فما فوق
          </div>

          <button 
            onClick={openGoogleMapsSearch}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-all hover:opacity-90"
          >
            <Map size={18} /> {t('searchOnGoogleMaps') || 'عرض الكل على خرائط جوجل'}
          </button>
        </div>
      </div>

      {/* حالة التحميل (مع زر إلغاء/تجاوز) */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={36} className="animate-spin text-[var(--primary)] mb-4" />
          <p className="text-sm font-bold text-[var(--text-muted)] animate-pulse">{t('searchingHelp') || 'جاري البحث عن أقرب مساعدة...'}</p>
          <button onClick={openGoogleMapsSearch} className="mt-4 text-xs font-bold text-[var(--primary)] underline">
            تخطي البحث وفتح خرائط جوجل مباشرة
          </button>
        </div>
      )}

      {/* حالة الخطأ */}
      {errorMsg && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-center animate-fade-in shadow-sm">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-3 opacity-80" />
          <p className="text-sm font-bold text-red-500 mb-5 leading-relaxed">{errorMsg}</p>
          
          {showFallback && (
            <button onClick={openGoogleMapsSearch} className="bg-[var(--primary)] text-white px-5 py-3.5 rounded-2xl text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 w-full mb-4 shadow-lg shadow-blue-500/20">
              <Map size={18} /> {t('searchOnGoogleMaps') || 'البحث الآن على خرائط جوجل'}
            </button>
          )}
          
          <button onClick={() => fetchNearbyHelp(activeTab)} className="text-[var(--text-muted)] text-xs font-bold hover:text-[var(--text)] transition-colors">
            {t('retry') || 'إعادة المحاولة على خوادمنا'}
          </button>
        </div>
      )}

      {/* قائمة النتائج */}
      {!isLoading && !errorMsg && results.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-xs font-bold text-[var(--text-muted)]">
              {t('stationsFound') || 'تم العثور على'} {results.length} {t('nearbyStationsCount') || 'مكان قريب'}
            </p>
          </div>
          
          {results.map((place, index) => (
            <div key={place.id || index} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-[var(--primary)]/40 transition-all duration-300 active:scale-[0.98] group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'repair' ? 'bg-blue-500/10 text-blue-500' : 
                  activeTab === 'parts' ? 'bg-purple-500/10 text-purple-500' : 
                  'bg-red-500/10 text-red-500'
                }`}>
                  {activeTab === 'repair' ? <Wrench size={20} /> : activeTab === 'parts' ? <Settings size={20} /> : <Truck size={20} />}
                </div>
                <div>
                  <p className="font-bold text-[var(--text)] text-sm truncate max-w-[180px] leading-tight mb-1">{place.name}</p>
                  <p className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                    <MapPin size={12} className="text-[var(--primary)]" /> {place.distance} {t('km') || 'كم'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {place.phone ? (
                  <a href={`tel:${place.phone}`} className="p-3 bg-green-500/10 text-green-500 rounded-2xl hover:bg-green-500/20 active:scale-90 transition-all"><Phone size={18} /></a>
                ) : null}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl hover:bg-blue-500/20 active:scale-90 transition-all"><Navigation size={18} /></a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
