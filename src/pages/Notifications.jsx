import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { notificationService } from '../services/notificationService'; // ✅ استدعاء المحرك الجديد
import { 
  Bell, AlertTriangle, Info, Trash2, Check, ShieldAlert 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { currentCar, t, lang } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  
  // حالة "المقروء" يتم حفظها في الذاكرة المحلية
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // تحديث التنبيهات عند تحميل الصفحة
  useEffect(() => {
    if (currentCar) {
      const generatedAlerts = notificationService.generateSmartAlerts(currentCar, t, lang);
      setNotifications(generatedAlerts);
    }
  }, [currentCar, t, lang]);

  const markAsRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('read_notifications', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = [...new Set([...readIds, ...allIds])];
    setReadIds(updated);
    localStorage.setItem('read_notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (window.confirm(t('confirmDelete') || 'هل أنت متأكد؟')) {
      const allIds = notifications.map(n => n.id);
      const updated = [...new Set([...readIds, ...allIds])];
      setReadIds(updated);
      localStorage.setItem('read_notifications', JSON.stringify(updated));
      setNotifications([]); 
    }
  };

  const getStyle = (severity) => {
    switch (severity) {
      case 'critical': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-500', icon: AlertTriangle };
      case 'warning': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', icon: ShieldAlert };
      default: return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', icon: Info };
    }
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <div className="space-y-4 pb-24 px-4">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{t('notifications') || 'مركز التنبيهات'}</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">{unreadCount} {t('unread') || 'جديد'}</p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <button onClick={markAllRead} title={t('markAllRead') || 'تحديد الكل كمقروء'} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-green-500 transition-colors">
                <Check size={18} />
              </button>
              <button onClick={clearAll} title={t('clearAll') || 'مسح الكل'} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* قائمة التنبيهات */}
      {notifications.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Bell size={48} className="opacity-40" />
          </div>
          <p>{t('noNotifications') || 'لا توجد تنبيهات حالياً. كل شيء تحت السيطرة! ✅'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const style = getStyle(notif.severity);
            const Icon = style.icon;
            const isRead = readIds.includes(notif.id);

            return (
              <Link 
                key={notif.id} 
                to={notif.link}
                onClick={() => markAsRead(notif.id)}
                className={`block bg-[var(--surface)] border ${style.border} p-4 rounded-2xl flex items-start gap-4 transition-all hover:bg-[var(--surface-2)] ${isRead ? 'opacity-60 grayscale-[30%]' : 'shadow-lg'}`}
              >
                <div className={`p-3 rounded-xl ${style.bg} ${style.text} flex-shrink-0`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-[var(--text)] ${!isRead ? 'text-base' : 'text-sm'}`}>
                      {notif.title}
                    </h3>
                    {!isRead && (
                      <span className="w-2.5 h-2.5 bg-[var(--primary)] rounded-full flex-shrink-0 mt-1"></span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${style.text}`}>
                    {notif.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
