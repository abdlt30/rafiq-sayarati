import { useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppContext } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import localforage from 'localforage';
import { 
  Moon, Sun, Globe, ArrowRight, ArrowLeft, ChevronDown, ChevronUp, 
  ShieldCheck, Database, BellRing, CheckCircle, XCircle, 
  Download, Upload, AlertCircle, Info, Trash2, X, Loader2
} from 'lucide-react';

import CurrencySelector from '../shared/components/ui/CustomSelect.jsx';
import { pushService } from '../services/pushService.js';

const APP_VERSION = '1.0.0';
const BACKUP_VERSION = 2;

const db = localforage.createInstance({ name: 'RafiqSayaratiDB', storeName: 'appData' });

const LOCAL_STORAGE_KEYS = {
  vehicles: 'vehicles',
  savedCar: 'savedCar',
  user_name: 'user_name',
  theme: 'theme',
  lang: 'lang',
  currency: 'currency',
  notificationsEnabled: 'notificationsEnabled',
};

const INDEXED_DB_KEYS = [
  'fuel_records', 'expenses_records', 'maintenance_records', 
  'documents_records', 'reminders_records', 'income_records', 'custom_maintenance_types'
];

const safeBoolFromStorage = (key, fallback = true) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    return typeof parsed === 'boolean' ? parsed : fallback;
  } catch { return fallback; }
};

const readPushPermission = () => {
  try {
    if (typeof Notification === 'undefined') return 'unsupported';
    return Notification.permission || 'default';
  } catch { return 'default'; }
};

