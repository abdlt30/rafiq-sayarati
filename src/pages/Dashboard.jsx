import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Wallet, Gauge, Fuel, Wrench, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const COLORS = ['#2f6bff', '#f59e0b', '#22c55e'];

export default function Dashboard() {
  const { currentCar } = useContext(AppContext);
  const [totals, setTotals] = useState({ fuel: 0, maintenance: 0, expenses: 0, total: 0 });

  useEffect(() => {
    if (currentCar) {
      const data = dbService.getTotals(currentCar.id);
      setTotals(data);
    }
  }, [currentCar]);

  if (!currentCar) return null;

  const chartData = [
    { name: 'وقود', value: totals.fuel },
    { name: 'صيانة', value: totals.maintenance },
    { name: 'أخرى', value: totals.expenses },
  ].filter(item => item.value > 0);

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* بطاقة السيارة */}
      <div className="hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gauge size={18} />
            <span style={{ fontWeight: 'bold' }}>{currentCar.currentOdometer?.toLocaleString() || 0} KM</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>{currentCar.make} {currentCar.model}</h2>
            <p style={{ fontSize: '12px', color: '#9fb2d8', margin: '4px 0 0' }}>{currentCar.plate}</p>
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div className="stat" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '90px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <Wallet size={14} /> إجمالي المصاريف
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{totals.total} <span style={{ fontSize: '12px' }}>MAD</span></div>
        </div>
        
        <div className="stat" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '90px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <Gauge size={14} /> تكلفة الكيلومتر
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>0.07 <span style={{ fontSize: '12px' }}>MAD</span></div>
        </div>

        <div className="stat" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '90px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <Fuel size={14} /> إجمالي الوقود
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{totals.fuel} <span style={{ fontSize: '12px' }}>MAD</span></div>
        </div>

        <div className="stat" style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '90px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <Wrench size={14} /> الصيانة
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800' }}>{totals.maintenance} <span style={{ fontSize: '12px' }}>MAD</span></div>
        </div>
      </div>

      {/* الرسم البياني */}
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>توزيع المصاريف</h3>
      <div className="card" style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>لا توجد بيانات</span>
        )}
      </div>

      {/* الإجراءات السريعة */}
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '20px 0 12px' }}>إجراءات سريعة</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Link to="/fuel" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <span style={{ color: 'var(--text)' }}>إضافة وقود</span>
          <Fuel size={20} color="var(--primary)" />
        </Link>
        <Link to="/maintenance" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <span style={{ color: 'var(--text)' }}>إضافة صيانة</span>
          <Wrench size={20} color="var(--warning)" />
        </Link>
        <Link to="/expenses" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <span style={{ color: 'var(--text)' }}>إضافة مصروف</span>
          <Wallet size={20} color="var(--success)" />
        </Link>
        <Link to="/documents" className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
          <span style={{ color: 'var(--text)' }}>الوثائق</span>
          <FileText size={20} color="#a78bfa" />
        </Link>
      </div>
    </div>
  );
}
