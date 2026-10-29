import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-6 text-center font-sans">
      
      {/* الشعار أو الأيقونة */}
      <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center mb-10 border border-brand-500/20 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
        <span className="text-5xl">🚗</span>
      </div>

      {/* العنوان الرئيسي */}
      <h1 className="text-3xl font-bold text-white mb-3">رفيق سيارتي</h1>
      
      {/* رسالة القيمة */}
      <p className="text-slate-400 mb-10 max-w-xs leading-relaxed text-lg">
        تحكم في مصاريف سيارتك، تابع صيانتها، ووفر <span className="text-brand-500 font-bold">20%</span> من ميزانيتك بذكاء.
      </p>

      {/* زر البدء */}
      <div className="w-full max-w-xs">
        <Button onClick={() => navigate('/add-vehicle')}>
          ابدأ الآن
        </Button>
      </div>

    </div>
  );
}
