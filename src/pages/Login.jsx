import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShieldCheck, UserPlus, ChevronLeft } from 'lucide-react';

export default function Login() {
  const { t, lang, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  // دالة الدخول كزائر
  const handleGuestLogin = () => {
    // حفظ حالة المستخدم (يمكنك تعديلها لاحقاً عند ربط Supabase)
    if (setUser) {
      setUser({ name: 'زائر', isGuest: true });
    }
    navigate('/add-vehicle');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-6 text-center">
      
      {/* أيقونة احترافية بدلاً من الإيموجي */}
      <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <ShieldCheck size={48} className="text-[var(--primary)]" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text)] mb-3">
        {t('loginTitle') || 'مرحباً بك مجدداً'}
      </h1>
      
      <p className="text-sm text-[var(--text-muted)] mb-8 max-w-xs leading-relaxed">
        {t('loginSubtitle') || 'يمكنك تجربة التطبيق كزائر الآن، أو تسجيل الدخول لحفظ بياناتك في السحابة (قريباً).'}
      </p>
      
      {/* زر الدخول كزائر */}
      <button 
        type="button"
        onClick={handleGuestLogin} 
        className="w-full max-w-xs bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg shadow-[var(--primary)]/30 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
      >
        <UserPlus size={20} />
        {t('continueAsGuest') || 'المتابعة كزائر'}
      </button>

      {/* زر ثانوي (اختياري) - لربطه لاحقاً */}
      <button 
        type="button"
        onClick={() => {}} // سيتم ربطه بـ Supabase لاحقاً
        disabled
        className="w-full max-w-xs bg-[var(--surface-2)] text-[var(--text-muted)] font-bold py-4 rounded-xl cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
      >
        {t('signInWithEmail') || 'تسجيل الدخول بالبريد'}
        {lang === 'ar' ? <ChevronLeft size={18} /> : <ChevronLeft size={18} className="rotate-180" />}
      </button>
      
      <p className="text-[10px] text-[var(--text-muted)] mt-8">
        {t('dataPrivacyText') || 'بياناتك تبقى على جهازك في وضع الزائر.'}
      </p>
    </div>
  );
}
