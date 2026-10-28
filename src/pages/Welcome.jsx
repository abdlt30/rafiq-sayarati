import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button'; // تأكد أن المسار صحيح

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-6 text-center">
      
      {/* أيقونة أو شعار (اختياري) */}
      <div className="w-20 h-20 bg-brand-500/20 rounded-full flex items-center justify-center mb-8">
        <span className="text-4xl">🚗</span>
      </div>

      {/* رسالة القيمة */}
      <h1 className="text-3xl font-bold text-white mb-4">مرحباً بك في رفيق سيارتي</h1>
      <p className="text-slate-400 mb-8 max-w-xs leading-relaxed">
        تحكم في مصاريف سيارتك، تابع صيانتها، ووفر 20% من ميزانيتك بذكاء.
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
