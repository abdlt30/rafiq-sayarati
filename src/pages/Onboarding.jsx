import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext.jsx'; // ✅ إضافة .jsx
import { Wallet, Wrench, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Onboarding() {
  const { t, lang } = useContext(AppContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // ✅ إضافة نصوص احتياطية (Fallbacks) لضمان عدم ظهور مفاتيح الترجمة
  const slides = useMemo(() => [
    {
      icon: <Wallet size={80} className="text-blue-500" aria-hidden="true" />,
      title: t('onboardingTitle1') || 'تتبع كل درهم',
      desc: t('onboardingDesc1') || 'سجل مصاريف الوقود، الصيانة، والتأمين في مكان واحد. التطبيق يحسب لك تكلفة الكيلومتر تلقائياً.'
    },
    {
      icon: <Wrench size={80} className="text-yellow-500" aria-hidden="true" />,
      title: t('onboardingTitle2') || 'صيانة استباقية',
      desc: t('onboardingDesc2') || 'لا تنتظر حتى تتعطل سيارتك. أضف تذكيرات لتغيير الزيت والإطارات بناءً على المسافة أو التاريخ.'
    },
    {
      icon: <Bell size={80} className="text-red-500" aria-hidden="true" />,
      title: t('onboardingTitle3') || 'لا تفوت أي موعد',
      desc: t('onboardingDesc3') || 'تنبيهات ذكية قبل انتهاء التأمين أو الفحص التقني. احتفظ بسيارتك آمنة وقانونية دائماً.'
    }
  ], [t]);

  // ✅ حفظ علم "شاهد التعريف" (محصّن ضد فشل التخزين)
  const finishOnboarding = () => {
    try {
      localStorage.setItem('has_seen_onboarding', 'true');
    } catch (err) {
      console.error('Save onboarding flag failed:', err);
    } finally {
      // ننتقل مباشرة لإضافة السيارة
      navigate('/add-vehicle');
    }
  };

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => finishOnboarding();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between p-6 font-sans relative overflow-hidden">
      
      {/* زر التخطي */}
      <div className="flex justify-end pt-4 relative z-10">
        <button 
          type="button"
          onClick={handleSkip} 
          className="text-[var(--text-muted)] font-bold text-sm px-4 py-2 hover:text-[var(--text)] active:scale-95 transition-all"
          aria-label={t('skip') || 'تخطي'}
        >
          {t('skip') || 'تخطي'}
        </button>
      </div>

      {/* محتوى الشريحة */}
      <div 
        className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-fade-in relative z-10" 
        key={step}
        role="region"
        aria-live="polite"
        aria-label={`${t('slideProgress') || 'الشريحة'} ${step + 1} / ${slides.length}`}
      >
        {/* ✅ إضافة تأثير حركي خفيف للأيقونة (Floating) */}
        <div className="w-40 h-40 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-10 shadow-xl relative animate-bounce-slow">
          <div className="absolute inset-0 bg-[var(--primary)]/5 rounded-full animate-ping opacity-30"></div>
          {slides[step].icon}
        </div>
        
        <h2 className="text-3xl font-extrabold text-[var(--text)] mb-4">
          {slides[step].title}
        </h2>
        <p className="text-[var(--text-muted)] text-lg max-w-sm leading-relaxed">
          {slides[step].desc}
        </p>
      </div>

      {/* الأسفل: النقاط والزر */}
      <div className="pb-10 flex flex-col items-center gap-8 relative z-10">
        
        {/* نقاط التقدم */}
        <div className="flex gap-2" aria-hidden="true">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-[var(--primary)]' : 'w-2 bg-[var(--border)]'
              }`}
            ></div>
          ))}
        </div>

        {/* زر المتابعة */}
        <button 
          type="button"
          onClick={handleNext}
          className="w-full max-w-xs bg-[var(--primary)] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
        >
          {step === slides.length - 1 
            ? (t('startNow') || 'ابدأ الآن')
            : (t('next') || 'التالي')}
          {lang === 'ar' 
            ? <ChevronLeft size={20} aria-hidden="true" /> 
            : <ChevronRight size={20} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
