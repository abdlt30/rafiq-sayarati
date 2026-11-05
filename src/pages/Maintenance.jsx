import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, Wrench } from 'lucide-react';

export default function Maintenance() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getMaintenance().filter(r => r.carId === currentCar.id));
    }
  }, [currentCar]);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>الصيانة</h1>
        <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={24} />
        </button>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{records.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>إجمالي السجلات</div>
        </div>
        <div style={{ width: '1px', background: 'var(--border)' }}></div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--warning)' }}>{records.filter(r => r.type === 'تغيير زيت').length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>تغيير زيت</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {records.map(record => (
          <div key={record.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--surface-2)', padding: '10px', borderRadius: '10px', color: 'var(--warning)' }}>
                  <Wrench size={20} />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{record.type}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{record.date}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '8px', borderRadius: '8px' }}><Edit2 size={16} /></button>
                <button style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px' }}><Trash2 size={16} /></button>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <span style={{ background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{record.notes || 'لا توجد ملاحظات'}</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-2)' }}>{record.cost} MAD</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
