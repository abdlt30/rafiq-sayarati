import { useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Moon, Sun, Globe, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, 
  ShieldCheck, Database, BellRing, CheckCircle, XCircle, 
  Download, Upload, AlertCircle, Info, Trash2, X // ✅ إضافة أيقونة X
} from 'lucide-react';
import CurrencySelector from '../components/ui/CustomSelect'; 
import { pushService } from '../services/pushService';

const APP_VERSION = '1.0.0';
const BACKUP_VERSION = 1;

const BACKUP_KEYS = {
  vehicles: 'vehicles',
  savedCar: 'savedCar',
  fuel: 'fuel_records',
  expenses: 'expenses_records',
  maintenance: 'maintenance_records',
  documents: 'documents_records',
  reminders: 'reminders_records',
  incomes: 'income_records',
  customTypes: 'custom_maintenance_types',
  user_name: 'user_name',
  theme: 'theme',
  lang: 'lang',
  currency: 'currency',
  notificationsEnabled: 'notificationsEnabled',
};

const ARRAY_KEYS = ['vehicles', 'fuel', 'expenses', 'maintenance', 'documents', 'reminders', 'incomes', 'customTypes'];

const safeBoolFromStorage = (key, fallback = true) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'boolean' ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const readPushPermission = () => {
  try {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission || 'default';
  } catch {
    return 'default';
  }
};

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t, bumpDataVersion } = useContext(AppContext);
  const navigate = useNavigate();

  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    safeBoolFromStorage('notificationsEnabled', true)
  );
  const [pushPermission, setPushPermission] = useState(readPushPermission);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [importConfirm, setImportConfirm] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [lastBackup, setLastBackup] = useState(() => {
    try { return localStorage.getItem('lastBackupDate') || null; } catch { return null; }
  });

  const toastTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  }, []);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    } catch (e) {
      console.error('Save notificationsEnabled failed:', e);
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    const refresh = () => {
      const current = readPushPermission();
      setPushPermission(prev => (prev === current ? prev : current));
    };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    refresh();
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const handleEnablePush = async () => {
    try {
      if (!pushService || typeof pushService.requestPermission !== 'function') {
        showToast(t('pushUnavailable') || 'خدمة الإشعارات غير متاحة على هذا الجهاز.', 'error');
        return;
      }
      const granted = await pushService.requestPermission();
      setPushPermission(readPushPermission());

      if (granted) {
        setNotificationsEnabled(true);
        showToast(t('pushEnabled') || 'تم تفعيل الإشعارات بنجاح!', 'success');
      } else {
        showToast(t('pushDenied') || 'تم رفض الإشعارات. فعّلها من إعدادات المتصفح.', 'error');
      }
    } catch (err) {
      console.error('Push permission failed:', err);
      showToast(t('pushError') || 'تعذر طلب إذن الإشعارات.', 'error');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  const handleExport = () => {
    try {
      const data = {};
      Object.entries(BACKUP_KEYS).forEach(([key, storageKey]) => {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw === null) return;
          if (ARRAY_KEYS.includes(key)) {
            const parsed = JSON.parse(raw);
            data[key] = Array.isArray(parsed) ? parsed : [];
          } else if (key === 'savedCar') {
            data[key] = raw ? JSON.parse(raw) : null;
          } else if (key === 'notificationsEnabled') {
            data[key] = safeBoolFromStorage(storageKey, true);
          } else {
            data[key] = raw;
          }
        } catch {
          data[key] = ARRAY_KEYS.includes(key) ? [] : null;
        }
      });

      const backup = {
        appVersion: APP_VERSION,
        backupVersion: BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        data,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `rafiq-sayarati-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      localStorage.setItem('lastBackupDate', now);
      setLastBackup(now);
      showToast(t('exportSuccess') || 'تم تصدير البيانات بنجاح!', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast(t('errorExport') || 'حدث خطأ أثناء التصدير.', 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast(t('importError') || 'الملف كبير جداً أو تالف.', 'error');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showToast(t('importError') || 'تعذر قراءة الملف.', 'error');
      e.target.value = null;
    };
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);

        if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
          showToast(t('importError') || 'ملف غير صالح.', 'error');
          return;
        }
        if (parsed.backupVersion !== BACKUP_VERSION) {
          showToast(t('importVersionMismatch') || 'إصدار النسخة غير متوافق.', 'error');
          return;
        }

        setImportConfirm({ fileName: file.name, parsed });
      } catch (err) {
        showToast(t('importError') || 'ملف تالف أو غير صالح.', 'error');
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importConfirm) return;
    try {
      const { data } = importConfirm.parsed;

      // ✅ إصلاح أمني: التحقق من نوع البيانات قبل الحفظ
      Object.entries(BACKUP_KEYS).forEach(([key, storageKey]) => {
        if (!(key in data)) return;
        const value = data[key];

        if (ARRAY_KEYS.includes(key)) {
          if (Array.isArray(value)) localStorage.setItem(storageKey, JSON.stringify(value));
        } else if (key === 'savedCar') {
          if (value === null) localStorage.removeItem(storageKey);
          else if (typeof value === 'object') localStorage.setItem(storageKey, JSON.stringify(value));
        } else if (key === 'notificationsEnabled') {
          if (typeof value === 'boolean') localStorage.setItem(storageKey, JSON.stringify(value));
        } else if (typeof value === 'string') {
          localStorage.setItem(storageKey, value);
        }
      });

      bumpDataVersion?.();
      showToast(t('importSuccess') || 'تم الاستيراد! سيتم إعادة التشغيل.', 'success');
      
      // ✅ إعادة تحميل آمنة (Soft Reload)
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload(); // مطلوب فقط لتحديث state الـ Context
      }, 1500);
    } catch (err) {
      console.error('Import failed:', err);
      showToast(t('importError') || 'تعذر الاستيراد.', 'error');
    } finally {
      setImportConfirm(null);
    }
  };

  const handleResetAll = () => {
    try {
      Object.values(BACKUP_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('lastBackupDate');
      showToast(t('resetSuccess') || 'تم مسح جميع البيانات.', 'success');
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Reset failed:', err);
      showToast(t('errorSaving') || 'تعذر المسح.', 'error');
    } finally {
      setResetConfirm(false);
    }
  };

  const lastBackupDisplay = useMemo(() => {
    if (!lastBackup) return t('never') || 'أبداً';
    try {
      const d = new Date(lastBackup);
      if (isNaN(d.getTime())) return t('never') || 'أبداً';
      const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
      return d.toLocaleDateString(localeMap[lang] || 'ar-MA', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return t('never') || 'أبداً'; }
  }, [lastBackup, lang, t]);

  return (
    <div className="space-y-3 pb-24 px-4 pt-2">

      {/* ✅ إصلاح: استخدام أيقونة X بدلاً من × */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button 
            type="button"
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
            aria-label="إغلاق"
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-50">
        <button 
          type="button"
          onClick={handleBack}
          aria-label={t('back') || 'رجوع'}
          className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
        >
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('settings') || 'الإعدادات'}</h1>
      </div>
      
      {/* 1. المظهر */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </div>
          <span className="font-bold text-sm text-[var(--text)]">
            {theme === 'dark' ? (t('darkMode') || 'الوضع الداكن') : (t('lightMode') || 'الوضع الفاتح')}
          </span>
        </div>
        <button 
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label={t('toggleTheme') || 'تبديل المظهر'}
          className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${theme === 'dark' ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`} />
        </button>
      </div>

      {/* 2. التفضيلات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <button 
          type="button"
          onClick={() => setIsPrefsOpen(!isPrefsOpen)}
          aria-expanded={isPrefsOpen}
          className="w-full p-3.5 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
              <Globe size={18} />
            </div>
            <div className="text-start">
              <span className="font-bold text-sm text-[var(--text)] block">{t('preferences') || 'التفضيلات الإقليمية'}</span>
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-mono tracking-wider">{lang.toUpperCase()} • {currency}</span>
            </div>
          </div>
          {isPrefsOpen ? <ChevronUp size={18} className="text-[var(--text-muted)]" /> : <ChevronDown size={18} className="text-[var(--text-muted)]" />}
        </button>

        {isPrefsOpen && (
          <div className="p-3.5 border-t border-[var(--border)] space-y-5 bg-[var(--surface-2)]/30">
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block flex items-center gap-1.5">
                <Globe size={12} /> {t('language') || 'لغة التطبيق'}
              </label>
              <div className="flex gap-1.5 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                <button type="button" onClick={() => changeLang('ar')} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === 'ar' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>العربية</button>
                <button type="button" onClick={() => changeLang('en')} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === 'en' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>English</button>
                <button type="button" onClick={() => changeLang('fr')} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === 'fr' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>Français</button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block flex items-center gap-1.5">
                <span className="text-sm font-bold">$</span> {t('currency') || 'عملة التطبيق'}
              </label>
              <CurrencySelector currentCurrency={currency} onSelect={setCurrency} />
            </div>
          </div>
        )}
      </div>

      {/* 3. الإشعارات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><BellRing size={18} /></div>
            <div>
              <span className="font-bold text-sm text-[var(--text)] block">{t('externalNotifications') || 'الإشعارات الخارجية'}</span>
              <span className="text-[10px] text-[var(--text-muted)]">
                {t('notificationsSubtitle') || 'تنبيهات تظهر على شاشة هاتفك'}
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label={t('externalNotifications') || 'الإشعارات الخارجية'}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${notificationsEnabled ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${notificationsEnabled ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`} />
          </button>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
          <span className="text-[var(--text-muted)]">
            {t('browserPermission') || 'حالة الإذن من المتصفح:'}
          </span>

          {pushPermission === 'granted' && (
            <span className="flex items-center gap-1 text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-md">
              <CheckCircle size={14} /> {t('granted') || 'مفعّل'}
            </span>
          )}
          {pushPermission === 'default' && (
            <button 
              type="button"
              onClick={handleEnablePush}
              className="bg-[var(--primary)] text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
            >
              {t('requestPermission') || 'طلب الإذن'}
            </button>
          )}
          {pushPermission === 'denied' && (
            <span className="flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-md">
              <XCircle size={14} /> {t('denied') || 'مرفوض'}
            </span>
          )}
          {pushPermission === 'unsupported' && (
            <span className="flex items-center gap-1 text-slate-500 font-bold bg-slate-500/10 px-2 py-1 rounded-md">
              <Info size={14} /> {t('unsupported') || 'غير مدعوم'}
            </span>
          )}
        </div>
        {pushPermission === 'denied' && (
          <p className="text-[10px] text-red-400 mt-1">
            {t('enableFromBrowser') || 'يرجى تفعيل الإشعارات من إعدادات المتصفح.'}
          </p>
        )}
      </div>

      {/* 4. النسخ الاحتياطي */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <Database size={18} className="text-[var(--primary)]" />
          <h2 className="font-bold text-sm text-[var(--text)]">
            {t('backupAndExport') || 'النسخ الاحتياطي والتصدير'}
          </h2>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
          {t('backupDesc') || 'بياناتك محفوظة على هاتفك فقط. صدّرها كملف احتياطي لضمان عدم ضياعها.'}
        </p>

        <div className="text-[11px] text-[var(--text-muted)] mb-3 flex justify-between items-center">
          <span>{t('lastBackup') || 'آخر نسخة احتياطية:'}</span>
          <span className="font-bold text-[var(--text)]">{lastBackupDisplay}</span>
        </div>

        <div className="space-y-2">
          <button 
            type="button"
            onClick={handleExport}
            className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Download size={16} /> {t('exportDataBtn') || 'تصدير البيانات'}
          </button>

          <button 
            type="button"
            onClick={handleImportClick}
            className="w-full bg-[var(--surface-2)] text-[var(--text)] font-bold py-3 rounded-xl hover:bg-[var(--surface)] border border-[var(--border)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Upload size={16} /> {t('importDataBtn') || 'استيراد البيانات'}
          </button>

          <input 
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* 5. الخصوصية */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2.5">
          <ShieldCheck size={18} className="text-green-500" />
          <h2 className="font-bold text-sm text-[var(--text)]">{t('privacyAndSecurity') || 'الخصوصية والأمان'}</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
          {t('privacyText') || 'جميع بياناتك محفوظة على هاتفك فقط. نحن لا نجمع أي بيانات شخصية ولا نرسلها لأي خادم خارجي.'}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><Database size={12} /> {t('version') || 'الإصدار'}</span>
          <span className="font-mono bg-[var(--surface-2)] px-2 py-0.5 rounded-md">v{APP_VERSION}</span>
        </div>
      </div>

      {/* 6. منطقة الخطر */}
      <div className="bg-[var(--surface)] border border-red-500/20 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2.5">
          <AlertCircle size={18} className="text-red-500" />
          <h2 className="font-bold text-sm text-red-500">{t('dangerZone') || 'منطقة الخطر'}</h2>
        </div>
        <button 
          type="button"
          onClick={() => setResetConfirm(true)}
          className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={16} /> {t('resetApp') || 'مسح جميع البيانات'}
        </button>
      </div>

      {/* Modals (Import & Reset) */}
      {importConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-3 text-[var(--text)]">
              {t('confirmImport') || 'تحذير: سيتم استبدال جميع بياناتك.'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4 text-center">
              {importConfirm.fileName}
            </p>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setImportConfirm(null)}
                className="flex-1 bg-[var(--surface-2)] text-[var(--text)] font-bold py-3 rounded-xl"
              >
                {t('cancel') || 'إلغاء'}
              </button>
              <button 
                type="button"
                onClick={handleConfirmImport}
                className="flex-1 bg-[var(--primary)] text-white font-bold py-3 rounded-xl"
              >
                {t('confirm') || 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-red-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-3 text-red-500">
              {t('confirmReset') || 'هل أنت متأكد؟'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4 text-center">
              {t('resetWarning') || 'سيتم حذف جميع السيارات والسجلات نهائياً. لا يمكن التراجع.'}
            </p>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setResetConfirm(false)}
                className="flex-1 bg-[var(--surface-2)] text-[var(--text)] font-bold py-3 rounded-xl"
              >
                {t('cancel') || 'إلغاء'}
              </button>
              <button 
                type="button"
                onClick={handleResetAll}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl"
              >
                {t('confirmDeleteBtn') || 'مسح'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
