import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-6 text-center">
      {/* شعار التطبيق أو أيقونة سيارة */}
      <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center mb-8">
        <span className="text-4xl">🚗</span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">مرحباً بك في رفيق سيارتي</h1>
      <p className="text-slate-400 mb-8 leading-relaxed">
        تحكم في مصاريف سيارتك، تابع صيانتها، <br />
        ووفر 20% من ميزانيتك.
      </p>

      {/* زر الانتقال لصفحة إضافة السيارة */}
      <div className="w-full max-w-xs mt-4">
        <Button onClick={() => navigate('/add-vehicle')}>
          ابدأ الآن
        </Button>
      </div>
    </div>
  );
}
