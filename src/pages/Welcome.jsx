import { useContext, useState } from 'react'; // ✅ إضافة useState
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, TrendingDown, Clock, ChevronLeft, User } from 'lucide-react'; // ✅ إضافة أيقونة User

export default function Welcome() {
  const { t, lang, setUser } = useContext(AppContext); // ✅ إضافة setUser من الـ Context
  const navigate = useNavigate();
  
  // ✅ حالة لحفظ اسم المستخدم
  const [userName, setUserName] = useState('');

  // دالة معالجة البدء
  const handleStart = () => {
    if (userName.trim().length < 2) {
      alert('يرجى إدخال اسمك (حرفين على الأقل) لنتمكن من الترحيب بك.');
      return;
    }
    
    // حفظ الاسم في الـ Context والذاكرة المحلية
    if (setUser) {
      setUser({ name: userName.trim() });
    } else {
      // خطة بديلة في حال لم يكن setUser معرفاً في Context
      localStorage.setItem('user_name', userName.trim());
    }
    
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      
      {/* خلفية جمالية (تأثير توهج) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--primary)]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--primary-2)]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center z-10">
        
        {/* الشعار والأيقونة */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-2)] rounded-[2.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-[var(--primary)]/30 animate-bounce-slow">
          <span className="text-5xl sm:text-6xl">🚗</span>
        </div>

        {/* العنوان الرئيسي (الخطاف) */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] mb-3 tracking-tight leading-tight">
          {t('appName') || 'رفيق سيارتي'}
        </h1>
        
        <p className="text-base sm:text-lg text-[var(--text-muted)] mb-8 max-w-sm leading-relaxed">
          {t('welcomeMessagePart1') || 'تحكم في مصاريف سيارتك، تابع صيانتها، ووفر'}{' '}
          <span className="text-[var(--primary)] font-extrabold text-xl">20%</span>{' '}
          {t('welcomeMessagePart2') || 'من ميزانيتك بذكاء.'}
        </p>

        {/* ✅ حقل إدخال الاسم (الخطوة النفسية الذكية) */}
        <div className="w-full max-w-sm mb-6 animate-fade-in">
          <label className="text-xs font-bold text-[var(--text-muted)] mb-2 block text-start pl-1">
            كيف تحب أن نناديك؟
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <User size={18} className="text-[var(--text-muted)]" />
            </div>
            <input 
              type="text" 
              placeholder="اكتب اسمك هنا..." 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3.5 pr-11 pl-4 text-[var(--text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm font-bold shadow-sm"
              maxLength={20}
            />
          </div>
        </div>

        {/* الميزات التسويقية (لماذا هذا التطبيق؟) */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-sm">
            <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl"><TrendingDown size={20} /></div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">تتبع المصاريف بدقة</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">اعرف أين تذهب كل درهم تنفقه</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-sm">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl"><Clock size={20} /></div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">تنبيهات ذكية</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">لا تفوت موعد صيانة أو تجديد وثيقة</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] p-3 rounded-2xl shadow-sm">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl"><ShieldCheck size={20} /></div>
            <div className="text-start">
              <h3 className="font-bold text-[var(--text)] text-sm">راحة بالك</h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">سيارتك دائماً في أتم الاستعداد</p>
            </div>
          </div>
        </div>

        {/* زر البدء */}
        <div className="w-full max-w-xs pb-4">
          <button 
            onClick={handleStart}
            disabled={userName.trim().length < 2} // ✅ تعطيل الزر إذا كان الاسم فارغاً
            className={`w-full font-bold text-lg py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
              userName.trim().length < 2 
                ? 'bg-[var(--surface-2)] text-[var(--text-muted)] cursor-not-allowed shadow-none' 
                : 'bg-[var(--primary)] text-white shadow-[var(--primary)]/30 hover:scale-105 active:scale-95'
            }`}
          >
            {t('startNow') || 'ابدأ رحلتك الآن'}
            {lang === 'ar' ? <ChevronLeft size={20} /> : <ChevronLeft className="rotate-180" size={20} />}
          </button>
          <p className="text-[10px] text-[var(--text-muted)] mt-4 flex justify-center items-center gap-1">
            <ShieldCheck size={12} /> بياناتك محفوظة بخصوصية تامة على جهازك
          </p>
        </div>

      </div>
    </div>
  );
}
