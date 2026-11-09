import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingDown, Clock, ChevronLeft } from 'lucide-react';

export default function Welcome() {
  const { t, lang } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* خلفية جمالية (تأثير توهج) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--primary-2)]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center z-10">
        
        {/* الشعار والأيقونة */}
        <div className="w-28 h-28 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-2)] rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-[var(--primary)]/30 animate-bounce-slow">
          <span className="text-6xl">🚗</span>
        </div>

        {/* العنوان الرئيسي (الخطاف) */}
        <h1 className="text-4xl font-extrabold text-[var(--text)] mb-4 tracking-tight leading-tight">
          {t('appName') || 'رفيق سيارتي'}
        </h1>
        
        <p className="text-lg text-[var(--text-muted)] mb-10 max-w-sm leading-relaxed">
          {t('welcomeMessagePart1') || 'تحكم في مصاريف سيارتك، تابع صيانتها، ووفر'}{' '}
          <span className="text-[var(--primary)] font-extrabold text-xl">20%</span>{' '}
          {t('welcomeMessagePart2') || 'من ميزانيتك بذكاء.'}
        </p>

        {/* الميزات التسويقية (لماذا هذا التطبيق؟) */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><TrendingDown size={24} /></div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">تتبع المصاريف بدقة</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">اعرف أين تذهب كل درهم تنفقه</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl"><Clock size={24} /></div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">تنبيهات ذكية</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">لا تفوت موعد صيانة أو تجديد وثيقة</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-sm">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><ShieldCheck size={24} /></div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">راحة بالك</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">سيارتك دائماً في أتم الاستعداد</p>
            </div>
          </div>
        </div>

        {/* زر البدء */}
        <div className="w-full max-w-xs">
          <button 
            onClick={() => navigate('/onboarding')}
            className="w-full bg-[var(--primary)] text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-[var(--primary)]/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            {t('startNow') || 'ابدأ رحلتك الآن'}
            {lang === 'ar' ? <ChevronLeft size={20} /> : <ChevronLeft className="rotate-180" size={20} />}
          </button>
          <p className="text-xs text-[var(--text-muted)] mt-4 flex justify-center items-center gap-1">
            <ShieldCheck size={14} /> بياناتك محفوظة بخصوصية تامة
          </p>
        </div>

      </div>
    </div>
  );
}
