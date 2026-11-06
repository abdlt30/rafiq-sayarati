import { useContext } from 'react'; // 1. استدعاء useContext
import { AppContext } from '../context/AppContext'; // 2. استدعاء AppContext
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Welcome() {
  const { t } = useContext(AppContext); // 3. جلب دالة الترجمة
  const navigate = useNavigate();

  return (
    // 4. استخدام متغيرات الألوان الديناميكية بدلاً من bg-dark-900
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-6 text-center font-sans transition-colors duration-300">
      
      {/* الشعار أو الأيقونة */}
      {/* استخدام ألوان الـ primary الديناميكية */}
      <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-10 border border-[var(--primary)]/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
        <span className="text-5xl">🚗</span>
      </div>

      {/* العنوان الرئيسي */}
      <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
        {t('appName') || 'رفيق سيارتي'}
      </h1>
      
      {/* رسالة القيمة */}
      <p className="text-[var(--text-muted)] mb-10 max-w-xs leading-relaxed text-lg">
        {t('welcomeMessagePart1') || 'تحكم في مصاريف سيارتك، تابع صيانتها، ووفر'}{' '}
        <span className="text-[var(--primary)] font-bold">20%</span>{' '}
        {t('welcomeMessagePart2') || 'من ميزانيتك بذكاء.'}
      </p>

      {/* زر البدء */}
      <div className="w-full max-w-xs">
        <Button onClick={() => navigate('/add-vehicle')}>
          {t('startNow') || 'ابدأ الآن'}
        </Button>
      </div>

    </div>
  );
}
