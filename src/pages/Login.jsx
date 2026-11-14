import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx'; // ✅ إضافة .jsx
import { ShieldCheck, UserPlus, ChevronLeft, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { t, lang, setUser } = useContext(AppContext);
  const navigate = useNavigate();

  // ✅ الدخول كزائر (محصّن + اسم مترجم مع Fallback)
  const handleGuestLogin = () => {
    try {
      if (setUser) {
        // نستخدم 'زائر' كاحتياط إذا لم تكن الترجمة موجودة
        setUser({ name: t('guest') || 'زائر', isGuest: true });
      }
    } catch (err) {
      console.error('setUser failed:', err);
    } finally {
      navigate('/add-vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      
      {/* ✅ خلفية جمالية (مطابقة لصفحة الترحيب) */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[var(--primary-2)]/10 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>

      {/* بطاقة تسجيل الدخول */}
      <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative z-10 animate-fade-in">
        
        {/* أيقونة */}
        <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner border border-[var(--primary)]/20">
          <Lock size={36} className="text-[var(--primary)]" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--text)] mb-3 text-center">
          {t('loginTitle') || 'مرحباً بك مجدداً'}
        </h1>
        
        <p className="text-sm text-[var(--text-muted)] mb-8 text-center leading-relaxed">
          {t('loginSubtitle') || 'يمكنك تجربة التطبيق كزائر الآن، أو تسجيل الدخول لحفظ بياناتك في السحابة (قريباً).'}
        </p>
        
        {/* زر الدخول كزائر */}
        <button 
          type="button"
          onClick={handleGuestLogin} 
          className="w-full bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg shadow-[var(--primary)]/30 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
        >
          <UserPlus size={20} aria-hidden="true" />
          {t('continueAsGuest') || 'المتابعة كزائر'}
        </button>

        {/* زر تسجيل الدخول بالبريد (معطل - قريباً) */}
        <button 
          type="button"
          disabled
          aria-label={t('signInWithEmail') || 'تسجيل الدخول بالبريد'}
          className="w-full bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] font-bold py-4 rounded-xl cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
        >
          <Mail size={18} aria-hidden="true" />
          {t('signInWithEmail') || 'تسجيل الدخول بالبريد'}
          <span className="text-[9px] bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full ms-2">قريباً</span>
        </button>
        
        {/* شارة الخصوصية */}
        <div className="mt-8 flex items-center justify-center gap-2 bg-[var(--surface-2)] p-3 rounded-xl border border-[var(--border)]">
          <ShieldCheck size={16} className="text-green-500 shrink-0" aria-hidden="true" />
          <p className="text-[10px] text-[var(--text-muted)] font-bold text-start leading-tight">
            {t('dataPrivacyText') || 'بياناتك تبقى على جهازك في وضع الزائر.'}
          </p>
        </div>

      </div>
    </div>
  );
}