export default function Settings() {
  const { theme, toggleTheme, lang, changeLang, currency, setCurrency, t, bumpDataVersion } = useContext(AppContext);
  const navigate = useNavigate();

  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => safeBoolFromStorage('notificationsEnabled', true));
  const [pushPermission, setPushPermission] = useState(readPushPermission);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [importConfirm, setImportConfirm] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [lastBackup, setLastBackup] = useState(() => {
    try { return localStorage.getItem('lastBackupDate') || null; } catch { return null; }
  });

  const toastTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ===================== Toast ===================== */
  const showToast = useCallback((message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  }, []);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
    } catch (e) { console.error('Save failed:', e); }
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

  /* ===================== Push Permission ===================== */
  const handleEnablePush = async () => {
    try {
      if (!pushService || typeof pushService.requestPermission !== 'function') {
        showToast(t('pushUnavailable') || 'الإشعارات غير مدعومة', 'error');
        return;
      }
      const granted = await pushService.requestPermission();
      setPushPermission(readPushPermission());
      if (granted) {
        setNotificationsEnabled(true);
        showToast(t('pushEnabled') || 'تم تفعيل الإشعارات', 'success');
      } else {
        showToast(t('pushDenied') || 'تم رفض الإشعارات', 'error');
      }
    } catch (err) {
      showToast(t('pushError') || 'حدث خطأ', 'error');
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  /* ===================== Export (Async Backup) ===================== */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backupData = { localStorage: {}, indexedDB: {} };

      Object.entries(LOCAL_STORAGE_KEYS).forEach(([key, storageKey]) => {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw !== null) {
            backupData.localStorage[key] = (key === 'vehicles' || key === 'savedCar') ? JSON.parse(raw) : raw;
          }
        } catch {}
      });

      for (const key of INDEXED_DB_KEYS) {
        const data = await db.getItem(key);
        if (data) backupData.indexedDB[key] = data;
      }

      const backup = {
        appVersion: APP_VERSION,
        backupVersion: BACKUP_VERSION,
        exportDate: new Date().toISOString(),
        data: backupData,
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
      showToast(t('exportSuccess') || 'تم التصدير بنجاح', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast(t('errorExport') || 'فشل التصدير', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /* ===================== Import (Async Restore) ===================== */
  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast(t('importError') || 'الملف كبير جداً', 'error');
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || !parsed.data || !parsed.data.localStorage || !parsed.data.indexedDB) {
          return showToast(t('importVersionMismatch') || 'ملف غير متوافق', 'error');
        }
        setImportConfirm({ fileName: file.name, parsed });
      } catch (err) {
        showToast(t('importError') || 'ملف تالف', 'error');
      } finally {
        e.target.value = null;
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!importConfirm) return;
    setIsImporting(true);
    try {
      const { localStorage: lsData, indexedDB: idbData } = importConfirm.parsed.data;

      Object.entries(lsData).forEach(([key, value]) => {
        const storageKey = LOCAL_STORAGE_KEYS[key];
        if (storageKey) {
          if (typeof value === 'object') localStorage.setItem(storageKey, JSON.stringify(value));
          else localStorage.setItem(storageKey, value);
        }
      });

      for (const [key, value] of Object.entries(idbData)) {
        if (INDEXED_DB_KEYS.includes(key)) {
          await db.setItem(key, value);
        }
      }

      bumpDataVersion?.();
      showToast(t('importSuccess') || 'تمت الاستعادة بنجاح!', 'success');
      
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload(); 
      }, 1500);
    } catch (err) {
      console.error('Import failed:', err);
      showToast(t('importError') || 'فشل الاستيراد', 'error');
      setIsImporting(false);
      setImportConfirm(null);
    }
  };

  /* ===================== Reset (Danger Zone) ===================== */
  const handleResetAll = async () => {
    setIsResetting(true);
    try {
      Object.values(LOCAL_STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('lastBackupDate');
      await db.clear();

      showToast(t('resetSuccess') || 'تم مسح البيانات', 'success');
      setTimeout(() => {
        navigate('/', { replace: true });
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Reset failed:', err);
      showToast(t('errorSaving') || 'حدث خطأ أثناء المسح', 'error');
      setIsResetting(false);
      setResetConfirm(false);
    }
  };

  /* ===================== Date Display ===================== */
  const lastBackupDisplay = useMemo(() => {
    if (!lastBackup) return t('never') || 'أبداً';
    try {
      const d = new Date(lastBackup);
      if (isNaN(d.getTime())) return t('never') || 'أبداً';
      const localeMap = { ar: 'ar-MA', en: 'en-US', fr: 'fr-FR' };
      return d.toLocaleDateString(localeMap[lang] || 'ar-MA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return t('never') || 'أبداً'; }
  }, [lastBackup, lang, t]);

  return (
    <div className="space-y-3 pb-24 px-4 pt-2">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          <button type="button" onClick={() => setToast({ show: false, message: '', type: 'success' })} className="ml-2 opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-50">
        <button type="button" onClick={handleBack} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
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
        <button type="button" onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}>
          <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${theme === 'dark' ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`} />
        </button>
      </div>

      {/* 2. التفضيلات */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <button type="button" onClick={() => setIsPrefsOpen(!isPrefsOpen)} className="w-full p-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--primary)]"><Globe size={18} /></div>
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
              <label className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block flex items-center gap-1.5"><Globe size={12} /> {t('language') || 'اللغة'}</label>
              <div className="flex gap-1.5 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                {['ar', 'en', 'fr'].map(l => (
                  <button key={l} type="button" onClick={() => changeLang(l)} className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${lang === l ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                    {l === 'ar' ? 'العربية' : l === 'en' ? 'English' : 'Français'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-[var(--text-muted)] mb-2 block flex items-center gap-1.5"><span className="text-sm font-bold">$</span> {t('currency') || 'العملة'}</label>
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
              <span className="text-[10px] text-[var(--text-muted)]">{t('notificationsSubtitle') || 'تنبيهات تظهر على شاشة هاتفك'}</span>
            </div>
          </div>
          <button type="button" onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${notificationsEnabled ? 'bg-[var(--primary)]' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute shadow-sm transition-transform duration-300 ${notificationsEnabled ? (lang === 'ar' ? 'right-1' : 'left-1') : (lang === 'ar' ? 'left-1' : 'right-1')}`} />
          </button>
        </div>

        <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center text-xs">
          <span className="text-[var(--text-muted)]">{t('browserPermission') || 'حالة الإذن من المتصفح:'}</span>
          {pushPermission === 'granted' && <span className="flex items-center gap-1 text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-md"><CheckCircle size={14} /> {t('granted') || 'مفعّل'}</span>}
          {pushPermission === 'default' && <button type="button" onClick={handleEnablePush} className="bg-[var(--primary)] text-white font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-600 transition-colors">{t('requestPermission') || 'طلب الإذن'}</button>}
          {pushPermission === 'denied' && <span className="flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-md"><XCircle size={14} /> {t('denied') || 'مرفوض'}</span>}
          {pushPermission === 'unsupported' && <span className="flex items-center gap-1 text-slate-500 font-bold bg-slate-500/10 px-2 py-1 rounded-md"><Info size={14} /> {t('unsupported') || 'غير مدعوم'}</span>}
        </div>
      </div>

      {/* 4. النسخ الاحتياطي */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-3">
          <Database size={18} className="text-[var(--primary)]" />
          <h2 className="font-bold text-sm text-[var(--text)]">{t('backupAndExport') || 'النسخ الاحتياطي والتصدير'}</h2>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{t('backupDesc') || 'بياناتك محفوظة على هاتفك فقط. قم بتصديرها كملف احتياطي لضمان عدم ضياعها.'}</p>

        <div className="text-[11px] text-[var(--text-muted)] mb-3 flex justify-between items-center">
          <span>{t('lastBackup') || 'آخر نسخة احتياطية:'}</span>
          <span className="font-bold text-[var(--text)]">{lastBackupDisplay}</span>
        </div>

        <div className="space-y-2">
          <button 
            type="button" 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full bg-[var(--primary)] text-white font-bold py-3 rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
            {isExporting ? (t('exporting') || 'جاري التصدير...') : (t('exportDataBtn') || 'تصدير البيانات')}
          </button>

          <button 
            type="button" 
            onClick={handleImportClick} 
            disabled={isImporting}
            className="w-full bg-[var(--surface-2)] text-[var(--text)] font-bold py-3 rounded-xl hover:bg-[var(--surface)] border border-[var(--border)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload size={16} /> {t('importDataBtn') || 'استيراد البيانات'}
          </button>

          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        </div>
      </div>

      {/* 5. الخصوصية */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 mb-2.5">
          <ShieldCheck size={18} className="text-green-500" />
          <h2 className="font-bold text-sm text-[var(--text)]">{t('privacyAndSecurity') || 'الخصوصية والأمان'}</h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">{t('privacyText') || 'جميع بياناتك محفوظة على هاتفك فقط. نحن لا نجمع أي بيانات شخصية.'}</p>
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
          disabled={isResetting}
          className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isResetting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} 
          {isResetting ? (t('resetting') || 'جاري المسح...') : (t('resetApp') || 'مسح جميع البيانات')}
        </button>
      </div>

      {/* Modals */}
      {importConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-[var(--border)] shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-3 text-[var(--text)]">{t('confirmImport') || 'تأكيد الاستيراد'}</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4 text-center">{importConfirm.fileName}</p>
            <p className="text-xs text-red-500 mb-4 text-center font-bold">{t('importWarning') || 'تحذير: سيتم استبدال جميع البيانات الحالية!'}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setImportConfirm(null)} disabled={isImporting} className="flex-1 bg-[var(--surface-2)] text-[var(--text)] font-bold py-3 rounded-xl disabled:opacity-50">{t('cancel') || 'إلغاء'}</button>
              <button type="button" onClick={handleConfirmImport} disabled={isImporting} className="flex-1 bg-[var(--primary)] text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : (t('confirm') || 'تأكيد')}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--surface)] p-5 rounded-3xl w-full max-w-md border border-red-500/30 shadow-2xl">
            <h3 className="text-lg font-bold text-center mb-3 text-red-500">{t('confirmReset') || 'هل أنت متأكد؟'}</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4 text-center">{t('resetWarning') || 'سيتم حذف جميع السيارات والسجلات نهائياً. لا يمكن التراجع.'}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setResetConfirm(false)} disabled={isResetting} className="flex-1 bg-[var(--surface-2)] text-[var(--text)] font-bold py-3 rounded-xl disabled:opacity-50">{t('cancel') || 'إلغاء'}</button>
              <button type="button" onClick={handleResetAll} disabled={isResetting} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50">
                {isResetting ? <Loader2 size={16} className="animate-spin" /> : (t('confirmDeleteBtn') || 'حذف')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
