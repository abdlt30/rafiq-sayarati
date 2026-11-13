import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Car, ShieldCheck, Mail } from 'lucide-react';
import { AppContext } from '../context/AppContext';

// ⚠️ مهم جداً: يجب أن تكون هذه القيم حقيقية قبل النشر على Google Play
const APP_VERSION = '1.0.0';
const DEVELOPER_EMAIL = 'abdlt30@example.com'; // ← استبدلها ببريدك الحقيقي
// ✅ رابط حقيقي يعمل فعلياً (GitHub Pages)
const PRIVACY_POLICY_URL = 'https://abdlt30.github.io/rafiq-sayarati/privacy.html';

export default function About() {
  const navigate = useNavigate();
  const { t, lang } = useContext(AppContext);

  // ✅ رجوع محصّن باستخدام history.state.idx (React Router 6)
  const handleBack = () => {
    const idx = window.history.state?.idx;
    if (typeof idx === 'number' && idx > 0) {
      navigate(-1);
    } else {
      navigate('/more', { replace: true });
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      
      {/* الشريط العلوي */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          type="button"
          onClick={handleBack} 
          aria-label={t('back')}
          className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)] active:scale-90 transition-transform"
        >
          {lang === 'ar' 
            ? <ArrowRight size={20} aria-hidden="true" /> 
            : <ArrowLeft size={20} aria-hidden="true" />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">
          {t('aboutApp')}
        </h1>
      </div>

      {/* بطاقة الشعار */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-3xl text-center shadow-sm">
        <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Car size={40} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--text)] mb-2">
          {t('appName')}
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 font-mono">
          v{APP_VERSION}
        </p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-green-500 font-bold bg-green-500/10 py-2 px-4 rounded-full w-fit mx-auto">
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{t('dataSecureLocally')}</span>
        </div>
      </div>

      {/* وصف التطبيق */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl text-sm text-[var(--text-muted)] leading-relaxed">
        <p className="mb-3">
          {t('appDescription1')}
        </p>
        <p>
          {t('appDescription2')}
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
            <ShieldCheck size={18} className="text-blue-500" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--text)]">{t('privacyPolicy')}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">{t('opensInBrowser')}</span>
        </a>

        <a 
          href={`mailto:${DEVELOPER_EMAIL}`}
          className="flex items-center justify-between p-4 hover:bg-[var(--surface-2)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-orange-500" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--text)]">{t('contactDeveloper')}</span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] font-mono">{DEVELOPER_EMAIL}</span>
        </a>
      </div>

      {/* تذييل */}
      <p className="text-center text-[10px] text-[var(--text-muted)] mt-8">
        {t('madeWithLove')} <span aria-hidden="true">❤️</span>
      </p>
    </div>
  );
}
