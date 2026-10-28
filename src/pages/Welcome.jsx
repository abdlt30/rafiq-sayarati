import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-3xl font-bold text-brand-500 mb-4">مرحباً بك في رفيق سيارتي</h1>
      <p className="text-slate-400 mb-8">تحكم في مصاريف سيارتك، ووفر 20% من ميزانيتك.</p>
      <Button onClick={() => navigate('/add-vehicle')}>ابدأ الآن</Button>
    </div>
  );
}
