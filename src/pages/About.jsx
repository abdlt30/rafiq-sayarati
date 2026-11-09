import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Car, ShieldCheck } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export default function About() {
  const navigate = useNavigate();
  const { t, lang } = useContext(AppContext);

  return (
    <div className="space-y-6 pb-24 px-4 pt-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--text)]">
          {lang === 'ar' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('aboutApp') || 'حول التطبيق'}</h1>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-3xl text-center shadow-sm">
        <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
          <Car size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--text)] mb-2">{t('appName') || 'رفيق سيارتي'}</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">الإصدار 1.0.0</p>
        
        <div className="flex items-center justify-center gap-2 text-xs text-green-500 font-bold bg-green-500/10 py-2 px-4 rounded-full w-fit mx-auto">
          <ShieldCheck size={16} />
          <span>بياناتك آمنة ومحفوظة محلياً</span>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl text-sm text-[var(--text-muted)] leading-relaxed">
        <p className="mb-3">
          تطبيق "رفيق سيارتي" هو رفيقك الذكي لإدارة كل ما يتعلق بسيارتك. من تتبع المصاريف والوقود، إلى تذكيرات الصيانة والوثائق.
        </p>
        <p>
          تم تصميم هذا التطبيق ليكون سريعاً، آمناً، وسهل الاستخدام، ليوفر عليك الوقت والمال.
        </p>
      </div>
    </div>
  );
}
