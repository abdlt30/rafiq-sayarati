import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, ArrowLeft, MapPin, Phone, Navigation, 
  Wrench, Truck, Settings, Battery, AlertTriangle, 
  Loader2, Map, Star, ShieldAlert, CheckCircle2
} from 'lucide-react';

import { safeNumber } from '../shared/utils/safeNumber.js';

// دالة حساب المسافة (Haversine)
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
  
  // الفئة النشطة (repair, towing, parts_new, parts_used, battery)
  const [activeTab, setActiveTab] = useState('repair'); 
  const [errorMsg, setErrorMsg] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const [geoError, setGeoError] = useState(false);

  const loadingTimerRef = useRef(null);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  // الحصول على الكلمة المفتاحية لخرائط جوجل حسب اللغة والفئة
  const getGoogleMapsQuery = (tab, lang) => {
    const queries = {
      repair: { ar: 'ميكانيكي سيارات', en: 'car repair shop', fr: 'garage automobile' },
      towing: { ar: 'سطحة سحب سيارات', en: 'towing service', fr: 'service de remorquage' },
      parts_new: { ar: 'قطع غيار سيارات جديدة', en: 'new car parts', fr: 'pièces auto neuves' },
      parts_used: { ar: 'قطع غيار سيارات مستعملة', en: 'used car parts', fr: 'pièces auto occasion' },
      battery: { ar: 'بطارية سيارة', en: 'car battery shop', fr: 'batterie voiture' },
    };
    return queries[tab]?.[lang] || queries[tab]?.['en'] || 'car service';
  };

  // فتح خرائط جوجل فوراً بالكلمة المفتاحية المناسبة
  const openGoogleMapsSearch = useCallback(() => {
    const query = getGoogleMapsQuery(activeTab, lang);
    let url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    if (userLocation) {
      url += `/@${userLocation.lat},${userLocation.lon},14z`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [userLocation, activeTab, lang]);

  // جلب الموقع والبحث في OSM
  const fetchNearbyHelp = useCallback(async (type) => {
    setErrorMsg('');
    setShowFallback(false);
    setIsLoading(true);
    setResults([]);

    // مؤقت 6 ثوانٍ كحد أقصى للبحث في OSM
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setErrorMsg(t('searchTimeout') || 'الخادم بطيء. يمكنك استخدام خرائط جوجل مباشرة.');
      setShowFallback(true);
    }, 6000);

    if (!navigator.geolocation) {
      setErrorMsg(t('locationNotSupported') || 'متصفحك لا يدعم تحديد الموقع.');
      setIsLoading(false);
      setGeoError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        setGeoError(false);

        let queryTag = '';
        if (type === 'repair') queryTag = 'nwr["amenity"="car_repair"]';
        else if (type === 'towing') queryTag = '(nwr["service"="towing"];nwr["amenity"="car_repair"]["name"~"دبناج|سطحة|Remorquage|Dépannage|ونش",i];)';
        else if (type === 'parts_new' || type === 'parts_used') queryTag = 'nwr["shop"="car_parts"]';
        else if (type === 'battery') queryTag = '(nwr["shop"="car_parts"]["name"~"بطارية|batterie|battery",i];nwr["amenity"="car_repair"]["name"~"بطارية|batterie|battery",i];)';

        // تقليل النطاق إلى 5000 متر لتسريع الاستجابة
        const query = `[out:json];(${queryTag}(around:5000,${latitude},${longitude}););out center 15;`;

        try {
          let success = false;
          for (const endpoint of OVERPASS_ENDPOINTS) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 ثواني لكل خادم

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
            setErrorMsg(t('noStationsFound') || 'لم نجد نتائج قريبة جداً. جرب خرائط جوجل.');
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
        setGeoError(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [t]);

  useEffect(() => {
    fetchNearbyHelp(activeTab);
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [activeTab, fetchNearbyHelp]);

  // قائمة الخدمات (شبكة)
  const services = [
    { id: 'repair', label: t('serviceRepair') || 'ورشة إصلاح', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'towing', label: t('serviceTowing') || 'سيارة سحب (سطحة)', icon: Truck, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'battery', label: t('serviceBattery') || 'بطارية سيارة', icon: Battery, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { id: 'parts_new', label: t('servicePartsNew') || 'قطع غيار جديدة', icon: Settings, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'parts_used', label: t('servicePartsUsed') || 'قطع غيار مستعملة', icon: Settings, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-4 pb-24 px-4 pt-4 max-w-2xl mx-auto min-h-screen font-sans">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={handleBack} className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95 transition-all shadow-sm">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-extrabold text-[var(--text)] flex items-center gap-2 tracking-tight">
          <span className="p-1.5 bg-red-500/10 text-red-500 rounded-lg"><AlertTriangle size={20} /></span>
          {t('helpCenter') || 'مركز المساعدة'}
        </h1>
      </div>

      <p className="text-xs font-bold text-[var(--text-muted)] text-center mb-2">
        {t('emergencyDesc') || 'اختر نوع المساعدة التي تحتاجها الآن'}
      </p>

      {/* شبكة الخدمات (Emergency Grid) */}
      <div className="grid grid-cols-2 gap-3">
        {services.map(service => {
          const Icon = service.icon;
          const isActive = activeTab === service.id;
          return (
            <button
              key={service.id}
              onClick={() => setActiveTab(service.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 ${
                isActive 
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-md' 
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]'
              }`}
            >
              <div className={`p-3 rounded-full mb-2 ${service.bg} ${service.color}`}>
                <Icon size={24} />
              </div>
              <span className={`text-xs font-bold text-center ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text)]'}`}>
                {service.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* بطاقة البحث السريع (تحل مشكلة الزر المقطوع) */}
      <div className="w-full bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)] rounded-3xl p-5 border border-[var(--border)] shadow-sm relative overflow-hidden mt-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-3">
            <MapPin size={24} className="text-[var(--primary)]" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text)] mb-1">
            {t('searchViaGoogle') || 'بحث سريع عبر جوجل'}
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mb-4">
            {geoError ? 'الموقع غير متاح، لكن يمكنك البحث في محيطك.' : 'اضغط للبحث عن أقرب خدمة في خرائط جوجل فوراً.'}
          </p>
          
          <button 
            onClick={openGoogleMapsSearch}
            className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white px-4 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[var(--primary)]/20 active:scale-[0.98] transition-all"
          >
            <Map size={18} /> 
            <span className="truncate">
              {services.find(s => s.id === activeTab)?.label} {lang === 'ar' ? 'قريب مني' : 'near me'}
            </span>
          </button>
        </div>
      </div>

      {/* حالة التحميل */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={32} className="animate-spin text-[var(--primary)] mb-3" />
          <p className="text-xs font-bold text-[var(--text-muted)] animate-pulse">{t('searchingHelp') || 'جاري البحث في قاعدة البيانات...'}</p>
        </div>
      )}

      {/* حالة الخطأ */}
      {errorMsg && !isLoading && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-5 rounded-3xl text-center animate-fade-in shadow-sm mt-4">
          <AlertTriangle size={32} className="text-orange-500 mx-auto mb-3 opacity-80" />
          <p className="text-xs font-bold text-orange-500 mb-4 leading-relaxed">{errorMsg}</p>
          
          <button onClick={() => fetchNearbyHelp(activeTab)} className="text-[var(--text-muted)] text-xs font-bold hover:text-[var(--text)] transition-colors border border-[var(--border)] px-4 py-2 rounded-lg bg-[var(--surface)]">
            {t('retry') || 'إعادة المحاولة في الخلفية'}
          </button>
        </div>
      )}

      {/* قائمة النتائج */}
      {!isLoading && !errorMsg && results.length > 0 && (
        <div className="space-y-3 animate-fade-in mt-4">
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
              <CheckCircle2 size={14} className="text-green-500" />
              {t('nearbyResults') || 'أقرب الخدمات المكتشفة'} ({results.length})
            </p>
          </div>
          
          {results.map((place, index) => (
            <div key={place.id || index} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-3xl flex items-center justify-between shadow-sm hover:border-[var(--primary)]/40 transition-all active:scale-[0.98]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[var(--text)] text-sm truncate max-w-[150px] leading-tight mb-0.5">{place.name}</p>
                  <p className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-1">
                    <Navigation size={10} className="text-[var(--primary)]" /> {place.distance} {t('km') || 'كم'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 shrink-0">
                {place.phone && (
                  <a href={`tel:${place.phone}`} className="p-2.5 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 active:scale-90 transition-all"><Phone size={16} /></a>
                )}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500/20 active:scale-90 transition-all"><Navigation size={16} /></a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ملاحظة أمان */}
      <div className="flex items-start gap-2 bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)] mt-6">
        <ShieldAlert size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          في حالات الطوارئ القصوى، يرجى الاتصال بالسلطات المحلية أو خدمات الطوارئ الرسمية في بلدك أولاً.
        </p>
      </div>

    </div>
  );
}
