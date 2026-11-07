import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { dbService } from '../services/dbService';
import { Plus, Trash2, Edit2, X, Wrench, Gauge, Settings2 } from 'lucide-react';

export default function Maintenance() {
  const { currentCar, t, currency } = useContext(AppContext);
  
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ date: '', type: 'oilChange', cost: '', nextKm: '' });
  
  // حالة لتخزين الأنواع المخصصة
  const [customTypes, setCustomTypes] = useState([]);

  const sortRecords = (data) => [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  useEffect(() => {
    if (currentCar) {
      const carMaintenance = dbService.getMaintenance().filter(r => r.carId === currentCar.id);
      setRecords(sortRecords(carMaintenance));
      setCustomTypes(dbService.getCustomTypes()); // جلب الأنواع المخصصة
    }
  }, [currentCar]);

  const handleAddCustomType = () => {
    const newType = window.prompt(t('enterCustomTypeName') || 'أدخل اسم نوع الصيانة الجديد:');
    if (newType && newType.trim() !== '') {
      const updatedTypes = dbService.addCustomType(newType.trim());
      setCustomTypes(updatedTypes);
      setFormData({ ...formData, type: newType.trim() }); // اختياره تلقائياً
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const data = { 
      carId: currentCar.id, 
      ...formData, 
      cost: Number(formData.cost), 
      nextKm: Number(formData.nextKm) || null 
    };
    
    if (editingId) {
      const updated = dbService.updateMaintenance(editingId, data);
      setRecords(sortRecords(updated));
    } else {
      const newRecord = dbService.addMaintenance(data);
      if (newRecord) setRecords(sortRecords([newRecord, ...records]));
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if(window.confirm(t('confirmDelete'))) {
      const updated = dbService.deleteMaintenance(id);
      setRecords(sortRecords(updated));
    }
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    const typeKeyMap = {
      'تغيير زيت': 'oilChange', 'إطارات': 'tires', 'فرامل': 'brakes', 
      'بطارية': 'battery', 'فلتر هواء': 'airFilter', 'فحص شامل': 'fullInspection', 'أخرى': 'other'
    };
    const typeKey = typeKeyMap[record.type] || record.type;

    setFormData({ date: record.date, type: typeKey, cost: record.cost, nextKm: record.nextKm || '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ date: '', type: 'oilChange', cost: '', nextKm: '' });
  };

  return (
    <div className="space-y-4 pb-24 px-4">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md pt-4 pb-3 -mx-4 px-4 border-b border-[var(--border)]/50 z-10">
        <h1 className="text-2xl font-bold text-[var(--text)]">{t('maintenance') || 'الصيانة'}</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[var(--primary)] p-3 rounded-full text-white shadow-lg hover:scale-105 transition-transform">
          <Plus size={24} />
        </button>
      </div>

      {records.length === 0 ? (
        <div className="text-center text-[var(--text-muted)] mt-20 flex flex-col items-center">
          <div className="p-4 bg-[var(--surface-2)] rounded-full mb-4">
            <Wrench size={48} className="opacity-40" />
          </div>
          <p>{t('noMaintenanceRecords') || 'لا توجد سجلات صيانة.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(record => (
            <div key={record.id} className="bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3 transition-colors hover:border-yellow-500/30">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500"><Wrench size={20}/></div>
                  <div>
                    <p className="font-bold text-[var(--text)] text-lg">{t(record.type) !== record.type ? t(record.type) : record.type}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{record.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(record)} className="text-blue-400 bg-blue-400/10 p-2 rounded-lg hover:bg-blue-400/20 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(record.id)} className="text-red-400 bg-red-400/10 p-2 rounded-lg hover:bg-red-400/20 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Gauge size={14} />
                  {record.nextKm ? (
                    <span>{t('nextChange') || 'التغيير القادم'}: <span className="font-bold text-[var(--text)]">{Number(record.nextKm).toLocaleString()}</span> KM</span>
                  ) : (
                    <span>{t('noNextMaintenance') || 'لا توجد صيانة قادمة'}</span>
                  )}
                </div>
                <span className="font-extrabold text-[var(--primary)] text-sm">
                  {Number(record.cost).toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">{currency}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-[var(--surface)] p-6 rounded-2xl w-full max-w-md border border-[var(--border)] relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={closeModal} className="absolute top-4 left-4 p-1.5 bg-[var(--surface-2)] rounded-full text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-center mb-6 text-[var(--text)] mt-2">
              {editingId ? (t('edit') || 'تعديل') : (t('addMaintenance') || 'إضافة صيانة')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('date') || 'التاريخ'}</label>
                <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] [color-scheme:dark] outline-none focus:border-[var(--primary)]" />
              </div>

              {/* قائمة الأنواع مع زر الإضافة المخصص */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs text-[var(--text-muted)] block">{t('maintenanceType') || 'نوع الصيانة'}</label>
                  <button type="button" onClick={handleAddCustomType} className="text-xs text-[var(--primary)] flex items-center gap-1 hover:underline">
                    <Settings2 size={12} /> إضافة نوع
                  </button>
                </div>
                <select 
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})} 
                  className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]"
                >
                  <optgroup label={t('defaultTypes') || 'أنواع افتراضية'}>
                    <option value="oilChange">{t('oilChange') || 'تغيير زيت'}</option>
                    <option value="tires">{t('tires') || 'إطارات'}</option>
                    <option value="brakes">{t('brakes') || 'فرامل'}</option>
                    <option value="battery">{t('battery') || 'بطارية'}</option>
                    <option value="airFilter">{t('airFilter') || 'فلتر هواء'}</option>
                    <option value="fullInspection">{t('fullInspection') || 'فحص شامل'}</option>
                    <option value="other">{t('other') || 'أخرى'}</option>
                  </optgroup>
                  {customTypes.length > 0 && (
                    <optgroup label={t('customTypes') || 'أنواع مخصصة'}>
                      {customTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('cost') || 'التكلفة'} ({currency})</label>
                <input type="number" step="0.01" required placeholder={t('enterCost') || 'أدخل التكلفة'} value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{t('nextOdometer') || 'العداد للصيانة القادمة'} (KM)</label>
                <input type="number" placeholder={t('optional') || 'اختياري'} value={formData.nextKm} onChange={e => setFormData({...formData, nextKm: e.target.value})} className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-3 text-[var(--text)] outline-none focus:border-[var(--primary)]" />
              </div>
            </div>

            <button type="submit" className="w-full mt-8 bg-[var(--primary)] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-600 transition-colors">
              {t('save') || 'حفظ'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
