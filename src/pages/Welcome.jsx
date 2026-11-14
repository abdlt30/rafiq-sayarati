import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext.jsx'; // ✅ إضافة .jsx
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingDown, Clock, ChevronLeft, User, Lock } from 'lucide-react'; // ✅ إضافة أيقونة القفل

export default function Welcome() {
  const { t, lang, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('');

  /* ✅ الحساب الرياضي للتحقق من الاسم */
  const trimmedName = userName.trim();
  const isValidName = trimmedName.length >= 2 && trimmedName.length <= 20;

  /* ✅ الحفظ محصّن */
  const handleStart = (e) => {
    e.preventDefault();
    if (!isValidName) return;

    try {
      setUser({ name: trimmedName });
    } catch (err) {
      console.error('setUser failed:', err);
    } finally {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* خلفية جمالية */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--primary-2)]/20 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"></div>

      {/* form لدعم Enter و a11y */}
      <form 
        onSubmit={handleStart} 
        noValidate 
        className="flex-1 flex flex-col justify-center items-center p-6 text-center z-10"
      >
        
        {/* الشعار */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-2)] rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-[var(--primary)]/30 animate-bounce-slow">
          <span className="text-5xl sm:text-6xl" aria-hidden="true">🚗</span>
        </div>

        {/* العنوان */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mb-3 tracking-tight leading-tight">
          {t('appName') || 'رفيق سيارتي'}
        </h1>
        
        {/* ✅ النص التسويقي الجديد (بدون كذب) */}
        <p className="text-base sm:text-lg text-[var(--text-muted)] mb-8 max-w-sm leading-relaxed">
          {t('welcomeMessagePart1') || 'تحكم في مصاريف سيارتك، تابع صيانتها،'}{' '}
          <span className="text-[var(--primary)] font-extrabold text-xl">{t('welcomeMessagePart2') || 'وتمتع براحة البال.'}</span>
        </p>

        {/* حقل الاسم */}
        <div className="w-full max-w-sm mb-6 animate-fade-in">
          <label 
            htmlFor="userName"
            className="text-xs font-bold text-[var(--text-muted)] mb-2 block text-start ps-1"
          >
            {t('howToCallYou') || 'كيف تحب أن نناديك؟'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
              <User size={18} className="text-[var(--text-muted)]" aria-hidden="true" />
            </div>
            <input 
              id="userName"
              type="text"
              autoComplete="name"
              placeholder={t('enterName') || 'اكتب اسمك هنا...'}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3.5 ps-11 pe-4 text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm font-bold shadow-sm"
              maxLength={20}
              aria-invalid={userName.length > 0 && !isValidName}
            />
          </div>
        </div>

        {/* الميزات (القيمة الحقيقية) */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-sm">
            <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl">
              <TrendingDown size={20} aria-hidden="true" />
            </div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">
                {t('featureTrackExpenses') || 'تتبع دقيق للمصاريف'}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {t('featureTrackExpensesDesc') || 'اعرف أين يذهب كل درهم تنفقه بوضوح تام.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-sm">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl">
              <Clock size={20} aria-hidden="true" />
            </div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">
                {t('featureSmartAlerts') || 'تنبيهات استباقية'}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {t('featureSmartAlertsDesc') || 'لا تفوت موعد تغيير الزيت أو تجديد التأمين.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-sm">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <Lock size={20} aria-hidden="true" /> {/* ✅ تغيير الأيقونة لتعكس الخصوصية */}
            </div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">
                {t('featurePeaceOfMind') || 'خصوصية مطلقة'}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {t('featurePeaceOfMindDesc') || 'بياناتك محفوظة على هاتفك، لا نرسلها لأي خادم.'}
              </p>
            </div>
          </div>
        </div>

        {/* زر البدء */}
        <div className="w-full max-w-xs pb-4">
          <button 
            type="submit"
            disabled={!isValidName}
            className={`w-full font-bold text-lg py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              !isValidName 
                ? 'bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed shadow-none' 
                : 'bg-[var(--primary)] text-white shadow-[var(--primary)]/30 hover:scale-105 active:scale-95'
            }`}
          >
            {t('startNow') || 'ابدأ الآن'}
            <ChevronLeft 
              size={20} 
              className={`transition-transform duration-300 ${lang === 'ar' ? '' : 'rotate-180'}`}
              aria-hidden="true"
            />
          </button>
          
          {/* ✅ شارة الثقة (Trust Badge) */}
          <p className="text-[10px] text-[var(--text-muted)] mt-4 flex justify-center items-center gap-1 font-bold">
            <ShieldCheck size={14} className="text-green-500" aria-hidden="true" /> 
            {t('privacyNoteShort') || 'بياناتك ملكك وحدك، محفوظة محلياً.'}
          </p>
        </div>

      </form>
    </div>
  );
}
