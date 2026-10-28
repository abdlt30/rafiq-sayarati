export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 px-4 py-4 flex justify-between items-center">
      <div className="text-brand-500 font-bold text-lg">رفيق سيارتي</div>
      <div className="text-xs text-slate-400 bg-dark-800 px-3 py-1 rounded-full border border-dark-700">
        الإصدار 1.0
      </div>
    </header>
  );
}
