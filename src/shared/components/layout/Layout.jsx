import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    // ✅ استخدام h-[100dvh] للمتصفحات الحديثة لضمان ثبات الارتفاع
    <div className="flex h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] font-sans overflow-hidden">
      
      {/* ✅ الشريط الجانبي (للكمبيوتر): 
          - تحويله إلى aside للدلالة البرمجية السليمة (Semantic HTML)
          - إضافة overflow-y-auto لضمان التمرير بداخله إذا كان المحتوى طويلاً
      */}
      <aside className="hidden md:block w-64 flex-shrink-0 border-e border-[var(--border)] bg-[var(--surface)] h-full overflow-y-auto">
        <Sidebar />
      </aside>

      {/* حاوية المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* 
            ✅ الحاوية الرئيسية (Main Content):
            - overflow-y-auto: لضمان التمرير داخل المحتوى فقط دون التأثير على الهيكل العام.
            - pt-safe: إضافة (اختيارية) لحماية المحتوى من شريط الحالة العلوي في أجهزة الآيفون.
            - pb-24: مساحة سفلية كافية لمنع تداخل المحتوى مع شريط التنقل السفلي.
        */}
        <main 
          className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 pb-24 md:pb-8 scroll-smooth"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <Outlet /> 
        </main>
      </div>

      {/* ✅ الشريط السفلي (للهواتف): 
          - إضافة border-t للفصل البصري بين المحتوى والشريط.
          - pb-safe لحماية زر الهوم في الآيفون.
          - left-0 right-0 لضمان تمدد الشريط بعرض الشاشة بالكامل.
      */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 pb-[env(safe-area-inset-bottom)] bg-[var(--surface)] border-t border-[var(--border)]">
        <BottomNav />
      </div>
    </div>
  );
}
