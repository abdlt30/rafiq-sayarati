import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-center items-center p-6 text-center">
      <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🔐</span>
      </div>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-4">تسجيل الدخول</h1>
      <p className="text-[var(--text-muted)] mb-8 max-w-xs">
        سيتم ربط هذه الصفحة بقاعدة بيانات Supabase قريباً. اضغط على الزر للمتابعة كزائر.
      </p>
      
      {/* زر مؤقت لتجاوز الدخول */}
      <button 
        onClick={() => navigate('/add-vehicle')} 
        className="w-full max-w-xs bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg"
      >
        المتابعة وإضافة السيارة
      </button>
    </div>
  );
}
