import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Navigation, AlertCircle, Loader, Fuel, RefreshCw } from 'lucide-react';
import { AppContext } from '../context/AppContext';

/* =========================================================
   ✅ إعدادات الأيقونات (Leaflet)
   ========================================================= */
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const stationIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #f97316; width: 30px; height: 30px; border-radius: 50%; display: flex; justify-content: center; align-items: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="15" y2="22"></line><line x1="4" y1="9" x2="14" y2="9"></line><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"></path><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"></path></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

/* ✅ ثوابت */
const SEARCH_RADIUS_M = 5000;
const GEOLOCATION_TIMEOUT = 15000;
const FETCH_TIMEOUT = 20000;
const DEBOUNCE_MS = 5000;
const CACHE_TTL_MS = 5 * 60 * 1000;

/* ✅ طلب fetch مع timeout */
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

export default function FuelStations() {
  const { t, lang } = useContext(AppContext);

  const [position, setPosition] = useState(null);
  const [stations, setStations] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState(null);

  const isMountedRef = useRef(true);
  const lastFetchRef = useRef(0);
  const cacheRef = useRef({ timestamp: 0, position: null, stations: [] });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /* ===================== 1. جلب الموقع ===================== */
  const getLocation = useCallback(() => {
    setLoadingLocation(true);
    setError(null);
    setEmptyMessage(null);

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setError(t('geolocationInsecure'));
      setLoadingLocation(false);
      return;
    }

    if (!navigator.geolocation) {
      setError(t('locationNotSupported'));
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMountedRef.current) return;
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLoadingLocation(false);
      },
      (err) => {
        if (!isMountedRef.current) return;
        setLoadingLocation(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(t('locationDenied'));
            break;
          case err.POSITION_UNAVAILABLE:
            setError(t('locationUnavailable'));
            break;
          case err.TIMEOUT:
            setError(t('locationTimeout'));
            break;
          default:
            setError(t('locationError'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT,
        maximumAge: 60000,
      }
    );
  }, [t]);

  /* ===================== 2. جلب المحطات ===================== */
  const fetchStations = useCallback(async (lat, lon, { force = false } = {}) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < DEBOUNCE_MS) {
      return;
    }

    const cache = cacheRef.current;
    const samePosition =
      cache.position &&
      Math.abs(cache.position[0] - lat) < 0.0001 &&
      Math.abs(cache.position[1] - lon) < 0.0001;
    if (!force && samePosition && now - cache.timestamp < CACHE_TTL_MS) {
      setStations(cache.stations);
      return;
    }

    lastFetchRef.current = now;
    setLoadingStations(true);
    setError(null);
    setEmptyMessage(null);
    setStations([]);

    const query = `
      [out:json][timeout:15];
      node["amenity"="fuel"](around:${SEARCH_RADIUS_M},${lat},${lon});
      out 30;
    `;

    try {
      const response = await fetchWithTimeout(
        'https://overpass-api.de/api/interpreter',
        { method: 'POST', body: query },
        FETCH_TIMEOUT
      );

      if (!response.ok) {
        throw new Error(`overpass_${response.status}`);
      }

      const data = await response.json();
      if (!isMountedRef.current) return;

      const foundStations = (data.elements || []).map(el => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || el.tags?.brand || t('fuelStation'),
        address: el.tags?.['addr:street'] || el.tags?.['addr:city'] || t('addressUnavailable'),
      }));

      cacheRef.current = {
        timestamp: now,
        position: [lat, lon],
        stations: foundStations,
      };

      setStations(foundStations);

      if (foundStations.length === 0) {
        setEmptyMessage(t('noStationsFound'));
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Overpass fetch failed:', err);

      if (err.name === 'AbortError') {
        setError(t('searchTimeout'));
      } else if (String(err).includes('429')) {
        setError(t('searchBusy'));
      } else if (String(err).includes('504')) {
        setError(t('searchSlow'));
      } else {
        setError(t('searchFailed'));
      }
    } finally {
      if (isMountedRef.current) setLoadingStations(false);
    }
  }, [t]);

  /* ===================== 3. التهيئة ===================== */
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (position) {
      fetchStations(position[0], position[1]);
    }
  }, [position, fetchStations]);

  const handleRefresh = () => {
    if (position) {
      fetchStations(position[0], position[1], { force: true });
    } else {
      getLocation();
    }
  };

  /* ===================== 4. Render ===================== */
  return (
    <div className="space-y-4 pb-24 px-4 pt-4">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('nearbyStations')}</h1>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loadingLocation || loadingStations}
          aria-label={t('refreshSearch')}
          className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loadingStations ? 'animate-spin' : ''} aria-hidden="true" />
        </button>
      </div>

      {/* حالة التحميل */}
      {(loadingLocation || loadingStations) && (
        <div 
          className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)] space-y-3"
          aria-live="polite"
          role="status"
        >
          <Loader className="animate-spin text-[var(--primary)]" size={32} aria-hidden="true" />
          <p className="text-sm font-bold">
            {loadingLocation ? t('locating') : t('searchingStations')}
          </p>
        </div>
      )}

      {/* حالة الخطأ */}
      {error && !loadingLocation && !loadingStations && (
        <div 
          className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl flex flex-col items-center text-center space-y-4"
          role="alert"
        >
          <AlertCircle className="text-red-500" size={48} aria-hidden="true" />
          <p className="text-red-500 font-bold text-sm">{error}</p>
          <button
            type="button"
            onClick={handleRefresh}
            className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
          >
            {t('retry')}
          </button>
        </div>
      )}

      {/* حالة فارغة */}
      {emptyMessage && !loadingLocation && !loadingStations && !error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
          <Fuel className="text-yellow-500" size={40} aria-hidden="true" />
          <p className="text-yellow-500 font-bold text-sm">{emptyMessage}</p>
        </div>
      )}

      {/* الخريطة */}
      {!loadingLocation && !loadingStations && position && !error && !emptyMessage && (
        <div className="space-y-4">
          <div 
            className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-lg relative z-0"
            aria-label={t('mapView')}
            role="region"
          >
            <MapContainer
              center={position}
              zoom={14}
              style={{ height: '450px', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={position}>
                <Popup>{t('yourLocation')}</Popup>
              </Marker>

              {stations.map(station => (
                <Marker key={station.id} position={[station.lat, station.lon]} icon={stationIcon}>
                  <Popup>
                    <div className="text-center font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                      <strong className="text-orange-600 block text-sm mb-1">{station.name}</strong>
                      <span className="text-xs text-gray-600">{station.address}</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Fuel size={18} className="text-orange-500" aria-hidden="true" />
              <span className="text-sm font-bold">
                {stations.length > 0
                  ? `${t('stationsFound')} ${stations.length} ${t('nearbyStationsCount')}`
                  : t('noStationsNearby')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-xs text-[var(--primary)] font-bold bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              {t('refreshSearch')}
            </button>
          </div>
        </div>
      )}
      
      <p className="text-center text-[10px] text-[var(--text-muted)] mt-2 flex items-center justify-center gap-1">
        <Navigation size={10} aria-hidden="true" />
        {t('osmCredit')}
      </p>
    </div>
  );
}
