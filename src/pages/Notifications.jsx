import { useContext, useMemo, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext.jsx'; // ✅ إضافة .jsx
import { notificationService } from '../services/notificationService.js'; // ✅ إضافة .js
import { AlertTriangle, Info, Trash2, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import ConfirmModal from '../shared/components/ui/ConfirmModal.jsx'; // ✅ إضافة .jsx

const READ_IDS_KEY = 'read_notifications';
const DISMISSED_IDS_KEY = 'dismissed_notifications';
const MAX_TRACKED_IDS = 200;

/* ✅ دالة مساعدة خارجية (تحسين أداء) */
const getStyle = (severity) => {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', icon: AlertTriangle };
    case 'warning':
      return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', icon: ShieldAlert };
    case 'success':
      return { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-500', icon: Sparkles };
    default:
      return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', icon: Info };
  }
};

const safeIdsFromStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => typeof x === 'string');
  } catch (e) {
    console.error(`read ${key} failed:`, e);
    return [];
  }
};

const saveIds = (key, ids) => {
  try {
    const unique = [...new Set(ids)].slice(-MAX_TRACKED_IDS);
    localStorage.setItem(key, JSON.stringify(unique));
    return unique;
  } catch (e) {
    console.error(`save ${key} failed:`, e);
    return [...new Set(ids)];
  }
};

export default function Notifications() {
  const { currentCar, t, lang, dataVersion } = useContext(AppContext);
  const [showClearModal, setShowClearModal] = useState(false);
  const [readIds, setReadIds] = useState(() => safeIdsFromStorage(READ_IDS_KEY));
  const [dismissedIds, setDismissedIds] = useState(() => safeIdsFromStorage(DISMISSED_IDS_KEY));

  /* ✅ استخدام Set للبحث السريع O(1) */
  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const dismissedSet = useMemo(() => new Set(dismissedIds), [dismissedIds]);

  const notifications = useMemo(() => {
    if (!currentCar) return [];
    try {
      const alerts = notificationService.generateSmartAlerts(currentCar, t, lang);
      return Array.isArray(alerts) ? alerts : [];
    } catch (e) {
      console.error('generateSmartAlerts failed:', e);
      return [];
    }
  }, [currentCar, t, lang, dataVersion]);

  const visibleNotifications = useMemo(() => {
    if (dismissedIds.length === 0) return notifications;
    return notifications.filter(n => !dismissedSet.has(n.id));
  }, [notifications, dismissedSet, dismissedIds.length]);

  const unreadCount = useMemo(() => {
    return visibleNotifications.filter(n => !readSet.has(n.id)).length;
  }, [visibleNotifications, readSet]);

  /* ===================== الإجراءات ===================== */
  const markAsRead = useCallback((id) => {
    if (!id || readSet.has(id)) return;
    setReadIds(prev => saveIds(READ_IDS_KEY, [...prev, id]));
  }, [readSet]);

  const markAllRead = useCallback(() => {
    if (visibleNotifications.length === 0) return;
    const allIds = visibleNotifications.map(n => n.id);
    setReadIds(prev => saveIds(READ_IDS_KEY, [...prev, ...allIds]));
  }, [visibleNotifications]);

  const handleClearAllConfirm = useCallback(() => {
    if (notifications.length === 0) {
      setShowClearModal(false);
      return;
    }
    const allIds = notifications.map(n => n.id);
    setDismissedIds(prev => saveIds(DISMISSED_IDS_KEY, [...prev, ...allIds]));
    setShowClearModal(false);
  }, [notifications]);

  return (
    <div className="space-y-4 pb-24 px-4 min-h-screen">
      
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {t('notifications') || 'مركز التنبيهات'}
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {unreadCount > 0 
              ? `${unreadCount} ${t('unread') || 'جديد'}`
              : (t('allUnderControl') || 'كل شيء تحت السيطرة')}
          </p>
        </div>
        <div className="flex gap-2">
          {visibleNotifications.length > 0 && (
            <>
              <button 
                type="button"
                onClick={markAllRead} 
                aria-label={t('markAllRead') || 'تحديد الكل كمقروء'}
                title={t('markAllRead') || 'تحديد الكل كمقروء'}
                disabled={unreadCount === 0}
                className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-green-500 disabled:opacity-50 disabled:hover:text-[var(--text-muted)] transition-colors"
              >
                <Check size={18} aria-hidden="true" />
              </button>
              <button 
                type="button"
                onClick={() => setShowClearModal(true)} 
                aria-label={t('clearAll') || 'مسح الكل'}
                title={t('clearAll') || 'مسح الكل'}
                className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* قائمة التنبيهات */}
      {visibleNotifications.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-24 flex flex-col items-center animate-fade-in">
          <div className="relative w-24 h-24 flex items-center justify-center mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-50"></div>
            <div className="relative w-20 h-20 bg-[var(--surface-2)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <ShieldAlert size={40} className="text-green-500" aria-hidden="true" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--text)] mb-2">
            {t('allSafe') || 'سيارتك في أمان تام'}
          </h3>
          <p className="text-sm max-w-xs">
            {t('noNotifications') || 'لا توجد تنبيهات حالياً.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notif) => {
            const style = getStyle(notif.severity);
            const Icon = style.icon;
            const isRead = readSet.has(notif.id);

            return (
              <Link 
                key={notif.id} 
                to={notif.link || '/'}
                onClick={() => markAsRead(notif.id)}
                aria-label={notif.title}
                className={`bg-[var(--surface)] border ${style.border} p-4 rounded-2xl flex items-start gap-4 transition-all hover:bg-[var(--surface-2)] ${
                  isRead ? 'opacity-60 grayscale-[30%]' : 'shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-xl ${style.bg} ${style.text} flex-shrink-0`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-bold text-[var(--text)] ${!isRead ? 'text-base' : 'text-sm'}`}>
                      {notif.title}
                    </h3>
                    {!isRead && (
                      <span className="w-2.5 h-2.5 bg-[var(--primary)] rounded-full flex-shrink-0 mt-1 shadow-[0_0_8px_var(--primary)]"></span>
                    )}
                  </div>
                  <p className={`text-xs mt-1.5 font-medium leading-relaxed ${style.text}`}>
                    {notif.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* نافذة تأكيد المسح */}
      <ConfirmModal 
        isOpen={showClearModal} 
        onClose={() => setShowClearModal(false)} 
        onConfirm={handleClearAllConfirm} 
        title={t('clearAllNotifications') || 'مسح جميع التنبيهات'}
        message={t('clearAllConfirmMsg') || 'هل أنت متأكد من مسح جميع التنبيهات؟ لن تظهر مرة أخرى إلا عند إنشاء تنبيهات جديدة.'}
        variant="danger"
        confirmText={t('confirmDeleteBtn') || 'حذف'}
        cancelText={t('cancel') || 'إلغاء'}
      />
    </div>
  );
}
