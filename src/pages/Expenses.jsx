import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Expenses() {
  const { currentCar } = useContext(AppContext);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getExpenses().filter(r => r.carId === currentCar.id));
    }
  }, [currentCar]);

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>المصاريف</h1>
        <button style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {records.map(record => (
          <div key={record.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{record.cost} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MAD</span></p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{record.date}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '8px', borderRadius: '8px' }}><Edit2 size={16} /></button>
                <button style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px' }}><Trash2 size={16} /></button>
              </div>
            </div>
            <div style={{ background: 'var(--surface-2)', padding: '8px 12px', borderRadius: '8px', display: 'inline-block', width: 'fit-content', color: 'var(--primary-2)', fontSize: '13px', fontWeight: 'bold' }}>
              {record.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
