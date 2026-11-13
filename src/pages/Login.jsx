import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, UserPlus, ChevronLeft } from 'lucide-react';

export default function Login() {
  const { t, lang, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  // ✅ الدخول كزائر (محصّن + اسم مترجم)
  const handleGuestLogin = () => {
    try {
      if (setUser) {
        setUser({ name: t('guest'), isGuest: true });
      }
    } catch (err) {
      console.error('setUser failed:', err);
      // نكمل على أي حال: المستخدم يستطيع التجربة بدون اسم
    } finally {
      navigate('/add-vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-6 text-center">
      
      {/* أيقونة */}
      <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <ShieldCheck size={48} className="text-[var(--primary)]" aria-hidden="true" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
        {t('loginTitle')}
      </h1>
      
      <p className="text-sm text-[var(--text-muted)] mb-8 max-w-xs leading-relaxed">
        {t('loginSubtitle')}
      </p>
      
      {/* زر الدخول كزائر */}
      <button 
        type="button"
        onClick={handleGuestLogin} 
        className="w-full max-w-xs bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg shadow-[var(--primary)]/30 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
      >
        <UserPlus size={20} aria-hidden="true" />
        {t('continueAsGuest')}
      </button>

      {/* زر ثانوي (قريباً) - disabled */}
      <button 
        type="button"
        disabled
        aria-label={t('signInWithEmail')}
        className="w-full max-w-xs bg-[var(--surface-2)] text-[var(--text-muted)] font-bold py-4 rounded-xl cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
      >
        {t('signInWithEmail')}
        <ChevronLeft 
          size={18} 
          className={lang === 'ar' ? '' : 'rotate-180'} 
          aria-hidden="true" 
        />
      </button>
      
      <p className="text-[10px] text-[var(--text-muted)] mt-8">
        {t('dataPrivacyText')}
      </p>
    </div>
  );
}
