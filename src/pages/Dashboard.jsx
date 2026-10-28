import Card from '../components/ui/Card';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white mb-6">لوحة التحكم</h1>
      <Card>
        <p className="text-slate-400 text-center">بيانات السيارة ستظهر هنا</p>
      </Card>
      <Card>
        <p className="text-slate-400 text-center">إحصائيات المصاريف ستظهر هنا</p>
      </Card>
    </div>
  );
}
