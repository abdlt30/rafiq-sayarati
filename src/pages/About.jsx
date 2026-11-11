import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Car, ShieldCheck, Mail, FileText, Code } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

// يمكنك لاحقاً استبدال هذه القيم برابط حقيقي أو جلبها من package.json
const APP_VERSION = '1.0.0';
const DEVELOPER_EMAIL = 'support@rafiq-sayarati.com';
const PRIVACY_POLICY_URL = 'https://rafiq-sayarati.com/privacy';

export default function About() {
  const navigate = useNavigate();
  const { t, lang } = useContext(AppContext);

  // ✅ دالة ذكية للرجوع (تتفادى الخطأ إذا لم يكن هناك سجل)
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/more'); // المسار الافتراضي
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          type="button"
          onClick={handleBack} 
          aria-label={t('back') || 'رجوع'}
          className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] active:scale-90 transition-transform"
        >
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {t('aboutApp') || 'حول التطبيق'}
        </h1>
      </div>

      {/* بطاقة الشعار */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-3xl text-center shadow-sm">
        <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Car size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--text)] mb-2">
          {t('appName') || 'رفيق سيارتي'}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 font-mono">
          v{APP_VERSION}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-green-500 font-bold bg-green-500/10 py-2 px-4 rounded-full w-fit mx-auto">
          <ShieldCheck size={16} />
          <span>{t('dataSecureLocally') || 'بياناتك آمنة ومحفوظة محلياً'}</span>
        </div>
      </div>

      {/* وصف التطبيق */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl text-sm text-[var(--text-muted)] leading-relaxed">
        <p className="mb-3">
          {t('appDescription1') || 'تطبيق "رفيق سيارتي" هو رفيقك الذكي لإدارة كل ما يتعلق بسيارتك. من تتبع المصاريف والوقود، إلى تذكيرات الصيانة والوثائق.'}
        </p>
        <p>
          {t('appDescription2') || 'تم تصميم هذا التطبيق ليكون سريعاً، آمناً، وسهل الاستخدام، ليوفر عليك الوقت والمال.'}
        </p>
      </div>

      {/* ✅ قسم قانوني متوافق مع Google Play */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <a 
          href={PRIVACY_POLICY_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border-b border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-blue-500" />
            <span className="text-sm font-bold text-[var(--text)]">{t('privacyPolicy') || 'سياسة الخصوصية'}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">{t('opensInBrowser') || 'يفتح في المتصفح'}</span>
        </a>

        <a 
          href={`mailto:${DEVELOPER_EMAIL}`}
          className="flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-orange-500" />
            <span className="text-sm font-bold text-[var(--text)]">{t('contactDeveloper') || 'التواصل مع المطور'}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">{DEVELOPER_EMAIL}</span>
        </a>
      </div>

      {/* تذييل */}
      <p className="text-center text-[10px] text-[var(--text-muted)] mt-8">
        {t('madeWithLove') || 'صُنع بكل حب لخدمة سيارتك'} ❤️
      </p>
    </div>
  );
}
