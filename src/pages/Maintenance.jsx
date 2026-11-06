import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wrench } from 'lucide-react';

export default function Maintenance() {
  // 1. إضافة currency من الـ Context
  const { currentCar, t, currency } = useContext(AppContext);
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // 2. تغيير القيمة الافتراضية للنوع إلى مفتاح ترجمة
  const [formData, setFormData] = useState({ date: '', type: 'oilChange', cost: '', nextKm: '', notes: '' });

  useEffect(() => {
    if (currentCar) {
      setRecords(dbService.getMaintenance().filter(r => r.carId === currentCar.id));
    }
  }, [currentCar]);

  const handleSave = (e) => {
    e.preventDefault();
    const data = { 
      carId: currentCar.id, 
      ...formData, 
      // نحفظ المفتاح (key) في قاعدة البيانات، وسنقوم بترجمته عند العرض
      cost: Number(formData.cost), 
      nextKm: Number(formData.nextKm) || null 
    };
    
    if (editingId) {
      setRecords(dbService.updateMaintenance(editingId, data));
    } else {
      setRecords([dbService.addMaintenance(data), ...records]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm(t('confirmDelete') || 'هل أنت متأكد من الحذف؟')) {
      setRecords(dbService.deleteMaintenance(id));
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    setFormData({ 
      date: record.date, 
      type: record.type, 
      cost: record.cost, 
      nextKm: record.nextKm || '', 
      notes: record.notes || '' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'oilChange', cost: '', nextKm: '', notes: '' });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* الشريط العلوي */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)] pt-2 pb-2 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('maintenance') || 'الصيانة'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg">
          <Plus size={24} />
        </button>
      </div>

      {/* قائمة السجلات */}
      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-10">{t('noMaintenanceRecords') || 'لا توجد سجلات صيانة.'}</div>
      ) : (
        records.map(record => (
          <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500"><Wrench size={20}/></div>
                <div>
                  {/* ترجمة نوع الصيانة عند العرض */}
                  <p className="font-bold text-[var(--text)]">{t(record.type) || record.type}</p>
                  <p className="text-xs text-[var(--text-muted)]">{record.date}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex justify-between items-center bg-[var(--surface-2)] p-2 rounded-lg text-xs">
              <span className="text-[var(--text-muted)]">
                {record.nextKm ? `${t('nextChange')}: ${record.nextKm} KM` : t('noNextMaintenance')}
              </span>
              {/* 3. استخدام العملة الديناميكية */}
              <span className="font-bold text-[var(--primary)]">{record.cost} {currency}</span>
            </div>
          </div>
        ))
      )}

      {/* نافذة إضافة/تعديل الصيانة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] overflow-y-auto">
            
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 text-[var(--text-muted)] hover:text-white">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-center mb-6 text-[var(--text)]">
              {editingId ? (t('edit') || 'تعديل') : (t('addMaintenance') || 'إضافة صيانة')}
            </h2>
            
            <div className="space-y-4">
              {/* التاريخ */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none" 
                />
              </div>

              {/* النوع */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('maintenanceType') || 'نوع الصيانة'}</label>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none"
                >
                  <option value="oilChange">{t('oilChange') || 'تغيير زيت'}</option>
                  <option value="tires">{t('tires') || 'إطارات'}</option>
                  <option value="brakes">{t('brakes') || 'فرامل'}</option>
                  <option value="battery">{t('battery') || 'بطارية'}</option>
                  <option value="airFilter">{t('airFilter') || 'فلتر هواء'}</option>
                  <option value="fullInspection">{t('fullInspection') || 'فحص شامل'}</option>
                  <option value="other">{t('other') || 'أخرى'}</option>
                </select>
              </div>

              {/* التكلفة */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input 
                  type="number" 
                  required 
                  placeholder={t('enterCost') || 'أدخل التكلفة'} 
                  value={formData.cost} 
                  onChange={e => setFormData({...formData, cost: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none" 
                />
              </div>

              {/* العداد القادم */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('nextOdometer') || 'العداد للصيانة القادمة'} (KM)</label>
                <input 
                  type="number" 
                  placeholder={t('optional') || 'اختياري'} 
                  value={formData.nextKm} 
                  onChange={e => setFormData({...formData, nextKm: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none" 
                />
              </div>
            </div>

            {/* زر الحفظ */}
            <button 
              type="submit" 
              className="w-full mt-6 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors"
            >
              {t('save') || 'حفظ'}
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
